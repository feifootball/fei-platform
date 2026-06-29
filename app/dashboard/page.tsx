'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

type Profile = {
  role: string | null
  full_name: string | null
  created_at: string | null
}

type Assessment = {
  level: string
  score: number
  role: string
  completed_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [lastAssessment, setLastAssessment] = useState<Assessment | null>(null)
  const [assessmentCount, setAssessmentCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setUserEmail(user.email || '')

      const { data: profileData } = await supabase
        .from('profiles')
        .select('role, full_name, created_at')
        .eq('user_id', user.id)
        .single()

      if (profileData) setProfile(profileData)

      const { data: assessmentData, count: aCount } = await supabase
        .from('assessment_history')
        .select('level, score, role, completed_at', { count: 'exact' })
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })

      if (assessmentData && assessmentData.length > 0) {
        setLastAssessment(assessmentData[0] as Assessment)
      }
      setAssessmentCount(aCount || 0)

      const { count: nCount } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)

      setUnreadCount(nCount || 0)
      setLoading(false)
    }

    loadData()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function getLevelLabel(level: string) {
    const labels: Record<string, string> = {
      'C1': 'Advanced Professional',
      'B2': 'Professional',
      'B1': 'Intermediate',
      'A2': 'Foundation',
    }
    return labels[level] || level
  }

  function getLevelProgress(level: string) {
    const progress: Record<string, number> = { 'A2': 25, 'B1': 50, 'B2': 75, 'C1': 100 }
    return progress[level] || 0
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fei-bg">
        <p className="text-fei-sky">Loading...</p>
      </div>
    )
  }

  const displayName = profile?.full_name || userEmail.split('@')[0]

  return (
    <div className="min-h-screen bg-fei-bg">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-fei-text/10 bg-fei-bg/90 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="FEI" className="h-8 w-auto" />
            <span className="hidden text-xs font-medium text-fei-sky sm:block">Football English Intelligence</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/learning" className="rounded-full px-4 py-2 text-sm font-medium text-fei-text/60 transition hover:bg-fei-text/5 hover:text-fei-text">Learning</Link>
            <Link href="/notifications" className="relative rounded-full px-4 py-2 text-sm font-medium text-fei-text/60 transition hover:bg-fei-text/5 hover:text-fei-text">
              Notifications
              {unreadCount > 0 && <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{unreadCount}</span>}
            </Link>
            <Link href="/settings" className="rounded-full px-4 py-2 text-sm font-medium text-fei-text/60 transition hover:bg-fei-text/5 hover:text-fei-text">Settings</Link>
            <button onClick={handleLogout} className="ml-2 rounded-full border border-fei-text/20 px-4 py-2 text-sm font-medium text-fei-text/60 transition hover:border-fei-text/40 hover:text-fei-text">Sign out</button>
          </nav>
        </div>
      </header>

      <main className="px-6 py-12">
        <div className="mx-auto max-w-5xl space-y-8">

          {/* Welcome */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fei-sky">Welcome back</p>
            <h1 className="mt-2 text-4xl font-black text-fei-text sm:text-5xl">{displayName}</h1>
            {profile?.role && <p className="mt-2 text-fei-text/50">{profile.role}</p>}
          </div>

          {/* Assessment card o CTA */}
          {lastAssessment ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {/* FEI Profile */}
              <div className="rounded-2xl border border-fei-yellow/20 bg-fei-yellow/5 p-6 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fei-yellow">FEI Profile</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-fei-yellow bg-fei-yellow/10">
                    <span className="text-2xl font-black text-fei-yellow">{lastAssessment.level}</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-fei-text">{lastAssessment.role}</p>
                    <p className="text-sm text-fei-text/60">{getLevelLabel(lastAssessment.level)}</p>
                    <p className="mt-1 text-sm text-fei-text/40">Score: {lastAssessment.score}%</p>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Link href="/learning" className="rounded-full bg-fei-yellow px-6 py-2.5 text-sm font-semibold text-fei-bg transition hover:bg-fei-yellow/90">Continue Learning</Link>
                  <Link href="/settings" className="rounded-full border border-fei-text/20 px-6 py-2.5 text-sm font-medium text-fei-text/60 transition hover:border-fei-text/40 hover:text-fei-text">View History</Link>
                </div>
              </div>

              {/* CEFR Progress */}
              <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fei-sky">CEFR Progress</p>
                <p className="mt-3 text-5xl font-black text-fei-yellow">{lastAssessment.level}</p>
                <p className="mt-1 text-sm text-fei-text/60">{getLevelLabel(lastAssessment.level)}</p>
                <div className="mt-4 space-y-2">
                  {['A2', 'B1', 'B2', 'C1'].map((lvl) => (
                    <div key={lvl} className="flex items-center gap-2">
                      <span className="w-6 text-xs text-fei-text/40">{lvl}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-fei-text/10">
                        <div
                          className={`h-1.5 rounded-full transition-all ${lvl === lastAssessment.level ? 'bg-fei-yellow' : getLevelProgress(lvl) < getLevelProgress(lastAssessment.level) ? 'bg-fei-yellow/40' : 'bg-fei-text/10'}`}
                          style={{ width: lvl === lastAssessment.level ? '100%' : getLevelProgress(lvl) < getLevelProgress(lastAssessment.level) ? '100%' : '0%' }}
                        />
                      </div>
                      {lvl === lastAssessment.level && <span className="text-xs text-fei-yellow">←</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-fei-sky/30 bg-fei-sky/[0.03] p-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fei-sky">Get Started</p>
              <h2 className="mt-4 text-2xl font-bold text-fei-text">Take your diagnostic assessment</h2>
              <p className="mx-auto mt-3 max-w-md text-fei-text/60">Find out your CEFR level and get a personalized learning path based on your role in football.</p>
              <Link href="/onboarding" className="mt-6 inline-flex rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg transition hover:bg-fei-yellow/90">
                Start Assessment →
              </Link>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-5 text-center">
              <p className="text-3xl font-black text-fei-yellow">0</p>
              <p className="mt-1 text-xs text-fei-text/50">Scenarios completed</p>
            </div>
            <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-5 text-center">
              <p className="text-3xl font-black text-fei-yellow">{assessmentCount}</p>
              <p className="mt-1 text-xs text-fei-text/50">Assessments taken</p>
            </div>
            <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-5 text-center">
              <p className="text-3xl font-black text-fei-yellow">0</p>
              <p className="mt-1 text-xs text-fei-text/50">Day streak</p>
            </div>
            <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-5 text-center">
              <p className="text-3xl font-black text-fei-yellow">0h</p>
              <p className="mt-1 text-xs text-fei-text/50">Time learning</p>
            </div>
          </div>

          {/* Quick access */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/learning" className="group rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6 transition hover:border-fei-sky/30 hover:bg-fei-sky/[0.04]">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-fei-sky/10 text-fei-sky">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <p className="font-semibold text-fei-text">Learning</p>
              <p className="mt-1 text-sm text-fei-text/50">Your personalized modules</p>
            </Link>

            <Link href="/notifications" className="group relative rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6 transition hover:border-fei-sky/30 hover:bg-fei-sky/[0.04]">
              {unreadCount > 0 && <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{unreadCount}</span>}
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-fei-sky/10 text-fei-sky">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <p className="font-semibold text-fei-text">Notifications</p>
              <p className="mt-1 text-sm text-fei-text/50">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</p>
            </Link>

            <Link href="/settings" className="group rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6 transition hover:border-fei-sky/30 hover:bg-fei-sky/[0.04]">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-fei-sky/10 text-fei-sky">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" />
                </svg>
              </div>
              <p className="font-semibold text-fei-text">Settings</p>
              <p className="mt-1 text-sm text-fei-text/50">Account & preferences</p>
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}
