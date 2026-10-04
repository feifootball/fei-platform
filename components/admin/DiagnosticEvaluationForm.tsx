'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function evaluationTemplate(hasAudio: boolean) {
  const speaking = hasAudio
    ? `{
    "skill": "speaking",
    "status": "assessed",
    "overallLevel": "B2",
    "evidenceFloor": "B2",
    "evidenceCeiling": "B2",
    "borderlineAlternative": null,
    "confidence": "high",
    "dimensions": {
      "task_fulfilment_and_professional_relevance": "B2",
      "clarity_organisation_and_interactional_effectiveness": "B2",
      "language_control_and_range": "B2",
      "fluency_and_intelligibility": "B2",
      "professional_football_communication": "B2"
    },
    "audioStatus": "assessable",
    "evaluator": "imported_model",
    "evaluatorId": "manual-import",
    "rationale": "Replace with the concise evidence-based rationale.",
    "flags": []
  }`
    : `{
    "skill": "speaking",
    "status": "technical_unassessable",
    "overallLevel": null,
    "evidenceFloor": null,
    "evidenceCeiling": null,
    "borderlineAlternative": null,
    "confidence": null,
    "dimensions": null,
    "audioStatus": "unassessable",
    "evaluator": "human",
    "evaluatorId": "admin-review",
    "rationale": "No Speaking recording was available.",
    "flags": ["missing_audio"]
  }`

  return `{
  "writing": {
    "skill": "writing",
    "status": "assessed",
    "overallLevel": "B2",
    "evidenceFloor": "B2",
    "evidenceCeiling": "B2",
    "borderlineAlternative": null,
    "confidence": "high",
    "dimensions": {
      "task_fulfilment": "B2",
      "clarity_and_organisation": "B2",
      "language_control_and_range": "B2",
      "professional_football_communication": "B2"
    },
    "evaluator": "imported_model",
    "evaluatorId": "manual-import",
    "rationale": "Replace with the concise evidence-based rationale.",
    "flags": []
  },
  "speaking": ${speaking}
}`
}

export default function DiagnosticEvaluationForm({
  attemptId,
  evaluationPrompt,
  hasAudio,
}: {
  attemptId: string
  evaluationPrompt: string
  hasAudio: boolean
}) {
  const router = useRouter()
  const [value, setValue] = useState(() => evaluationTemplate(hasAudio))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function copyPrompt() {
    await navigator.clipboard.writeText(evaluationPrompt)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  async function submit() {
    setSaving(true)
    setMessage(null)

    try {
      const parsed = JSON.parse(value) as Record<string, unknown>
      const response = await fetch('/api/admin/diagnostic/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, ...parsed }),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(result.error || 'The evaluation could not be saved.')

      setMessage('Evaluation saved and placement recalculated.')
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The evaluation JSON is invalid.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
      <div className="rounded-2xl border border-fei-sky/20 bg-fei-sky/[0.05] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fei-sky">Step 1</p>
        <h2 className="mt-2 text-xl font-bold text-fei-text">Evaluate with the external AI</h2>
        <p className="mt-2 text-sm leading-6 text-fei-text/50">
          Copy this prepared prompt. If Speaking audio exists, download it from this page and attach it with the prompt.
        </p>
        <button
          type="button"
          onClick={copyPrompt}
          className="mt-5 w-full rounded-full border border-fei-sky/40 px-6 py-3 font-semibold text-fei-sky transition hover:bg-fei-sky/10"
        >
          {copied ? 'Prompt copied' : 'Copy evaluation prompt'}
        </button>
      </div>

      <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fei-sky">Step 2</p>
        <h2 className="mt-2 text-xl font-bold text-fei-text">Validate and save the result</h2>
        <p className="mt-2 text-sm leading-6 text-fei-text/50">
          Paste the returned JSON below. FEI checks the levels, evidence range, dimensions, and C1 guardrails before calculating placement.
        </p>
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          spellCheck={false}
          className="mt-5 min-h-[560px] w-full rounded-xl border border-fei-text/15 bg-fei-bg p-4 font-mono text-xs leading-5 text-fei-text outline-none focus:border-fei-sky"
        />
        {message && (
          <p className="mt-4 rounded-xl border border-fei-text/10 bg-fei-text/[0.04] px-4 py-3 text-sm text-fei-text/70">
            {message}
          </p>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="mt-5 w-full rounded-full bg-fei-yellow px-6 py-3 font-bold text-fei-bg disabled:opacity-50"
        >
          {saving ? 'Validating...' : 'Validate and save evaluation'}
        </button>
      </div>
    </div>
  )
}
