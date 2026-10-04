import { createClient } from '@/lib/supabase/server'
import type { ObjectiveItemEvidence } from '@/lib/diagnostic/types'

const MAX_AUDIO_BYTES = 15 * 1024 * 1024
const MAX_TEXT_LENGTH = 10_000
const EXPECTED_OBJECTIVE_ITEMS = 12
const PLACEMENT_LEVELS = new Set(['A2', 'B1', 'B2', 'C1'])
const OBJECTIVE_SECTIONS = new Set(['reading', 'listening', 'vocabulary'])

function textField(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

function parseObjectiveEvidence(value: string): ObjectiveItemEvidence[] | null {
  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed) || parsed.length !== EXPECTED_OBJECTIVE_ITEMS) {
      return null
    }

    const itemIds = new Set<string>()
    const isValid = parsed.every((item: unknown) => {
      if (!item || typeof item !== 'object') return false

      const candidate = item as Record<string, unknown>
      const itemId = candidate.itemId
      if (typeof itemId !== 'string' || itemId.length === 0 || itemIds.has(itemId)) {
        return false
      }

      itemIds.add(itemId)
      return (
        PLACEMENT_LEVELS.has(String(candidate.level)) &&
        OBJECTIVE_SECTIONS.has(String(candidate.section)) &&
        typeof candidate.correct === 'boolean'
      )
    })

    return isValid ? (parsed as ObjectiveItemEvidence[]) : null
  } catch {
    return null
  }
}

function audioExtension(contentType: string) {
  const extensions: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/mp4': 'm4a',
    'audio/mpeg': 'mp3',
    'audio/ogg': 'ogg',
    'audio/wav': 'wav',
    'audio/x-m4a': 'm4a',
  }
  return extensions[contentType] ?? 'audio'
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  const user = userData.user

  if (userError || !user) {
    return Response.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const formData = await request.formData()
  const role = textField(formData, 'role')
  const writingPrompt = textField(formData, 'writingPrompt')
  const writingResponse = textField(formData, 'writingResponse')
  const speakingPrompt = textField(formData, 'speakingPrompt')
  const durationValue = Number(textField(formData, 'speakingDurationSeconds'))
  const objectiveEvidence = parseObjectiveEvidence(
    textField(formData, 'objectiveEvidence'),
  )
  const speakingAudio = formData.get('speakingAudio')

  if (!role || !writingPrompt || !speakingPrompt || !objectiveEvidence) {
    return Response.json({ error: 'The diagnostic submission is incomplete.' }, { status: 400 })
  }

  if (
    writingPrompt.length > MAX_TEXT_LENGTH ||
    writingResponse.length > MAX_TEXT_LENGTH ||
    speakingPrompt.length > MAX_TEXT_LENGTH
  ) {
    return Response.json({ error: 'A text field is too long.' }, { status: 400 })
  }

  if (!(speakingAudio instanceof File) || speakingAudio.size === 0) {
    return Response.json({ error: 'A Speaking recording is required.' }, { status: 400 })
  }

  if (
    speakingAudio.size > MAX_AUDIO_BYTES ||
    !speakingAudio.type.startsWith('audio/')
  ) {
    return Response.json({ error: 'The Speaking recording is not supported.' }, { status: 400 })
  }

  const attemptId = crypto.randomUUID()
  const extension = audioExtension(speakingAudio.type)
  const audioPath = `${user.id}/${attemptId}.${extension}`
  const durationSeconds = Number.isFinite(durationValue)
    ? Math.max(0, Math.round(durationValue))
    : null

  const { error: audioError } = await supabase.storage
    .from('diagnostic-speaking')
    .upload(audioPath, speakingAudio, {
      contentType: speakingAudio.type,
      upsert: false,
    })

  if (audioError) {
    return Response.json(
      { error: 'The Speaking recording could not be saved.' },
      { status: 500 },
    )
  }

  const { error: attemptError } = await supabase
    .from('diagnostic_attempts')
    .insert({
      id: attemptId,
      user_id: user.id,
      role,
      objective_evidence: objectiveEvidence,
      writing_prompt: writingPrompt,
      writing_response: writingResponse,
      speaking_prompt: speakingPrompt,
      speaking_audio_path: audioPath,
      speaking_media_type: speakingAudio.type,
      speaking_duration_seconds: durationSeconds,
      status: 'pending_evaluation',
    })

  if (attemptError) {
    await supabase.storage.from('diagnostic-speaking').remove([audioPath])
    return Response.json(
      { error: 'The diagnostic attempt could not be saved.' },
      { status: 500 },
    )
  }

  return Response.json(
    {
      attemptId,
      status: 'pending_evaluation',
      message: 'Your diagnostic was submitted for evaluation.',
    },
    { status: 201 },
  )
}
