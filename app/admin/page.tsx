import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = 'danielaportillafl@gmail.com'

type Profile = {
  user_id: string
  role: string | null
  created_at: string | null
}

type RoleCount = {
  role: string
  count: number
}

type AssessmentRecord = {
  id?: string
  user_id?: string | null
  score?: number | null
  level?: string | null
  created_at?: string | null
  completed_at?: string | null
}

type AuthUserSummary = {
  id: string
  email: string
  created_at: string | null
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Date unavailable'

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

async function listAllAuthUsers() {
  const supabaseAdmin = createAdminClient()
  const users: User[] = []
  const perPage = 1000
  let page = 1

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    })

    if (error) {
      throw error
    }

    const currentPageUsers = data.users ?? []
    users.push(...currentPageUsers)

    if (!data.nextPage || data.nextPage <= page) {
      break
    }

    page = data.nextPage
  }

  return users
}

function getRoleCounts(profiles: Profile[]) {
  const counts = new Map<string, number>()

  profiles.forEach((profile) => {
    const role = profile.role?.trim() || 'No role selected'
    counts.set(role, (counts.get(role) ?? 0) + 1)
  })

  return Array.from(counts.entries())
    .map(([role, count]) => ({ role, count }))
    .sort((a, b) => b.count - a.count || a.role.localeCompare(b.role))
}

function getCefrDistribution(assessments: AssessmentRecord[]) {
  const counts = new Map<string, number>()

  assessments.forEach((assessment) => {
    const level = assessment.level?.trim()
    if (!level) return
    counts.set(level, (counts.get(level) ?? 0) + 1)
  })

  return Array.from(counts.entries())
    .map(([level, count]) => ({ level, count }))
    .sort((a, b) => a.level.localeCompare(b.level))
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 rounded-xl border border-fei-text/10 bg-fei-text/[0.04] px-4 py-5 text-sm leading-relaxed text-fei-text/60">
      {children}
    </p>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
      <p className="text-sm font-medium text-fei-text/50">{label}</p>
      <p className="mt-3 text-4xl font-black text-fei-yellow">{value}</p>
    </div>
  )
}

function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-fei-bg px-6">
      <div className="w-full max-w-md rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-8 text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-2.5">
          <Image src="/logo.svg" alt="FEI" width={32} height={32} className="h-8 w-auto" />
          <span className="text-sm font-medium text-fei-sky">Football English Intelligence</span>
        </Link>
        <h1 className="mt-8 text-3xl font-bold text-fei-text">Access denied</h1>
        <p className="mt-3 text-sm leading-relaxed text-fei-text/60">
          This internal founder dashboard is only available to the FEI admin account.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg transition-colors hover:bg-fei-yellow/90"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) {
    redirect('/login')
  }

  if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return <AccessDenied />
  }

  const { count: totalProfiles } = await supabase
    .from('profiles')
    .select('user_id', { count: 'exact', head: true })

  const { data: profilesData } = await supabase
    .from('profiles')
    .select('user_id, role, created_at')
    .order('created_at', { ascending: false })
    .limit(1000)

  const profiles = (profilesData ?? []) as Profile[]
  const recentProfiles = profiles.slice(0, 8)
  const roleCounts = getRoleCounts(profiles)
  const authUsers = await listAllAuthUsers()
  const profileUserIds = new Set(profiles.map((profile) => profile.user_id))
  const usersWithoutProfile: AuthUserSummary[] = authUsers
    .filter((authUser) => !profileUserIds.has(authUser.id))
    .map((authUser) => ({
      id: authUser.id,
      email: authUser.email ?? 'Email unavailable',
      created_at: authUser.created_at ?? null,
    }))
    .sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
      return bTime - aTime
    })

  const { count: completedAssessmentCount, error: assessmentCountError } = await supabase
    .from('assessment_history')
    .select('id', { count: 'exact', head: true })

  const { data: assessmentData, error: assessmentDataError } = await supabase
    .from('assessment_history')
    .select('id, user_id, score, level, created_at, completed_at')
    .order('created_at', { ascending: false })
    .limit(1000)

  const assessments =
    assessmentCountError || assessmentDataError ? [] : ((assessmentData ?? []) as AssessmentRecord[])
  const cefrDistribution = getCefrDistribution(assessments)
  const recentActivity = assessments.slice(0, 8)

  return (
    <div className="min-h-screen bg-fei-bg px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="FEI" width={32} height={32} className="h-8 w-auto" />
            <span className="text-xs font-medium text-fei-sky sm:text-sm">
              Football English Intelligence
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-fei-text/20 px-4 py-2 text-sm text-fei-text/60 transition-colors hover:border-fei-text/40 hover:text-fei-text"
          >
            Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fei-sky">Founder admin</p>
          <h1 className="mt-3 text-3xl font-bold text-fei-text sm:text-4xl">FEI Admin Dashboard</h1>
          <p className="mt-3 max-w-2xl text-fei-text/50">
            A simple internal view of profiles and diagnostic activity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total registered users" value={authUsers.length} />
          <StatCard label="Total profiles" value={totalProfiles ?? profiles.length} />
          <StatCard label="Completed assessments" value={completedAssessmentCount ?? assessments.length} />
          <StatCard label="Roles represented" value={roleCounts.length} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
            <h2 className="text-xl font-bold text-fei-text">Users by role</h2>
            {roleCounts.length === 0 ? (
              <EmptyState>No profiles are available yet.</EmptyState>
            ) : (
              <div className="mt-5 grid gap-3">
                {roleCounts.map((item: RoleCount) => (
                  <div
                    key={item.role}
                    className="flex items-center justify-between gap-4 rounded-xl border border-fei-text/10 bg-fei-text/[0.04] px-4 py-3"
                  >
                    <span className="text-sm font-medium text-fei-text">{item.role}</span>
                    <span className="rounded-full bg-fei-yellow/10 px-3 py-1 text-sm font-bold text-fei-yellow">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
            <h2 className="text-xl font-bold text-fei-text">Recent profiles</h2>
            {recentProfiles.length === 0 ? (
              <EmptyState>No recent profiles are available yet.</EmptyState>
            ) : (
              <div className="mt-5 grid gap-3">
                {recentProfiles.map((profile) => (
                  <div
                    key={`${profile.user_id}-${profile.created_at ?? 'profile'}`}
                    className="rounded-xl border border-fei-text/10 bg-fei-text/[0.04] p-4"
                  >
                    <p className="font-semibold text-fei-text">{profile.role ?? 'No role selected'}</p>
                    <p className="mt-1 break-all text-xs text-fei-text/45">User ID: {profile.user_id}</p>
                    <p className="mt-2 text-sm text-fei-sky">{formatDate(profile.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="mt-6 grid gap-6">
          <section className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-fei-text">Registered users without profile</h2>
              <span className="rounded-full bg-fei-yellow/10 px-3 py-1 text-sm font-bold text-fei-yellow">
                {usersWithoutProfile.length}
              </span>
            </div>
            {usersWithoutProfile.length === 0 ? (
              <EmptyState>Every registered user has a profile.</EmptyState>
            ) : (
              <div className="mt-5 grid gap-3">
                {usersWithoutProfile.slice(0, 20).map((authUser) => (
                  <div
                    key={authUser.id}
                    className="rounded-xl border border-fei-text/10 bg-fei-text/[0.04] p-4"
                  >
                    <p className="font-semibold text-fei-text">{authUser.email}</p>
                    <p className="mt-1 break-all text-xs text-fei-text/45">User ID: {authUser.id}</p>
                    <p className="mt-2 text-sm text-fei-sky">{formatDate(authUser.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
            <h2 className="text-xl font-bold text-fei-text">Assessment metrics</h2>
            {assessments.length === 0 ? (
              <EmptyState>
                Assessment data will appear here once users complete diagnostics.
              </EmptyState>
            ) : (
              <div className="mt-5 rounded-xl border border-fei-text/10 bg-fei-text/[0.04] p-5">
                <p className="text-sm font-medium text-fei-text/50">Total completed assessments</p>
                <p className="mt-3 text-4xl font-black text-fei-yellow">
                  {completedAssessmentCount ?? assessments.length}
                </p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
            <h2 className="text-xl font-bold text-fei-text">CEFR distribution</h2>
            {cefrDistribution.length === 0 ? (
              <EmptyState>
                CEFR distribution will appear once assessments are completed.
              </EmptyState>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cefrDistribution.map((item) => (
                  <div
                    key={item.level}
                    className="rounded-xl border border-fei-text/10 bg-fei-text/[0.04] p-4"
                  >
                    <p className="text-sm font-medium text-fei-text/50">CEFR {item.level}</p>
                    <p className="mt-2 text-3xl font-black text-fei-yellow">{item.count}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
            <h2 className="text-xl font-bold text-fei-text">Recent activity</h2>
            {recentActivity.length === 0 ? (
              <EmptyState>
                Recent activity will appear here once users complete diagnostics.
              </EmptyState>
            ) : (
              <div className="mt-5 grid gap-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={activity.id ?? `${activity.user_id ?? 'user'}-${index}`}
                    className="rounded-xl border border-fei-text/10 bg-fei-text/[0.04] p-4"
                  >
                    <p className="font-semibold text-fei-text">
                      {activity.level ? `CEFR Level: ${activity.level}` : 'Completed assessment'}
                    </p>
                    <p className="mt-1 text-sm text-fei-text/50">
                      {typeof activity.score === 'number' ? `Score: ${activity.score}%` : 'Score unavailable'}
                    </p>
                    {activity.user_id && (
                      <p className="mt-1 break-all text-xs text-fei-text/45">User ID: {activity.user_id}</p>
                    )}
                    <p className="mt-2 text-sm text-fei-sky">
                      {formatDate(activity.completed_at ?? activity.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
