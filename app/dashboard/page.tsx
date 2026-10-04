'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Assessment = {
  level: string
  score: number
  role: string
  completed_at: string
}

type DiagnosticAttempt = {
  id: string
  role: string
  status: 'pending_evaluation' | 'human_review_required' | 'evaluated'
  submitted_at: string
  level: string | null
}

const diagnosticRoles = [
  'Professional Player',
  'Head Coach',
  'Assistant Coach',
  'Scout',
  'Head of Scouting',
  'Academy Director',
  'Performance Analyst',
  'Fitness Coach',
  'Physiotherapist',
  'Sports Psychologist',
  'Nutritionist',
]

const needsRoleSelection = (role: string) => {
  return !role || role === "I'll choose later" || role === 'Other football role'
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}


function NewUserDashboard({
  displayName,
  userRole,
  onSignOut,
}: {
  displayName: string
  userRole: string
  onSignOut: () => void
}) {
  return (
    <main className="min-h-screen bg-[#F7FAFC] text-fei-bg">
      <nav className="border-b border-fei-bg/[0.08] bg-white">
        <div className="mx-auto flex min-h-[56px] max-w-[1440px] items-center justify-between px-6 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center" aria-label="Go to FEI home">
            <img src="/fei-logo-navbar-vector.svg" alt="FEI" className="h-9 w-auto" />
            <span className="mx-4 hidden h-5 w-px bg-fei-bg/10 sm:block" />
            <span className="hidden text-sm font-medium text-fei-bg/55 sm:inline">
              Football English Intelligence
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/faq" className="rounded-lg px-3 py-2 text-sm font-medium text-fei-bg/55 hover:bg-fei-bg/[0.04]">
              Help
            </Link>
            <button type="button" onClick={onSignOut} className="rounded-lg px-3 py-2 text-sm font-medium text-fei-bg/55 hover:bg-fei-bg/[0.04]">
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-3 sm:px-8 lg:py-4">
        <section className="border-b border-fei-bg/10 px-0 py-3 pb-8 sm:py-5 sm:pb-9">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fei-sky">
                Your FEI profile
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
                {displayName}
              </h1>
              <p className="mt-2 text-base font-medium text-fei-bg/55">
                {userRole}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-fei-bg/55">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-fei-yellow bg-white" />
              <span className="font-semibold text-fei-bg/70">Diagnostic status</span>
              <span>Not started</span>
            </div>
          </div>
        </section>

        <div className="mt-3 h-px bg-gradient-to-r from-transparent via-fei-bg/[0.06] to-transparent" />

        <div className="mt-3 grid grid-cols-1 gap-4">
          <section className="flex flex-col rounded-[28px] border border-fei-bg/10 bg-white p-5 shadow-[0_18px_50px_rgba(7,17,31,0.04)] sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fei-bg/45">
                Your starting point
              </p>
              <span className="rounded-2xl bg-fei-sky/[0.12] px-4 py-2 text-sm font-semibold text-fei-bg">
                15–20 min
              </span>
            </div>
            <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-[1.12] tracking-[-0.035em] sm:text-4xl">
              Find your current football english level.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-fei-bg/55">
              A short assessment built around your role in football.
            </p>

            <div className="mt-5 border-t border-fei-bg/[0.07] pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fei-bg/40">
                What we evaluate
              </p>
              <div className="mt-3">
                {[
                  'Role-specific football communication',
                  'Clarity in real situations',
                  'Vocabulary and language control',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 py-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-fei-sky" />
                    <p className="text-sm leading-5 text-fei-bg/60">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-start pt-4">
              <div className="inline-block">
                <Link
                  href={"/assessment?role=" + encodeURIComponent(userRole)}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-fei-yellow px-7 py-3.5 text-base font-bold text-fei-bg shadow-[0_12px_28px_rgba(250,204,21,0.2)] transition hover:-translate-y-0.5 hover:bg-fei-yellow/90"
                >
                  Start diagnostic
                  <ChevronRightIcon />
                </Link>
                <p className="mt-2 text-center text-sm text-fei-bg/45">Free initial assessment</p>
              </div>
            </div>
          </section>

          <aside className="px-0 py-3 sm:py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fei-bg/45">
              Your next step
            </p>

            <div className="mt-8">
              <p className="text-2xl font-semibold tracking-[-0.025em]">Start with your diagnostic</p>
              <p className="mt-3 text-sm leading-6 text-fei-bg/55">
                Your result will unlock the next two steps in your FEI pathway.
              </p>
            </div>

            <div className="mt-6 border-t border-fei-bg/10 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-fei-bg/40">
                FEI profile
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  ['Level', 'A CEFR-aligned result showing your current communication level in football.'],
                  ['Strengths', 'The communication habits and language resources you already use effectively.'],
                  ['Improvements', 'The specific gaps to work on first, from clarity to vocabulary and control.'],
                  ['Pathway', 'A role-based sequence of modules matched to your diagnostic profile.'],
                ].map(([title, description]) => (
                  <div key={title} tabIndex={0} className="group flex min-h-[68px] cursor-default flex-col justify-between overflow-hidden rounded-2xl border border-fei-bg/10 bg-[#F8FCFE] p-2.5 outline-none transition duration-300 hover:-translate-y-0.5 hover:border-fei-sky/35 hover:bg-white focus:-translate-y-0.5 focus:border-fei-sky/35 focus:bg-white">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold transition group-hover:text-fei-sky group-focus:text-fei-sky">{title}</p>
                      <span className="h-2 w-2 rounded-full bg-fei-sky/55 transition group-hover:bg-fei-yellow group-focus:bg-fei-yellow" />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-fei-bg/55 opacity-0 translate-y-1 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}

function CompletedDiagnosticDashboard({
  displayName,
  userRole,
  level,
  attemptId,
  onSignOut,
}: {
  displayName: string
  userRole: string
  level: string
  attemptId: string
  onSignOut: () => void
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#F7FAFC] to-[#EAF7FC] text-fei-bg">
      <nav className="border-b border-fei-bg/[0.08] bg-white">
        <div className="mx-auto flex min-h-[56px] max-w-[1440px] items-center justify-between px-6 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center" aria-label="Go to FEI home">
            <img src="/fei-logo-navbar-vector.svg" alt="FEI" className="h-9 w-auto" />
            <span className="mx-4 hidden h-5 w-px bg-fei-bg/10 sm:block" />
            <span className="hidden text-sm font-medium text-fei-bg/55 sm:inline">Football English Intelligence</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/faq" className="rounded-lg px-3 py-2 text-sm font-medium text-fei-bg/55 hover:bg-fei-bg/[0.04]">Help</Link>
            <button type="button" onClick={onSignOut} className="rounded-lg px-3 py-2 text-sm font-medium text-fei-bg/55 hover:bg-fei-bg/[0.04]">Sign out</button>
          </div>
        </div>
      </nav>
      <section className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:py-10">
        <section className="border-b border-fei-bg/10 px-0 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fei-bg/45">Your FEI profile</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-[-0.045em] sm:text-5xl">{displayName}</h1>
              <p className="mt-2 text-base font-medium text-fei-bg/55">{userRole}</p>
            </div>
            <span className="rounded-full bg-fei-sky/10 px-4 py-2 text-sm font-semibold text-fei-bg/55">Profile ready</span>
          </div>
        </section>
        <section className="mt-6 rounded-[28px] border border-fei-bg/10 bg-white p-6 shadow-[0_18px_50px_rgba(7,17,31,0.04)] sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fei-bg/45">Your starting point</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Your FEI profile is ready.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-fei-bg/55">Your initial level, priorities, and role-based pathway are ready to explore.</p>
            </div>
            <div className="rounded-2xl bg-fei-bg px-6 py-4 text-center text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Initial level</p>
              <p className="mt-1 text-4xl font-black">{level}</p>
            </div>
          </div>
          <Link href={`/diagnostic/results/${attemptId}`} className="mt-7 inline-flex min-h-[52px] items-center justify-center rounded-full bg-fei-yellow px-7 py-3.5 text-base font-bold text-fei-bg shadow-[0_12px_28px_rgba(250,204,21,0.2)] transition hover:-translate-y-0.5 hover:bg-fei-yellow/90">
            View profile and pathway <ChevronRightIcon />
          </Link>
        </section>
      </section>
    </main>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [savingRole, setSavingRole] = useState(false)
  const [lastAssessment, setLastAssessment] = useState<Assessment | null>(null)
  const [latestDiagnostic, setLatestDiagnostic] = useState<DiagnosticAttempt | null>(null)
  const [assessmentCount, setAssessmentCount] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('user_id', user.id)
      .maybeSingle()

    const name =
      profileData?.full_name ||
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'FEI User'

    const role =
      profileData?.role ||
      user.user_metadata?.role ||
      ''

    setDisplayName(name)
    setUserRole(role)
    setSelectedRole(diagnosticRoles.includes(role) ? role : '')

    const { data: assessments, count } = await supabase
      .from('assessment_history')
      .select('level, score, role, completed_at', { count: 'exact' })
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(1)

    setLastAssessment(assessments?.[0] || null)

    const { data: diagnosticAttempts, count: diagnosticCount } = await supabase
      .from('diagnostic_attempts')
      .select('id, role, status, submitted_at', { count: 'exact' })
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(1)

    const latestAttempt = diagnosticAttempts?.[0]
    if (latestAttempt) {
      const { data: diagnosticResult } = await supabase
        .from('diagnostic_results')
        .select('level')
        .eq('attempt_id', latestAttempt.id)
        .maybeSingle()

      setLatestDiagnostic({
        ...latestAttempt,
        level: diagnosticResult?.level ?? null,
      })
    }

    setAssessmentCount((count || 0) + (diagnosticCount || 0))
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleSaveRole() {
    if (!selectedRole) return

    setSavingRole(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    const { error } = existingProfile
      ? await supabase
          .from('profiles')
          .update({ role: selectedRole })
          .eq('user_id', user.id)
      : await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            role: selectedRole,
          })

    if (!error) {
      setUserRole(selectedRole)
    }

    setSavingRole(false)
  }

  function getResultLabel(level: string) {
    if (!level) return '—'
    return level.toUpperCase()
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FA] text-fei-bg">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-fei-yellow border-t-transparent" />
      </main>
    )
  }

  const hasValidRole = !needsRoleSelection(userRole)
  const diagnosticStatus = latestDiagnostic
    ? latestDiagnostic.status === 'evaluated'
      ? 'Completed'
      : 'In review'
    : lastAssessment
      ? 'Completed'
      : 'Not started'
  const currentResult = latestDiagnostic?.level
    ? getResultLabel(latestDiagnostic.level)
    : lastAssessment
      ? getResultLabel(lastAssessment.level)
      : '—'

  const isNewUser = hasValidRole && !latestDiagnostic

  if (isNewUser) {
    return (
      <NewUserDashboard
        displayName={displayName}
        userRole={userRole}
        onSignOut={handleLogout}
      />
    )
  }

  if (latestDiagnostic) {
    return (
      <CompletedDiagnosticDashboard
        displayName={displayName}
        userRole={userRole}
        level={currentResult}
        attemptId={latestDiagnostic.id}
        onSignOut={handleLogout}
      />
    )
  }

  return (
    <main className="min-h-screen bg-[#F6F7F9] text-fei-bg">
      <div className="mx-auto max-w-7xl px-6 py-10 text-center sm:px-8 lg:py-16">
        <h1 className="text-3xl font-bold">Your FEI profile</h1>
        <p className="mt-3 text-fei-bg/55">Your profile is ready to view.</p>
      </div>
    </main>
  )
}
}
