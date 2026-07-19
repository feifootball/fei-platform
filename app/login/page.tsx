'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Lang = 'en' | 'es'

const copy = {
  en: {
    navRegister: 'Register',
    label: 'Account access',
    title: 'Login to FEI',
    description: 'Access your account and continue your progress.',
    email: 'Email',
    password: 'Password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    loading: 'Logging in...',
    submit: 'Login',
    noAccount: "Don’t have an account?",
    register: 'Register',
    forgot: 'Forgot your password?',
  },
  es: {
    navRegister: 'Registrarse',
    label: 'Acceso a tu cuenta',
    title: 'Ingresa a FEI',
    description: 'Accede a tu cuenta y continúa tu progreso.',
    email: 'Correo electrónico',
    password: 'Contraseña',
    showPassword: 'Mostrar contraseña',
    hidePassword: 'Ocultar contraseña',
    loading: 'Ingresando...',
    submit: 'Ingresar',
    noAccount: '¿No tienes una cuenta?',
    register: 'Regístrate',
    forgot: '¿Olvidaste tu contraseña?',
  },
}

export default function LoginPage() {
  const [lang, setLang] = useState<Lang>('en')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const t = copy[lang]

  useEffect(() => {
    const saved = localStorage.getItem('fei_lang_v2') as Lang
    if (saved === 'en' || saved === 'es') setLang(saved)
  }, [])

  function toggleLang() {
    const next: Lang = lang === 'en' ? 'es' : 'en'
    setLang(next)
    localStorage.setItem('fei_lang_v2', next)
    window.dispatchEvent(new CustomEvent('fei_lang_v2_v2_change', { detail: next }))
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
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
            href="/register"
            className="rounded-full bg-fei-yellow px-4 py-1.5 text-[15px] font-bold text-fei-bg transition hover:bg-fei-yellow/90 hover:shadow-lg hover:shadow-fei-yellow/20"
          >
            {t.navRegister}
          </a>
        </div>
      </nav>
    </header>
  )

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_18%,rgba(125,211,252,0.10),transparent_34%),linear-gradient(to_bottom,#ffffff_0%,#ffffff_38%,#F7F8FA_100%)] text-fei-bg">
      <AuthNav />

      <section className="mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl items-center justify-center px-5 py-6 sm:px-8">
        <div className="w-full max-w-md">
          <form
            onSubmit={handleLogin}
            className="relative overflow-hidden rounded-[2rem] border border-fei-bg/12 bg-white p-5 shadow-[0_26px_70px_rgba(7,17,31,0.10)] sm:p-7"
          >
            <div className="absolute inset-x-6 top-0 h-[2px] bg-gradient-to-r from-fei-yellow via-fei-sky to-transparent opacity-90" />

            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-fei-bg/65">
                {t.label}
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight text-fei-bg/92">
                {lang === 'en' ? (
                  <>
                    Login to <span className="text-fei-sky">FEI</span>
                  </>
                ) : (
                  <>
                    Ingresa a <span className="text-fei-sky">FEI</span>
                  </>
                )}
              </h1>

              {t.description && (
                <p className="mt-3 text-sm leading-6 text-fei-bg/58 mb-9">
                  {t.description}
                </p>
              )}
            </div>

            {error && (
              <p className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-500">
                {error}
              </p>
            )}

            <div className="mb-3">
              <label className="mb-2 block text-sm font-bold text-fei-bg/70">
                {t.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-fei-bg/10 bg-white px-4 py-2.5 text-fei-bg placeholder-fei-bg/40 outline-none transition focus:border-fei-sky/45"
                placeholder="you@club.com"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold text-fei-bg/70">
                {t.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-fei-bg/10 bg-white py-2.5 pl-4 pr-12 text-fei-bg placeholder-fei-bg/40 outline-none transition focus:border-fei-sky/45"
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(current => !current)}
                  aria-label={showPassword ? t.hidePassword : t.showPassword}
                  title={showPassword ? t.hidePassword : t.showPassword}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-fei-bg/40 transition hover:text-fei-bg/70 focus:outline-none"
                >
                  {showPassword ? (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 4.3A10.8 10.8 0 0112 4c5.2 0 8.8 4.4 9.7 5.7a.5.5 0 010 .6 16.7 16.7 0 01-3 3.3M6.6 6.6A16.2 16.2 0 002.3 9.7a.5.5 0 000 .6C3.2 11.6 6.8 16 12 16c.9 0 1.8-.1 2.6-.4"
                      />
                    </svg>
                  ) : (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.3 9.7a.5.5 0 000 .6C3.2 11.6 6.8 16 12 16s8.8-4.4 9.7-5.7a.5.5 0 000-.6C20.8 8.4 17.2 4 12 4S3.2 8.4 2.3 9.7z"
                      />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-fei-yellow py-2.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90 hover:shadow-lg hover:shadow-fei-yellow/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? t.loading : t.submit}
            </button>

            <p className="mt-4 text-center text-sm text-fei-bg/62">
              {t.noAccount}{' '}
              <a href="/register" className="font-semibold text-[#38bdf8] hover:text-fei-bg hover:underline">
                {t.register}
              </a>
            </p>

            <div className="mt-3 text-center">
              <a
                href="/forgot-password"
                className="text-sm font-semibold text-[#38bdf8] transition hover:text-fei-bg hover:underline"
              >
                {t.forgot}
              </a>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
