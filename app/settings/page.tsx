'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

type Profile = {
  role: string | null
  created_at: string | null
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

type AssessmentRecord = {
  id?: string
  role?: string | null
  score?: number | null
  level?: string | null
  created_at?: string | null
  completed_at?: string | null
}

function formatDate(value: string | null | undefined) {
  if (!value) return null

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState('')
  const [roleError, setRoleError] = useState('')
  const [roleSuccess, setRoleSuccess] = useState('')
  const [roleLoading, setRoleLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function loadSettings() {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        router.push('/login')
        return
      }

      setUser(userData.user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('role, created_at')
        .eq('user_id', userData.user.id)
        .maybeSingle()

      setProfile(profileData)
      setSelectedRole(profileData?.role && diagnosticRoles.includes(profileData.role) ? profileData.role : '')

      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessment_history')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('completed_at', { ascending: false })

      setAssessments(assessmentError ? [] : assessmentData ?? [])
      setLoading(false)
    }

    loadSettings()
  }, [router, supabase])

  async function handleRoleChange(e: React.FormEvent) {
    e.preventDefault()
    setRoleError('')
    setRoleSuccess('')

    if (!selectedRole) {
      setRoleError('Please choose a football role.')
      return
    }

    if (!user) {
      router.push('/login')
      return
    }

    setRoleLoading(true)

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

    if (error) {
      setRoleError(error.message)
    } else {
      setProfile((prev) => ({
        role: selectedRole,
        created_at: prev?.created_at ?? null,
      }))
      setRoleSuccess('Football role updated successfully.')
    }

    setRoleLoading(false)
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    setPasswordLoading(true)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess('Password updated successfully.')
      setNewPassword('')
      setConfirmPassword('')
    }

    setPasswordLoading(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fei-bg">
        <p className="text-fei-sky">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fei-bg px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <img src="/fei-logo-navbar-vector.svg" alt="FEI" className="h-8 w-auto" />
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
          <h1 className="text-3xl font-bold text-fei-text sm:text-4xl">Settings</h1>
          <p className="mt-3 text-fei-text/50">Manage your FEI account and assessment access.</p>
        </div>

        <div className="grid gap-6">
          <section className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
            <h2 className="text-xl font-bold text-fei-text">Account</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-fei-text/50">Email</p>
                <p className="mt-1 break-words font-medium text-fei-text">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-fei-text/50">Selected role</p>
                <p className="mt-1 font-medium text-fei-yellow">{profile?.role ?? 'No role selected yet.'}</p>
              </div>
              <div>
                <p className="text-sm text-fei-text/50">Profile created</p>
                <p className="mt-1 font-medium text-fei-text">
                  {formatDate(profile?.created_at) ?? 'No profile date available.'}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
            <h2 className="text-xl font-bold text-fei-text">Football Role</h2>
            <p className="mt-2 text-sm text-fei-text/50">
              Change your FEI role to update your diagnostic context.
            </p>

            <form onSubmit={handleRoleChange} className="mt-5 grid gap-4">
              {roleSuccess && (
                <p className="rounded-lg bg-fei-sky/10 px-4 py-3 text-sm text-fei-sky">{roleSuccess}</p>
              )}
              {roleError && (
                <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{roleError}</p>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-fei-text/70">Selected role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full rounded-xl border border-fei-text/10 bg-fei-text/[0.05] px-4 py-3 text-fei-text focus:border-fei-yellow focus:outline-none"
                >
                  <option value="" className="bg-fei-bg text-fei-text">Choose your role</option>
                  {diagnosticRoles.map((role) => (
                    <option key={role} value={role} className="bg-fei-bg text-fei-text">
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={roleLoading || !selectedRole}
                  className="rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg transition-colors hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-yellow/20 disabled:text-fei-yellow/50 disabled:opacity-100"
                >
                  {roleLoading ? 'Saving role...' : 'Save role'}
                </button>

                <Link
                  href={selectedRole ? `/assessment?role=${encodeURIComponent(selectedRole)}` : '/assessment'}
                  className="rounded-full border border-fei-sky/40 px-8 py-3 font-semibold text-fei-sky transition-colors hover:bg-fei-sky/10"
                >
                  Test selected diagnostic
                </Link>
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
            <h2 className="text-xl font-bold text-fei-text">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="mt-5 grid gap-4">
              {passwordSuccess && (
                <p className="rounded-lg bg-fei-sky/10 px-4 py-3 text-sm text-fei-sky">{passwordSuccess}</p>
              )}
              {passwordError && (
                <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{passwordError}</p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-fei-text/70">New password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-fei-text/10 bg-fei-text/[0.05] px-4 py-3 text-fei-text placeholder-fei-text/30 focus:border-fei-yellow focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-fei-text/70">Confirm password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-fei-text/10 bg-fei-text/[0.05] px-4 py-3 text-fei-text placeholder-fei-text/30 focus:border-fei-yellow focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg transition-colors hover:bg-fei-yellow/90 disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating password...' : 'Update password'}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
            <h2 className="text-xl font-bold text-fei-text">Assessment History</h2>
            {assessments.length === 0 ? (
              <p className="mt-4 rounded-xl border border-fei-text/10 bg-fei-text/[0.04] px-4 py-5 text-sm text-fei-text/60">
                No assessment history available yet.
              </p>
            ) : (
              <div className="mt-4 grid gap-3">
                {assessments.map((assessment, index) => (
                  <div
                    key={assessment.id ?? `${assessment.created_at ?? 'assessment'}-${index}`}
                    className="rounded-xl border border-fei-text/10 bg-fei-text/[0.04] p-4"
                  >
                    <p className="font-semibold text-fei-text">
                      {assessment.level ? `CEFR Level: ${assessment.level}` : 'Completed assessment'}
                    </p>
                    <p className="mt-1 text-sm text-fei-yellow">
                      {assessment.role ?? 'Role unavailable'}
                    </p>
                    <p className="mt-1 text-sm text-fei-text/50">
                      {typeof assessment.score === 'number' ? `Score: ${assessment.score}%` : 'Score unavailable'}
                    </p>
                    <p className="mt-1 text-sm text-fei-sky">
                      {formatDate(assessment.completed_at ?? assessment.created_at) ?? 'Completion date unavailable'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
            <h2 className="text-xl font-bold text-fei-text">Retake Assessment</h2>
            {assessments.length === 0 && (
              <p className="mt-4 text-sm text-fei-text/60">No completed assessment yet.</p>
            )}
            <Link
              href={selectedRole ? `/assessment?role=${encodeURIComponent(selectedRole)}` : '/dashboard'}
              className="mt-5 inline-flex rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg transition-colors hover:bg-fei-yellow/90"
            >
              Retake assessment
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
