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

    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: user.id,
          role: selectedRole,
        },
        { onConflict: 'user_id' }
      )

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
      <main className="flex min-h-screen items-center justify-center bg-fei-bg text-fei-text">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-fei-yellow border-t-transparent" />
      </main>
    )
  }

  const hasValidRole = !needsRoleSelection(userRole)
  const diagnosticStatus = lastAssessment ? 'Completed' : 'Not started'
  const currentResult = lastAssessment ? getResultLabel(lastAssessment.level) : '—'

  return (
    <main className="min-h-screen bg-fei-bg text-fei-text">
      <nav className="border-b border-fei-text/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-xl font-black text-fei-yellow">FEI</span>
            <span className="hidden text-sm text-fei-sky sm:inline">Football English Intelligence</span>
          </Link>

          <div className="flex items-center gap-6 text-sm text-fei-text/55">
            <Link href="/learning" className="transition hover:text-fei-text">
              Learning Path
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-full border border-fei-text/15 px-5 py-2 text-fei-text/70 transition hover:border-fei-yellow hover:text-fei-yellow"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.45em] text-fei-sky">
            Welcome back
          </p>
          <h1 className="text-5xl font-black tracking-tight text-fei-text md:text-6xl">
            {displayName}
          </h1>

          <div className="mt-5 inline-flex rounded-full border border-fei-sky/20 bg-fei-sky/[0.06] px-4 py-2 text-sm font-medium text-fei-sky">
            Role: {userRole || 'Not selected'}
          </div>

          <p className="mt-4 max-w-2xl text-base leading-7 text-fei-text/55">
            FEI adapts your diagnostic and learning path to your role in football, so your English training feels practical, contextual, and career-focused.
          </p>
        </div>

        {needsRoleSelection(userRole) ? (
          <section className="mb-10 rounded-3xl border border-dashed border-fei-yellow/30 bg-fei-yellow/[0.03] p-8 md:p-10">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fei-yellow">
                Choose your role
              </p>
              <h2 className="mt-4 text-3xl font-bold text-fei-text">
                Select a football role to start your diagnostic
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-fei-text/60">
                FEI diagnostics are role-specific. Choose the closest available role so your assessment matches your football context.
              </p>

              {userRole === 'Other football role' && (
                <p className="mt-5 rounded-2xl border border-fei-sky/20 bg-fei-sky/[0.06] px-4 py-3 text-sm leading-6 text-fei-text/60">
                  Thanks for telling us your role. For now, please choose the closest available FEI role to begin your diagnostic.
                </p>
              )}

              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="mt-7 h-[60px] w-full appearance-none rounded-xl border border-fei-text/10 bg-fei-text/[0.05] px-4 pr-12 text-base text-fei-text focus:border-fei-yellow focus:outline-none"
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
                  <option key={role} value={role} className="bg-fei-bg text-fei-text">
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
          <section className="mb-10 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-3xl border border-fei-sky/20 bg-fei-sky/[0.035] p-8 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-fei-sky">
                FEI Diagnostic
              </p>
              <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight text-fei-text md:text-4xl">
                Start your {userRole} diagnostic assessment
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-fei-text/60">
                Complete a short role-specific diagnostic and receive one recommended FEI pathway based on your football communication profile.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-fei-text/10 bg-fei-bg/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-fei-text/35">Time</p>
                  <p className="mt-2 font-bold text-fei-text">10–12 min</p>
                </div>
                <div className="rounded-2xl border border-fei-text/10 bg-fei-bg/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-fei-text/35">Result</p>
                  <p className="mt-2 font-bold text-fei-text">FEI Pathway</p>
                </div>
                <div className="rounded-2xl border border-fei-text/10 bg-fei-bg/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-fei-text/35">Format</p>
                  <p className="mt-2 font-bold text-fei-text">Role-specific</p>
                </div>
              </div>

              <Link
                href={`/assessment?role=${encodeURIComponent(userRole)}`}
                className="mt-8 inline-flex rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg transition hover:bg-fei-yellow/90"
              >
                Start Assessment →
              </Link>
            </div>

            <div className="rounded-3xl border border-fei-text/10 bg-fei-text/[0.03] p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fei-yellow">
                What it measures
              </p>

              <div className="mt-6 space-y-4">
                {[
                  'Football vocabulary',
                  'Tactical understanding',
                  'Reading match context',
                  'Listening to football communication',
                  'Functional communication',
                  'Writing and speaking tasks',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm text-fei-text/65">
                    <span className="h-2 w-2 rounded-full bg-fei-yellow" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="mb-10 grid gap-5 md:grid-cols-4">
          <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6 text-center">
            <p className="text-2xl font-black text-fei-yellow">{diagnosticStatus}</p>
            <p className="mt-2 text-sm text-fei-text/45">Diagnostic status</p>
          </div>

          <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6 text-center">
            <p className="text-4xl font-black text-fei-yellow">{assessmentCount}</p>
            <p className="mt-2 text-sm text-fei-text/45">Assessments taken</p>
          </div>

          <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6 text-center">
            <p className="text-4xl font-black text-fei-yellow">{currentResult}</p>
            <p className="mt-2 text-sm text-fei-text/45">Current level</p>
          </div>

          <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6 text-center">
            <p className="text-4xl font-black text-fei-yellow">0h</p>
            <p className="mt-2 text-sm text-fei-text/45">Learning time</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-fei-text/10 bg-fei-text/[0.03] p-7">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-fei-sky/15 text-fei-sky">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.5v13m0-13C10.8 5.4 9.2 5 7.5 5H5v13h2.5c1.7 0 3.3.4 4.5 1.5m0-13C13.2 5.4 14.8 5 16.5 5H19v13h-2.5c-1.7 0-3.3.4-4.5 1.5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-fei-text">Learning Path</h3>
            <p className="mt-3 text-sm leading-6 text-fei-text/55">
              Your personalized training path will appear here after your diagnostic results are ready.
            </p>
            <Link href="/learning" className="mt-6 inline-flex text-sm font-semibold text-fei-sky hover:underline">
              View Learning Path →
            </Link>
          </div>

          <div className="rounded-3xl border border-fei-text/10 bg-fei-text/[0.03] p-7">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-fei-yellow/15 text-fei-yellow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.5 11 14.5 15.5 9.5M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-fei-text">Diagnostic Report</h3>
            <p className="mt-3 text-sm leading-6 text-fei-text/55">
              Once completed, your report will show your level, strengths, gaps, and recommended next steps.
            </p>
            <p className="mt-6 text-sm font-semibold text-fei-text/35">
              Available after assessment
            </p>
          </div>

          <div className="rounded-3xl border border-fei-text/10 bg-fei-text/[0.03] p-7">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-fei-sky/15 text-fei-sky">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5 19 7.5v5c0 4.5-3 7.5-7 8-4-.5-7-3.5-7-8v-5l7-4Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12h5M12 9.5v5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-fei-text">Role Profile</h3>
            <p className="mt-3 text-sm leading-6 text-fei-text/55">
              Your current FEI role is <span className="font-semibold text-fei-text">{userRole || 'not selected'}</span>. This controls your diagnostic context and learning recommendations.
            </p>
            <p className="mt-6 text-sm font-semibold text-fei-text/35">
              Role-based intelligence
            </p>
          </div>
        </section>
      </section>
    </main>
  )
}
