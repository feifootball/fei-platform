'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        setLoading(false)
      }
    }
    getUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
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
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <span className="text-2xl font-black text-fei-yellow">FEI</span>
            <span className="ml-2 text-sm text-fei-sky">Football English Intelligence</span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full border border-fei-text/20 px-4 py-2 text-sm text-fei-text/60 hover:border-fei-text/40"
          >
            Sign out
          </button>
        </div>
        <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-8">
          <h1 className="mb-2 text-3xl font-bold text-fei-text">
            Welcome, {user?.user_metadata?.full_name || user?.email}
          </h1>
          <p className="text-fei-text/50">Your FEI dashboard is coming soon.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {['Scout', 'Head Coach', 'Performance Analyst'].map(role => (
              <div key={role} className="rounded-xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
                <p className="font-semibold text-fei-yellow">{role}</p>
                <p className="mt-1 text-sm text-fei-sky">Coming soon</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
