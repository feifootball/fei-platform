'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type Lang = 'en' | 'es'

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

const countries = [
  'Argentina',
  'Brazil',
  'Canada',
  'Chile',
  'Colombia',
  'Ecuador',
  'France',
  'Germany',
  'Italy',
  'Mexico',
  'Portugal',
  'Spain',
  'United Kingdom',
  'United States',
  'Other',
]

const copy = {
  en: {
    createLabel: 'Create your account',
    titlePrefix: 'Join',
    description:
      'Create your account to start your FEI diagnostic and begin your football English training journey.',
    fullName: 'Full name',
    fullNamePlaceholder: 'Your name',
    role: 'Football role',
    chooseRole: 'Choose your role',
    chooseLaterNote:
      'You can create your account now, but you will need to choose a football role before starting your FEI Diagnostic.',
    customRolePlaceholder: 'Tell us your football role',
    customRoleNote:
      'FEI diagnostics are currently built around specific football roles. Tell us your role, then choose the closest available role later to begin your diagnostic.',
    country: 'Country',
    chooseCountry: 'Choose your country',
    email: 'Email',
    password: 'Password',
    passwordHelp: 'Use at least 8 characters with uppercase, lowercase, and a number.',
    termsStart: 'I accept the',
    terms: 'Terms of Service',
    and: 'and',
    privacy: 'Privacy Policy',
    gdprStart: 'I understand my personal data is processed and protected according to our',
    loading: 'Creating account...',
    submit: 'Get Started',
    already: 'Already have an account?',
    signIn: 'Sign in',
    login: 'Login',
    almost: 'Almost there',
    confirmTitle: 'Confirm your FEI account',
    sentTo: 'We sent a confirmation link to:',
    confirmBody:
      'Open the email and click the confirmation link to activate your FEI profile and continue to your diagnostic.',
    spam: 'Can’t find it? Check your spam or promotions folder.',
    goLogin: 'Go to Sign in',
  },
  es: {
    createLabel: 'Crea tu cuenta',
    titlePrefix: 'Únete a',
    description:
      'Crea tu cuenta para iniciar tu diagnóstico FEI y empezar tu entrenamiento en inglés especializado en fútbol.',
    fullName: 'Nombre completo',
    fullNamePlaceholder: 'Tu nombre',
    role: 'Rol en el fútbol',
    chooseRole: 'Elige tu rol',
    chooseLaterNote:
      'Puedes crear tu cuenta ahora, pero deberás elegir un rol antes de iniciar tu Diagnóstico FEI.',
    customRolePlaceholder: 'Cuéntanos cuál es tu rol',
    customRoleNote:
      'Los diagnósticos FEI están construidos alrededor de roles específicos del fútbol. Cuéntanos tu rol y luego elige el rol más cercano para iniciar tu diagnóstico.',
    country: 'País',
    chooseCountry: 'Elige tu país',
    email: 'Correo electrónico',
    password: 'Contraseña',
    passwordHelp: 'Usa al menos 8 caracteres con mayúscula, minúscula y un número.',
    termsStart: 'Acepto los',
    terms: 'Términos de uso',
    and: 'y la',
    privacy: 'Política de privacidad',
    gdprStart: 'Entiendo que mis datos personales serán procesados y protegidos según nuestra',
    loading: 'Creando cuenta...',
    submit: 'Empezar',
    already: '¿Ya tienes una cuenta?',
    signIn: 'Ingresar',
    login: 'Ingresar',
    almost: 'Casi listo',
    confirmTitle: 'Confirma tu cuenta FEI',
    sentTo: 'Enviamos un enlace de confirmación a:',
    confirmBody:
      'Abre el correo y haz clic en el enlace de confirmación para activar tu perfil FEI y continuar con tu diagnóstico.',
    spam: '¿No lo encuentras? Revisa spam o promociones.',
    goLogin: 'Ir a ingresar',
  },
}

export default function RegisterPage() {
  const [lang, setLang] = useState<Lang>('en')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [country, setCountry] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedGdpr, setAcceptedGdpr] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()
  const t = copy[lang]

  useEffect(() => {
    const saved = localStorage.getItem('fei_lang_v2') as Lang
    if (saved === 'en' || saved === 'es') setLang(saved)

    const params = new URLSearchParams(window.location.search)
    const selectedRole = params.get('role')

    if (selectedRole && roles.includes(selectedRole)) {
      setRole(selectedRole)
    }
  }, [])

  function toggleLang() {
    const next: Lang = lang === 'en' ? 'es' : 'en'
    setLang(next)
    localStorage.setItem('fei_lang_v2', next)
    window.dispatchEvent(new CustomEvent('fei_lang_v2_v2_change', { detail: next }))
  }

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
          country,
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
          country,
        },
        { onConflict: 'user_id' }
      )
    }

    setSuccess(true)
    setLoading(false)
  }

  const AuthNav = () => (
    <header className="mx-auto w-full max-w-[1280px] px-4 pt-4 sm:px-5">
      <nav className="flex h-[60px] items-center justify-between rounded-full border border-fei-bg/8 bg-white/70 px-4 shadow-[0_8px_24px_rgba(7,17,31,0.045)] backdrop-blur-2xl sm:px-5">
        <a href="/" className="flex items-center">
          <img src="/fei-logo-navbar-vector.svg" alt="FEI" className="h-12 w-auto" />
        </a>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="inline-flex items-center gap-2 rounded-full border border-fei-bg/10 bg-white px-4 py-1.5 text-[15px] font-medium tracking-[-0.01em] text-fei-bg/75 transition hover:border-fei-bg/18 hover:text-fei-bg"
            aria-label="Change language"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-fei-sky"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18" />
              <path d="M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21" />
              <path d="M12 3c-2.2 2.4-3.3 5.4-3.3 9S9.8 18.6 12 21" />
            </svg>
            {lang === 'en' ? 'ES' : 'EN'}
          </button>

          <a
            href="/login"
            className="rounded-full border border-fei-bg/18 px-4 py-1.5 text-[15px] font-medium text-fei-bg transition hover:bg-fei-bg/[0.04]"
          >
            {t.login}
          </a>
        </div>
      </nav>
    </header>
  )

  if (success) {
    return (
      <main className="min-h-screen bg-white text-fei-bg">
        <AuthNav />

        <section className="mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
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

              <p className="text-xs font-black uppercase tracking-[0.28em] text-fei-bg/65">
                {t.almost}
              </p>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-fei-bg">
                {t.confirmTitle}
              </h1>

              <p className="mt-4 text-sm leading-6 text-fei-bg/58">
                {t.sentTo}
              </p>

              <div className="mx-auto mt-4 max-w-full rounded-full border border-fei-bg/10 bg-white px-4 py-2 text-sm font-bold text-fei-bg/62">
                {email}
              </div>

              <p className="mt-5 text-sm leading-6 text-fei-bg/68">
                {t.confirmBody}
              </p>

              <p className="mt-4 text-xs leading-5 text-fei-bg/55">
                {t.spam}
              </p>

              <a
                href="/login"
                className="mt-7 inline-flex w-full justify-center rounded-full bg-fei-yellow px-6 py-3 font-bold text-fei-bg transition hover:bg-fei-yellow/90 hover:shadow-lg hover:shadow-fei-yellow/20"
              >
                {t.goLogin}
              </a>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-fei-bg">
      <AuthNav />

      <section className="mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-xl">
          <form
            onSubmit={handleRegister}
            className="relative overflow-hidden rounded-[2rem] border border-fei-bg/10 bg-[#F7F8FA] p-6 shadow-[0_18px_55px_rgba(7,17,31,0.05)] sm:p-8"
          >
            <div className="absolute inset-x-6 top-0 h-[2px] bg-gradient-to-r from-fei-yellow via-fei-sky to-transparent opacity-90" />

            <div className="mb-7">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-fei-bg/65">
                {t.createLabel}
              </p>

              <h1 className="mt-4 text-4xl font-black tracking-tight text-fei-bg">
                {t.titlePrefix} <span className="text-fei-sky">FEI</span>
              </h1>

              <p className="mt-4 text-sm leading-6 text-fei-bg/58">
                {t.description}
              </p>
            </div>

            {error && (
              <p className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-500">
                {error}
              </p>
            )}

            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold text-fei-bg/62">
                {t.fullName}
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full rounded-2xl border border-fei-bg/10 bg-white px-4 py-3 text-fei-bg placeholder-fei-bg/40 outline-none transition focus:border-fei-sky/45"
                placeholder={t.fullNamePlaceholder}
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold text-fei-bg/62">
                {t.role}
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
                <option value="">{t.chooseRole}</option>
                {roles.map(item => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              {role === "I'll choose later" && (
                <p className="mt-3 rounded-2xl border border-fei-sky/20 bg-fei-sky/[0.06] px-4 py-3 text-sm leading-6 text-fei-bg/70">
                  {t.chooseLaterNote}
                </p>
              )}

              {role === 'Other football role' && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={customRole}
                    onChange={e => setCustomRole(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-fei-bg/10 bg-white px-4 py-3 text-fei-bg placeholder-fei-bg/40 outline-none transition focus:border-fei-sky/45"
                    placeholder={t.customRolePlaceholder}
                  />
                  <p className="mt-3 rounded-2xl border border-fei-yellow/30 bg-fei-yellow/[0.08] px-4 py-3 text-sm leading-6 text-fei-bg/70">
                    {t.customRoleNote}
                  </p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold text-fei-bg/62">
                {t.country}
              </label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
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
                <option value="">{t.chooseCountry}</option>
                {countries.map(item => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold text-fei-bg/62">
                {t.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-fei-bg/10 bg-white px-4 py-3 text-fei-bg placeholder-fei-bg/40 outline-none transition focus:border-fei-sky/45"
                placeholder="you@club.com"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-bold text-fei-bg/62">
                {t.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-2xl border border-fei-bg/10 bg-white px-4 py-3 text-fei-bg placeholder-fei-bg/40 outline-none transition focus:border-fei-sky/45"
                placeholder="••••••••"
              />
              <p className="mt-2 text-xs leading-5 text-fei-bg/58">
                {t.passwordHelp}
              </p>
            </div>

            <div className="mb-6 space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-fei-bg/10 bg-white p-4 text-sm leading-6 text-fei-bg/70">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                  required
                  className="mt-1 h-4 w-4 rounded border-fei-bg/20 bg-white text-fei-yellow accent-fei-yellow focus:ring-fei-yellow"
                />
                <span>
                  {t.termsStart}{' '}
                  <a href="/terms" className="font-black text-[#38bdf8] hover:text-fei-bg hover:underline">
                    {t.terms}
                  </a>{' '}
                  {t.and}{' '}
                  <a href="/privacy" className="font-black text-[#38bdf8] hover:text-fei-bg hover:underline">
                    {t.privacy}
                  </a>
                  .
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-fei-bg/10 bg-white p-4 text-sm leading-6 text-fei-bg/70">
                <input
                  type="checkbox"
                  checked={acceptedGdpr}
                  onChange={e => setAcceptedGdpr(e.target.checked)}
                  required
                  className="mt-1 h-4 w-4 rounded border-fei-bg/20 bg-white text-fei-yellow accent-fei-yellow focus:ring-fei-yellow"
                />
                <span>
                  {t.gdprStart}{' '}
                  <a href="/privacy" className="font-black text-[#38bdf8] hover:text-fei-bg hover:underline">
                    {t.privacy}
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
              {loading ? t.loading : t.submit}
            </button>

            <p className="mt-4 text-center text-sm text-fei-bg/62">
              {t.already}{' '}
              <a href="/login" className="font-black text-[#38bdf8] hover:text-fei-bg hover:underline">
                {t.signIn}
              </a>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}
