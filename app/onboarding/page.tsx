import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type Profile = {
  role: string | null
}

type OnboardingPageProps = {
  searchParams?: Promise<{
    started?: string
  }>
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams
  const diagnosticStarted = params?.started === 'true'
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) {
    redirect('/login')
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  const profile = profileData as Profile | null
  const selectedRole = profile?.role?.trim()

  if (!selectedRole) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-fei-bg px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="FEI" width={32} height={32} className="h-8 w-auto" />
            <span className="text-xs font-medium text-fei-sky sm:text-sm">
              Football English Intelligence
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-fei-text/20 px-4 py-2 text-sm text-fei-text/60 transition-colors hover:border-fei-text/40 hover:text-fei-text"
          >
            Dashboard
          </Link>
        </div>

        <main className="rounded-2xl border border-fei-sky/20 bg-fei-text/[0.03] p-8 sm:p-10">
          <div className="mb-6 inline-flex rounded-full bg-fei-yellow/10 px-4 py-2">
            <span className="text-sm font-semibold text-fei-yellow">Onboarding</span>
          </div>

          <h1 className="text-3xl font-bold text-fei-text sm:text-5xl">
            FEI Diagnostic Assessment
          </h1>

          <div className="mt-6 rounded-xl border border-fei-text/10 bg-fei-bg/40 p-5">
            <p className="text-sm font-medium text-fei-text/50">Selected role</p>
            <p className="mt-2 text-2xl font-bold text-fei-yellow">{selectedRole}</p>
          </div>

          <p className="mt-6 text-base leading-7 text-fei-text/65 sm:text-lg">
            The diagnostic will measure your football-specific English across role-based
            communication, professional vocabulary, match and training context, and the clarity
            needed to operate in international football environments.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-fei-text/10 bg-fei-text/[0.04] p-4">
              <p className="text-sm font-semibold text-fei-sky">Role context</p>
              <p className="mt-2 text-sm leading-6 text-fei-text/55">
                Questions will match your selected football role.
              </p>
            </div>
            <div className="rounded-xl border border-fei-text/10 bg-fei-text/[0.04] p-4">
              <p className="text-sm font-semibold text-fei-sky">Communication</p>
              <p className="mt-2 text-sm leading-6 text-fei-text/55">
                Prompts will focus on practical professional situations.
              </p>
            </div>
            <div className="rounded-xl border border-fei-text/10 bg-fei-text/[0.04] p-4">
              <p className="text-sm font-semibold text-fei-sky">Baseline</p>
              <p className="mt-2 text-sm leading-6 text-fei-text/55">
                Results will be added after the question flow is built.
              </p>
            </div>
          </div>

          {diagnosticStarted ? (
            <div className="mt-10 rounded-xl border border-fei-yellow/30 bg-fei-yellow/10 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fei-yellow">
                Diagnostic started
              </p>
              <p className="mt-3 text-sm leading-6 text-fei-text/65">
                Your role is confirmed. The next step is to add the role-specific diagnostic
                questions on top of this onboarding entry point.
              </p>
            </div>
          ) : (
            <div className="mt-10">
              <Link
                href="/onboarding?started=true"
                className="inline-flex rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg transition-colors hover:bg-fei-yellow/90"
              >
                Start Diagnostic
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
