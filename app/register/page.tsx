'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

const roles = [
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
  'Other football role',
  "I'll choose later",
]

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedGdpr, setAcceptedGdpr] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const selectedRole = params.get('role')

    if (selectedRole && roles.includes(selectedRole)) {
      setRole(selectedRole)
    }
  }, [])

  async function handleRegister(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy to create your FEI account.')
      setLoading(false)
      return
    }

    if (!acceptedGdpr) {
      setError('Please confirm that you understand how your personal data is processed and protected.')
      setLoading(false)
      return
    }

    if (!role) {
      setError('Please choose your football role.')
      setLoading(false)
      return
    }

    if (role === 'Other football role' && !customRole.trim()) {
      setError('Please tell us your football role.')
      setLoading(false)
      return
    }

    const hasMinimumLength = password.length >= 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)

    if (!hasMinimumLength || !hasUppercase || !hasLowercase || !hasNumber) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, and a number.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role,
          custom_role: role === 'Other football role' ? customRole.trim() : null,
        },
      },
    })

    if (error) {
      const message = error.message.toLowerCase()

      if (
        message.includes('email rate limit') ||
        message.includes('rate limit') ||
        message.includes('too many requests')
      ) {
        setError(
          'We may have already sent a confirmation email to this address. Please check your inbox, spam, or promotions folder before trying again.'
        )
      } else if (
        message.includes('already registered') ||
        message.includes('already exists') ||
        message.includes('user already')
      ) {
        setError(
          'This email may already be registered. Please sign in or check your inbox for a confirmation email.'
        )
      } else {
        setError(error.message)
      }

      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').upsert(
        {
          user_id: data.user.id,
          full_name: name,
          role,
        },
        { onConflict: 'user_id' }
      )
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <main className="min-h-screen bg-white px-5 py-10 text-fei-bg sm:px-8">
        <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <a href="/" className="inline-flex items-center justify-center">
                <img
                  src="/fei-logo-navbar-vector.svg"
                  alt="FEI"
                  className="h-12 w-auto"
                />
              </a>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-fei-bg/10 bg-[#F7F8FA] p-7 text-center shadow-[0_18px_55px_rgba(7,17,31,0.05)] sm:p-8">
              <div className="absolute inset-x-6 top-0 h-[2px] bg-gradient-to-r from-fei-yellow via-fei-sky to-transparent opacity-90" />

              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-fei-sky/25 bg-white text-fei-sky">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7"
                  aria-hidden
                >
                  <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
                  <path d="M5 7.5 12 13l7-5.5" />
                </svg>
              </div>

              <p className="text-xs font-black uppercase tracking-[0.28em] text-fei-bg/55">
                Almost there
              </p>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-fei-bg">
                Confirm your FEI account
              </h1>

              <p className="mt-4 text-sm leading-6 text-fei-bg/62">
                We sent a confirmation link to:
              </p>

              <div className="mx-auto mt-4 max-w-full rounded-full border border-fei-bg/10 bg-white px-4 py-2 text-sm font-bold text-fei-bg">
                {email}
              </div>

              <p className="mt-5 text-sm leading-6 text-fei-bg/55">
                Open the email and click the confirmation link to activate your FEI profile
                and continue to your diagnostic.
              </p>

              <p className="mt-4 text-xs leading-5 text-fei-bg/40">
                Can’t find it? Check your spam or promotions folder.
              </p>

              <a
                href="/login"
                className="mt-7 inline-flex w-full justify-center rounded-full bg-fei-yellow px-6 py-3 font-bold text-fei-bg transition hover:bg-fei-yellow/90 hover:shadow-lg hover:shadow-fei-yellow/20"
              >
                Go to Sign in
              </a>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-fei-bg sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center justify-center">
        <div className="w-full max-w-xl">
          <div className="mb-8 text-center">
            <a href="/" className="inline-flex items-center justify-center">
              <img
                src="/fei-logo-navbar-vector.svg"
                alt="FEI"
                className="h-12 w-auto"
              />
            </a>
          </div>

          <form
            onSubmit={handleRegister}
            className="relative overflow-hidden rounded-[2rem] border border-fei-bg/10 bg-[#F7F8FA] p-6 shadow-[0_18px_55px_rgba(7,17,31,0.05)] sm:p-8"
          >
            <div className="absolute inset-x-6 top-0 h-[2px] bg-gradient-to-r from-fei-yellow via-fei-sky to-transparent opacity-90" />

            <div className="mb-7">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-fei-bg/55">
                Create your account
              </p>

              <h1 className="mt-4 text-4xl font-black tracking-tight text-fei-bg">
                Join FEI
              </h1>

              <p className="mt-4 text-sm leading-6 text-fei-bg/62">
                Choose the football role that best matches your pathway. FEI uses this to personalize your diagnostic.
              </p>
            </div>

            {error && (
              <p className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-500">
                {error}
              </p>
            )}

            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold text-fei-bg/70">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full rounded-2xl border border-fei-bg/10 bg-white px-4 py-3 text-fei-bg placeholder-fei-bg/30 outline-none transition focus:border-fei-sky/45"
                placeholder="Your name"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold text-fei-bg/70">
                Football role
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                required
                className="h-[54px] w-full appearance-none rounded-2xl border border-fei-bg/10 bg-white px-4 pr-12 text-base text-fei-bg outline-none transition focus:border-fei-sky/45"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%237dd3fc' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1.25rem',
                }}
              >
                <option value="">Choose your role</option>
                {roles.map(item => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              {role === "I'll choose later" && (
                <p className="mt-3 rounded-2xl border border-fei-sky/20 bg-fei-sky/[0.06] px-4 py-3 text-sm leading-6 text-fei-bg/62">
                  You can create your account now, but you will need to choose a football role before starting your FEI Diagnostic.
                </p>
              )}

              {role === 'Other football role' && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={customRole}
                    onChange={e => setCustomRole(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-fei-bg/10 bg-white px-4 py-3 text-fei-bg placeholder-fei-bg/30 outline-none transition focus:border-fei-sky/45"
                    placeholder="Tell us your football role"
                  />
                  <p className="mt-3 rounded-2xl border border-fei-yellow/30 bg-fei-yellow/[0.08] px-4 py-3 text-sm leading-6 text-fei-bg/62">
                    FEI diagnostics are currently built around specific football roles. Tell us your role, then choose the closest available role later to begin your diagnostic.
                  </p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold text-fei-bg/70">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-fei-bg/10 bg-white px-4 py-3 text-fei-bg placeholder-fei-bg/30 outline-none transition focus:border-fei-sky/45"
                placeholder="you@club.com"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-bold text-fei-bg/70">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-2xl border border-fei-bg/10 bg-white px-4 py-3 text-fei-bg placeholder-fei-bg/30 outline-none transition focus:border-fei-sky/45"
                placeholder="••••••••"
              />
              <p className="mt-2 text-xs leading-5 text-fei-bg/40">
                Use at least 8 characters with uppercase, lowercase, and a number.
              </p>
            </div>

            <div className="mb-6 space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-fei-bg/10 bg-white p-4 text-sm leading-6 text-fei-bg/62">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                  required
                  className="mt-1 h-4 w-4 rounded border-fei-bg/20 bg-white text-fei-yellow accent-fei-yellow focus:ring-fei-yellow"
                />
                <span>
                  I accept the{' '}
                  <a href="/terms" className="font-bold text-fei-sky hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="font-bold text-fei-sky hover:underline">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-fei-bg/10 bg-white p-4 text-sm leading-6 text-fei-bg/62">
                <input
                  type="checkbox"
                  checked={acceptedGdpr}
                  onChange={e => setAcceptedGdpr(e.target.checked)}
                  required
                  className="mt-1 h-4 w-4 rounded border-fei-bg/20 bg-white text-fei-yellow accent-fei-yellow focus:ring-fei-yellow"
                />
                <span>
                  I understand my personal data is processed and protected according to our{' '}
                  <a href="/privacy" className="font-bold text-fei-sky hover:underline">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !acceptedTerms || !acceptedGdpr}
              className="w-full rounded-full bg-fei-yellow py-3 font-bold text-fei-bg transition hover:bg-fei-yellow/90 hover:shadow-lg hover:shadow-fei-yellow/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Get Started'}
            </button>

            <p className="mt-4 text-center text-sm text-fei-bg/50">
              Already have an account?{' '}
              <a href="/login" className="font-bold text-fei-sky hover:underline">
                Sign in
              </a>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}
