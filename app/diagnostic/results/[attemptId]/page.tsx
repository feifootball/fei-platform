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

  const insightSections = communicationProfile
    ? [
        { title: 'Stronger evidence', subtitle: 'The communication skills you already show.', items: communicationProfile.strengths, accent: 'bg-fei-sky' },
        { title: 'Priority areas', subtitle: 'The skills to develop next.', items: communicationProfile.priorities, accent: 'bg-fei-yellow' },
      ]
    : []

  return (
    <main className="min-h-screen bg-[#F5F8FB] px-6 py-10 text-fei-bg sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-fei-bg/50 transition hover:text-fei-bg">
            <span className="text-lg">←</span> Back to dashboard
          </Link>
          <span className="hidden text-xs font-bold uppercase tracking-[0.24em] text-fei-bg/35 sm:inline">FEI diagnostic result</span>
        </div>

        {isReady && result && communicationProfile ? (
          <>
            <header className="mt-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-fei-sky">Your diagnostic result</p>
                <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.055em] sm:text-6xl">A clearer picture of your football English.</h1>
                <p className="mt-4 text-base leading-7 text-fei-bg/55">Your result is built around the communication demands of your role.</p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-fei-bg/65 shadow-sm ring-1 ring-fei-bg/[0.08]">
                <span className="h-2.5 w-2.5 rounded-full bg-fei-sky" /> Profile ready
              </span>
            </header>

            <section className="mt-8 overflow-hidden rounded-[32px] bg-white shadow-[0_24px_70px_rgba(7,17,31,0.08)] ring-1 ring-fei-bg/[0.08]">
              <div className="grid lg:grid-cols-[0.76fr_1.24fr]">
                <div className="relative overflow-hidden bg-[#07111F] p-8 text-white sm:p-10">
                  <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-fei-sky/20 blur-2xl" />
                  <div className="relative">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/45">Initial FEI level</p>
                    <p className="mt-6 text-8xl font-semibold tracking-[-0.08em]">{result.level}</p>
                    <p className="mt-2 text-lg text-white/65">{attempt.role}</p>
                    <div className="mt-10 inline-flex rounded-full border border-fei-sky/35 bg-fei-sky/10 px-4 py-2 text-sm font-semibold text-fei-sky">Ready to use in your pathway</div>
                  </div>
                </div>
                <div className="p-8 sm:p-10">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-fei-bg/42">What this means</p>
                  <p className="mt-5 max-w-2xl text-lg leading-8 text-fei-bg/65">{result.reason}</p>
                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {[
                      ['Level', 'Your starting point'],
                      ['Priorities', 'What to practise first'],
                      ['Pathway', 'Your next role-based step'],
                    ].map(([title, text]) => (
                      <div key={title} className="rounded-2xl bg-[#F6FAFC] p-4 ring-1 ring-fei-bg/[0.06]">
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="mt-1 text-xs leading-5 text-fei-bg/50">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[28px] bg-white p-7 shadow-[0_18px_55px_rgba(7,17,31,0.06)] ring-1 ring-fei-bg/[0.08] sm:p-8">
                <div className="flex items-center justify-between">
                  <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-fei-bg/42">Your level</p><p className="mt-2 text-sm text-fei-bg/50">CEFR-aligned communication scale</p></div>
                  <span className="rounded-full bg-fei-yellow/20 px-3 py-1.5 text-sm font-bold">{result.level}</span>
                </div>
                <div className="mt-8 flex gap-2">
                  {['A2', 'B1', 'B2', 'C1'].map((level, index) => (
                    <div key={level} className="flex-1">
                      <div className={index <= levelPosition(result.level) ? 'h-3 rounded-full bg-fei-sky' : 'h-3 rounded-full bg-fei-bg/[0.08]'} />
                      <p className={level === result.level ? 'mt-2 text-sm font-bold' : 'mt-2 text-sm text-fei-bg/40'}>{level}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-7 border-t border-fei-bg/[0.08] pt-5 text-sm leading-6 text-fei-bg/55">This is your starting point for the FEI pathway. Your practice will build from here.</p>
              </div>
              <Link href="/learning" className="group rounded-[28px] bg-fei-yellow p-7 shadow-[0_18px_55px_rgba(250,204,21,0.2)] transition hover:-translate-y-1 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-fei-bg/55">Next step</p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em]">Explore your Learning Pathway.</h2>
                <p className="mt-3 text-sm leading-6 text-fei-bg/65">Turn this result into focused football English practice.</p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold">View Learning Path <span className="text-lg transition group-hover:translate-x-1">→</span></span>
              </Link>
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-2">
              {insightSections.map((section) => (
                <div key={section.title} className="rounded-[28px] bg-white p-7 shadow-[0_18px_55px_rgba(7,17,31,0.06)] ring-1 ring-fei-bg/[0.08] sm:p-8">
                  <div className={section.accent + ' mb-5 h-1 w-14 rounded-full'} />
                  <h2 className="text-2xl font-semibold tracking-[-0.035em]">{section.title}</h2>
                  <p className="mt-2 text-sm text-fei-bg/50">{section.subtitle}</p>
                  <div className="mt-6 space-y-3">
                    {section.items.length > 0 ? section.items.map((item) => (
                      <div key={item.key} className="rounded-2xl bg-[#F7FAFC] p-4 ring-1 ring-fei-bg/[0.05]">
                        <p className="font-semibold">{item.label}</p>
                        <p className="mt-1 text-xs leading-5 text-fei-bg/50">{item.evidence.map((evidence) => evidence.skill + ' ' + evidence.level).join(' · ') || 'Recommended starting focus'}</p>
                      </div>
                    )) : <p className="text-sm text-fei-bg/50">More evidence will appear as you complete activities.</p>}
                  </div>
                </div>
              ))}           </section>

            {result && (
              <section className="mt-6 rounded-[28px] bg-white p-7 shadow-[0_18px_55px_rgba(7,17,31,0.06)] ring-1 ring-fei-bg/[0.08] sm:p-8">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-fei-bg/42">Objective evidence</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">How the result was built</h2></div>
                  <p className="text-sm text-fei-bg/50">{result.objective_correct} of {result.objective_total} objective items correct</p>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-4">
                  {Object.entries(result.objective_evidence).map(([level, evidence]) => (
                    <div key={level} className="rounded-2xl bg-[#F7FAFC] p-4 ring-1 ring-fei-bg/[0.05]">
                      <div className="flex items-center justify-between"><p className="text-lg font-bold">{level}</p><p className="text-xs font-semibold text-fei-bg/50">{evidence.correct}/{evidence.total}</p></div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-fei-bg/[0.08]"><div className="h-full rounded-full bg-fei-sky" style={{ width: evidence.total ? ((evidence.correct / evidence.total) * 100) + '%' : '0%' }} /></div>
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
                    <div key={skill} className="rounded-[28px] bg-white p-7 shadow-[0_18px_55px_rgba(7,17,31,0.06)] ring-1 ring-fei-bg/[0.08] sm:p-8">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-fei-sky">{skill}</p>
                      <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">{payload.overallLevel ?? 'Review'}</p>
                      {payload.rationale && <p className="mt-4 text-sm leading-6 text-fei-bg/55">{payload.rationale}</p>}
                      {payload.dimensions && <div className="mt-5 grid gap-2">{Object.entries(payload.dimensions).map(([dimension, level]) => <div key={dimension} className="flex items-center justify-between gap-4 border-t border-fei-bg/[0.08] pt-2 text-xs"><span className="text-fei-bg/50">{dimensionLabel(dimension)}</span><span className="font-bold">{level}</span></div>)}</div>}
                    </div>
                  )
                })}
              </section>
            )}
          </>
        ) : (
          <section className="mx-auto mt-14 max-w-3xl rounded-[32px] bg-white p-8 shadow-[0_24px_70px_rgba(7,17,31,0.08)] ring-1 ring-fei-bg/[0.08] sm:p-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-fei-sky/10 text-2xl text-fei-sky">⌛</div>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.24em] text-fei-sky">Evaluation in progress</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Your final level is not ready yet</h1>
            <p className="mt-5 text-base leading-7 text-fei-bg/55">FEI is reviewing your Writing and Speaking evidence. This page will show your result once both production tasks have a valid evaluation.</p>
            {result?.reason && <p className="mt-3 text-sm leading-6 text-fei-bg/45">{result.reason}</p>}
          </section>
        )}
      </div>
    </main>
  )

}
