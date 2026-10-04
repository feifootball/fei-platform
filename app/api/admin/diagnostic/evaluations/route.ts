import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { calculatePlacement } from '@/lib/diagnostic/placement'
import { parseProductionEvaluation } from '@/lib/diagnostic/parse-evaluation'
import type { ObjectiveItemEvidence } from '@/lib/diagnostic/types'

const ADMIN_EMAIL = 'danielaportillafl@gmail.com'

function isObjectiveEvidence(value: unknown): value is ObjectiveItemEvidence[] {
  return Array.isArray(value) && value.every((item) =>
    Boolean(item) &&
    typeof item === 'object' &&
    typeof (item as ObjectiveItemEvidence).itemId === 'string' &&
    ['A2', 'B1', 'B2', 'C1'].includes((item as ObjectiveItemEvidence).level) &&
    ['reading', 'listening', 'vocabulary'].includes((item as ObjectiveItemEvidence).section) &&
    typeof (item as ObjectiveItemEvidence).correct === 'boolean'
  )
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return Response.json({ error: 'Admin access required.' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'The evaluation JSON is invalid.' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'The evaluation payload is required.' }, { status: 400 })
  }

  const payload = body as Record<string, unknown>
  const attemptId = payload.attemptId
  if (typeof attemptId !== 'string') {
    return Response.json({ error: 'Attempt ID is required.' }, { status: 400 })
  }

  const writingParsed = parseProductionEvaluation(payload.writing, 'writing')
  const speakingParsed = parseProductionEvaluation(payload.speaking, 'speaking')
  const issues = [...writingParsed.issues, ...speakingParsed.issues]

  if (!writingParsed.evaluation || !speakingParsed.evaluation || issues.length > 0) {
    return Response.json({ error: issues.join(' ') || 'Both evaluations are required.' }, { status: 400 })
  }

  if (writingParsed.evaluation.skill !== 'writing' || speakingParsed.evaluation.skill !== 'speaking') {
    return Response.json({ error: 'Writing and Speaking evaluations do not match their sections.' }, { status: 400 })
  }

  const writingEvaluation = writingParsed.evaluation
  const speakingEvaluation = speakingParsed.evaluation

  const admin = createAdminClient()
  const { data: attempt, error: attemptError } = await admin
    .from('diagnostic_attempts')
    .select('id, objective_evidence')
    .eq('id', attemptId)
    .single()

  if (attemptError || !attempt || !isObjectiveEvidence(attempt.objective_evidence)) {
    return Response.json({ error: 'The diagnostic attempt was not found or is invalid.' }, { status: 404 })
  }

  const { data: existingVersions } = await admin
    .from('diagnostic_production_evaluations')
    .select('skill, version')
    .eq('attempt_id', attemptId)
    .order('version', { ascending: false })

  const nextVersion = (skill: 'writing' | 'speaking') => {
    const current = existingVersions?.find((item) => item.skill === skill)?.version ?? 0
    return current + 1
  }

  const evaluations = [writingEvaluation, speakingEvaluation]
  const { error: evaluationError } = await admin
    .from('diagnostic_production_evaluations')
    .insert(evaluations.map((evaluation) => ({
      attempt_id: attemptId,
      skill: evaluation.skill,
      version: nextVersion(evaluation.skill),
      evaluation_status: evaluation.status,
      evaluation_payload: evaluation,
      evaluator_type: evaluation.evaluator,
      evaluator_id: evaluation.evaluatorId ?? null,
      scoring_contract_version: '1.0.0',
      created_by: user.id,
    })))

  if (evaluationError) {
    return Response.json({ error: 'The evaluations could not be saved.' }, { status: 500 })
  }

  const outcome = calculatePlacement(
    attempt.objective_evidence,
    writingEvaluation,
    speakingEvaluation,
  )

  const { error: resultError } = await admin
    .from('diagnostic_results')
    .upsert({
      attempt_id: attemptId,
      status: outcome.status,
      level: outcome.level,
      reason: outcome.reason,
      objective_evidence: outcome.objectiveEvidence,
      objective_correct: outcome.objectiveCorrect,
      objective_total: outcome.objectiveTotal,
      production_points: outcome.productionPoints,
      total_points: outcome.totalPoints,
      max_points: outcome.maxPoints,
      scoring_contract_version: '1.0.0',
      updated_at: new Date().toISOString(),
    })

  if (resultError) {
    return Response.json({ error: 'The evaluations were saved, but the result needs review.' }, { status: 500 })
  }

  await admin
    .from('diagnostic_attempts')
    .update({ status: outcome.status === 'ready' ? 'evaluated' : 'human_review_required' })
    .eq('id', attemptId)

  return Response.json({ outcome })
}
