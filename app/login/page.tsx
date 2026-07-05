'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSocialLogin(provider: 'google' | 'facebook') {
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/confirm`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-fei-bg px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-4xl font-black text-fei-yellow">FEI</span>
          <p className="mt-2 text-sm text-fei-sky">Football English Intelligence</p>
        </div>
        <form onSubmit={handleLogin} className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-8">
          <h1 className="mb-6 text-2xl font-bold text-fei-text">Welcome back</h1>
          {error && <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}

          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="flex items-center justify-center gap-3 rounded-full border border-fei-text/10 bg-fei-text/[0.05] px-5 py-3 text-sm font-semibold text-fei-text transition hover:border-fei-sky/40 hover:bg-fei-sky/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-lg">G</span>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              disabled={loading}
              className="flex items-center justify-center gap-3 rounded-full border border-fei-text/10 bg-fei-text/[0.05] px-5 py-3 text-sm font-semibold text-fei-text transition hover:border-fei-sky/40 hover:bg-fei-sky/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-lg font-black text-fei-sky">f</span>
              Continue with Facebook
            </button>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-fei-text/10" />
            <span className="text-xs uppercase tracking-[0.24em] text-fei-text/35">or</span>
            <div className="h-px flex-1 bg-fei-text/10" />
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-fei-text/70">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-fei-text/10 bg-fei-text/[0.05] px-4 py-3 text-fei-text placeholder-fei-text/30 focus:border-fei-yellow focus:outline-none"
              placeholder="you@club.com"
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-fei-text/70">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-fei-text/10 bg-fei-text/[0.05] px-4 py-3 text-fei-text placeholder-fei-text/30 focus:border-fei-yellow focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-fei-yellow py-3 font-semibold text-fei-bg transition-colors hover:bg-fei-yellow/90 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="mt-4 text-center text-sm text-fei-text/50">
            Don't have an account?{' '}
            <a href="/register" className="text-fei-sky hover:underline">Register</a>
          </p>
        
          <div className="mt-4 text-center">
            <a
              href="/forgot-password"
              className="text-sm font-medium text-fei-sky hover:text-fei-yellow transition-colors"
            >
              Forgot your password?
            </a>
          </div>

        </form>
      </div>
    </div>
  )
}
