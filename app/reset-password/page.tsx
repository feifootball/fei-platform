'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    window.setTimeout(() => router.push('/login'), 1200)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-fei-bg px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-4xl font-black text-fei-yellow">FEI</span>
          <p className="mt-2 text-sm text-fei-sky">Football English Intelligence</p>
        </div>

        <form onSubmit={handlePasswordUpdate} className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-8">
          <h1 className="mb-3 text-2xl font-bold text-fei-text">Create a new password</h1>
          <p className="mb-6 text-sm leading-relaxed text-fei-text/60">
            Choose a password you have not used before for your FEI account.
          </p>

          {success && (
            <p className="mb-4 rounded-lg bg-fei-sky/10 px-4 py-3 text-sm text-fei-sky">
              Password updated. Redirecting to sign in...
            </p>
          )}
          {error && <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-fei-text/70">New password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-fei-text/10 bg-fei-text/[0.05] px-4 py-3 text-fei-text placeholder-fei-text/30 focus:border-fei-yellow focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <div className="mb-6">
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

          <button
            type="submit"
            disabled={loading || success}
            className="w-full rounded-full bg-fei-yellow py-3 font-semibold text-fei-bg transition-colors hover:bg-fei-yellow/90 disabled:opacity-50"
          >
            {loading ? 'Updating password...' : 'Update password'}
          </button>

          <p className="mt-4 text-center text-sm text-fei-text/50">
            Back to{' '}
            <a href="/login" className="text-fei-sky hover:underline">sign in</a>
          </p>
        </form>
      </div>
    </div>
  )
}
