'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })
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
        <form onSubmit={handleRegister} className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-8">
          <h1 className="mb-6 text-2xl font-bold text-fei-text">Create your account</h1>
          {error && <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-fei-text/70">Full name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-fei-text/10 bg-fei-text/[0.05] px-4 py-3 text-fei-text placeholder-fei-text/30 focus:border-fei-yellow focus:outline-none"
              placeholder="Your name"
            />
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
              minLength={6}
              className="w-full rounded-xl border border-fei-text/10 bg-fei-text/[0.05] px-4 py-3 text-fei-text placeholder-fei-text/30 focus:border-fei-yellow focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-fei-yellow py-3 font-semibold text-fei-bg transition-colors hover:bg-fei-yellow/90 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Get Started'}
          </button>
          <p className="mt-4 text-center text-sm text-fei-text/50">
            Already have an account?{' '}
            <a href="/login" className="text-fei-sky hover:underline">Sign in</a>
          </p>
        </form>
      </div>
    </div>
  )
}
