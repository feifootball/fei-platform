'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

type AssessmentRecord = {
  id: string
  role: string
  score: number
  level: string
  completed_at: string
}

type Profile = {
  user_id: string
  role: string
  created_at: string
}

export default function LearningPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [lastAssessment, setLastAssessment] = useState<AssessmentRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      const { data: assessmentData } = await supabase
        .from('assessment_history')
        .select('id, role, score, level, completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1)

      if (assessmentData && assessmentData.length > 0) {
        setLastAssessment(assessmentData[0] as AssessmentRecord)
      }

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
        <p className="text-fei-sky">Loading your profile...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!lastAssessment) {
    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5" aria-label="Go to FEI home">
              <img src="/fei-logo-navbar-vector.svg" alt="FEI" className="h-8 w-auto" />
              <span className="text-xs font-medium text-fei-sky sm:text-sm">
                Football English Intelligence
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-full border border-fei-text/20 px-4 py-2 text-sm text-fei-text/60 transition-colors hover:border-fei-text/40 hover:text-fei-text"
            >
              Sign out
            </button>
          </div>

          <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-8 text-center">
            <h1 className="text-2xl font-bold text-fei-text">No Assessment Yet</h1>
            <p className="mt-2 text-fei-text/60">Complete your diagnostic assessment to start learning.</p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg transition-colors hover:bg-fei-yellow/90"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fei-bg px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Go to FEI home">
            <img src="/fei-logo-navbar-vector.svg" alt="FEI" className="h-8 w-auto" />
            <span className="text-xs font-medium text-fei-sky sm:text-sm">
              Football English Intelligence
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-full border border-fei-text/20 px-4 py-2 text-sm text-fei-text/60 transition-colors hover:border-fei-text/40 hover:text-fei-text"
          >
            Sign out
          </button>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-fei-text">Your Learning Path</h1>
          <p className="mt-2 text-fei-text/60">Personalized modules based on your assessment</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6 lg:col-span-1">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fei-sky">
              FEI Profile
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-fei-text/50">Role</p>
                <p className="mt-2 text-lg font-bold text-fei-yellow">{lastAssessment.role}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-fei-text/50">CEFR Level</p>
                <p className="mt-2 flex items-center gap-2">
                  <span className="text-2xl font-black text-fei-yellow">{lastAssessment.level}</span>
                  <span className="text-xs text-fei-text/60">
                    {lastAssessment.level === 'C1' && 'Advanced Professional'}
                    {lastAssessment.level === 'B2' && 'Professional'}
                    {lastAssessment.level === 'B1' && 'Intermediate'}
                    {lastAssessment.level === 'A2' && 'Foundation'}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-fei-text/50">Assessment Score</p>
                <p className="mt-2 text-lg font-bold text-fei-sky">{lastAssessment.score}%</p>
              </div>

              <div className="pt-4">
                <p className="text-xs font-medium text-fei-text/50">Assessment Date</p>
                <p className="mt-2 text-sm text-fei-text">
                  {new Date(lastAssessment.completed_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Learning Modules */}
          <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6 lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fei-sky">
              Recommended Path
            </p>

            <h2 className="mt-4 text-2xl font-bold text-fei-text">
              {lastAssessment.role} Communication
            </h2>

            <p className="mt-3 text-fei-text/60">
              Your personalized learning modules are being prepared. Content coming soon based on your role and CEFR level.
            </p>

            <div className="mt-8 space-y-3">
              <div className="rounded-xl border border-fei-text/10 bg-fei-text/[0.04] p-4">
                <p className="font-semibold text-fei-text">Module 1: Foundation</p>
                <p className="mt-1 text-sm text-fei-text/60">Core communication patterns for your role</p>
                <div className="mt-3 h-2 rounded-full bg-fei-text/10">
                  <div className="h-2 rounded-full bg-fei-sky" style={{ width: '0%' }} />
                </div>
              </div>

              <div className="rounded-xl border border-fei-text/10 bg-fei-text/[0.04] p-4">
                <p className="font-semibold text-fei-text">Module 2: Intermediate</p>
                <p className="mt-1 text-sm text-fei-text/60">Advanced scenarios and nuanced communication</p>
                <div className="mt-3 h-2 rounded-full bg-fei-text/10">
                  <div className="h-2 rounded-full bg-fei-text/10" style={{ width: '0%' }} />
                </div>
              </div>

              <div className="rounded-xl border border-fei-text/10 bg-fei-text/[0.04] p-4">
                <p className="font-semibold text-fei-text">Module 3: Professional</p>
                <p className="mt-1 text-sm text-fei-text/60">Expert-level communication mastery</p>
                <div className="mt-3 h-2 rounded-full bg-fei-text/10">
                  <div className="h-2 rounded-full bg-fei-text/10" style={{ width: '0%' }} />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/settings"
                className="inline-flex rounded-full border border-fei-text/20 px-6 py-3 font-semibold text-fei-text transition-colors hover:border-fei-text/40"
              >
                View Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
