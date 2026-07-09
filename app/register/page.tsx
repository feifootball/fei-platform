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
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-fei-bg px-6 py-12">
        <div className="absolute left-[-10rem] top-[-10rem] h-80 w-80 rounded-full bg-fei-sky/10 blur-3xl" />
        <div className="absolute bottom-[-12rem] right-[-10rem] h-96 w-96 rounded-full bg-fei-yellow/10 blur-3xl" />

        <section className="relative w-full max-w-md text-center">
          <a href="/" className="mx-auto inline-flex items-center justify-center">
            <img
              src="/fei-logo-navbar-vector.svg"
              alt="FEI"
              className="h-12 w-auto"
            />
          </a>

          <div className="mt-8 rounded-[2rem] border border-fei-text/10 bg-fei-text/[0.04] p-8 shadow-2xl shadow-black/20 backdrop-blur">
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

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-fei-sky">
              Almost there
            </p>

            <h1 className="text-2xl font-black tracking-tight text-fei-text">
              Confirm your FEI account
            </h1>

            <p className="mt-4 text-sm leading-6 text-fei-text/60">
              We sent a confirmation link to your email. Open it to activate your profile
              and continue to your diagnostic.
            </p>

            <div className="mx-auto mt-5 max-w-full rounded-full border border-fei-yellow/20 bg-fei-yellow/[0.08] px-4 py-2 text-sm font-semibold text-fei-yellow">
              {email}
            </div>

            <p className="mt-5 text-xs leading-5 text-fei-text/40">
              Can’t find it? Check your spam or promotions folder.
            </p>

            <a
              href="/login"
              className="mt-7 inline-flex w-full justify-center rounded-full bg-fei-yellow px-6 py-3 font-bold text-fei-bg transition hover:-translate-y-0.5 hover:bg-fei-yellow/90 hover:shadow-lg hover:shadow-fei-yellow/20"
            >
              Go to sign in
            </a>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-fei-bg px-6 py-10 text-fei-text">
      <div className="absolute left-[-12rem] top-[-12rem] h-96 w-96 rounded-full bg-fei-sky/10 blur-3xl" />
      <div className="absolute bottom-[-14rem] right-[-10rem] h-[28rem] w-[28rem] rounded-full bg-fei-yellow/10 blur-3xl" />

      <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="hidden lg:block">
          <a href="/" className="inline-flex items-center">
            <img
              src="/fei-logo-navbar-vector.svg"
              alt="FEI"
              className="h-12 w-auto"
            />
          </a>

          <p className="mt-10 text-xs font-bold uppercase tracking-[0.32em] text-fei-sky">
            Football English Intelligence
          </p>

          <h1 className="mt-5 max-w-xl text-5xl font-black leading-[1.02] tracking-tight text-fei-text">
            Start with your football role.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-fei-text/62">
            FEI personalizes your diagnostic according to the communication demands of your role in football.
          </p>

          <div className="mt-8 grid max-w-md gap-3">
            {[
              'Role-specific English diagnostic',
              'Real football communication situations',
              'Personalized pathway after registration',
            ].map(item => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-fei-text/10 bg-fei-text/[0.04] px-4 py-3 text-sm text-fei-text/70"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fei-yellow/12 text-fei-yellow">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                    aria-hidden
                  >
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full">
          <div className="mb-7 text-center lg:hidden">
            <a href="/" className="inline-flex items-center justify-center">
              <img
                src="/fei-logo-navbar-vector.svg"
                alt="FEI"
                className="h-12 w-auto"
              />
            </a>
            <p className="mt-3 text-sm text-fei-sky">Football English Intelligence</p>
          </div>

          <form
            onSubmit={handleRegister}
            className="rounded-[2rem] border border-fei-text/10 bg-fei-text/[0.04] p-6 shadow-2xl shadow-black/25 backdrop-blur sm:p-8"
          >
            <div className="mb-7">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-fei-yellow">
                Create your account
              </p>

              <h2 className="text-3xl font-black tracking-tight text-fei-text">
                Join FEI
              </h2>

              <p className="mt-3 text-sm leading-6 text-fei-text/55">
                Choose your role, create your account and continue to your FEI diagnostic.
              </p>
            </div>

            {error && (
              <p className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300">
                {error}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-fei-text/75">
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-fei-text/10 bg-fei-bg/45 px-4 py-3 text-fei-text placeholder-fei-text/30 outline-none transition focus:border-fei-yellow/70 focus:bg-fei-bg/70"
                  placeholder="Your name"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-fei-text/75">
                  Football role
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  required
                  className="h-[54px] w-full appearance-none rounded-2xl border border-fei-text/10 bg-fei-bg/45 px-4 pr-12 text-base text-fei-text outline-none transition focus:border-fei-yellow/70 focus:bg-fei-bg/70"
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
                    <option key={item} value={item} className="bg-fei-bg text-fei-text">
                      {item}
                    </option>
                  ))}
                </select>

                {role && role !== 'Other football role' && role !== "I'll choose later" && (
                  <p className="mt-3 rounded-2xl border border-fei-sky/20 bg-fei-sky/[0.06] px-4 py-3 text-sm leading-6 text-fei-text/60">
                    Your FEI diagnostic will be personalized for the communication situations of a {role}.
                  </p>
                )}

                {role === "I'll choose later" && (
                  <p className="mt-3 rounded-2xl border border-fei-sky/20 bg-fei-sky/[0.06] px-4 py-3 text-sm leading-6 text-fei-text/60">
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
                      className="w-full rounded-2xl border border-fei-text/10 bg-fei-bg/45 px-4 py-3 text-fei-text placeholder-fei-text/30 outline-none transition focus:border-fei-yellow/70 focus:bg-fei-bg/70"
                      placeholder="Tell us your football role"
                    />
                    <p className="mt-3 rounded-2xl border border-fei-yellow/20 bg-fei-yellow/[0.06] px-4 py-3 text-sm leading-6 text-fei-text/60">
                      FEI diagnostics are currently built around specific football roles. Tell us your role, then choose the closest available role later to begin your diagnostic.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-fei-text/75">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-fei-text/10 bg-fei-bg/45 px-4 py-3 text-fei-text placeholder-fei-text/30 outline-none transition focus:border-fei-yellow/70 focus:bg-fei-bg/70"
                  placeholder="you@club.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-fei-text/75">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-2xl border border-fei-text/10 bg-fei-bg/45 px-4 py-3 text-fei-text placeholder-fei-text/30 outline-none transition focus:border-fei-yellow/70 focus:bg-fei-bg/70"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <p className="mt-2 text-xs leading-5 text-fei-text/40">
              Use at least 8 characters with uppercase, lowercase, and a number.
            </p>

            <div className="mt-6 space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-fei-text/10 bg-fei-bg/30 p-4 text-sm leading-6 text-fei-text/60 transition hover:border-fei-text/18">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                  required
                  className="mt-1 h-4 w-4 rounded border-fei-text/20 bg-fei-bg text-fei-yellow accent-fei-yellow focus:ring-fei-yellow"
                />
                <span>
                  I accept the{' '}
                  <a href="/terms" className="font-semibold text-fei-sky hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="font-semibold text-fei-sky hover:underline">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-fei-text/10 bg-fei-bg/30 p-4 text-sm leading-6 text-fei-text/60 transition hover:border-fei-text/18">
                <input
                  type="checkbox"
                  checked={acceptedGdpr}
                  onChange={e => setAcceptedGdpr(e.target.checked)}
                  required
                  className="mt-1 h-4 w-4 rounded border-fei-text/20 bg-fei-bg text-fei-yellow accent-fei-yellow focus:ring-fei-yellow"
                />
                <span>
                  I understand my personal data is processed and protected according to our{' '}
                  <a href="/privacy" className="font-semibold text-fei-sky hover:underline">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !acceptedTerms || !acceptedGdpr}
              className="mt-7 w-full rounded-full bg-fei-yellow py-3.5 font-black text-fei-bg transition hover:-translate-y-0.5 hover:bg-fei-yellow/90 hover:shadow-lg hover:shadow-fei-yellow/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loading ? 'Creating account...' : 'Create my FEI account'}
            </button>

            <p className="mt-5 text-center text-sm text-fei-text/50">
              Already have an account?{' '}
              <a href="/login" className="font-semibold text-fei-sky hover:underline">
                Sign in
              </a>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}
