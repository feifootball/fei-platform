'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
}

const diagnosticQuestions: { [key: string]: Question[] } = {
  'Professional Player': [
    {
      id: 'pp-1',
      text: 'You need to explain your recent performance to the coach. What do you say?',
      options: [
        'I play good.',
        'I believe my recent performances have shown improvement in tactical positioning and decision-making under pressure.',
        'My game is better now.',
      ],
      correctAnswer: 1,
    },
    {
      id: 'pp-2',
      text: 'A journalist asks about your recovery from injury. How do you respond?',
      options: [
        'I am OK now.',
        'The medical team has been instrumental in my rehabilitation process. I\'m progressing well and feeling stronger each session.',
        'I feel better.',
      ],
      correctAnswer: 1,
    },
  ],
  'Head Coach': [
    {
      id: 'hc-1',
      text: 'You need to brief your staff on tactical adjustments for the next match. How do you phrase it?',
      options: [
        'We change the tactics.',
        'We will implement a more compact defensive shape and transition quickly to counter-attacks, capitalizing on their high defensive line.',
        'Change the way we play.',
      ],
      correctAnswer: 1,
    },
    {
      id: 'hc-2',
      text: 'How would you communicate a difficult personnel decision to your team?',
      options: [
        'Someone is leaving.',
        'After careful evaluation, we\'ve made the strategic decision to part ways. I appreciate their contributions and wish them well.',
        'We need to make changes.',
      ],
      correctAnswer: 1,
    },
  ],
  'Scout': [
    {
      id: 'sc-1',
      text: 'You are reporting a player recommendation to the Head of Scouting. What do you say?',
      options: [
        'This player is good for us.',
        'This prospect exhibits the positional attributes and technical execution we require. I recommend advancing to video analysis phase.',
        'I like this player.',
      ],
      correctAnswer: 1,
    },
    {
      id: 'sc-2',
      text: 'Describing a player\'s technical level to colleagues, what language do you use?',
      options: [
        'He is a good midfielder.',
        'His ball retention under pressure averages 87%, with progressive pass accuracy of 78% in the final third.',
        'He plays well.',
      ],
      correctAnswer: 1,
    },
  ],
}

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role')
  
  const [userRole, setUserRole] = useState<string | null>(roleParam)
  const [loading, setLoading] = useState(!roleParam)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{
    score: number
    level: string
    message: string
    correctCount: number
  } | null>(null)

  useEffect(() => {
    if (!roleParam) {
      router.push('/dashboard')
    } else {
      setLoading(false)
    }
  }, [roleParam, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fei-bg">
        <p className="text-fei-sky">Loading assessment...</p>
      </div>
    )
  }

  if (!userRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fei-bg">
        <p className="text-fei-text">Error loading your role. Redirecting...</p>
      </div>
    )
  }

  const questions = diagnosticQuestions[userRole] || []

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fei-bg">
        <div className="text-center">
          <p className="text-fei-text mb-4">Assessment not yet available for this role.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg transition-colors hover:bg-fei-yellow/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = optionIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      submitAssessment()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const submitAssessment = () => {
    let correctCount = 0
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        correctCount++
      }
    })

    const percentage = Math.round((correctCount / questions.length) * 100)
    let level = 'A2'
    let message = 'Foundation'

    if (percentage >= 80) {
      level = 'C1'
      message = 'Advanced Professional'
    } else if (percentage >= 60) {
      level = 'B2'
      message = 'Professional'
    } else if (percentage >= 40) {
      level = 'B1'
      message = 'Intermediate'
    }

    setResult({
      score: percentage,
      level: level,
      message: message,
      correctCount: correctCount,
    })
    setSubmitted(true)
  }

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-fei-bg px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10">
            <a href="/" className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="FEI" className="h-8 w-auto" />
              <span className="text-xs font-medium text-fei-sky sm:text-sm">
                Football English Intelligence
              </span>
            </a>
          </div>

          <div className="rounded-xl border border-fei-sky/20 bg-fei-bg p-8 text-center">
            <div className="mb-6">
              <div className="inline-block rounded-full bg-fei-yellow/10 px-4 py-2">
                <span className="text-sm font-semibold text-fei-yellow">Assessment Complete</span>
              </div>
            </div>

            <h1 className="mb-2 text-4xl font-bold text-fei-text">
              Your CEFR Level: <span className="text-fei-yellow">{result.level}</span>
            </h1>

            <p className="mb-6 text-xl text-fei-sky">{result.message}</p>

            <div className="mb-8 rounded-lg bg-fei-text/5 p-6">
              <p className="mb-2 text-sm text-fei-text/60">Score</p>
              <div className="flex items-center justify-center gap-2">
                <div className="text-3xl font-bold text-fei-yellow">{result.score}%</div>
                <div className="text-sm text-fei-text/60">({result.correctCount}/{questions.length} correct)</div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg transition-colors hover:bg-fei-yellow/90"
              >
                Start Learning
              </button>
              <button
                onClick={() => {
                  setSubmitted(false)
                  setCurrentQuestion(0)
                  setAnswers([])
                  setResult(null)
                }}
                className="w-full rounded-full border border-fei-text/20 px-8 py-3 font-semibold text-fei-text transition-colors hover:border-fei-text/40"
              >
                Retake Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const isAnswered = answers[currentQuestion] !== undefined
  const correctCount = answers.filter((ans, idx) => ans === questions[idx].correctAnswer).length

  return (
    <div className="min-h-screen bg-fei-bg px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="FEI" className="h-8 w-auto" />
            <span className="text-xs font-medium text-fei-sky sm:text-sm">
              Football English Intelligence
            </span>
          </a>
          <span className="text-sm text-fei-text/50">
            {currentQuestion + 1} of {questions.length}
          </span>
        </div>

        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-fei-text/70">Your Role: {userRole}</span>
            <span className="text-xs text-fei-text/50">Progress</span>
          </div>
          <div className="h-2 w-full rounded-full bg-fei-text/10">
            <div
              className="h-2 rounded-full bg-fei-yellow transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-fei-sky/20 bg-fei-text/5 p-8">
          <h2 className="mb-6 text-lg font-semibold text-fei-text">{currentQ.text}</h2>

          <div className="mb-8 space-y-3">
            {currentQ.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`w-full rounded-lg border px-4 py-3 text-left transition-all ${
                  answers[currentQuestion] === idx
                    ? 'border-fei-yellow bg-fei-yellow/10'
                    : 'border-fei-text/10 bg-fei-text/[0.02] hover:border-fei-sky'
                }`}
              >
                <span className="text-fei-text">{option}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex-1 rounded-full border border-fei-text/20 px-6 py-3 font-semibold text-fei-text transition-colors hover:border-fei-text/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className="flex-1 rounded-full bg-fei-yellow px-6 py-3 font-semibold text-fei-bg transition-colors hover:bg-fei-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-fei-text/50">
            {correctCount} of {currentQuestion + 1} answers correct so far
          </p>
        </div>
      </div>
    </div>
  )
}
