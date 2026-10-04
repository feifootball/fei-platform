import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import DiagnosticEvaluationForm from '@/components/admin/DiagnosticEvaluationForm'
import { getProductionTasks } from '@/lib/diagnostic/task-prompts'
import type { ObjectiveItemEvidence } from '@/lib/diagnostic/types'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = 'danielaportillafl@gmail.com'

type Attempt = {
  id: string
  role: string
  submission_version: string
  objective_evidence: ObjectiveItemEvidence[]
  writing_task_id: string
  writing_response: string
  speaking_task_id: string
  speaking_audio_path: string | null
  speaking_duration_seconds: number | null
  status: string
  submitted_at: string
}

type StoredEvaluation = {
  id: string
  skill: 'writing' | 'speaking'
  version: number
  evaluation_status: string
  evaluator_type: string
  created_at: string
}

type StoredResult = {
  status: string
  level: string | null
  reason: string
  objective_correct: number
  objective_total: number
  production_points: number | null
  total_points: number | null
  max_points: number
  updated_at: string
}

function taskText(label: string, task: ReturnType<typeof getProductionTasks>['writing']) {
  return [
    `${label} situation: ${task.situation}`,
    `${label} task: ${task.task}`,
    `${label} requirements:`,
    ...task.requirements.map((requirement) => `- ${requirement}`),
  ].join('\n')
}

function buildEvaluationPrompt(attempt: Attempt) {
  const tasks = getProductionTasks(attempt.role, attempt.submission_version)

  return `Evaluate this FEI diagnostic submission using the approved FEI Writing and Speaking framework.

Core rules:
- Judge the demonstrated English, not response length by itself.
- Technical football vocabulary alone does not raise the CEFR level.
- Overall is a best-fit judgement and cannot exceed Language Control & Range.
- Use C1 only when complex grammar, precise vocabulary, nuance and control are sustained.
- Use Insufficient Evidence when the sample does not support a defensible CEFR judgement.
- Borderline alternatives must be adjacent and only used when genuinely plausible.
- For Speaking, judge the audio. Accent is not pronunciation, fluency is not speed, and audio quality must not lower the language level.

Role: ${attempt.role}

${taskText('Writing', tasks.writing)}

Candidate Writing response:
${attempt.writing_response || '[No written response]'}

${taskText('Speaking', tasks.speaking)}

Listen to the attached Speaking recording before judging it. Return only valid JSON matching the template shown in FEI. Use null levels and dimensions for an unresolved status.`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default async function DiagnosticReviewPage({
  params,
}: {
  params: Promise<{ attemptId: string }>
}) {
  const { attemptId } = await params
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) redirect('/login')
  if (user.email?.toLowerCase() !== ADMIN_EMAIL) redirect('/dashboard')

  const admin = createAdminClient()
  const [{ data: attemptData }, { data: evaluationData }, { data: resultData }] = await Promise.all([
    admin.from('diagnostic_attempts').select('*').eq('id', attemptId).maybeSingle(),
    admin
      .from('diagnostic_production_evaluations')
      .select('id, skill, version, evaluation_status, evaluator_type, created_at')
      .eq('attempt_id', attemptId)
      .order('created_at', { ascending: false }),
    admin.from('diagnostic_results').select('*').eq('attempt_id', attemptId).maybeSingle(),
  ])

  if (!attemptData) notFound()

  const attempt = attemptData as Attempt
  const evaluations = (evaluationData ?? []) as StoredEvaluation[]
  const result = resultData as StoredResult | null
  const tasks = getProductionTasks(attempt.role, attempt.submission_version)

  let audioUrl: string | null = null
  if (attempt.speaking_audio_path) {
    const { data } = await admin.storage
      .from('diagnostic-speaking')
      .createSignedUrl(attempt.speaking_audio_path, 60 * 30)
    audioUrl = data?.signedUrl ?? null
  }

  const objectiveCorrect = attempt.objective_evidence.filter((item) => item.correct).length

  return (
    <div className="min-h-screen bg-fei-bg px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link href="/admin/diagnostics" className="flex items-center gap-2.5">
            <Image src="/fei-logo-navbar-vector.svg" alt="FEI" width={32} height={32} className="h-8 w-auto" />
            <span className="text-sm font-medium text-fei-sky">← All diagnostic reviews</span>
          </Link>
          <span className="rounded-full border border-fei-text/15 px-4 py-2 text-xs font-semibold text-fei-text/60">
            {attempt.status.replaceAll('_', ' ')}
          </span>
        </header>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fei-sky">{attempt.role}</p>
          <h1 className="mt-3 text-3xl font-bold text-fei-text sm:text-4xl">Review diagnostic submission</h1>
          <p className="mt-3 text-sm text-fei-text/45">
            Submitted {formatDate(attempt.submitted_at)} · Objective answers: {objectiveCorrect}/{attempt.objective_evidence.length}
          </p>
        </div>

        {result && (
          <section className="mb-6 rounded-2xl border border-green-500/20 bg-green-500/[0.05] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-green-200">Current result</p>
                <p className="mt-1 text-4xl font-black text-fei-text">{result.level ?? 'Review required'}</p>
              </div>
              <p className="max-w-xl text-sm leading-6 text-fei-text/60">{result.reason}</p>
            </div>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fei-sky">Writing</p>
              <h2 className="mt-2 text-xl font-bold text-fei-text">{tasks.writing.task}</h2>
              <p className="mt-4 text-sm leading-6 text-fei-text/60">{tasks.writing.situation}</p>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm leading-6 text-fei-text/50">
                {tasks.writing.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}
              </ul>
              <div className="mt-5 rounded-xl border border-fei-text/10 bg-fei-bg p-4">
                <p className="whitespace-pre-wrap text-sm leading-7 text-fei-text/85">
                  {attempt.writing_response || '[No written response]'}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fei-sky">Speaking</p>
              <h2 className="mt-2 text-xl font-bold text-fei-text">{tasks.speaking.task}</h2>
              <p className="mt-4 text-sm leading-6 text-fei-text/60">{tasks.speaking.situation}</p>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm leading-6 text-fei-text/50">
                {tasks.speaking.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}
              </ul>
              <div className="mt-5 rounded-xl border border-fei-text/10 bg-fei-bg p-4">
                {audioUrl ? (
                  <>
                    <audio controls preload="metadata" className="w-full" src={audioUrl}>
                      Your browser does not support audio playback.
                    </audio>
                    <a
                      href={audioUrl}
                      download={`fei-speaking-${attempt.id}`}
                      className="mt-4 inline-flex rounded-full border border-fei-sky/40 px-4 py-2 text-sm font-semibold text-fei-sky transition hover:bg-fei-sky/10"
                    >
                      Download Speaking recording
                    </a>
                  </>
                ) : (
                  <p className="text-sm text-red-200">No Speaking recording was saved. Mark Speaking as technical_unassessable.</p>
                )}
                <p className="mt-3 text-xs text-fei-text/40">
                  Recorded duration: {attempt.speaking_duration_seconds ?? 0} seconds. Duration is context only and does not determine level.
                </p>
              </div>
            </section>

            {evaluations.length > 0 && (
              <section className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
                <h2 className="text-xl font-bold text-fei-text">Evaluation history</h2>
                <div className="mt-4 grid gap-3">
                  {evaluations.map((evaluation) => (
                    <div key={evaluation.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-fei-text/10 bg-fei-bg px-4 py-3">
                      <p className="text-sm font-semibold capitalize text-fei-text">{evaluation.skill} · version {evaluation.version}</p>
                      <p className="text-xs text-fei-text/45">{evaluation.evaluation_status.replaceAll('_', ' ')} · {formatDate(evaluation.created_at)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <DiagnosticEvaluationForm
            attemptId={attempt.id}
            evaluationPrompt={buildEvaluationPrompt(attempt)}
            hasAudio={Boolean(audioUrl)}
          />
        </div>
      </div>
    </div>
  )
}
