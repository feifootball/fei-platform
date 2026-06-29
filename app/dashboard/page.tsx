'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

type Profile = {
  role: string | null
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
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUserEmail(user.email || '')

      const { data: profileData } = await supabase
        .from('profiles')
        .select('role, created_at')
        .eq('user_id', user.id)
        .single()

      if (profileData) setProfile(profileData)

      const { data: assessmentData } = await supabase
        .from('assessment_history')
        .select('level, score, role, completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1)

      if (assessmentData && assessmentData.length > 0) {
        setLastAssessment(assessmentData[0] as Assessment)
      }

      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)

      setUnreadCount(count || 0)
      setLoading(false)
    }

    loadData()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fei-bg">
        <p className="text-fei-sky">Loading...</p>
      </div>
    )
  }

  const firstName = userEmail.split('@')[0]

  return (
    <div className="min-h-screen bg-fei-bg">
      {/* Navbar interno */}
      <header className="border-b border-fei-text/10 bg-fei-bg/90 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="FEI" className="h-8 w-auto" />
            <span className="hidden text-xs font-medium text-fei-sky sm:block">
              Football English Intelligence
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link href="/learning" className="rounded-full px-4 py-2 text-sm font-medium text-fei-text/60 transition hover:bg-fei-text/5 hover:text-fei-text">
              Learning
            </Link>
            <Link href="/notifications" className="relative rounded-full px-4 py-2 text-sm font-medium text-fei-text/60 transition hover:bg-fei-text/5 hover:text-fei-text">
              Notifications
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link href="/settings" className="rounded-full px-4 py-2 text-sm font-medium text-fei-text/60 transition hover:bg-fei-text/5 hover:text-fei-text">
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-full border border-fei-text/20 px-4 py-2 text-sm font-medium text-fei-text/60 transition hover:border-fei-text/40 hover:text-fei-text"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>

      <main className="px-6 py-12">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fei-sky">Welcome back</p>
            <h1 className="mt-2 text-4xl font-black text-fei-text sm:text-5xl">{firstName}</h1>
          </div>

          {/* Assessment Card */}
          {lastAssessment ? (
            <div className="mb-6 grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-fei-yellow/20 bg-fei-yellow/5 p-6 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fei-yellow">Your FEI Profile</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-fei-yellow bg-fei-yellow/10">
                    <span className="text-2xl font-black text-fei-yellow">{lastAssessment.level}</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-fei-text">{lastAssessment.role}</p>
                    <p className="text-sm text-fei-text/60">Score: {lastAssessment.score}%</p>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Link href="/learning" className="rounded-full bg-fei-yellow px-6 py-2.5 text-sm font-semibold text-fei-bg transition hover:bg-fei-yellow/90">
                    Continue Learning
                  </Link>
                  <Link href="/settings" className="rounded-full border border-fei-text/20 px-6 py-2.5 text-sm font-medium text-fei-text/60 transition hover:border-fei-text/40 hover:text-fei-text">
                    View History
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fei-sky">CEFR Level</p>
                <p className="mt-3 text-5xl font-black text-fei-yellow">{lastAssessment.level}</p>
                <p className="mt-2 text-sm text-fei-text/60">
                  {lastAssessment.level === 'C1' && 'Advanced Professional'}
                  {lastAssessment.level === 'B2' && 'Professional'}
                  {lastAssessment.level === 'B1' && 'Intermediate'}
                  {lastAssessment.level === 'A2' && 'Foundation'}
                </p>
                <div className="mt-4 h-2 rounded-full bg-fei-text/10">
                  <div
                    className="h-2 rounded-full bg-fei-yellow transition-all"
                    style={{ width: `${lastAssessment.score}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-fei-text/40">{lastAssessment.score}% score</p>
              </div>
            </div>
          ) : (
            <div className="mb-6 rounded-2xl border border-dashed border-fei-sky/30 bg-fei-sky/[0.03] p-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fei-sky">Get Started</p>
              <h2 className="mt-4 text-2xl font-bold text-fei-text">Take your diagnostic assessment</h2>
              <p className="mx-auto mt-3 max-w-md text-fei-text/60">Find out your CEFR level and get a personalized learning path based on your role in football.</p>
              <Link
                href="/onboarding"
                className="mt-6 inline-flex rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg transition hover:bg-fei-yellow/90"
              >
                Start Assessment →
              </Link>
            </div>
          )}

          {/* Quick Access */}
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
              {unreadCount > 0 && (
                <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-fei-sky/10 text-fei-sky">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <p className="font-semibold text-fei-text">Notifications</p>
              <p className="mt-1 text-sm text-fei-text/50">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
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
