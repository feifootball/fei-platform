'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type Level = 'A2' | 'B1' | 'B2' | 'C1'

const levels: Record<Level, {
  name: string
  descriptor: string
  pressure: string
  language: string[]
  vocabulary: string[]
}> = {
  A2: {
    name: 'Essential',
    descriptor: 'Communicate what changes, who changes and the immediate action using brief, direct language.',
    pressure: 'A familiar halftime situation with one clear problem and one immediate change.',
    language: ['Direct commands', 'Present simple and present continuous', 'Basic when / if instructions'],
    vocabulary: ['press', 'drop', 'stay wide', 'inside', 'mark', 'next action'],
  },
  B1: {
    name: 'Independent',
    descriptor: 'Add a reason or evidence, assign responsibilities and confirm the next action.',
    pressure: 'A recurring problem, moderate time pressure and one clarification question.',
    language: ['Cause and consequence', 'Real conditionals', 'Confirmation questions'],
    vocabulary: ['trigger', 'compactness', 'cover', 'second ball', 'passing lane', 'overload'],
  },
  B2: {
    name: 'Adaptive',
    descriptor: 'Adapt the adjustment when seconds, noise and match emotion limit communication.',
    pressure: 'An unpredictable match state with high noise, emotion and competing information.',
    language: ['Conditional instructions', 'Modal deduction', 'Concession and concise emphasis'],
    vocabulary: ['pressing trap', 'spare player', 'rest defence', 'transition risk', 'weak side', 'trade-off'],
  },
  C1: {
    name: 'Strategic',
    descriptor: 'Align multiple stakeholders and lead a defensible adjustment as the match state evolves.',
    pressure: 'Competing evidence and priorities across assistants, unit leaders and substitutes.',
    language: ['Strategic qualification', 'Advanced conditionals', 'Fronting and controlled emphasis'],
    vocabulary: ['contingency', 'manipulate space', 'deny access', 'risk threshold', 'cascade the message'],
  },
}

const stages = [
  { label: 'Briefing', title: 'Read the match', minutes: '3 min' },
  { label: 'Recognition', title: 'Choose the message', minutes: '5 min' },
  { label: 'Build', title: 'Shape the adjustment', minutes: '8 min' },
  { label: 'Rehearse', title: 'Communicate under pressure', minutes: '5 min' },
  { label: 'Perform', title: 'Assessment preview', minutes: '7 min' },
]

const messageOptions = [
  {
    id: 'vague',
    text: 'Push higher and be more aggressive. We need to stop them playing through us.',
    note: 'The priority is visible, but responsibility and the trigger remain unclear.',
  },
  {
    id: 'actionable',
    text: 'When their pivot receives, our eight jumps. The winger stays with the full-back and the back line squeezes ten metres. If they play around us, recover inside first. Clear?',
    note: 'The command identifies the trigger, responsibilities, next action and confirmation.',
  },
  {
    id: 'overloaded',
    text: 'They have been finding the pivot because our first line is slightly disconnected, so we may need to reconsider the distances between several units and perhaps change the timing of the press.',
    note: 'The analysis is plausible, but the players cannot act immediately from this message.',
  },
]

function PitchDiagram() {
  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] border border-white/15 bg-[#123E35] shadow-inner">
      <div className="absolute inset-4 rounded-2xl border border-white/35" />
      <div className="absolute inset-y-4 left-1/2 border-l border-white/35" />
      <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35" />
      <div className="absolute left-4 top-1/2 h-36 w-20 -translate-y-1/2 border border-l-0 border-white/35" />
      <div className="absolute right-4 top-1/2 h-36 w-20 -translate-y-1/2 border border-r-0 border-white/35" />

      <div className="absolute left-[28%] top-[33%] h-7 w-7 rounded-full border-4 border-white bg-fei-sky shadow-lg" />
      <div className="absolute left-[28%] top-[57%] h-7 w-7 rounded-full border-4 border-white bg-fei-sky shadow-lg" />
      <div className="absolute left-[42%] top-[44%] h-8 w-8 rounded-full border-4 border-white bg-fei-yellow shadow-lg" />
      <div className="absolute left-[56%] top-[28%] h-7 w-7 rounded-full border-4 border-white bg-[#F97373] shadow-lg" />
      <div className="absolute left-[61%] top-[54%] h-7 w-7 rounded-full border-4 border-white bg-[#F97373] shadow-lg" />
      <div className="absolute left-[69%] top-[43%] h-7 w-7 rounded-full border-4 border-white bg-[#F97373] shadow-lg" />

      <div className="absolute left-[38%] top-[46%] h-0 w-16 -rotate-12 border-t-2 border-dashed border-fei-yellow" />
      <div className="absolute left-[47%] top-[35%] h-0 w-20 rotate-12 border-t-2 border-dashed border-fei-yellow" />

      <div className="absolute bottom-6 left-6 rounded-full bg-black/35 px-4 py-2 text-xs font-bold text-white backdrop-blur">
        The pivot keeps receiving behind your first press
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function TacticalAdjustmentPilot() {
  const [level, setLevel] = useState<Level>('B2')
  const [stage, setStage] = useState(0)
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(20)
  const [running, setRunning] = useState(false)
  const [reviewed, setReviewed] = useState(false)
  const current = levels[level]

  useEffect(() => {
    if (!running || seconds === 0) return
    const timer = window.setTimeout(() => {
      const nextSecond = seconds - 1
      setSeconds(nextSecond)
      if (nextSecond === 0) setRunning(false)
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [running, seconds])

  const progress = useMemo(() => ((stage + 1) / stages.length) * 100, [stage])

  function resetRehearsal() {
    setSeconds(20)
    setRunning(false)
  }

  return (
    <main className="min-h-screen bg-[#F3F5F7] text-fei-bg">
      <nav className="border-b border-fei-bg/10 bg-white">
        <div className="mx-auto flex min-h-[68px] max-w-[1500px] items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/fei-logo-navbar-vector.svg" alt="FEI" width={38} height={38} className="h-9 w-auto" />
            <div>
              <p className="text-sm font-black leading-4">Football English Intelligence</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-fei-bg/40">Module prototype</p>
            </div>
          </Link>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="rounded-full bg-fei-sky/15 px-3 py-1.5 text-xs font-black text-fei-bg">HC-S03</span>
            <span className="text-sm font-semibold text-fei-bg/45">Head Coach · In-Play Communication</span>
          </div>
        </div>
      </nav>

      <div className="h-1 bg-fei-bg/8">
        <div className="h-full bg-fei-yellow transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="mx-auto grid max-w-[1500px] gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-b border-fei-bg/10 bg-white px-5 py-6 lg:min-h-[calc(100vh-72px)] lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-fei-sky">Pilot module</p>
            <h1 className="mt-2 text-2xl font-black tracking-[-0.03em]">Tactical Adjustment</h1>
            <p className="mt-2 text-sm leading-6 text-fei-bg/50">Communicate the change before the next moment of play.</p>
          </div>

          <div className="mt-6 rounded-2xl bg-fei-bg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Target level</p>
                <p className="mt-1 text-lg font-black text-fei-yellow">{level} · {current.name}</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-black">{level}</span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-1.5" aria-label="Select level">
              {(Object.keys(levels) as Level[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLevel(item)}
                  className={`rounded-lg py-2 text-xs font-black transition ${level === item ? 'bg-fei-yellow text-fei-bg' : 'bg-white/8 text-white/60 hover:bg-white/15'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <ol className="mt-7 hidden space-y-1 lg:block">
            {stages.map((item, index) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => setStage(index)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${stage === index ? 'bg-fei-sky/12' : 'hover:bg-fei-bg/[0.035]'}`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${index < stage ? 'bg-fei-bg text-white' : stage === index ? 'bg-fei-yellow text-fei-bg' : 'bg-fei-bg/[0.06] text-fei-bg/40'}`}>
                    {index < stage ? <CheckIcon /> : index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-fei-bg/35">{item.label}</span>
                    <span className="mt-0.5 block text-sm font-bold">{item.title}</span>
                  </span>
                  <span className="text-[10px] font-semibold text-fei-bg/30">{item.minutes}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="mt-6 rounded-2xl border border-fei-bg/10 bg-[#FAFBFC] p-4 text-xs leading-5 text-fei-bg/50">
            <p className="font-black uppercase tracking-[0.14em] text-fei-bg/35">Prototype timing</p>
            <p className="mt-2">The times are placeholders. Real usage will determine the final module length.</p>
          </div>
        </aside>

        <section className="px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
          <div className="mx-auto max-w-5xl">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-fei-sky">{stages[stage].label} · {level}</p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] sm:text-4xl">{stages[stage].title}</h2>
              </div>
              <div className="rounded-full border border-fei-bg/10 bg-white px-4 py-2 text-xs font-bold text-fei-bg/45">
                Estimated {stages[stage].minutes}
              </div>
            </div>

            {stage === 0 && (
              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <PitchDiagram />
                <div className="rounded-[28px] bg-fei-bg p-6 text-white sm:p-8">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-fei-sky">78th minute · 1–1</p>
                  <h3 className="mt-4 text-2xl font-black leading-tight">Your press is being played through.</h3>
                  <p className="mt-4 text-sm leading-7 text-white/60">
                    Their centre-back waits for your striker to jump, then finds the pivot behind him. Your assistant warns that pushing the eight higher may expose the weak side.
                  </p>
                  <div className="mt-6 border-t border-white/10 pt-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fei-yellow">Your professional outcome</p>
                    <p className="mt-2 text-base font-bold leading-7">Give one actionable adjustment before play restarts.</p>
                  </div>
                </div>

                <div className="rounded-[28px] border border-fei-bg/10 bg-white p-6 xl:col-span-2 sm:p-8">
                  <div className="grid gap-6 md:grid-cols-[1fr_1.2fr] md:items-start">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-fei-sky">Performance target</p>
                      <p className="mt-3 text-xl font-black leading-8">{current.descriptor}</p>
                    </div>
                    <div className="rounded-2xl bg-[#F5F7F9] p-5">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-fei-bg/35">Pressure condition</p>
                      <p className="mt-2 text-sm leading-6 text-fei-bg/65">{current.pressure}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {stage === 1 && (
              <div className="rounded-[30px] border border-fei-bg/10 bg-white p-6 sm:p-9">
                <div className="max-w-3xl">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-fei-sky">Decision point</p>
                  <h3 className="mt-3 text-2xl font-black">Which message is easiest to act on immediately?</h3>
                  <p className="mt-3 text-sm leading-7 text-fei-bg/50">Choose one. Focus on the professional outcome, not on which version sounds most sophisticated.</p>
                </div>
                <div className="mt-7 grid gap-4">
                  {messageOptions.map((option, index) => {
                    const selected = selectedMessage === option.id
                    const correct = option.id === 'actionable'
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedMessage(option.id)}
                        className={`rounded-2xl border p-5 text-left transition ${selected ? correct ? 'border-emerald-400 bg-emerald-50' : 'border-fei-yellow bg-fei-yellow/10' : 'border-fei-bg/10 hover:border-fei-sky hover:bg-fei-sky/[0.04]'}`}
                      >
                        <span className="flex items-start gap-4">
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${selected ? 'bg-fei-bg text-white' : 'bg-fei-bg/[0.06] text-fei-bg/45'}`}>{String.fromCharCode(65 + index)}</span>
                          <span>
                            <span className="block text-base font-bold leading-7">“{option.text}”</span>
                            {selected && <span className="mt-3 block text-sm leading-6 text-fei-bg/55">{option.note}</span>}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
                {selectedMessage && (
                  <div className={`mt-5 rounded-2xl px-5 py-4 text-sm font-semibold ${selectedMessage === 'actionable' ? 'bg-emerald-100 text-emerald-950' : 'bg-fei-yellow/20 text-fei-bg'}`}>
                    {selectedMessage === 'actionable'
                      ? 'Actionable: the players know the trigger, responsibilities, response and confirmation.'
                      : 'Keep the useful idea, then make the trigger, responsibility and next action explicit.'}
                  </div>
                )}
              </div>
            )}

            {stage === 2 && (
              <div className="space-y-6">
                <div className="rounded-[30px] bg-fei-bg p-6 text-white sm:p-9">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-fei-sky">Command architecture</p>
                  <div className="mt-6 grid gap-3 md:grid-cols-5">
                    {[
                      ['01', 'Observation', 'They are finding the pivot.'],
                      ['02', 'Priority', 'Protect the central lane.'],
                      ['03', 'Responsibility', 'Eight jumps; winger holds.'],
                      ['04', 'Trigger', 'When the pivot receives.'],
                      ['05', 'Check', 'Clear? Tell me the trigger.'],
                    ].map(([number, label, example]) => (
                      <div key={number} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                        <p className="text-xl font-black text-fei-yellow">{number}</p>
                        <p className="mt-3 text-sm font-black">{label}</p>
                        <p className="mt-2 text-xs leading-5 text-white/45">{example}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-[28px] border border-fei-bg/10 bg-white p-6">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-fei-sky">Language tools · {level}</p>
                    <ul className="mt-5 space-y-3">
                      {current.language.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm font-semibold leading-6">
                          <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fei-sky/15 text-fei-bg"><CheckIcon /></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-[28px] border border-fei-bg/10 bg-white p-6">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-fei-yellow">Tactical vocabulary</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {current.vocabulary.map((item) => (
                        <span key={item} className="rounded-full bg-fei-bg/[0.05] px-3 py-2 text-sm font-bold text-fei-bg/65">{item}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-fei-yellow/60 bg-fei-yellow/10 p-6 sm:p-8">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-fei-bg/45">Build your version</p>
                  <p className="mt-3 text-lg font-black">When __________, our __________. If __________, then __________. Clear?</p>
                  <p className="mt-3 text-sm leading-6 text-fei-bg/55">The support would reduce progressively according to the learner’s level and previous attempts.</p>
                </div>
              </div>
            )}

            {stage === 3 && (
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[30px] bg-fei-bg p-7 text-white sm:p-10">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-fei-sky">Live variation</p>
                      <h3 className="mt-3 text-2xl font-black">Your assistant challenges the adjustment.</h3>
                    </div>
                    <span className="rounded-full bg-[#F97373]/15 px-3 py-1.5 text-xs font-black text-[#FFB4B4]">High noise</span>
                  </div>
                  <blockquote className="mt-7 rounded-2xl border-l-4 border-fei-yellow bg-white/[0.06] p-5 text-lg font-semibold leading-8">
                    “If the eight jumps, their winger will stay wide and we’ll leave the full-back isolated.”
                  </blockquote>
                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    {['Acknowledge the risk', 'Protect the priority', 'Confirm the contingency'].map((item) => (
                      <div key={item} className="rounded-xl border border-white/10 px-4 py-3 text-xs font-bold text-white/65">{item}</div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center rounded-[30px] border border-fei-bg/10 bg-white p-7 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-fei-bg/35">Rehearsal clock</p>
                  <p className={`mt-4 text-7xl font-black tabular-nums ${seconds <= 5 ? 'text-[#D94A4A]' : 'text-fei-bg'}`}>{seconds}</p>
                  <p className="mt-2 text-sm font-semibold text-fei-bg/45">seconds</p>
                  <button
                    type="button"
                    onClick={() => seconds === 0 ? resetRehearsal() : setRunning((value) => !value)}
                    className="mt-7 w-full rounded-full bg-fei-yellow px-6 py-3.5 text-sm font-black text-fei-bg transition hover:brightness-95"
                  >
                    {seconds === 0 ? 'Reset rehearsal' : running ? 'Pause' : seconds < 20 ? 'Continue' : 'Start 20-second rehearsal'}
                  </button>
                  <p className="mt-4 text-xs leading-5 text-fei-bg/40">Voice recording can be tested after the learning experience is approved.</p>
                </div>
              </div>
            )}

            {stage === 4 && (
              <div className="space-y-6">
                <div className="rounded-[30px] bg-fei-bg p-7 text-white sm:p-10">
                  <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-fei-sky">Rapid command simulation</p>
                      <h3 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.03em]">A new match state. One live follow-up. One actionable outcome.</h3>
                      <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">Support is restricted according to the target level. The task evaluates the professional result, not memorised phrases.</p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.06] px-6 py-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Evidence mode</p>
                      <p className="mt-2 font-black text-fei-yellow">Rapid command</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    ['Professional outcome', 'Players can act from the message.'],
                    ['Language control', 'Meaning remains precise at the target level.'],
                    ['Adaptation', 'The response changes when pressure increases.'],
                    ['Interaction', 'Questions are resolved and action is confirmed.'],
                  ].map(([title, description]) => (
                    <div key={title} className="rounded-2xl border border-fei-bg/10 bg-white p-5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-fei-sky/15 text-fei-bg"><CheckIcon /></span>
                      <p className="mt-4 text-sm font-black">{title}</p>
                      <p className="mt-2 text-xs leading-5 text-fei-bg/45">{description}</p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setReviewed((value) => !value)}
                  className={`w-full rounded-2xl border px-6 py-5 text-left transition ${reviewed ? 'border-emerald-300 bg-emerald-50' : 'border-fei-yellow/60 bg-fei-yellow/10 hover:bg-fei-yellow/15'}`}
                >
                  <span className="flex items-center justify-between gap-5">
                    <span>
                      <span className="block text-xs font-black uppercase tracking-[0.18em] text-fei-bg/40">Prototype review marker</span>
                      <span className="mt-1 block text-base font-black">{reviewed ? 'Module structure marked as reviewed' : 'Mark this structure as reviewed'}</span>
                    </span>
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full ${reviewed ? 'bg-emerald-600 text-white' : 'bg-fei-bg text-white'}`}><CheckIcon /></span>
                  </span>
                </button>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-fei-bg/10 pt-6">
              <button
                type="button"
                disabled={stage === 0}
                onClick={() => setStage((value) => Math.max(0, value - 1))}
                className="rounded-full border border-fei-bg/15 bg-white px-6 py-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-30"
              >
                ← Previous
              </button>
              <div className="hidden text-xs font-semibold text-fei-bg/35 sm:block">Step {stage + 1} of {stages.length}</div>
              <button
                type="button"
                disabled={stage === stages.length - 1}
                onClick={() => setStage((value) => Math.min(stages.length - 1, value + 1))}
                className="rounded-full bg-fei-bg px-6 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
