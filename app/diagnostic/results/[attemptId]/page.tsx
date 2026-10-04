import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { summarizeObjectiveEvidence } from '@/lib/diagnostic/placement'
import { buildCommunicationProfile } from '@/lib/learning/pathway'
import type { ObjectiveItemEvidence, PlacementLevel } from '@/lib/diagnostic/types'

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

type Attempt = {
  id: string
  role: string
  status: string
  submitted_at: string
  objective_evidence: ObjectiveItemEvidence[]
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

function dimensionLabel(value: string) {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function provisionalLevel(evidence: ObjectiveItemEvidence[]): PlacementLevel {
  const summary = summarizeObjectiveEvidence(evidence)
  if (summary.A2.thresholdMet && summary.B1.thresholdMet && summary.B2.thresholdMet && summary.C1.thresholdMet) return 'C1'
  if (summary.A2.thresholdMet && summary.B1.thresholdMet && summary.B2.thresholdMet) return 'B2'
  if (summary.A2.thresholdMet && summary.B1.thresholdMet) return 'B1'
  return 'A2'
}

function profileSignals(evidence: ObjectiveItemEvidence[]) {
  const sections = ['reading', 'listening', 'vocabulary'] as const
  const labels = {
    reading: 'Reading football information',
    listening: 'Understanding spoken football English',
    vocabulary: 'Football vocabulary and language choices',
  }
  const scores = sections.map((section) => {
    const items = evidence.filter((item) => item.section === section)
    const correct = items.filter((item) => item.correct).length
    return { section, label: labels[section], correct, total: items.length }
  })
  const strengths = [...scores].sort((a, b) => b.correct / Math.max(b.total, 1) - a.correct / Math.max(a.total, 1))
  const priorities = [...scores].sort((a, b) => a.correct / Math.max(a.total, 1) - b.correct / Math.max(b.total, 1))
  return {
    strengths: strengths.slice(0, 2).map((item) => item.label),
    priorities: priorities.slice(0, 2).map((item) => item.label),
  }
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

  const [{ data: attemptData }, { data: resultData }, { data: evaluationData }] = await Promise.all([
    supabase
      .from('diagnostic_attempts')
      .select('id, role, status, submitted_at, objective_evidence')
      .eq('id', attemptId)
      .maybeSingle(),
    supabase.from('diagnostic_results').select('*').eq('attempt_id', attemptId).maybeSingle(),
    supabase
      .from('diagnostic_production_evaluations')
      .select('skill, version, evaluation_payload')
      .eq('attempt_id', attemptId)
      .order('version', { ascending: false }),
  ])

  if (!attemptData) notFound()

  const attempt = attemptData as Attempt
  const result = resultData as Result | null
  const evidence = Array.isArray(attempt.objective_evidence) ? attempt.objective_evidence : []
  const initialLevel = result?.level ?? provisionalLevel(evidence)
  const signals = profileSignals(evidence)
  const latestBySkill = new Map<string, Evaluation>()
  for (const evaluation of (evaluationData ?? []) as Evaluation[]) {
    if (!latestBySkill.has(evaluation.skill)) latestBySkill.set(evaluation.skill, evaluation)
  }
  const communicationProfile = buildCommunicationProfile({
    role: attempt.role,
    level: initialLevel as PlacementLevel,
    writingDimensions: latestBySkill.get('writing')?.evaluation_payload.dimensions,
    speakingDimensions: latestBySkill.get('speaking')?.evaluation_payload.dimensions,
  })

  const isReady = result?.status === 'ready' && Boolean(result.level)
  const objectiveEvidence = result?.objective_evidence ?? summarizeObjectiveEvidence(evidence)
  const objectiveCorrect = result?.objective_correct ?? evidence.filter((item) => item.correct).length
  const objectiveTotal = result?.objective_total ?? evidence.length

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#F7FAFC] to-[#EAF7FC] px-6 py-10 text-fei-bg sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="text-sm font-semibold text-fei-bg/45 hover:underline">
          ← Back to dashboard
        </Link>

        <section className="mt-8 rounded-[30px] border border-fei-bg/10 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:p-12">
          {isReady ? (
            <>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-fei-bg/45">Final FEI profile</p>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
                <div>
                  <h1 className="text-7xl font-black tracking-[-0.06em] text-fei-bg">{result.level}</h1>
                  <p className="mt-2 text-lg font-semibold text-fei-bg/65">{attempt.role}</p>
                </div>
                <span className="rounded-full bg-fei-yellow/20 px-4 py-2 text-sm font-bold text-fei-bg">Final result</span>
              </div>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-fei-bg/55">{result.reason}</p>
            </>
          ) : (
            <>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-fei-bg/45">Initial FEI profile</p>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
                <div>
                  <h1 className="text-7xl font-black tracking-[-0.06em] text-fei-bg">{initialLevel}</h1>
                  <p className="mt-2 text-lg font-semibold text-fei-bg/65">{attempt.role}</p>
                </div>
                <span className="rounded-full bg-fei-sky/10 px-4 py-2 text-sm font-bold text-fei-bg/45">Ready now</span>
              </div>
              <p className="mt-6 max-w-2xl text-base leading-7 text-fei-bg/65">
                Your initial profile is ready from your objective responses. Writing and Speaking will refine your final FEI level later.
              </p>
            </>
          )}

          {!isReady && (
            <div className="mt-8 rounded-2xl border border-fei-sky/20 bg-fei-sky/[0.06] p-5">
              <p className="text-sm font-bold text-fei-bg">You can start with this profile today.</p>
              <p className="mt-1 text-sm leading-6 text-fei-bg/55">
                Your pathway can use this starting point while the production evidence is reviewed.
              </p>
            </div>
          )}
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border border-fei-bg/10 bg-white p-7">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-fei-bg/40">Strengths</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-fei-bg/65">
              {signals.strengths.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </div>
          <div className="rounded-[24px] border border-fei-bg/10 bg-white p-7">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-fei-bg/40">Priorities</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-fei-bg/65">
              {signals.priorities.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] bg-fei-bg p-7 text-white shadow-[0_24px_70px_rgba(7,17,31,0.16)] sm:p-9">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">Your FEI pathway</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em]">{communicationProfile.levelLabel}</h2>
              <p className="mt-2 text-sm text-white/60">{communicationProfile.nextGoal}</p>
            </div>
            <Link href="/learning" className="rounded-full bg-fei-yellow px-5 py-2.5 text-sm font-bold text-fei-bg transition hover:bg-fei-yellow/90">
              Explore pathway
            </Link>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {communicationProfile.modules.map((module) => (
              <article key={module.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/40">Module {String(module.order).padStart(2, '0')}</p>
                <h3 className="mt-3 text-lg font-bold">{module.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/65">{module.scenario}</p>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-xs font-bold text-fei-bg/45">Communication focus</p>
                  <p className="mt-1 text-sm text-white/70">{module.communicationFocus}</p>
                </div>
                <p className="mt-4 text-xs leading-5 text-white/50">{module.outcome}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[24px] border border-fei-bg/10 bg-white p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-fei-bg">Objective evidence</h2>
              <p className="mt-2 text-sm text-fei-bg/50">{objectiveCorrect} of {objectiveTotal} objective items correct</p>
            </div>
            {!isReady && <span className="text-xs font-semibold text-fei-bg/40">Initial signal</span>}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {Object.entries(objectiveEvidence).map(([level, item]) => (
              <div key={level} className="rounded-2xl border border-fei-bg/10 bg-fei-bg/[0.025] p-4 text-center">
                <p className="text-2xl font-black text-fei-bg">{level}</p>
                <p className="mt-1 text-sm text-fei-bg/50">{item.correct}/{item.total}</p>
              </div>
            ))}
          </div>
        </section>

        {latestBySkill.size > 0 && (
          <section className="mt-6 grid gap-6 md:grid-cols-2">
            {(['writing', 'speaking'] as const).map((skill) => {
              const evaluation = latestBySkill.get(skill)
              if (!evaluation) return null
              const payload = evaluation.evaluation_payload
              return (
                <div key={skill} className="rounded-3xl border border-fei-bg/10 bg-white p-7">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-fei-bg/45">{skill}</p>
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
