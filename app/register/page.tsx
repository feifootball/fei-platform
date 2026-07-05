'use client'

import { useState } from 'react'
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

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy to create your FEI account.')
      setLoading(false)
      return
    }

    if (!acceptedGdpr) {
      setError('Please confirm that you understand your data is processed under GDPR.')
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
      <div className="flex min-h-screen items-center justify-center bg-fei-bg px-6">
        <div className="w-full max-w-md text-center">
          <span className="text-4xl font-black text-fei-yellow">FEI</span>
          <p className="mt-2 text-sm text-fei-sky">Football English Intelligence</p>
          <div className="mt-8 rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-fei-yellow/25 bg-fei-yellow/10 text-fei-yellow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8"
                aria-hidden
              >
                <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
                <path d="M5 7.5 12 13l7-5.5" />
              </svg>
            </div>

            <h1 className="mb-3 text-2xl font-bold text-fei-text">
              Confirm your FEI account
            </h1>

            <p className="text-fei-text/60">
              We sent a confirmation link to:
            </p>

            <div className="mx-auto mt-4 max-w-full rounded-full border border-fei-yellow/20 bg-fei-yellow/[0.08] px-4 py-2 text-sm font-semibold text-fei-yellow">
              {email}
            </div>

            <p className="mt-5 text-sm leading-6 text-fei-text/60">
              Open the email and click the confirmation link to activate your FEI profile
              and continue to your diagnostic.
            </p>

            <p className="mt-4 text-xs leading-5 text-fei-text/40">
              Can’t find it? Check your spam or promotions folder.
            </p>

            <a
              href="/login"
              className="mt-6 inline-flex w-full justify-center rounded-full bg-fei-yellow px-6 py-3 font-semibold text-fei-bg transition hover:bg-fei-yellow/90"
            >
              Go to Sign in
            </a>


          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-fei-bg px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <span className="text-4xl font-black text-fei-yellow">FEI</span>
          <p className="mt-2 text-sm text-fei-sky">Football English Intelligence</p>
        </div>

        <form onSubmit={handleRegister} className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-8">
          <h1 className="mb-2 text-2xl font-bold text-fei-text">Create your account</h1>
          <p className="mb-6 text-sm leading-6 text-fei-text/50">
            Choose the football role that best matches your pathway. FEI uses this to personalize your diagnostic.
          </p>

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
            <label className="mb-2 block text-sm font-medium text-fei-text/70">Football role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              required
              className="h-[60px] w-full appearance-none rounded-xl border border-fei-text/10 bg-fei-text/[0.05] px-4 pr-12 text-base text-fei-text focus:border-fei-yellow focus:outline-none"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%237dd3fc' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1rem center",
                backgroundSize: "1.25rem",
              }}
            >
              <option value="">Choose your role</option>
              {roles.map(item => (
                <option key={item} value={item} className="bg-fei-bg text-fei-text">
                  {item}
                </option>
              ))}
            </select>

            {role === "I'll choose later" && (
              <p className="mt-3 rounded-xl border border-fei-sky/20 bg-fei-sky/[0.06] px-4 py-3 text-sm leading-6 text-fei-text/60">
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
                  className="w-full rounded-xl border border-fei-text/10 bg-fei-text/[0.05] px-4 py-3 text-fei-text placeholder-fei-text/30 focus:border-fei-yellow focus:outline-none"
                  placeholder="Tell us your football role"
                />
                <p className="mt-3 rounded-xl border border-fei-yellow/20 bg-fei-yellow/[0.06] px-4 py-3 text-sm leading-6 text-fei-text/60">
                  FEI diagnostics are currently built around specific football roles. Tell us your role, then choose the closest available role later to begin your diagnostic.
                </p>
              </div>
            )}
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
              minLength={8}
              className="w-full rounded-xl border border-fei-text/10 bg-fei-text/[0.05] px-4 py-3 text-fei-text placeholder-fei-text/30 focus:border-fei-yellow focus:outline-none"
              placeholder="••••••••"
            />
            <p className="mt-2 text-xs leading-5 text-fei-text/40">
              Use at least 8 characters with uppercase, lowercase, and a number.
            </p>
          </div>

          <div className="mb-6 space-y-3">
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-fei-text/60">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
                required
                className="mt-1 h-4 w-4 rounded border-fei-text/20 bg-fei-bg text-fei-yellow accent-fei-yellow focus:ring-fei-yellow"
              />
              <span>
                I accept the{' '}
                <a href="/terms" className="font-medium text-fei-sky hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="font-medium text-fei-sky hover:underline">
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-fei-text/60">
              <input
                type="checkbox"
                checked={acceptedGdpr}
                onChange={e => setAcceptedGdpr(e.target.checked)}
                required
                className="mt-1 h-4 w-4 rounded border-fei-text/20 bg-fei-bg text-fei-yellow accent-fei-yellow focus:ring-fei-yellow"
              />
              <span>
                I understand my data is processed under{' '}
                <a href="/gdpr" className="font-medium text-fei-sky hover:underline">
                  GDPR
                </a>
                .
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !acceptedTerms || !acceptedGdpr}
            className="w-full rounded-full bg-fei-yellow py-3 font-semibold text-fei-bg transition-colors hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:opacity-50"
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
