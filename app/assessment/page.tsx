'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Suspense } from 'react'

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Section = 'intro' | 'audio-check' | 'warm-up' | 'reading' | 'listening' | 'vocabulary' | 'functional' | 'writing' | 'speaking' | 'result'

type Answer = string | null

interface Result {
  level: 'A2' | 'B1' | 'B2' | 'C1'
  insight: string
  score: number
  maxScore: number
}

// ─── ASSESSMENT DATA ───────────────────────────────────────────────────────────

const items = {
  warmup: [
    {
      id: 'w1',
      label: 'Item 1 — Role Identification',
      context: 'Which situation is most common in your role as a senior squad player?',
      question: 'Choose the option that best matches the daily communication reality of the role.',
      options: [
        'A. Preparing detailed physical reports for the medical staff',
        'B. Explaining opposition trends to recruitment staff',
        'C. Understanding coaching instructions during training and matches',
        'D. Designing recovery plans for injured teammates',
      ],
      correct: 'C',
    },
    {
      id: 'w2',
      label: 'Item 2 — Communication Priority',
      context: 'What type of communication matters most to your daily professional performance?',
      question: 'Choose the communication area that most directly affects your performance pathway.',
      options: [
        'A. Understanding coaches clearly in real time',
        'B. Writing long tactical reports after matches',
        'C. Negotiating sponsorship messages with agents',
        'D. Presenting recruitment recommendations to directors',
      ],
      correct: 'A',
    },
  ],
  reading: [
    {
      id: 'r1',
      level: 'A2',
      label: 'Item 3 — Tactical Instruction',
      context: 'Your assistant coach sends this message before training:\n\n"Today we work in a mid-block. Stay close to the 6 and protect the inside channel. When the ball goes wide to their fullback, jump with the nearest winger. If the pass stays central, hold your position."',
      question: 'What should you do when the ball goes wide to their fullback?',
      options: [
        'A. Hold the inside channel and avoid pressing wide',
        'B. Wait for the striker before moving forward',
        'C. Drop deeper to protect the penalty area',
        'D. Press with the nearest winger immediately',
      ],
      correct: 'D',
    },
    {
      id: 'r2',
      level: 'B1',
      label: 'Item 4 — Feedback with Reasoning',
      context: 'After training, the analyst sends this note:\n\n"Your positioning was good when we defended crosses. The problem came when the second ball dropped. You reacted a little late, so the opponent could restart the attack. The first step is to scan earlier after the duel."',
      question: 'What is the main improvement target?',
      options: [
        'A. Improve crossing accuracy after defensive duels',
        'B. Scan earlier and react faster to second balls',
        'C. Stay deeper whenever the opponent attacks wide',
        'D. Challenge the first aerial duel with more force',
      ],
      correct: 'B',
    },
    {
      id: 'r3',
      level: 'B2',
      label: 'Item 5 — Physical Status and Availability',
      context: 'Your physiotherapist sends this message:\n\n"Your recovery markers are not alarming, but your hamstring load is higher than normal. I do not think you need to sit out, but we should avoid a full match if we want you ready midweek. Let\'s plan your minutes and monitor intensity."',
      question: 'What is the physiotherapist suggesting?',
      options: [
        'A. You should not train until the midweek fixture',
        'B. You are fully available with no restrictions',
        'C. You can play if minutes and intensity are managed',
        'D. You are injured and unavailable this weekend',
      ],
      correct: 'C',
    },
  ],
  listening: [
    {
      id: 'l1',
      level: 'A2',
      label: 'Item 6 — Defensive Instruction',
      script: 'When we lose the ball, stay compact. Do not press alone. Keep close to the midfield line and protect the space inside. Compact first, then pressure.',
      question: 'What is the main instruction?',
      options: [
        'A. Stay compact before pressing the ball',
        'B. Press alone as soon as possession changes',
        'C. Move wide to open the midfield line',
        'D. Attack quickly after every lost ball',
      ],
      correct: 'A',
    },
    {
      id: 'l2',
      level: 'B1',
      label: 'Item 7 — Pressing Adjustment',
      script: 'Normally we press high straight away. Today, wait for the first pass into midfield. When that pass arrives, close the player down quickly. We press later because they are strong in possession.',
      question: 'How is today\'s pressing approach different?',
      options: [
        'A. Press high as soon as their center-back receives',
        'B. Wait until they enter the attacking third',
        'C. Press after the first pass into midfield',
        'D. Stop pressing and protect the penalty area',
      ],
      correct: 'C',
    },
    {
      id: 'l3',
      level: 'B2',
      label: 'Item 8 — Nuanced Feedback',
      script: 'Your effort was good, and your position improved after halftime. But in the first half, you rushed into tackles too early. The issue is not commitment; it is decision-making. Sometimes controlling the space is better than trying to win the ball immediately.',
      question: 'What does the coach want you to improve?',
      options: [
        'A. Show more commitment in defensive duels',
        'B. Stop tackling and stay away from pressure',
        'C. Hold a deeper position for the full match',
        'D. Control space instead of rushing tackles',
      ],
      correct: 'D',
    },
  ],
  vocabulary: [
    {
      id: 'v1',
      level: 'A2',
      label: 'Item 9 — On-Pitch Warning',
      context: 'You receive the ball facing your own goal. A teammate shouts: "Man on, left shoulder!"',
      question: 'What should you understand?',
      options: [
        'A. A teammate is free on your left side',
        'B. An opponent is close on your left side',
        'C. The ball has gone out on the left side',
        'D. You should pass immediately to the left',
      ],
      correct: 'B',
    },
    {
      id: 'v2',
      level: 'B1',
      label: 'Item 10 — Tactical Term',
      context: 'The coach says: "Our pressing trigger is when their fullback takes the first touch forward."',
      question: 'What is a "pressing trigger"?',
      options: [
        'A. The moment that tells the team to press',
        'B. The player who presses more than others',
        'C. The mistake that happens during pressure',
        'D. The shape used after losing possession',
      ],
      correct: 'A',
    },
    {
      id: 'v3',
      level: 'B2',
      label: 'Item 11 — Medical Precision',
      context: 'The physiotherapist asks: "Can you describe the onset of the discomfort? When did you first notice it, and what movement caused it?"',
      question: 'What is the physiotherapist asking about?',
      options: [
        'A. Whether the discomfort is improving today',
        'B. What treatment you would prefer next',
        'C. When and how the discomfort started',
        'D. Whether you had the same issue before',
      ],
      correct: 'C',
    },
  ],
  functional: [
    {
      id: 'f1',
      level: 'B1',
      label: 'Item 12 — Asking for Clarification',
      context: 'During training, the assistant coach says: "Delay the press in this zone. Force them sideways, and only press when they commit to a direction." You understand most of it, but you are not sure what "commit to a direction" means.',
      question: 'What is the most professional way to ask for clarification?',
      options: [
        'A. "Can you repeat the whole instruction one more time?"',
        'B. "I understand the idea, but the timing feels difficult."',
        'C. "Should I press wider, or stay inside with the 6?"',
        'D. "Can you clarify exactly when they commit to a direction?"',
      ],
      correct: 'D',
    },
    {
      id: 'f2',
      level: 'B2',
      label: 'Item 13 — Receiving Critical Feedback',
      context: 'At halftime, the head coach says: "Your position was too deep, and you were late to press. We need more from you defensively." You think the team shape also made pressing difficult.',
      question: 'What is the best response?',
      options: [
        'A. "I was working hard, but I\'ll try to follow it more closely."',
        'B. "I see your point. The shape made it hard, but I can press earlier."',
        'C. "I understand. I\'ll press higher every time in the second half."',
        'D. "The shape was the main issue, but I\'ll do what you want."',
      ],
      correct: 'B',
    },
    {
      id: 'f3',
      level: 'B2',
      label: 'Item 14 — Public Criticism',
      context: 'After a difficult match, a journalist posts: "Poor decision-making from the forwards today. Too many touches and rushed shots." You want to respond professionally online.',
      question: 'Which response best protects your credibility?',
      options: [
        'A. "Disappointed with the result. I\'ll review my decisions and keep working for the team."',
        'B. "Tough result. Some comments are unfair, but we all need to improve quickly."',
        'C. "Not the result we wanted. I gave everything and will ignore outside noise."',
        'D. "Difficult day. The team made mistakes, and we must all take responsibility."',
      ],
      correct: 'A',
    },
    {
      id: 'f4',
      level: 'C1',
      label: 'Item 15 — Role and Playing-Time Conversation',
      context: 'You have had limited minutes recently. You are meeting the head coach privately to understand your role and what you can control.',
      question: 'What is the most strategic way to open the conversation?',
      options: [
        'A. "I want to understand what is missing from my performances and improve it."',
        'B. "I need clarity on whether I am still part of your plans."',
        'C. "I\'d like to understand my role and what I can control to earn more minutes."',
        'D. "I want to know if the minutes are tactical, fitness-related or contractual."',
      ],
      correct: 'C',
    },
  ],
}

const insights = {
  A2: {
    level: 'A2',
    title: 'Foundation',
    insight: 'You understand basic football communication situations and can follow direct instructions. Your pathway will help you build confidence and clarity in more complex professional contexts. Training focus: Understanding tactical instructions; asking for clarification; reporting physical status; responding to basic feedback. Every lesson connects directly to your professional role.',
  },
  B1: {
    level: 'B1',
    title: 'Intermediate',
    insight: 'You already understand many common football communication situations and can respond professionally in routine interactions. Your pathway will help you communicate with more confidence, structure and precision in complex situations. Training focus: Tactical clarification; feedback response; medical communication; speaking with confidence under pressure. Every lesson connects directly to your professional role.',
  },
  B2: {
    level: 'B2',
    title: 'Professional',
    insight: 'You communicate with clarity and professionalism across most football situations. Your pathway will help you manage more complex conversations, pressure moments and leadership communication with stronger strategic control. Training focus: Complex feedback conversations; playing-time and role discussions; public communication; leadership communication under pressure. Every lesson connects directly to your professional role.',
  },
  C1: {
    level: 'C1',
    title: 'Advanced Professional',
    insight: 'You demonstrate advanced professional communication with precision, maturity and strategic awareness. Your pathway will help you refine leadership communication, negotiation, public presence and high-pressure decision-making. Training focus: Advanced leadership communication; strategic negotiation; crisis and media communication; personal brand and reputation management. Every lesson connects directly to your professional role.',
  },
}

// ─── SCORE CALCULATOR ────────────────────────────────────────────────────────

function calculateResult(answers: Record<string, Answer>, writingScore: number, speakingScore: number): Result {
  let score = 0
  const maxObjective = 13
  const allItems = [...items.reading, ...items.listening, ...items.vocabulary, ...items.functional]

  allItems.forEach((item) => {
    const ans = answers[item.id]
    if (ans && ans.startsWith(item.correct)) score++
  })

  const totalScore = score + writingScore + speakingScore
  const maxScore = maxObjective + 4 + 4

  const a2Items = [items.reading[0], items.listening[0], items.vocabulary[0]]
  const b1Items = [items.reading[1], items.listening[1], items.vocabulary[1], items.functional[0]]
  const b2Items = [items.reading[2], items.listening[2], items.vocabulary[2], items.functional[1], items.functional[2]]
  const c1Item = items.functional[3]

  const a2Score = a2Items.filter((i) => answers[i.id]?.startsWith(i.correct)).length
  const b1Score = b1Items.filter((i) => answers[i.id]?.startsWith(i.correct)).length
  const b2Score = b2Items.filter((i) => answers[i.id]?.startsWith(i.correct)).length
  const c1Correct = answers[c1Item.id]?.startsWith(c1Item.correct)

  let level: 'A2' | 'B1' | 'B2' | 'C1' = 'A2'

  if (c1Correct && b2Score >= 4 && (writingScore === 4 || speakingScore === 4)) {
    level = 'C1'
  } else if (b2Score >= 3 && b1Score >= 3) {
    level = 'B2'
  } else if (b1Score >= 3 && a2Score >= 2) {
    level = 'B1'
  } else {
    level = 'A2'
  }

  return {
    level,
    insight: insights[level].insight,
    score: totalScore,
    maxScore,
  }
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-xs text-fei-text/40">
        <span>Item {current} of {total}</span>
        <span>{Math.round((current / total) * 100)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-fei-text/10">
        <div
          className="h-1.5 rounded-full bg-fei-yellow transition-all duration-500"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  )
}

function SectionBadge({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-full bg-fei-sky/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-fei-sky">
      {label}
    </span>
  )
}

function OptionButton({
  option,
  selected,
  onSelect,
}: {
  option: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-2xl border px-5 py-4 text-left text-sm leading-6 transition ${
        selected
          ? 'border-fei-yellow bg-fei-yellow/[0.07] text-fei-text shadow-[0_0_0_1px_rgba(255,214,10,0.12)]'
          : 'border-fei-text/10 bg-fei-text/[0.03] text-fei-text/70 hover:border-fei-sky/35 hover:bg-fei-sky/[0.035] hover:text-fei-text'
      }`}
    >
      <span className="font-medium">{option}</span>
    </button>
  )
}

function AudioPlayer({ script, itemId }: { script: string; itemId: string }) {
  const [played, setPlayed] = useState(false)
  const [playing, setPlaying] = useState(false)

  function handlePlay() {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(script)
    utterance.lang = 'en-GB'
    utterance.rate = 0.9
    utterance.onstart = () => { setPlaying(true); setPlayed(true) }
    utterance.onend = () => setPlaying(false)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="rounded-xl border border-fei-sky/20 bg-fei-sky/[0.04] p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-fei-sky" />
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-fei-sky">Audio</span>
        {played && <span className="text-xs text-fei-sky/60">— You can listen again</span>}
      </div>
      <p className="mb-4 text-xs text-fei-text/40 italic">Click play to hear the audio clip. You may listen up to 2 times.</p>
      <button
        onClick={handlePlay}
        disabled={playing}
        className="inline-flex items-center gap-2 rounded-full bg-fei-sky px-5 py-2.5 text-sm font-semibold text-fei-bg transition hover:bg-fei-sky/90 disabled:opacity-50"
      >
        {playing ? (
          <>
            <span className="flex h-3 w-3 items-center gap-0.5">
              <span className="block h-3 w-0.5 animate-pulse bg-fei-bg" />
              <span className="block h-2 w-0.5 animate-pulse bg-fei-bg" style={{ animationDelay: '0.1s' }} />
              <span className="block h-3 w-0.5 animate-pulse bg-fei-bg" style={{ animationDelay: '0.2s' }} />
            </span>
            Playing...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M8 5v14l11-7z" />
            </svg>
            {played ? 'Play again' : 'Play audio'}
          </>
        )}
      </button>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

function AssessmentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const selectedRole = searchParams.get('role') || 'Professional Player'
  const assessmentAvailable = selectedRole === 'Professional Player'

  const [section, setSection] = useState<Section>('intro')
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [warmupStep, setWarmupStep] = useState(0)
  const [readingStep, setReadingStep] = useState(0)
  const [listeningStep, setListeningStep] = useState(0)
  const [vocabStep, setVocabStep] = useState(0)
  const [functionalStep, setFunctionalStep] = useState(0)
  const [writingText, setWritingText] = useState('')
  const [writingScore, setWritingScore] = useState(0)
  const [speakingScore, setSpeakingScore] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordingDone, setRecordingDone] = useState(false)
  const [micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown')
  const [audioTestPlaying, setAudioTestPlaying] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [saving, setSaving] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const totalItems = 17

  // ── Security: block navigation ───────────────────────────────────────────────
  useEffect(() => {
    if (section === 'intro' || section === 'result') return

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [section])

  // ── Security: disable copy/paste/right-click ──────────────────────────────────
  useEffect(() => {
    if (section === 'intro' || section === 'result') return

    function prevent(e: Event) { e.preventDefault() }

    document.addEventListener('copy', prevent)
    document.addEventListener('cut', prevent)
    document.addEventListener('contextmenu', prevent)

    return () => {
      document.removeEventListener('copy', prevent)
      document.removeEventListener('cut', prevent)
      document.removeEventListener('contextmenu', prevent)
    }
  }, [section])

  function setAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  function scoreWriting(text: string): number {
    const words = text.trim().split(/\s+/).length
    const sentences = text.trim().split(/[.!?]+/).filter(Boolean).length
    const hasKey = ['hamstring', 'sharp', 'turn', 'cool-down', 'sprint', 'tight'].some((w) => text.toLowerCase().includes(w))

    if (words < 20 || sentences < 2) return 1
    if (words >= 20 && sentences >= 3 && !hasKey) return 2
    if (words >= 35 && sentences >= 3 && hasKey) return 3
    return 4
  }

  async function finishAssessment(spScore: number) {
    const wScore = scoreWriting(writingText)
    const res = calculateResult(answers, wScore, spScore)
    setResult(res)
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('assessment_history').insert({
        user_id: user.id,
        role: selectedRole,
        score: Math.round((res.score / res.maxScore) * 100),
        level: res.level,
        completed_at: new Date().toISOString(),
      })
    }

    setSaving(false)
    setSection('result')
  }

  async function requestMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      setMicPermission('granted')
    } catch {
      setMicPermission('denied')
    }
  }

  function playAudioTest() {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance('Audio test. If you can hear this clearly, your audio is working correctly.')
    utterance.lang = 'en-GB'
    utterance.rate = 0.9
    utterance.onstart = () => setAudioTestPlaying(true)
    utterance.onend = () => setAudioTestPlaying(false)
    window.speechSynthesis.speak(utterance)
  }

  async function startRecording() {
    try {
      let stream = mediaStreamRef.current

      if (!stream || stream.getTracks().every((track) => track.readyState === 'ended')) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaStreamRef.current = stream
      }

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setMicPermission('granted')
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => {
          if (t >= 75) {
            stopRecording()
            return t
          }
          return t + 1
        })
      }, 1000)
    } catch {
      setMicPermission('denied')
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
    setRecordingDone(true)
  }

  function getItemNumber(section: Section, step: number): number {
    const map: Record<string, number> = {
      'warm-up': step + 1,
      'reading': step + 3,
      'listening': step + 6,
      'vocabulary': step + 9,
      'functional': step + 12,
      'writing': 16,
      'speaking': 17,
    }
    return map[section] || 1
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
  }, [])

  // ─── SCREENS ────────────────────────────────────────────────────────────────

  if (!assessmentAvailable) {
    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col justify-center">
          <div className="mb-10 flex items-center gap-3">
            <img src="/logo.svg" alt="FEI" className="h-8 w-auto" />
            <span className="text-xs font-medium text-fei-sky">Football English Intelligence</span>
          </div>

          <div className="rounded-3xl border border-fei-text/10 bg-fei-text/[0.03] p-8 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-fei-yellow/20 bg-fei-yellow/[0.08] text-fei-yellow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
                aria-hidden
              >
                <path d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="8.5" />
              </svg>
            </div>

            <div className="mb-4 inline-block rounded-full bg-fei-sky/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-fei-sky">
              Assessment Coming Soon
            </div>

            <h1 className="text-3xl font-black text-fei-text">{selectedRole}</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-fei-text/60">
              This role-specific diagnostic is being prepared. FEI diagnostics are built separately for each football role so the questions, scenarios, and pathway recommendation match your real communication context.
            </p>

            <button
              onClick={() => router.push('/dashboard')}
              className="mt-8 rounded-full bg-fei-yellow px-8 py-3 text-sm font-bold text-fei-bg transition hover:bg-fei-yellow/90"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // INTRO
  if (section === 'intro') {
    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-12 flex items-center gap-3">
            <img src="/logo.svg" alt="FEI" className="h-8 w-auto" />
            <span className="text-xs font-medium text-fei-sky">Football English Intelligence</span>
          </div>

          <div className="mb-8">
            <div className="inline-block rounded-full bg-fei-yellow/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-fei-yellow">
              Diagnostic Assessment
            </div>
            <h1 className="mt-4 text-4xl font-black text-fei-text sm:text-5xl">{selectedRole}</h1>
            <p className="mt-3 text-fei-text/60">Senior Squad · FEI Communication Intelligence</p>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-5 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-fei-sky/20 bg-fei-sky/[0.08] text-fei-sky">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M12 7.5v5l3 2" />
                </svg>
              </div>
              <p className="text-xs text-fei-text/50">Duration</p>
              <p className="mt-1 font-semibold text-fei-text">10–12 minutes</p>
            </div>

            <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-5 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-fei-yellow/20 bg-fei-yellow/[0.08] text-fei-yellow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path d="M12 3.5 19 7.5v5c0 4.5-3 7.5-7 8-4-.5-7-3.5-7-8v-5l7-4Z" />
                  <path d="M9 12.5 11 14.5 15.5 9.5" />
                </svg>
              </div>
              <p className="text-xs text-fei-text/50">Result</p>
              <p className="mt-1 font-semibold text-fei-text">FEI Pathway + AI Insight</p>
            </div>
          </div>

          <div className="mb-8 rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
            <h2 className="mb-4 font-bold text-fei-text">Before you begin</h2>
            <ul className="space-y-4 text-sm text-fei-text/70">
              {[
                'Use headphones or speakers for listening items.',
                'Enable your microphone for the final spoken response.',
                'Stay on this page until the assessment is complete.',
                'Find a quiet place with a stable internet connection.',
                'Answer every item. There is no penalty for incorrect answers.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-fei-yellow/25 bg-fei-yellow/[0.08] text-fei-yellow">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3"
                      aria-hidden
                    >
                      <path d="m6 12 4 4 8-8" />
                    </svg>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => setSection('audio-check')}
            className="w-full rounded-full bg-fei-yellow py-4 text-base font-bold text-fei-bg transition hover:bg-fei-yellow/90"
          >
            Begin assessment →
          </button>
        </div>
      </div>
    )
  }

  // AUDIO CHECK
  if (section === 'audio-check') {
    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 flex items-center gap-3">
            <img src="/logo.svg" alt="FEI" className="h-8 w-auto" />
            <span className="text-xs font-medium text-fei-sky">Football English Intelligence</span>
          </div>

          <div className="mb-8">
            <div className="inline-block rounded-full bg-fei-sky/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-fei-sky">
              Audio & Microphone Check
            </div>
            <h1 className="mt-4 text-3xl font-black text-fei-text">Check your setup</h1>
            <p className="mt-2 text-fei-text/60">Check your audio and enable your microphone before starting the diagnostic.</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fei-sky/10 text-fei-sky font-bold text-sm">1</div>
                <h3 className="font-bold text-fei-text">Audio test</h3>
              </div>
              <p className="mb-4 text-sm text-fei-text/60">Play the sample audio to confirm you can hear the listening items.</p>
              <button
                onClick={playAudioTest}
                disabled={audioTestPlaying}
                className="inline-flex items-center gap-2 rounded-full border border-fei-sky px-5 py-2.5 text-sm font-semibold text-fei-sky transition hover:bg-fei-sky/10 disabled:opacity-50"
              >
                {audioTestPlaying ? 'Playing...' : 'Play test audio'}
              </button>
            </div>

            <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fei-sky/10 text-fei-sky font-bold text-sm">2</div>
                <h3 className="font-bold text-fei-text">Speaking setup</h3>
              </div>
              <p className="mb-4 text-sm text-fei-text/60">Enable your microphone now to start the assessment.</p>
              {micPermission === 'granted' ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-5 py-2.5 text-sm font-semibold text-green-400">
                  ✓ Microphone ready
                </div>
              ) : micPermission === 'denied' ? (
                <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400">
                  ⚠ Microphone access denied. Please allow microphone access in your browser settings and refresh the page.
                </div>
              ) : (
                <button
                  onClick={requestMic}
                  className="inline-flex items-center gap-2 rounded-full bg-fei-yellow px-5 py-2.5 text-sm font-semibold text-fei-bg transition hover:bg-fei-yellow/90"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.9}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden
                  >
                    <path d="M12 14.5a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 0 0-7 0v5a3.5 3.5 0 0 0 3.5 3.5Z" />
                    <path d="M5.5 10.5a6.5 6.5 0 0 0 13 0" />
                    <path d="M12 17v3.5" />
                    <path d="M9 20.5h6" />
                  </svg>
                  Enable microphone
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => setSection('intro')}
              className="rounded-full border border-fei-text/20 px-6 py-3 text-sm font-medium text-fei-text/60 transition hover:border-fei-text/40 hover:text-fei-text"
            >
              ← Back
            </button>
            <button
              onClick={() => {
                if (micPermission !== 'granted') return
                setSection('warm-up')
              }}
              disabled={micPermission !== 'granted'}
              className="flex-1 rounded-full bg-fei-yellow py-3 text-sm font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-yellow/20 disabled:text-fei-yellow/50 disabled:opacity-100"
            >
              {micPermission === 'granted' ? 'Start assessment →' : 'Enable microphone to start'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // WARM-UP
  if (section === 'warm-up') {
    const item = items.warmup[warmupStep]
    const selected = answers[item.id]

    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="FEI" className="h-7 w-auto" />
            </div>
          </div>

          <ProgressBar current={getItemNumber('warm-up', warmupStep)} total={totalItems} />

          <div className="mb-6">
            <SectionBadge label="Role Warm-Up" />
            <p className="mt-2 text-xs text-fei-text/40">These questions help personalize your pathway. There are no wrong answers here.</p>
          </div>

            <div className="rounded-3xl border border-fei-text/10 bg-fei-text/[0.03] p-6 lg:col-span-5">
            <p className="mb-3 text-sm text-fei-text/60">{item.context}</p>
            <p className="font-semibold text-fei-sky select-none">{item.question}</p>
          </div>

          <div className="mb-8 space-y-3">
            {item.options.map((option) => (
              <OptionButton
                key={option}
                option={option}
                selected={selected === option}
                onSelect={() => setAnswer(item.id, option)}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (!selected) return
              if (warmupStep < items.warmup.length - 1) {
                setWarmupStep(warmupStep + 1)
              } else {
                setSection('reading')
              }
            }}
            disabled={!selected}
            className="w-full rounded-full bg-fei-yellow py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-yellow/20 disabled:text-fei-yellow/50 disabled:opacity-100"
          >
            {!selected ? 'Select an option to continue' : warmupStep < items.warmup.length - 1 ? 'Next →' : 'Continue to Reading →'}
          </button>
        </div>
      </div>
    )
  }

  // READING
  if (section === 'reading') {
    const item = items.reading[readingStep]
    const selected = answers[item.id]

    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="FEI" className="h-7 w-auto" />
            </div>
          </div>

          <ProgressBar current={getItemNumber('reading', readingStep)} total={totalItems} />

          <div className="mb-6">
            <SectionBadge label="Professional Reading" />
          </div>

          <div className="mb-6 rounded-2xl border border-fei-sky/20 bg-fei-sky/[0.03] p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-fei-sky">Read carefully</p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-fei-text select-none">{item.context}</p>
          </div>

          <div className="mb-6">
            <p className="font-semibold text-fei-sky select-none">{item.question}</p>
          </div>

          <div className="mb-8 space-y-3">
            {item.options.map((option) => (
              <OptionButton
                key={option}
                option={option}
                selected={selected === option}
                onSelect={() => setAnswer(item.id, option)}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (!selected) return
              if (readingStep < items.reading.length - 1) {
                setReadingStep(readingStep + 1)
              } else {
                setSection('listening')
              }
            }}
            disabled={!selected}
            className="w-full rounded-full bg-fei-yellow py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-yellow/20 disabled:text-fei-yellow/50 disabled:opacity-100"
          >
            {!selected ? 'Select an option to continue' : readingStep < items.reading.length - 1 ? 'Next →' : 'Continue to Listening →'}
          </button>
        </div>
      </div>
    )
  }

  // LISTENING
  if (section === 'listening') {
    const item = items.listening[listeningStep]
    const selected = answers[item.id]

    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="FEI" className="h-7 w-auto" />
            </div>
          </div>

          <ProgressBar current={getItemNumber('listening', listeningStep)} total={totalItems} />

          <div className="mb-6">
            <SectionBadge label="Listening in Context" />
            <p className="mt-2 text-xs text-fei-text/40">Use headphones for best results.</p>
          </div>

          <div className="mb-6">
            <AudioPlayer script={item.script} itemId={item.id} />
          </div>

          <div className="mb-6">
            <p className="font-semibold text-fei-sky select-none">{item.question}</p>
          </div>

          <div className="mb-8 space-y-3">
            {item.options.map((option) => (
              <OptionButton
                key={option}
                option={option}
                selected={selected === option}
                onSelect={() => setAnswer(item.id, option)}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (!selected) return
              if (listeningStep < items.listening.length - 1) {
                setListeningStep(listeningStep + 1)
              } else {
                setSection('vocabulary')
              }
            }}
            disabled={!selected}
            className="w-full rounded-full bg-fei-yellow py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-yellow/20 disabled:text-fei-yellow/50 disabled:opacity-100"
          >
            {!selected ? 'Select an option to continue' : listeningStep < items.listening.length - 1 ? 'Next →' : 'Continue to Vocabulary →'}
          </button>
        </div>
      </div>
    )
  }

  // VOCABULARY
  if (section === 'vocabulary') {
    const item = items.vocabulary[vocabStep]
    const selected = answers[item.id]

    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="FEI" className="h-7 w-auto" />
            </div>
          </div>

          <ProgressBar current={getItemNumber('vocabulary', vocabStep)} total={totalItems} />

          <div className="mb-6">
            <SectionBadge label="Football Vocabulary" />
          </div>

          <div className="mb-6 rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
            <p className="text-sm leading-relaxed text-fei-text select-none">{item.context}</p>
          </div>

          <div className="mb-6">
            <p className="font-semibold text-fei-sky select-none">{item.question}</p>
          </div>

          <div className="mb-8 space-y-3">
            {item.options.map((option) => (
              <OptionButton
                key={option}
                option={option}
                selected={selected === option}
                onSelect={() => setAnswer(item.id, option)}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (!selected) return
              if (vocabStep < items.vocabulary.length - 1) {
                setVocabStep(vocabStep + 1)
              } else {
                setSection('functional')
              }
            }}
            disabled={!selected}
            className="w-full rounded-full bg-fei-yellow py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-yellow/20 disabled:text-fei-yellow/50 disabled:opacity-100"
          >
            {!selected ? 'Select an option to continue' : vocabStep < items.vocabulary.length - 1 ? 'Next →' : 'Continue to Functional Communication →'}
          </button>
        </div>
      </div>
    )
  }

  // FUNCTIONAL COMMUNICATION
  if (section === 'functional') {
    const item = items.functional[functionalStep]
    const selected = answers[item.id]

    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="FEI" className="h-7 w-auto" />
            </div>
          </div>

          <ProgressBar current={getItemNumber('functional', functionalStep)} total={totalItems} />

          <div className="mb-6">
            <SectionBadge label="Functional Communication" />
          </div>

          <div className="mb-6 rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
            <p className="text-sm leading-relaxed text-fei-text select-none">{item.context}</p>
          </div>

          <div className="mb-6">
            <p className="font-semibold text-fei-sky select-none">{item.question}</p>
          </div>

          <div className="mb-8 space-y-3">
            {item.options.map((option) => (
              <OptionButton
                key={option}
                option={option}
                selected={selected === option}
                onSelect={() => setAnswer(item.id, option)}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (!selected) return
              if (functionalStep < items.functional.length - 1) {
                setFunctionalStep(functionalStep + 1)
              } else {
                setSection('writing')
              }
            }}
            disabled={!selected}
            className="w-full rounded-full bg-fei-yellow py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-yellow/20 disabled:text-fei-yellow/50 disabled:opacity-100"
          >
            {!selected ? 'Select an option to continue' : functionalStep < items.functional.length - 1 ? 'Next →' : 'Continue to Writing →'}
          </button>
        </div>
      </div>
    )
  }

  // WRITING
  if (section === 'writing') {
    const wordCount = writingText.trim() ? writingText.trim().split(/\s+/).length : 0

    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="FEI" className="h-7 w-auto" />
            </div>
          </div>

          <ProgressBar current={16} total={totalItems} />

          <div className="mb-6">
            <SectionBadge label="Written Production" />
          </div>

          <div className="mb-6 rounded-2xl border border-fei-sky/20 bg-fei-sky/[0.03] p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-fei-sky">Situation</p>
            <p className="text-sm leading-relaxed text-fei-text/80">
              After training today, you developed tightness in your left hamstring during the second half. It started when you made a sharp turning movement while sprinting. The sensation increased slightly during the cool-down. You want to report this to the physiotherapist before tomorrow's session.
            </p>
          </div>

          <div className="mb-3">
            <p className="font-semibold text-fei-text">Write a message to the physiotherapist reporting this discomfort.</p>
            <p className="mt-1 text-sm text-fei-text/50">Write 3–5 sentences in professional English.</p>
          </div>

          <textarea
            value={writingText}
            onChange={(e) => setWritingText(e.target.value)}
            placeholder="Hi, I wanted to report..."
            rows={6}
            className="mb-2 w-full rounded-xl border border-fei-text/10 bg-fei-text/[0.05] px-5 py-4 text-sm text-fei-text placeholder-fei-text/20 focus:border-fei-yellow focus:outline-none resize-none"
          />
          <div className="mb-8 flex items-center justify-between text-xs text-fei-text/40">
            <span>{wordCount} words</span>
            <span>Target: 30–80 words</span>
          </div>

          <button
            onClick={() => setSection('speaking')}
            disabled={wordCount < 10}
            className="w-full rounded-full bg-fei-yellow py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:bg-fei-yellow/20 disabled:text-fei-yellow/50 disabled:opacity-100"
          >
            Continue to Speaking →
          </button>
        </div>
      </div>
    )
  }

  // SPEAKING
  if (section === 'speaking') {
    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="FEI" className="h-7 w-auto" />
            </div>
          </div>

          <ProgressBar current={17} total={totalItems} />

          <div className="mb-6">
            <SectionBadge label="Speaking Production" />
          </div>

          <div className="mb-6 rounded-2xl border border-fei-sky/20 bg-fei-sky/[0.03] p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-fei-sky">Situation</p>
            <p className="text-sm leading-relaxed text-fei-text/80">
              You have just received feedback from the head coach about your last match. The coach said you were too slow in transition and needed to be more aggressive in pressing. You disagree slightly because the transition was fast and you were managing some discomfort.
            </p>
          </div>

          <div className="mb-6">
            <p className="font-semibold text-fei-text">Explain how you would respond to the coach professionally.</p>
            <p className="mt-1 text-sm text-fei-text/50">Recommended time: 45–60 seconds. Recording stops automatically at 75 seconds.</p>
          </div>

          {isRecording && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                <span className="text-sm font-semibold text-red-400">Recording...</span>
                <span className="ml-auto text-sm font-bold text-red-400">{recordingTime}s</span>
              </div>
              <div className="h-2 w-full rounded-full bg-fei-text/10">
                <div
                  className="h-2 rounded-full bg-red-500 transition-all"
                  style={{ width: `${(recordingTime / 75) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-fei-text/40">
                {recordingTime < 45 ? 'Recommended minimum: 45 seconds. You can stop anytime.' : recordingTime < 60 ? 'Good length — you can continue' : 'Consider wrapping up.'}
              </p>
            </div>
          )}

          {recordingDone && (
            <div
              className={`mb-6 rounded-2xl border p-5 text-center ${
                recordingTime < 45
                  ? 'border-fei-yellow/25 bg-fei-yellow/[0.06]'
                  : 'border-green-500/20 bg-green-500/5'
              }`}
            >
              <p className={`text-sm font-semibold ${recordingTime < 45 ? 'text-fei-yellow' : 'text-green-400'}`}>
                {recordingTime < 45 ? `Recording saved (${recordingTime}s)` : `✓ Recording saved (${recordingTime}s)`}
              </p>
              <p className="mt-1 text-xs leading-5 text-fei-text/45">
                {recordingTime < 45
                  ? 'Your response is shorter than recommended. For a stronger AI Insight, try to speak for 45–60 seconds.'
                  : 'Your speaking sample has been captured.'}
              </p>
            </div>
          )}

          <div className="mb-4">
            {!isRecording && !recordingDone && (
              <button
                onClick={startRecording}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-500 py-3.5 font-bold text-white transition hover:bg-red-500/90"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.9}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path d="M12 14.5a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 0 0-7 0v5a3.5 3.5 0 0 0 3.5 3.5Z" />
                  <path d="M5.5 10.5a6.5 6.5 0 0 0 13 0" />
                  <path d="M12 17v3.5" />
                  <path d="M9 20.5h6" />
                </svg>
                Start recording
              </button>
            )}
            {isRecording && (
              <button
                onClick={stopRecording}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-red-500 py-3.5 font-bold text-red-400 transition hover:bg-red-500/10"
              >
                <span className="h-3 w-3 rounded-[3px] bg-current" />
                Stop recording
              </button>
            )}
          </div>

          {recordingDone && (
            <div className="space-y-3">
              <button
                onClick={() => {
                  setRecordingDone(false)
                  setRecordingTime(0)
                  setIsRecording(false)
                }}
                className="mx-auto flex w-fit items-center justify-center gap-2 rounded-full border border-fei-text/20 px-5 py-2.5 text-sm font-medium text-fei-text/65 transition hover:border-fei-sky/35 hover:text-fei-sky"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.9}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path d="M20 11a8 8 0 1 0-2.35 5.65" />
                  <path d="M20 4v7h-7" />
                </svg>
                Record again
              </button>
              <button
                onClick={() => finishAssessment(Math.min(4, Math.max(1, Math.round(recordingTime / 18))))}
                className="w-full rounded-full bg-fei-yellow py-3.5 font-bold text-fei-bg transition hover:bg-fei-yellow/90"
              >
                {saving ? 'Saving results...' : 'Submit assessment →'}
              </button>
            </div>
          )}

          {!isRecording && !recordingDone && (
            <button
              onClick={() => finishAssessment(1)}
              className="mt-4 w-full text-center text-xs text-fei-text/30 hover:text-fei-text/50 transition"
            >
              Skip speaking and submit
            </button>
          )}
        </div>
      </div>
    )
  }

  // RESULT
  if (section === 'result' && result) {
    const levelLabels: Record<string, string> = {
      A2: 'Foundation',
      B1: 'Intermediate',
      B2: 'Professional',
      C1: 'Advanced Professional',
    }

    const levelColors: Record<string, string> = {
      A2: 'text-fei-sky',
      B1: 'text-fei-sky',
      B2: 'text-fei-yellow',
      C1: 'text-fei-yellow',
    }

    const pathwayDescriptions: Record<string, string> = {
      A2: 'You understand basic football communication and can follow direct instructions in training and matchday contexts. Your pathway will build the confidence and vocabulary you need to communicate more clearly with coaches, medical staff, and teammates in everyday professional situations.',
      B1: 'You can manage many common football communication situations and respond professionally in routine interactions. Your pathway will help you communicate with more structure, confidence, and precision when situations become more complex.',
      B2: 'You communicate with clarity across most professional football situations and can handle feedback, tactical information, and role-related conversations with growing confidence. Your pathway will help you strengthen strategic control in pressure moments.',
      C1: 'You demonstrate advanced professional communication with strong awareness, precision, and maturity. Your pathway will help you refine leadership communication, negotiation, public presence, and high-pressure decision-making.',
    }

    const aiInsights: Record<string, string> = {
      A2: 'Your result shows a developing foundation in professional football English. You can handle some direct communication in familiar situations, but you need more consistency when instructions become faster, more tactical, or more pressure-based. Your next step is to strengthen real-time understanding, clarification skills, and clearer communication with coaches, teammates, and medical staff. FEI recommends starting with practical role-specific training so you can improve in the situations that affect your daily performance most.',
      B1: 'Your result shows that you can manage common football communication, especially when the context is familiar and the message is direct. Your next step is to communicate with more structure and precision when conversations become more detailed, tactical, or pressure-based. FEI recommends focused role-specific training to help you respond more confidently in professional situations.',
      B2: 'Your result shows strong professional communication potential across football-specific situations. You can understand and respond to many complex messages, but your next step is to improve strategic control in feedback, role conversations, and high-pressure communication. FEI recommends advanced role-specific training to help you communicate with more authority and precision.',
      C1: 'Your result shows advanced professional communication ability with strong awareness, precision, and maturity. Your next step is refinement: leadership communication, negotiation, public presence, and high-pressure decision-making. FEI recommends advanced training designed to sharpen your communication at the highest professional level.',
    }

    const pathwayFocus: Record<string, string[]> = {
      A2: [
        'Understanding tactical instructions',
        'Asking for clarification',
        'Reporting physical status',
        'Responding to basic feedback',
      ],
      B1: [
        'Tactical clarification',
        'Feedback response',
        'Medical communication',
        'Speaking with confidence under pressure',
      ],
      B2: [
        'Complex feedback conversations',
        'Playing-time and role discussions',
        'Public communication',
        'Leadership communication under pressure',
      ],
      C1: [
        'Advanced leadership communication',
        'Strategic negotiation',
        'Crisis and media communication',
        'Personal brand and reputation management',
      ],
    }

    const focusItems = pathwayFocus[result.level] || pathwayFocus.A2
    const pathwayDescription = pathwayDescriptions[result.level] || pathwayDescriptions.A2
    const aiInsight = aiInsights[result.level] || aiInsights.A2
    const pathwayLabel = levelLabels[result.level] || 'Foundation'
    const pathwayColor = levelColors[result.level] || 'text-fei-sky'
    const overallEvidence = Math.round((result.score / result.maxScore) * 100)

    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-10 flex items-center gap-3">
            <img src="/logo.svg" alt="FEI" className="h-8 w-auto" />
            <span className="text-xs font-medium text-fei-sky">Football English Intelligence</span>
          </div>

          <div className="mb-8 text-center">
            <div className="inline-block rounded-full bg-fei-yellow/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-fei-yellow">
              Assessment Complete
            </div>
            <h1 className="mt-4 text-4xl font-black text-fei-text">Your FEI Profile</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-fei-text/50">
              This short profile gives you your recommended starting pathway. Your full diagnostic report and personalized training plan are unlocked inside your FEI pathway.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="rounded-3xl border border-fei-yellow/20 bg-fei-yellow/[0.05] p-8 text-center lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fei-text/50">
                Recommended Pathway
              </p>
              <p className={`mt-5 text-8xl font-black ${pathwayColor}`}>
                {result.level}
              </p>
              <p className="mt-2 text-2xl font-bold text-fei-text">
                {pathwayLabel}
              </p>

              <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-fei-sky/20 bg-fei-bg/35 p-5 text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fei-sky">
                  {selectedRole}
                </p>
                <p className="mt-2 text-lg font-bold text-fei-text">
                  {result.level} — {pathwayLabel}
                </p>
                <p className="mt-3 text-sm leading-6 text-fei-text/70">
                  {pathwayDescription}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-fei-text/10 bg-fei-text/[0.03] p-6 lg:col-span-5">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-fei-yellow">
                Diagnostic Evidence
              </p>

              <div className="space-y-4">
                <div className="rounded-2xl border border-fei-text/10 bg-fei-bg/35 p-5 text-center">
                  <p className="text-4xl font-black text-fei-yellow">{result.score} / {result.maxScore}</p>
                  <p className="mt-2 text-xs text-fei-text/45">Diagnostic score</p>
                </div>

                <div className="rounded-2xl border border-fei-text/10 bg-fei-bg/35 p-5 text-center">
                  <p className="text-4xl font-black text-fei-yellow">{overallEvidence}%</p>
                  <p className="mt-2 text-xs text-fei-text/45">Diagnostic evidence</p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-fei-text/55">
                Your score helps FEI identify the most useful starting pathway for your football communication profile. It is not a pass/fail result.
              </p>
            </div>

            <div className="rounded-3xl border border-fei-text/10 bg-fei-text/[0.03] p-6 lg:col-span-12">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-fei-sky">
                AI Insight
              </p>
              <p className="max-w-5xl text-sm leading-relaxed text-fei-text/80">
                {aiInsight}
              </p>
            </div>

            <div className="rounded-3xl border border-fei-text/10 bg-fei-text/[0.03] p-6 lg:col-span-7">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-fei-yellow">
                Why this pathway?
              </p>
              <p className="text-sm leading-relaxed text-fei-text/70">
                Your diagnostic evidence shows that <span className="font-semibold text-fei-text">{result.level}</span> is the best starting point for your football communication profile. This is not a pass/fail result; it helps FEI recommend the pathway where targeted training can create the fastest and most relevant progress for your role.
              </p>
            </div>

            <div className="rounded-3xl border border-fei-sky/20 bg-fei-sky/[0.04] p-6 lg:col-span-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-fei-sky">
                Pathway Focus
              </p>
              <ul className="space-y-3 text-sm text-fei-text/70">
                {focusItems.map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-fei-yellow" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 rounded-2xl border border-fei-yellow/20 bg-fei-yellow/[0.06] p-4">
                <p className="text-sm leading-6 text-fei-text/70">
                  Unlock your complete FEI report to see detailed strengths, development priorities, and your personalized training plan.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/learning')}
            className="mt-8 w-full rounded-full bg-fei-yellow py-4 text-base font-bold text-fei-bg transition hover:bg-fei-yellow/90"
          >
            Start my FEI pathway →
          </button>

          <p className="mt-4 text-center text-xs text-fei-text/30">
            Your short diagnostic profile has been saved. You can review your progress from your dashboard.
          </p>
        </div>
      </div>
    )
  }

  return null
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-fei-bg">
        <p className="text-fei-sky">Loading assessment...</p>
      </div>
    }>
      <AssessmentContent />
    </Suspense>
  )
}
