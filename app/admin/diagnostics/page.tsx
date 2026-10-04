import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = 'danielaportillafl@gmail.com'

type Attempt = {
  id: string
  role: string
  status: 'pending_evaluation' | 'human_review_required' | 'evaluated'
  speaking_audio_path: string | null
  submitted_at: string
}

function statusLabel(status: Attempt['status']) {
  if (status === 'evaluated') return 'Evaluated'
  if (status === 'human_review_required') return 'Needs review'
  return 'Pending evaluation'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default async function DiagnosticReviewsPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) redirect('/login')
  if (user.email?.toLowerCase() !== ADMIN_EMAIL) redirect('/dashboard')

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('diagnostic_attempts')
    .select('id, role, status, speaking_audio_path, submitted_at')
    .order('submitted_at', { ascending: false })
    .limit(100)

  const attempts = (data ?? []) as Attempt[]
  const pendingCount = attempts.filter((attempt) => attempt.status !== 'evaluated').length

  return (
    <div className="min-h-screen bg-fei-bg px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image src="/fei-logo-navbar-vector.svg" alt="FEI" width={32} height={32} className="h-8 w-auto" />
            <span className="text-sm font-medium text-fei-sky">Diagnostic review</span>
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-fei-text/20 px-4 py-2 text-sm text-fei-text/60 transition-colors hover:border-fei-text/40 hover:text-fei-text"
          >
            Admin dashboard
          </Link>
        </header>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fei-sky">FEI scoring</p>
            <h1 className="mt-3 text-3xl font-bold text-fei-text sm:text-4xl">Production evaluations</h1>
            <p className="mt-3 max-w-2xl text-fei-text/50">
              Review the Writing response and Speaking recording, then import the structured evaluation.
            </p>
          </div>
          <div className="rounded-2xl border border-fei-yellow/20 bg-fei-yellow/[0.06] px-5 py-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fei-text/45">Waiting</p>
            <p className="mt-1 text-3xl font-black text-fei-yellow">{pendingCount}</p>
          </div>
        </div>

        {error ? (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-6 text-sm text-red-200">
            Diagnostic attempts could not be loaded.
          </p>
        ) : attempts.length === 0 ? (
          <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-10 text-center">
            <p className="text-xl font-bold text-fei-text">No submissions yet</p>
            <p className="mt-2 text-sm leading-6 text-fei-text/50">
              New completed diagnostics will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {attempts.map((attempt) => (
              <Link
                key={attempt.id}
                href={`/admin/diagnostics/${attempt.id}`}
                className="group rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-5 transition hover:border-fei-sky/40 hover:bg-fei-text/[0.05]"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-fei-text">{attempt.role}</p>
                    <p className="mt-1 text-sm text-fei-text/45">{formatDate(attempt.submitted_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {!attempt.speaking_audio_path && (
                      <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200">
                        No audio
                      </span>
                    )}
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      attempt.status === 'evaluated'
                        ? 'bg-green-500/10 text-green-200'
                        : 'bg-fei-yellow/10 text-fei-yellow'
                    }`}>
                      {statusLabel(attempt.status)}
                    </span>
                    <span className="text-fei-sky transition group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
