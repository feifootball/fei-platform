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

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [savingRole, setSavingRole] = useState(false)
  const [lastAssessment, setLastAssessment] = useState<Assessment | null>(null)
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
    setAssessmentCount(count || 0)
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
  const diagnosticStatus = lastAssessment ? 'Completed' : 'Not started'
  const currentResult = lastAssessment ? getResultLabel(lastAssessment.level) : '—'

  return (
    <main className="min-h-screen bg-[#F6F7F9] text-fei-bg">
      <nav className="sticky top-0 z-50 w-full border-b border-fei-bg/[0.08] bg-white/85 backdrop-blur-xl">
        <div className="flex min-h-[72px] w-full items-center justify-between px-6 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center">
            <span className="text-lg font-black tracking-tight text-fei-yellow">
              FEI
            </span>

            <span className="mx-4 hidden h-5 w-px bg-fei-bg/10 sm:block" />

            <span className="hidden text-sm font-medium text-fei-bg/55 sm:inline">
              Football English Intelligence
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
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

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-fei-bg/10 bg-white px-4 py-2 text-sm font-medium text-fei-bg/60 transition hover:border-fei-bg/20 hover:bg-fei-bg/[0.03] hover:text-fei-bg"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:py-12">
        <div className="mb-9 max-w-4xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.38em] text-fei-sky/90">
            Welcome back
          </p>
          <h1 className="text-4xl font-black tracking-tight text-fei-bg sm:text-5xl">
            {displayName}
          </h1>

          <div className="mt-5 inline-flex rounded-full border border-fei-sky/20 bg-fei-sky/[0.06] px-4 py-2 text-sm font-semibold text-fei-sky">
            Role: {userRole || 'Not selected'}
          </div>

          <p className="mt-4 max-w-3xl text-base leading-7 text-fei-bg/55">
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
          <section className="mb-10 grid gap-6 lg:grid-cols-[1.18fr_0.82fr] lg:items-stretch">
            <div className="relative overflow-hidden rounded-[2rem] border border-fei-bg/10 bg-white p-7 shadow-[0_24px_70px_rgba(0,0,0,0.14)] md:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.34em] text-fei-sky">
                FEI Diagnostic
              </p>
              <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight text-fei-bg md:text-[2.35rem]">
                Start your {userRole} diagnostic assessment
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-fei-bg/58">
                Complete a short role-specific diagnostic and receive one recommended FEI pathway based on your football communication profile.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-fei-bg/10 bg-[#F7F8FA] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-fei-bg/35">Time</p>
                  <p className="mt-2 font-bold text-fei-bg">10–12 min</p>
                </div>
                <div className="rounded-2xl border border-fei-bg/10 bg-[#F7F8FA] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-fei-bg/35">Result</p>
                  <p className="mt-2 font-bold text-fei-bg">FEI Pathway</p>
                </div>
                <div className="rounded-2xl border border-fei-bg/10 bg-[#F7F8FA] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-fei-bg/35">Type</p>
                  <p className="mt-2 font-bold text-fei-bg">Role diagnostic</p>
                </div>
              </div>

              <Link
                href={`/assessment?role=${encodeURIComponent(userRole)}`}
                className="mt-8 inline-flex rounded-full bg-fei-yellow px-7 py-3 text-sm font-bold text-fei-bg transition hover:bg-fei-yellow/90"
              >
                <span className="inline-flex items-center gap-2">
                  Start Assessment
                  <ChevronRightIcon />
                </span>
              </Link>
            </div>

            <div className="rounded-[2rem] border border-fei-bg/10 bg-white p-7 shadow-[0_20px_60px_rgba(7,17,31,0.06)] md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-fei-yellow">
                What it measures
              </p>

              <div className="mt-6 space-y-4">
                {[
                  'Understanding role-specific football communication',
                  'Reading tactical and professional information',
                  'Responding to feedback with clarity',
                  'Explaining decisions, observations, or recommendations',
                  'Communicating under match and workplace pressure',
                  'Using professional English in real football situations',
                ].map(item => (
                  <div key={item} className="flex items-start gap-3 text-sm leading-6 text-fei-bg/62">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-fei-yellow" />
                    <span>{item}</span>
                  </div>
                ))}
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
            <p className="mt-6 text-sm font-semibold text-fei-bg/35">
              Available after assessment
            </p>
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
