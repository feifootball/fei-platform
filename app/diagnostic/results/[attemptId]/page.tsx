import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { PlacementLevel } from '@/lib/diagnostic/types'
import { buildCommunicationProfile } from '@/lib/learning/pathway'
import { createClient } from '@/lib/supabase/server'

type Result = {
  status: 'ready' | 'pending_production_evaluation' | 'human_review_required'
  level: string | null
  reason: string
  objective_evidence: Record<string, { correct: number; total: number; thresholdMet: boolean }>
  objective_correct: number
  objective_total: number
  production_points: number | null
  total_points: number | null
  max_points: number
  updated_at: string
}

type EvaluationPayload = {
  status?: string
  overallLevel?: string | null
  confidence?: string | null
  rationale?: string
  dimensions?: Record<string, string> | null
}

type Evaluation = {
  skill: 'writing' | 'speaking'
  version: number
  evaluation_payload: EvaluationPayload
}

const PLACEMENT_LEVELS = new Set(['A2', 'B1', 'B2', 'C1'])

function isPlacementLevel(value: unknown): value is PlacementLevel {
  return typeof value === 'string' && PLACEMENT_LEVELS.has(value)
}

function dimensionLabel(value: string) {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default async function DiagnosticResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>
}) {
  const { attemptId } = await params
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const [{ data: attempt }, { data: resultData }, { data: evaluationData }] = await Promise.all([
    supabase
      .from('diagnostic_attempts')
      .select('id, role, status, submitted_at')
      .eq('id', attemptId)
      .maybeSingle(),
    supabase.from('diagnostic_results').select('*').eq('attempt_id', attemptId).maybeSingle(),
    supabase
      .from('diagnostic_production_evaluations')
      .select('skill, version, evaluation_payload')
      .eq('attempt_id', attemptId)
      .order('version', { ascending: false }),
  ])

  if (!attempt) notFound()

  const result = resultData as Result | null
  const latestBySkill = new Map<string, Evaluation>()
  for (const evaluation of (evaluationData ?? []) as Evaluation[]) {
    if (!latestBySkill.has(evaluation.skill)) latestBySkill.set(evaluation.skill, evaluation)
  }

  const isReady = result?.status === 'ready' && isPlacementLevel(result.level)
  const communicationProfile = isReady
    ? buildCommunicationProfile({
        role: attempt.role,
        level: result.level as PlacementLevel,
        writingDimensions: latestBySkill.get('writing')?.evaluation_payload.dimensions,
        speakingDimensions: latestBySkill.get('speaking')?.evaluation_payload.dimensions,
      })
    : null

  return (
    <main className="min-h-screen bg-[#F6F7F9] px-6 py-12 text-fei-bg sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="text-sm font-semibold text-fei-sky hover:underline">
          ← Back to dashboard
        </Link>

        <section className="mt-8 rounded-3xl border border-fei-bg/10 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-12">
          {isReady ? (
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-fei-sky">FEI diagnostic result</p>
                <h1 className="mt-4 text-6xl font-black tracking-tight text-fei-bg">{result?.level}</h1>
                <p className="mt-4 text-lg font-semibold text-fei-bg/70">{attempt.role}</p>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-fei-bg/55">{result?.reason}</p>
              </div>
              <Link href="/learning" className="inline-flex min-h-12 items-center justify-center rounded-full bg-fei-yellow px-7 py-3 font-black text-fei-bg">
                View my Learning Path →
              </Link>
            </div>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-fei-sky/10 text-2xl text-fei-sky">⌛</div>
              <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-fei-sky">Evaluation in progress</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-fei-bg sm:text-4xl">
                Your final level is not ready yet
              </h1>
              <p className="mt-5 text-sm leading-7 text-fei-bg/55">
                FEI is reviewing your Writing and Speaking evidence. This page will show your result once both production tasks have a valid evaluation.
              </p>
              {result?.reason && <p className="mt-3 text-sm leading-6 text-fei-bg/45">{result.reason}</p>}
            </>
          )}
        </section>

        {communicationProfile && (
          <section className="mt-6 rounded-3xl bg-fei-bg p-7 text-fei-text sm:p-9">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-fei-sky">Stronger evidence</p>
                <div className="mt-4 space-y-3">
                  {communicationProfile.strengths.length > 0 ? communicationProfile.strengths.map((item) => (
                    <div key={item.key} className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.04] px-4 py-3">
                      <p className="font-semibold">{item.label}</p>
                      <p className="mt-1 text-xs text-fei-text/45">{item.evidence.map((evidence) => `${evidence.skill} ${evidence.level}`).join(' · ')}</p>
                    </div>
                  )) : <p className="text-sm text-fei-text/50">More evidence will appear as you complete activities.</p>}
                </div>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-fei-yellow">Priority areas</p>
                <div className="mt-4 space-y-3">
                  {communicationProfile.priorities.map((item) => (
                    <div key={item.key} className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.04] px-4 py-3">
                      <p className="font-semibold">{item.label}</p>
                      <p className="mt-1 text-xs text-fei-text/45">{item.evidence.map((evidence) => `${evidence.skill} ${evidence.level}`).join(' · ') || 'Recommended starting focus'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {result && (
          <section className="mt-6 rounded-3xl border border-fei-bg/10 bg-white p-7">
            <h2 className="text-xl font-bold text-fei-bg">Objective evidence</h2>
            <p className="mt-2 text-sm text-fei-bg/50">
              {result.objective_correct} of {result.objective_total} objective items correct
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              {Object.entries(result.objective_evidence).map(([level, evidence]) => (
                <div key={level} className="rounded-2xl border border-fei-bg/10 bg-fei-bg/[0.025] p-4 text-center">
                  <p className="text-2xl font-black text-fei-bg">{level}</p>
                  <p className="mt-1 text-sm text-fei-bg/50">{evidence.correct}/{evidence.total}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {latestBySkill.size > 0 && (
          <section className="mt-6 grid gap-6 md:grid-cols-2">
            {(['writing', 'speaking'] as const).map((skill) => {
              const evaluation = latestBySkill.get(skill)
              if (!evaluation) return null
              const payload = evaluation.evaluation_payload
              return (
                <div key={skill} className="rounded-3xl border border-fei-bg/10 bg-white p-7">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-fei-sky">{skill}</p>
                  <p className="mt-3 text-4xl font-black text-fei-bg">{payload.overallLevel ?? 'Review'}</p>
                  {payload.rationale && <p className="mt-4 text-sm leading-6 text-fei-bg/55">{payload.rationale}</p>}
                  {payload.dimensions && (
                    <div className="mt-5 grid gap-2">
                      {Object.entries(payload.dimensions).map(([dimension, level]) => (
                        <div key={dimension} className="flex items-center justify-between gap-4 border-t border-fei-bg/8 pt-2 text-xs">
                          <span className="text-fei-bg/50">{dimensionLabel(dimension)}</span>
                          <span className="font-bold text-fei-bg">{level}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}
