'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const roles = [
  { name: 'Professional Player', description: 'Perform and represent the club globally' },
  { name: 'Head Coach', description: 'Lead tactical communication' },
  { name: 'Assistant Coach', description: 'Translate vision into action' },
  { name: 'Academy Director', description: 'Build the next generation' },
  { name: 'Scout', description: 'Identify and report talent globally' },
  { name: 'Head of Scouting', description: 'Drive recruitment strategy' },
  { name: 'Performance Analyst', description: 'Convert data into decisions' },
  { name: 'Fitness Coach', description: 'Protect player availability' },
  { name: 'Physiotherapist', description: 'Communicate with medical precision' },
  { name: 'Sports Psychologist', description: 'Facilitate mental performance' },
  { name: 'Nutritionist', description: 'Turn nutrition into performance' },
]

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setLoading(false)
      }
    }
    getUser()
  }, [router, supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function handleContinue() {
    if (!selected) return
    router.push(`/onboarding?role=${encodeURIComponent(selected)}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fei-bg">
        <p className="text-fei-sky">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fei-bg px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="FEI" className="h-8 w-auto" />
            <span className="text-xs font-medium text-fei-sky sm:text-sm">
              Football English Intelligence
            </span>
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((isOpen) => !isOpen)}
              className="rounded-full border border-fei-text/20 px-4 py-2 text-sm text-fei-text/70 transition-colors hover:border-fei-text/40 hover:text-fei-text"
              aria-expanded={isAccountMenuOpen}
              aria-haspopup="menu"
            >
              <span>Account</span>
              <span className="ml-2 text-fei-sky" aria-hidden="true">
                ▾
              </span>
            </button>

            {isAccountMenuOpen && (
              <div
                className="absolute right-0 z-10 mt-3 w-44 overflow-hidden rounded-xl border border-fei-text/10 bg-fei-bg shadow-xl shadow-black/20"
                role="menu"
              >
                <Link
                  href="/settings"
                  className="block px-4 py-3 text-sm text-fei-text/75 transition-colors hover:bg-fei-text/[0.04] hover:text-fei-yellow"
                  role="menuitem"
                >
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-4 py-3 text-left text-sm text-fei-text/75 transition-colors hover:bg-fei-text/[0.04] hover:text-fei-yellow"
                  role="menuitem"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-fei-text sm:text-4xl">
            Select Your Professional Role
          </h1>
          <p className="mt-3 text-fei-text/50">
            Choose the role that best describes your position in the club.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {roles.map((role) => (
            <button
              key={role.name}
              onClick={() => setSelected(role.name)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-4 py-5 text-center transition-all ${
                selected === role.name
                  ? 'border-fei-yellow bg-fei-yellow/10'
                  : 'border-fei-text/10 bg-fei-text/[0.03] hover:border-fei-sky'
              }`}
            >
              <span className="text-sm font-bold text-fei-yellow">{role.name}</span>
              <span className="text-xs leading-snug text-fei-sky">{role.description}</span>
            </button>
          ))}
        </div>

        {selected && (
          <div className="mt-8 text-center">
            <button
              onClick={handleContinue}
              className="rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg transition-colors hover:bg-fei-yellow/90"
            >
              Continue as {selected}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
