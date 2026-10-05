import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { PlacementLevel } from '@/lib/diagnostic/types'
import { buildCommunicationProfile, type ProfileDimension } from '@/lib/learning/pathway'
import { createClient } from '@/lib/supabase/server'

type Attempt = {
  id: string
  role: string
  status: 'pending_evaluation' | 'human_review_required' | 'evaluated'
  submitted_at: string
}

type Result = {
  status: 'ready' | 'pending_production_evaluation' | 'human_review_required'
  level: PlacementLevel | null
}

type Evaluation = {
  skill: 'writing' | 'speaking'
  version: number
  evaluation_payload: {
    dimensions?: Record<string, string> | null
  }
}

type LegacyAssessment = {
  role: string
  level: string
  completed_at: string
}

const PLACEMENT_LEVELS = new Set(['A2', 'B1', 'B2', 'C1'])

function isPlacementLevel(value: unknown): value is PlacementLevel {
  return typeof value === 'string' && PLACEMENT_LEVELS.has(value)
}

function EvidenceCard({ item }: { item: ProfileDimension }) {
  return (
    <div className="rounded-2xl border border-fei-bg/10 bg-white p-5">
      <p className="font-bold text-fei-bg">{item.label}</p>
      {item.evidence.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.evidence.map((evidence) => (
            <span key={`${evidence.skill}-${evidence.level}`} className="rounded-full bg-fei-sky/10 px-3 py-1 text-xs font-semibold text-fei-bg/65">
              {evidence.skill} {evidence.level}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-fei-bg/45">Recommended starting focus</p>
      )}
    </div>
  )
}

function EmptyPath() {
  return (
    <main className="min-h-screen bg-[#F6F7F9] px-6 py-12 text-fei-bg">
      <div className="mx-auto max-w-2xl">
        <Link href="/dashboard" className="text-sm font-semibold text-fei-sky hover:underline">← Back to dashboard</Link>
        <section className="mt-8 rounded-3xl border border-fei-bg/10 bg-white p-10 text-center">
          <h1 className="text-3xl font-black">Your Learning Path starts with the diagnostic</h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-fei-bg/55">
            Complete the role-specific diagnostic so FEI can recommend the right communication priorities and level focus.
          </p>
          <Link href="/dashboard" className="mt-7 inline-flex rounded-full bg-fei-yellow px-7 py-3 font-bold text-fei-bg">
            Go to diagnostic
          </Link>
        </section>
      </div>
    </main>
  )
}

export default async function LearningPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) redirect('/login')

  const [{ data: profileData }, { data: attemptData }, { data: legacyData }] = await Promise.all([
    supabase.from('profiles').select('role, full_name').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('diagnostic_attempts')
      .select('id, role, status, submitted_at')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('assessment_history')
      .select('role, level, completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const attempt = attemptData as Attempt | null
  const legacy = legacyData as LegacyAssessment | null

  if (attempt && attempt.status !== 'evaluated') {
    return (
      <main className="min-h-screen bg-[#F6F7F9] px-6 py-12 text-fei-bg">
        <div className="mx-auto max-w-2xl">
          <Link href="/dashboard" className="text-sm font-semibold text-fei-sky hover:underline">← Back to dashboard</Link>
          <section className="mt-8 rounded-3xl border border-fei-bg/10 bg-white p-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-fei-sky">Learning Path</p>
            <h1 className="mt-4 text-3xl font-black">Your diagnostic is still being evaluated</h1>
            <p className="mt-4 text-sm leading-7 text-fei-bg/55">
              Your personalized path will appear after the Writing and Speaking evaluations are complete.
            </p>
            <Link href={`/diagnostic/results/${attempt.id}`} className="mt-7 inline-flex rounded-full bg-fei-yellow px-7 py-3 font-bold text-fei-bg">
              View evaluation status
            </Link>
          </section>
        </div>
      </main>
    )
  }

  let role = legacy?.role ?? profileData?.role ?? 'Football Professional'
  let level: PlacementLevel | null = isPlacementLevel(legacy?.level) ? legacy.level : null
  let attemptId: string | null = null
  let writingDimensions: Record<string, string> | null = null
  let speakingDimensions: Record<string, string> | null = null

  if (attempt) {
    const [{ data: resultData }, { data: evaluationData }] = await Promise.all([
      supabase.from('diagnostic_results').select('status, level').eq('attempt_id', attempt.id).maybeSingle(),
      supabase
        .from('diagnostic_production_evaluations')
        .select('skill, version, evaluation_payload')
        .eq('attempt_id', attempt.id)
        .order('version', { ascending: false }),
    ])

    const result = resultData as Result | null
    if (result?.status === 'ready' && isPlacementLevel(result.level)) {
      role = attempt.role
      level = result.level
      attemptId = attempt.id
      const latestBySkill = new Map<string, Evaluation>()
      for (const evaluation of (evaluationData ?? []) as Evaluation[]) {
        if (!latestBySkill.has(evaluation.skill)) latestBySkill.set(evaluation.skill, evaluation)
      }
      writingDimensions = latestBySkill.get('writing')?.evaluation_payload.dimensions ?? null
      speakingDimensions = latestBySkill.get('speaking')?.evaluation_payload.dimensions ?? null
    }
  }

  if (!level) return <EmptyPath />

  const communicationProfile = buildCommunicationProfile({
    role,
    level,
    writingDimensions,
    speakingDimensions,
  })
  const displayName = profileData?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'FEI User'

  return (
    <main className="min-h-screen bg-[#F6F7F9] text-fei-bg">
      <nav className="border-b border-fei-bg/[0.08] bg-white/90">
        <div className="mx-auto flex min-h-[64px] max-w-7xl items-center justify-between px-6 sm:px-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/fei-logo-navbar-vector.svg" alt="FEI" width={36} height={36} className="h-9 w-auto" />
            <span className="hidden text-sm font-medium text-fei-bg/55 sm:inline">Football English Intelligence</span>
          </Link>
          <div className="flex items-center gap-4 text-sm font-semibold">
            {attemptId && <Link href={`/diagnostic/results/${attemptId}`} className="text-fei-bg/55 hover:text-fei-bg">Diagnostic report</Link>}
            <Link href="/dashboard" className="text-fei-bg/55 hover:text-fei-bg">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:py-14">
        <section className="overflow-hidden rounded-[32px] bg-fei-bg px-7 py-9 text-fei-text sm:px-10 lg:px-12 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-fei-sky">{displayName}&apos;s FEI path</p>
              <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                {communicationProfile.role} Communication
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-fei-text/60">
                Your starting path uses your diagnostic evidence to prioritize the communication you need for your role.
              </p>
            </div>
            <div className="rounded-3xl border border-fei-text/10 bg-fei-text/[0.04] px-7 py-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-fei-text/40">Current level</p>
              <div className="mt-2 flex items-end gap-3">
                <span className="text-5xl font-black text-fei-yellow">{communicationProfile.level}</span>
                <span className="pb-1 text-sm font-semibold text-fei-text/60">{communicationProfile.levelLabel}</span>
              </div>
              <p className="mt-3 text-sm text-fei-sky">{communicationProfile.nextGoal}</p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-fei-sky">Stronger evidence</p>
            <div className="mt-4 grid gap-3">
              {communicationProfile.strengths.length > 0 ? communicationProfile.strengths.map((item) => (
                <EvidenceCard key={item.key} item={item} />
              )) : (
                <div className="rounded-2xl border border-fei-bg/10 bg-white p-5 text-sm leading-6 text-fei-bg/50">
                  Your first completed activities will add more detailed strength evidence.
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-fei-yellow">Priority areas</p>
            <div className="mt-4 grid gap-3">
              {communicationProfile.priorities.map((item) => <EvidenceCard key={item.key} item={item} />)}
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-fei-sky">Recommended sequence</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.03em]">Your first three modules</h2>
            <p className="mt-3 text-sm leading-7 text-fei-bg/55">
              Each module combines a real role scenario with the grammar, vocabulary and communication control expected at your current level.
            </p>
          </div>

          <div className="mt-7 grid gap-5 lg:grid-cols-3">
            {communicationProfile.modules.map((module, index) => (
              <article key={module.id} className={`rounded-3xl border bg-white p-6 ${index === 0 ? 'border-fei-yellow/60 shadow-[0_18px_45px_rgba(250,204,21,0.12)]' : 'border-fei-bg/10'}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${index === 0 ? 'bg-fei-yellow/20 text-fei-bg' : 'bg-fei-bg/[0.05] text-fei-bg/45'}`}>
                    {index === 0 ? 'Start here' : index === 1 ? 'Next' : 'Then'}
                  </span>
                  <span className="text-2xl font-black text-fei-bg/15">0{module.order}</span>
                </div>
                <h3 className="mt-5 text-xl font-black leading-7">{module.title}</h3>
                <p className="mt-3 text-sm leading-6 text-fei-bg/55">{module.scenario}</p>

                <div className="mt-6 space-y-4 border-t border-fei-bg/8 pt-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fei-sky">Communication focus</p>
                    <p className="mt-1 text-sm font-semibold text-fei-bg/75">{module.communicationFocus}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fei-bg/35">Language focus</p>
                    <p className="mt-1 text-sm leading-6 text-fei-bg/60">{module.grammarFocus}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fei-bg/35">Vocabulary focus</p>
                    <p className="mt-1 text-sm leading-6 text-fei-bg/60">{module.vocabularyFocus}</p>
                  </div>
                </div>

                <p className="mt-6 rounded-2xl bg-fei-bg/[0.035] px-4 py-3 text-sm font-semibold leading-6 text-fei-bg/70">
                  Outcome: {module.outcome}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
