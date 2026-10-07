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
  objective_evidence?: Array<{ level: string; correct: boolean }> | null
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

function initialLevelFromEvidence(evidence: Array<{ level: string; correct: boolean }> | null | undefined) {
  if (!evidence?.length) return null
  const levels = ['A2', 'B1', 'B2', 'C1']
  let current = 'A2'
  for (const level of levels) {
    const items = evidence.filter((item) => item.level === level)
    if (items.length && items.filter((item) => item.correct).length >= 2) current = level
    else if (level !== 'A2') break
  }
  return current
}

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
  const evaluationAreas = [
    'Role-specific football communication',
    'Clarity in real situations',
    'Vocabulary and language control',
  ]

  const profilePreview = [
    ['Level', 'Your current communication level in football.'],
    ['Strengths', 'What you already communicate with confidence.'],
    ['Improvements', 'The areas to practise first.'],
    ['Pathway', 'Your next role-based learning step.'],
  ]

  return (
    <main className="min-h-screen overflow-hidden bg-[#F5F8FB] text-fei-bg">
      <nav className="relative z-20 border-b border-fei-bg/[0.08] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[64px] max-w-[1440px] items-center justify-between px-6 sm:px-10">
          <Link href="/" className="flex items-center" aria-label="Go to FEI home">
            <img src="/fei-logo-navbar-vector.svg" alt="FEI" className="h-9 w-auto" />
            <span className="mx-4 hidden h-5 w-px bg-fei-bg/10 sm:block" />
            <span className="hidden text-sm font-medium text-fei-bg/55 sm:inline">
              Football English Intelligence
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/faq" className="rounded-full px-4 py-2 text-sm font-medium text-fei-bg/55 transition hover:bg-fei-bg/[0.05] hover:text-fei-bg">
              Help
            </Link>
            <button type="button" onClick={onSignOut} className="rounded-full px-4 py-2 text-sm font-medium text-fei-bg/55 transition hover:bg-fei-bg/[0.05] hover:text-fei-bg">
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="relative">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-fei-sky/[0.16] blur-3xl" />
        <div className="pointer-events-none absolute -left-48 top-[520px] h-[460px] w-[460px] rounded-full bg-fei-yellow/[0.1] blur-3xl" />

        <section className="relative mx-auto max-w-7xl px-6 pb-16 pt-10 sm:px-10 lg:pb-24 lg:pt-14">
          <header className="flex flex-col justify-between gap-8 border-b border-fei-bg/10 pb-9 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-fei-sky">
                Your FEI profile
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-x-5 gap-y-2">
                <h1 className="text-5xl font-semibold tracking-[-0.055em] sm:text-6xl">
                  {displayName}
                </h1>
                <span className="mb-1 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-fei-bg/65 shadow-sm ring-1 ring-fei-bg/[0.07]">
                  {userRole}
                </span>
              </div>
              <p className="mt-4 max-w-2xl text-base leading-7 text-fei-bg/55">
                Your role shapes the situations, language, and priorities inside your FEI pathway.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start rounded-full bg-white/80 px-4 py-2.5 text-sm shadow-sm ring-1 ring-fei-bg/[0.07] lg:self-end">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-fei-yellow bg-white" />
              <span className="font-semibold text-fei-bg/70">Diagnostic</span>
              <span className="text-fei-bg/45">Not started</span>
            </div>
          </header>

          <div className="mt-9 grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
            <section className="relative overflow-hidden rounded-[32px] bg-white p-7 shadow-[0_24px_70px_rgba(7,17,31,0.08)] ring-1 ring-fei-bg/[0.08] sm:p-10">
              <div className="absolute right-0 top-0 h-44 w-44 translate-x-1/3 -translate-y-1/3 rounded-full bg-fei-sky/[0.12] blur-2xl" />
              <div className="relative flex items-start justify-between gap-5">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-fei-bg/45">
                  Your starting point
                </p>
                <span className="shrink-0 rounded-full bg-[#EFF9FE] px-4 py-2 text-sm font-semibold text-fei-bg/75 ring-1 ring-fei-sky/15">
                  15–20 min
                </span>
              </div>

              <h2 className="relative mt-8 max-w-2xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl">
                Find your current football English level.
              </h2>
              <p className="relative mt-5 max-w-xl text-base leading-7 text-fei-bg/55">
                A short assessment built around your role in football.
              </p>

              <div className="relative mt-8 rounded-2xl bg-[#F8FBFD] p-5 ring-1 ring-fei-bg/[0.06]">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-fei-bg/42">
                  What we evaluate
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {evaluationAreas.map((item, index) => (
                    <div key={item} className="group rounded-xl bg-white px-3.5 py-3 ring-1 ring-fei-bg/[0.06] transition duration-300 hover:-translate-y-1 hover:ring-fei-sky/30">
                      <span className="text-xs font-semibold text-fei-sky">0{index + 1}</span>
                      <p className="mt-2 text-sm leading-5 text-fei-bg/65 transition group-hover:text-fei-bg">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href={"/assessment?role=" + encodeURIComponent(userRole)}
                  className="group inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-fei-yellow px-7 py-3.5 text-base font-bold text-fei-bg shadow-[0_16px_32px_rgba(250,204,21,0.24)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_38px_rgba(250,204,21,0.34)]"
                >
                  Start diagnostic
                  <ChevronRightIcon />
                </Link>
                <span className="text-sm text-fei-bg/45">Free initial assessment</span>
              </div>
            </section>

            <aside className="rounded-[32px] bg-gradient-to-br from-white via-[#F8FCFE] to-[#EDF8FD] p-7 text-fei-bg shadow-[0_24px_70px_rgba(7,17,31,0.08)] ring-1 ring-fei-sky/15 sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-fei-bg/45">
                Your next step
              </p>
              <h2 className="mt-5 max-w-md text-3xl font-semibold leading-tight tracking-[-0.04em]">
                Start with your diagnostic.
              </h2>
              <p className="mt-4 max-w-md text-base leading-7 text-fei-bg/58">
                One short assessment opens the profile and pathway built around your role.
              </p>

              <div className="mt-9 flex items-center gap-2">
                {['Diagnostic', 'Profile', 'Pathway'].map((label, index) => (
                  <div key={label} className="flex min-w-0 flex-1 items-center gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-fei-bg/10 bg-white/70 text-sm font-semibold text-fei-bg/70">
                      0{index + 1}
                    </div>
                    {index < 2 && <div className="h-px flex-1 bg-fei-bg/10" />}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-fei-bg/42">
                <span>Diagnostic</span><span>Profile</span><span>Pathway</span>
              </div>

              <div className="mt-10 border-t border-fei-bg/10 pt-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-fei-bg/42">
                  What your result includes
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {profilePreview.map(([title, description]) => (
                    <div key={title} tabIndex={0} className="group rounded-2xl border border-fei-bg/10 bg-white/70 p-4 transition duration-300 hover:-translate-y-1 hover:border-fei-sky/45 hover:bg-white focus:-translate-y-1 focus:border-fei-sky/45 focus:bg-white">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-fei-bg/80">{title}</p>
                        <span className="h-1.5 w-1.5 rounded-full bg-fei-sky transition group-hover:bg-fei-yellow group-focus:bg-fei-yellow" />
                      </div>
                      <p className="mt-3 max-h-0 overflow-hidden text-xs leading-5 text-fei-bg/58 opacity-0 transition-all duration-300 group-hover:max-h-20 group-hover:opacity-100 group-focus:max-h-20 group-focus:opacity-100">
                        {description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ['01', 'Choose your role', 'Your football context sets the focus.'],
              ['02', 'Complete the assessment', 'Show us how you communicate in real situations.'],
              ['03', 'See what comes next', 'Receive a clear starting point for your pathway.'],
            ].map(([number, title, text]) => (
              <div key={number} className="group flex items-start gap-4 rounded-2xl bg-white/70 p-5 ring-1 ring-fei-bg/[0.07] transition duration-300 hover:bg-white hover:shadow-[0_16px_40px_rgba(7,17,31,0.07)]">
                <span className="text-xs font-bold text-fei-sky">{number}</span>
                <div>
                  <p className="font-semibold text-fei-bg">{title}</p>
                  <p className="mt-1 text-sm leading-5 text-fei-bg/50">{text}</p>
                </div>
              </div>
            ))}
          </section>
        </section>
      </div>
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
      .select('id, role, status, submitted_at, objective_evidence', { count: 'exact' })
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
        level: diagnosticResult?.level ?? initialLevelFromEvidence(latestAttempt.objective_evidence),
        objective_evidence: latestAttempt.objective_evidence,
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
      : 'Profile ready'
    : lastAssessment
      ? 'Completed'
      : 'Not started'
  const currentResult = latestDiagnostic?.level
    ? getResultLabel(latestDiagnostic.level)
    : lastAssessment
      ? getResultLabel(lastAssessment.level)
      : '—'

  const isNewUser = hasValidRole && !latestDiagnostic && !lastAssessment

  if (isNewUser) {
    return (
      <NewUserDashboard
        displayName={displayName}
        userRole={userRole}
        onSignOut={handleLogout}
      />
    )
  }

  return (
    <main className="min-h-screen bg-[#F6F7F9] text-fei-bg">
      <nav className="sticky top-0 z-50 w-full border-b border-fei-bg/[0.08] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[60px] w-full max-w-[1440px] items-center justify-between px-6 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="flex items-center"
            aria-label="Go to FEI home"
          >
            <img
              src="/fei-logo-navbar-vector.svg"
              alt="FEI"
              className="h-9 w-auto"
            />

            <span className="mx-4 hidden h-5 w-px bg-fei-bg/10 sm:block" />

            <span className="hidden text-sm font-medium text-fei-bg/55 sm:inline">
              Football English Intelligence
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/dashboard"
              className="relative hidden px-3 py-2 text-sm font-semibold text-fei-bg after:absolute after:inset-x-3 after:-bottom-[11px] after:h-0.5 after:bg-fei-yellow sm:inline-flex"
            >
              Dashboard
            </Link>

            <Link
              href="/learning"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-fei-bg/55 transition hover:bg-fei-bg/[0.04] hover:text-fei-bg sm:inline-flex"
            >
              Learning Path
            </Link>

            <Link
              href="/settings"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-fei-bg/55 transition hover:bg-fei-bg/[0.04] hover:text-fei-bg sm:inline-flex"
            >
              Settings
            </Link>

            <span className="mx-2 hidden h-5 w-px bg-fei-bg/10 sm:block" />

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-3 py-2 text-sm font-medium text-fei-bg/50 transition hover:bg-fei-bg/[0.04] hover:text-fei-bg"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:py-12">
        <div className="mb-10 max-w-5xl">
          <h1 className="text-4xl font-black tracking-[-0.04em] text-fei-bg sm:text-5xl">
            {displayName}
          </h1>

          <div className="mt-5 flex items-center gap-3 text-sm font-semibold text-fei-bg/58">
            <span className="h-2.5 w-2.5 rounded-full bg-fei-sky" />
            <span>{userRole || 'Role not selected'}</span>
          </div>

          <p className="mt-5 max-w-3xl text-base leading-7 text-fei-bg/55">
            FEI adapts your diagnostic and learning path to your role in football, so your English training feels practical, contextual, and career-focused.
          </p>
        </div>

        {needsRoleSelection(userRole) ? (
          <section className="mb-10 rounded-3xl border border-dashed border-fei-yellow/30 bg-fei-yellow/[0.03] p-8 md:p-10">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-fei-yellow">
                Choose your role
              </p>
              <h2 className="mt-4 text-3xl font-bold text-fei-bg">
                Select a football role to start your diagnostic
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-fei-bg/60">
                FEI diagnostics are role-specific. Choose the closest available role so your assessment matches your football context.
              </p>

              {userRole === 'Other football role' && (
                <p className="mt-5 rounded-2xl border border-fei-sky/20 bg-fei-sky/[0.06] px-4 py-3 text-sm leading-6 text-fei-bg/60">
                  Thanks for telling us your role. For now, please choose the closest available FEI role to begin your diagnostic.
                </p>
              )}

              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="mt-7 h-[60px] w-full appearance-none rounded-xl border border-fei-bg/10 bg-white px-4 pr-12 text-base text-fei-bg shadow-sm focus:border-fei-yellow focus:outline-none"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%237dd3fc' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1.25rem',
                }}
              >
                <option value="">Choose your closest role</option>
                {diagnosticRoles.map(role => (
                  <option key={role} value={role} className="bg-white text-fei-bg">
                    {role}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleSaveRole}
                disabled={!selectedRole || savingRole}
                className="mt-6 inline-flex rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg transition hover:bg-fei-yellow/90 disabled:opacity-50"
              >
                {savingRole ? 'Saving role...' : 'Save role'}
              </button>
            </div>
          </section>
        ) : (
          <section className="mb-14 border-y border-fei-bg/10 py-10 lg:py-12">
            <div className="grid items-start gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16">
              <div className="relative">
                <div className="mb-7 h-1 w-24 rounded-full bg-fei-sky" />

                <p className="text-xs font-black uppercase tracking-[0.32em] text-fei-bg/45">
                  Free initial diagnostic
                </p>

                <h2 className="mt-5 max-w-3xl text-4xl font-black leading-[1.08] tracking-[-0.04em] text-fei-bg sm:text-5xl">
                  Discover your Football English profile
                </h2>

                <p className="mt-6 max-w-2xl text-base leading-8 text-fei-bg/58">
                  Complete a free, role-specific diagnostic to understand how you communicate in football and identify your next development priority.
                </p>

                <div className="mt-9 grid gap-6 border-t border-fei-bg/10 pt-7 sm:grid-cols-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-fei-bg/38">
                      Time
                    </p>
                    <p className="mt-2 text-base font-bold text-fei-bg">
                      10–12 min
                    </p>
                  </div>

                  <div className="sm:border-l sm:border-fei-bg/10 sm:pl-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-fei-bg/38">
                      Result
                    </p>
                    <p className="mt-2 text-base font-bold text-fei-bg">
                      Personal FEI profile
                    </p>
                  </div>

                  <div className="sm:border-l sm:border-fei-bg/10 sm:pl-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-fei-bg/38">
                      Type
                    </p>
                    <p className="mt-2 text-base font-bold text-fei-bg">
                      Role diagnostic
                    </p>
                  </div>
                </div>

                <Link
                  href={`/assessment?role=${encodeURIComponent(userRole)}`}
                  className="mt-9 inline-flex min-h-[54px] items-center justify-center rounded-full bg-fei-yellow px-8 py-3.5 text-base font-black text-fei-bg shadow-[0_14px_34px_rgba(250,204,21,0.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-fei-yellow/90 hover:shadow-[0_18px_40px_rgba(250,204,21,0.32)]"
                >
                  <span className="inline-flex items-center gap-2">
                    Start your free diagnostic
                    <ChevronRightIcon />
                  </span>
                </Link>
              </div>

              <div className="relative lg:border-l lg:border-fei-bg/10 lg:pl-12">
                <div className="absolute -left-px top-0 hidden h-24 w-px bg-fei-sky lg:block" />

                <p className="text-xs font-black uppercase tracking-[0.3em] text-fei-bg/45">
                  What it measures
                </p>

                <div className="mt-7 space-y-5">
                  {[
                    'Understanding role-specific football communication',
                    'Reading tactical and professional information',
                    'Responding to feedback with clarity',
                    'Explaining decisions, observations, or recommendations',
                    'Communicating under match and workplace pressure',
                    'Using professional English in real football situations',
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="grid grid-cols-[34px_1fr] items-start gap-3"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-fei-sky/35 bg-fei-sky/[0.08] text-xs font-black text-fei-bg">
                        {index + 1}
                      </span>

                      <span className="pt-0.5 text-[15px] leading-6 text-fei-bg/62">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mb-10 grid gap-5 md:grid-cols-4">
          <div className="rounded-2xl border border-fei-bg/10 bg-white p-6 text-center shadow-[0_16px_45px_rgba(7,17,31,0.045)]">
            <p className="text-2xl font-black text-fei-yellow">{diagnosticStatus}</p>
            <p className="mt-2 text-sm text-fei-bg/45">Diagnostic status</p>
          </div>

          <div className="rounded-2xl border border-fei-bg/10 bg-white p-6 text-center shadow-[0_16px_45px_rgba(7,17,31,0.045)]">
            <p className="text-4xl font-black text-fei-yellow">{assessmentCount}</p>
            <p className="mt-2 text-sm text-fei-bg/45">Assessments taken</p>
          </div>

          <div className="rounded-2xl border border-fei-bg/10 bg-white p-6 text-center shadow-[0_16px_45px_rgba(7,17,31,0.045)]">
            <p className="text-4xl font-black text-fei-yellow">{currentResult}</p>
            <p className="mt-2 text-sm text-fei-bg/45">Current level</p>
          </div>

          <div className="rounded-2xl border border-fei-bg/10 bg-white p-6 text-center shadow-[0_16px_45px_rgba(7,17,31,0.045)]">
            <p className="text-4xl font-black text-fei-yellow">0h</p>
            <p className="mt-2 text-sm text-fei-bg/45">Learning time</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-fei-bg/10 bg-white p-7 shadow-[0_18px_55px_rgba(7,17,31,0.045)]">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-fei-sky/15 text-fei-sky">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.5v13m0-13C10.8 5.4 9.2 5 7.5 5H5v13h2.5c1.7 0 3.3.4 4.5 1.5m0-13C13.2 5.4 14.8 5 16.5 5H19v13h-2.5c-1.7 0-3.3.4-4.5 1.5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-fei-bg">Learning Path</h3>
            <p className="mt-3 text-sm leading-6 text-fei-bg/55">
              Your personalized training path will appear here after your diagnostic results are ready.
            </p>
            <Link href="/learning" className="mt-6 inline-flex text-sm font-semibold text-fei-sky hover:underline">
              <span className="inline-flex items-center gap-1.5">
                View Learning Path
                <ChevronRightIcon />
              </span>
            </Link>
          </div>

          <div className="rounded-3xl border border-fei-bg/10 bg-white p-7 shadow-[0_18px_55px_rgba(7,17,31,0.045)]">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-fei-yellow/15 text-fei-yellow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.5 11 14.5 15.5 9.5M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-fei-bg">Diagnostic Report</h3>
            <p className="mt-3 text-sm leading-6 text-fei-bg/55">
              Once completed, your report will show your level, strengths, gaps, and recommended next steps.
            </p>
            {latestDiagnostic || lastAssessment ? (
              <Link
                href={`/diagnostic/results/${latestDiagnostic?.status === 'evaluated' ? latestDiagnostic.id : 'unpaid-demo'}`}
                className="mt-6 inline-flex text-sm font-semibold text-fei-sky hover:underline"
              >
                <span className="inline-flex items-center gap-1.5">
                  View Diagnostic Report
                  <ChevronRightIcon />
                </span>
              </Link>
            ) : (
              <p className="mt-6 text-sm font-semibold text-fei-bg/35">
                Available after assessment
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-fei-bg/10 bg-white p-7 shadow-[0_18px_55px_rgba(7,17,31,0.045)]">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-fei-sky/15 text-fei-sky">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5 19 7.5v5c0 4.5-3 7.5-7 8-4-.5-7-3.5-7-8v-5l7-4Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12h5M12 9.5v5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-fei-bg">Role Profile</h3>
            <p className="mt-3 text-sm leading-6 text-fei-bg/55">
              Your current FEI role is <span className="font-semibold text-fei-bg">{userRole || 'not selected'}</span>. This controls your diagnostic context and learning recommendations.
            </p>
            <p className="mt-6 text-sm font-semibold text-fei-bg/35">
              Role-based intelligence
            </p>
          </div>
        </section>
      </section>
    </main>
  )
}
