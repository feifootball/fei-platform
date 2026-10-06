'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type ResultData = {
  level: string
  score: number
  maxScore: number
  reason: string
}

const strengthsByLevel: Record<string, string[]> = {
  A2: ['Understands simple football instructions', 'Recognizes familiar role vocabulary', 'Communicates basic needs in routine situations'],
  B1: ['Handles common football conversations', 'Responds to direct feedback', 'Explains familiar situations with useful structure'],
  B2: ['Communicates clearly in professional contexts', 'Understands complex football information', 'Supports decisions with relevant detail'],
  C1: ['Uses mature professional communication', 'Handles complex stakeholder conversations', 'Communicates with precision under pressure'],
}

const prioritiesByLevel: Record<string, string[]> = {
  A2: ['Ask for clarification with more confidence', 'Build stronger football-specific vocabulary', 'Respond when instructions are fast or pressured'],
  B1: ['Add more structure to explanations', 'Improve tactical and role-specific precision', 'Communicate more confidently under pressure'],
  B2: ['Refine leadership and feedback conversations', 'Improve strategic communication in complex situations', 'Control tone and detail in pressure moments'],
  C1: ['Refine influence across stakeholders', 'Strengthen executive and media communication', 'Sharpen elite decision-making language'],
}

const domains = [
  {
    title: 'On-Pitch Communication',
    detail: 'Fast, clear communication during live football situations.',
    scenarios: ['Match communication', 'Tactical communication and clarification'],
  },
  {
    title: 'Feedback, Staff and Availability',
    detail: 'Feedback conversations, tactical clarification and staff communication.',
    scenarios: ['Receiving feedback', 'Feedback delivery', 'Communicating injury or discomfort'],
  },
  {
    title: 'Dressing Room Leadership',
    detail: 'Leadership, peer support and private conflict resolution.',
    scenarios: ['Leadership communication', 'Peer support', 'Conflict resolution'],
  },
  {
    title: 'Media and Public Communication',
    detail: 'Interviews, public statements and crisis communication.',
    scenarios: ['Media interview', 'Crisis statement', 'Social media communication'],
  },
  {
    title: 'Personal Brand',
    detail: 'Personal narrative, sponsor communication and public identity.',
    scenarios: ['Personal branding', 'Sponsor communication'],
  },
  {
    title: 'Career Management',
    detail: 'Role expectations, development conversations and negotiation.',
    scenarios: ['Role expectation conversation'],
  },
]

function demoResult(): ResultData {
  return {
    level: 'B1',
    score: 24,
    maxScore: 32,
    reason: 'You manage routine football communication and understand the main idea in familiar professional situations. Your pathway now focuses on more structure, precision and confidence when the pace increases.',
  }
}

export default function DiagnosticResultPage() {
  const params = useParams<{ attemptId: string }>()
  const router = useRouter()
  const isUnpaidDemo = params.attemptId === 'unpaid-demo'
  const [role, setRole] = useState('Professional Player')
  const [result, setResult] = useState<ResultData>(demoResult())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      if (params.attemptId === 'demo' || params.attemptId === 'unpaid-demo') {
        if (active) setLoading(false)
        return
      }

      const supabase = createClient()
      const { data: attempt } = await supabase
        .from('diagnostic_attempts')
        .select('role')
        .eq('id', params.attemptId)
        .maybeSingle()
      const { data } = await supabase
        .from('diagnostic_results')
        .select('level, total_points, max_points, reason')
        .eq('attempt_id', params.attemptId)
        .maybeSingle()

      if (!active) return
      if (attempt?.role) setRole(attempt.role)
      if (data?.level) {
        setResult({
          level: data.level,
          score: data.total_points ?? 24,
          maxScore: data.max_points ?? 32,
          reason: data.reason ?? demoResult().reason,
        })
      }
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [params.attemptId])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] text-fei-bg/50">Loading your result…</div>
  }

  const strengths = strengthsByLevel[result.level] ?? strengthsByLevel.B1
  const priorities = prioritiesByLevel[result.level] ?? prioritiesByLevel.B1

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-fei-bg">
      <nav className="sticky top-0 z-20 border-b border-fei-bg/[0.08] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[60px] max-w-[1440px] items-center justify-between px-6 sm:px-10">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img src="/fei-logo-navbar-vector.svg" alt="FEI" className="h-9 w-auto" />
            <span className="hidden border-l border-fei-bg/10 pl-4 text-sm font-medium text-fei-bg/55 sm:inline">Football English Intelligence</span>
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold text-fei-bg/55 transition hover:text-fei-bg">Dashboard</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-[1280px] px-6 pb-20 pt-10 sm:px-10">
        <Link href="/dashboard" className="text-sm font-semibold text-fei-bg/55 transition hover:text-fei-bg">← Back to dashboard</Link>

        <section className="mt-7">
          <h1 className="text-3xl tracking-[-0.04em] sm:text-5xl"><span className="font-normal">Your result is </span><span className="font-black">ready.</span></h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-fei-bg/55">Your diagnostic is complete. Unlock the FEI course to turn this result into practical football communication.</p>
        </section>

        <section className="mt-8 rounded-[2rem] border border-fei-bg/10 bg-white shadow-[0_18px_55px_rgba(7,17,31,0.05)]">
          <div className="grid lg:grid-cols-[0.58fr_1.42fr]">
            <div className="p-4 sm:p-6 lg:border-r lg:border-fei-bg/10">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-fei-bg/48">Your level</p>
              <p className="mt-4 text-7xl font-black leading-none tracking-[-0.08em] text-fei-sky">{result.level}</p>
            </div>
            <div className="p-4 sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-fei-bg/48">What this means</p>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-fei-bg/62">{result.reason}</p>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-fei-bg/10 bg-white p-5 sm:p-7">
          <div className="grid gap-7 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-fei-bg/42">Objective result</p>
              <div className="mt-4 overflow-hidden rounded-2xl border border-fei-bg/10">
                {[
                  ['A2', '4 / 4', 'Strong foundation', 100],
                  ['B1', '3 / 4', 'Working level', 75],
                  ['B2', '2 / 4', 'Next focus', 50],
                  ['C1', '1 / 4', 'Future focus', 25],
                ].map(([level, score, status, percentage]) => (
                  <div key={level as string} className="flex items-center gap-4 border-b border-fei-bg/[0.08] px-4 py-2 last:border-b-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: `conic-gradient(#73cffa ${percentage}%, rgba(15,23,42,0.10) 0)` }}>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-fei-bg">{level}</span>
                    </div>
                    <span className="text-sm font-semibold text-fei-bg/65">{score}</span>
                    <span className="ml-auto text-xs font-medium text-fei-bg/42">{status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-fei-bg/42">Production result</p>
                <a href="/#how-we-evaluate" className="text-right text-[11px] font-bold text-fei-sky hover:underline">How was my result calculated?</a>
              </div>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl bg-fei-bg/[0.035] px-4 py-3">
                  <div className="flex items-center justify-between"><span className="text-sm font-semibold text-fei-bg/65">Writing</span><span className="text-xl font-black text-fei-sky">B1</span></div>
                  <p className="mt-2 text-xs leading-5 text-fei-bg/48">Clear main ideas and a professional tone. Next: add detail and stronger links between ideas.</p>
                </div>
                <div className="rounded-2xl bg-fei-bg/[0.035] px-4 py-3">
                  <div className="flex items-center justify-between"><span className="text-sm font-semibold text-fei-bg/65">Speaking</span><span className="text-xl font-black text-fei-sky">A2</span></div>
                  <p className="mt-2 text-xs leading-5 text-fei-bg/48">You can respond in familiar situations. Next: build fluency and precise match vocabulary.</p>
                </div>
              </div>
            </div>            </div>
        </section>

        <section className="mt-8 border-y border-fei-bg/10 py-7">
          <div className="grid gap-7 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="text-sm font-black text-fei-bg">Strengths</p>
              <div className="mt-2">
                {['Understands common football conversations', 'Responds to feedback', 'Explains familiar situations'].map((item) => (
                  <div key={item} className="flex gap-3 border-t border-fei-bg/[0.08] py-2.5 text-sm text-fei-bg/62">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-fei-sky" />{item}
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:border-l lg:border-fei-bg/10 lg:pl-12">
              <p className="text-sm font-black text-fei-bg">Next focus</p>
              <div className="mt-2">
                {['More structured explanations', 'Tactical precision', 'Confidence under pressure'].map((item) => (
                  <div key={item} className="flex gap-3 border-t border-fei-bg/[0.08] py-2.5 text-sm text-fei-bg/62">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-fei-yellow" />{item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="overflow-hidden rounded-[2rem] border border-fei-bg/10 bg-gradient-to-b from-white via-[#f8fcfe] to-[#eaf7fc] shadow-[0_18px_55px_rgba(7,17,31,0.045)]">
            <div className="grid lg:grid-cols-[1fr_340px]">
              <div className="p-5 sm:p-7 lg:border-r lg:border-fei-bg/10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-fei-bg/42">Course access</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl">Turn your result into practice</h2>
                <p className="mt-3 max-w-md text-sm font-normal leading-6 text-fei-bg/58">Unlock the course to access role-specific lessons, practice scenarios and the complete pathway built from your result.</p>
              </div>
              <div className="relative flex flex-col justify-between border-t border-fei-bg/10 bg-fei-sky/[0.055] p-5 sm:p-7 lg:border-t-0"><div className="absolute inset-x-0 top-0 h-1 bg-fei-yellow" /><div><p className="text-center text-xs font-black uppercase tracking-[0.2em] text-fei-bg/52">Unlock your course</p><div className="mt-5 flex items-end justify-center gap-2"><p className="text-6xl font-black leading-none">$49</p><p className="pb-1 text-lg font-bold text-fei-bg/48">/ month</p></div></div><div className="mt-5"><button type="button" onClick={() => router.push('/#pricing')} className="w-full rounded-full bg-fei-yellow px-5 py-3 text-sm font-black transition hover:-translate-y-0.5">Unlock course access</button></div></div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-fei-bg/45">Course preview</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.035em]">See what your pathway will unlock.</h2>
          </div>
          <div className="mt-4">
            {domains.slice(0, 2).map((domain, index) => <article key={domain.title} className={`grid gap-5 border-b border-fei-bg/10 py-7 lg:grid-cols-[72px_0.8fr_1.2fr] lg:items-center ${index === 2 ? 'blur-[3px] opacity-45 select-none' : ''}`}><p className="text-3xl font-black text-fei-sky">{String(index + 1).padStart(2, '0')}</p><div><p className="text-xs font-black uppercase tracking-[0.18em] text-fei-bg/38">Domain {index + 1}</p><h3 className="mt-2 text-xl font-black">{domain.title}</h3><p className="mt-2 max-w-md text-sm leading-6 text-fei-bg/48">{domain.detail}</p></div><div><p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-fei-sky">Your practice journey</p>{domain.scenarios.map((scenario, i) => <div key={scenario} className="flex gap-3 border-t border-fei-bg/[0.07] py-3 text-sm font-bold text-fei-bg/68"><span className="text-xs text-fei-sky">{String(i + 1).padStart(2, '0')}</span>{scenario}</div>)}</div></article>)}
          </div>
          <p className="mt-5 text-xs font-medium text-fei-bg/40">More role-specific modules will appear as you move through your pathway.</p>
        </section>

      </main>
    </div>
  )
}
