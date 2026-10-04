import type { PlacementLevel } from '@/lib/diagnostic/types'

type DimensionSource = Record<string, string> | null | undefined

export type LearningDimension =
  | 'task_effectiveness'
  | 'clarity_and_organisation'
  | 'language_control_and_range'
  | 'fluency_and_intelligibility'
  | 'professional_football_communication'

export interface ProfileDimension {
  key: LearningDimension
  label: string
  evidence: Array<{ skill: 'Writing' | 'Speaking'; level: string }>
  score: number
}

export interface LearningModule {
  id: string
  order: number
  title: string
  scenario: string
  communicationFocus: string
  grammarFocus: string
  vocabularyFocus: string
  outcome: string
}

export interface CommunicationProfile {
  role: string
  level: PlacementLevel
  levelLabel: string
  nextGoal: string
  strengths: ProfileDimension[]
  priorities: ProfileDimension[]
  modules: LearningModule[]
}

const LEVEL_RANK: Record<string, number> = {
  A1: 0,
  A2: 1,
  B1: 2,
  B2: 3,
  C1: 4,
}

const DIMENSION_LABELS: Record<LearningDimension, string> = {
  task_effectiveness: 'Task effectiveness',
  clarity_and_organisation: 'Clarity and organisation',
  language_control_and_range: 'Language control and range',
  fluency_and_intelligibility: 'Fluency and intelligibility',
  professional_football_communication: 'Professional football communication',
}

const DIMENSION_ALIASES: Record<string, LearningDimension> = {
  task_fulfilment: 'task_effectiveness',
  task_fulfilment_and_professional_relevance: 'task_effectiveness',
  clarity_and_organisation: 'clarity_and_organisation',
  clarity_organisation_and_interactional_effectiveness: 'clarity_and_organisation',
  language_control_and_range: 'language_control_and_range',
  fluency_and_intelligibility: 'fluency_and_intelligibility',
  professional_football_communication: 'professional_football_communication',
}

const LEVEL_LANGUAGE: Record<PlacementLevel, {
  grammar: string[]
  vocabulary: string[]
  label: string
  nextGoal: string
}> = {
  A2: {
    label: 'Foundation communication',
    nextGoal: 'Build reliable B1 communication',
    grammar: [
      'Present, past and planned future forms for clear updates',
      'Have to, may and might for duties, options and simple risk',
      'Comparatives, reasons and simple relative clauses',
    ],
    vocabulary: [
      'Core role actions, people, equipment and match situations',
      'Simple language for health, movement, plans and problems',
      'Common football collocations for instructions and updates',
    ],
  },
  B1: {
    label: 'Independent communication',
    nextGoal: 'Develop flexible B2 communication',
    grammar: [
      'Indirect questions and reported speech for professional exchange',
      'Modals for advice, necessity, permission and prohibition',
      'Conditionals, passive forms and connected past events',
    ],
    vocabulary: [
      'Language for progress, risk, options and recommendations',
      'Role-specific phrasal verbs and common professional collocations',
      'Precise verbs for explaining actions, causes and consequences',
    ],
  },
  B2: {
    label: 'Professional communication',
    nextGoal: 'Extend precision and control toward C1',
    grammar: [
      'Reduced relative clauses and participle structures for concise detail',
      'Alternative conditionals and modal reporting for risk and uncertainty',
      'Advanced passive, future and emphasis structures',
    ],
    vocabulary: [
      'Nuanced language for performance, progress and trade-offs',
      'Reporting verbs and precise evaluative language',
      'Collocations for evidence, decisions, risk and professional impact',
    ],
  },
  C1: {
    label: 'Advanced professional communication',
    nextGoal: 'Consolidate sustained C1 control across pressure contexts',
    grammar: [
      'Clefts, fronting and limiting adverbials for controlled emphasis',
      'Participle phrases, noun clauses and advanced referencing',
      'Perfect and continuous infinitives, subjunctive and nuanced future forms',
    ],
    vocabulary: [
      'Attitude adverbs and calibrated language for stance and uncertainty',
      'Precise language for change, attention, influence and impact',
      'Flexible idiomatic and professional collocations without loss of control',
    ],
  },
}

type RoleModule = { title: string; scenario: string; outcome: string }

const ROLE_MODULES: Record<string, RoleModule[]> = {
  'Professional Player': [
    { title: 'Availability and physical status', scenario: 'Report symptoms, workload and readiness to medical or coaching staff.', outcome: 'Give a clear update and request the right support.' },
    { title: 'Team and coaching communication', scenario: 'Clarify instructions, explain decisions and respond to feedback.', outcome: 'Keep communication direct, connected and useful in real time.' },
    { title: 'Media communication under pressure', scenario: 'Respond after difficult results without blaming teammates.', outcome: 'Protect the team while expressing a clear professional position.' },
  ],
  'Head Coach': [
    { title: 'Tactical direction', scenario: 'Set priorities, explain risk and guide decisions before and during matches.', outcome: 'Deliver concise instructions with clear reasoning.' },
    { title: 'Feedback and player management', scenario: 'Handle frustration, correct behaviour and protect relationships.', outcome: 'Balance authority, clarity and diplomacy.' },
    { title: 'Leadership under pressure', scenario: 'Address staff, players and media when evidence is incomplete or stakes are high.', outcome: 'Communicate decisions with nuance and control.' },
  ],
  'Assistant Coach': [
    { title: 'Training instructions', scenario: 'Set up practices and explain roles, triggers and supporting actions.', outcome: 'Make instructions immediately actionable.' },
    { title: 'Coaching interventions', scenario: 'Stop an exercise, diagnose a coordination problem and restart clearly.', outcome: 'Correct the issue without overloading the players.' },
    { title: 'Staff debriefs', scenario: 'Summarize what worked, what changed and what to prioritize next.', outcome: 'Turn observations into a concise recommendation.' },
  ],
  Scout: [
    { title: 'Player evidence', scenario: 'Describe strengths, limitations and performance across observations.', outcome: 'Separate observed evidence from projection.' },
    { title: 'Profile fit and uncertainty', scenario: 'Compare the player with the recruitment brief and identify missing evidence.', outcome: 'Express fit, risk and uncertainty precisely.' },
    { title: 'Recruitment recommendation', scenario: 'Present a next step to colleagues or the recruitment director.', outcome: 'Make a defensible recommendation without overstating the case.' },
  ],
  'Head of Scouting': [
    { title: 'Recruitment priorities', scenario: 'Compare immediate needs with longer-term squad value.', outcome: 'State the decision criteria and strategic priority clearly.' },
    { title: 'Risk and trade-offs', scenario: 'Discuss tactical fit, evidence gaps, financial value and timing.', outcome: 'Calibrate certainty and explain the consequences of each option.' },
    { title: 'Executive recommendations', scenario: 'Respond to urgency from the Head Coach or Sporting Director.', outcome: 'Give a clear recommendation while preserving alignment.' },
  ],
  'Academy Director': [
    { title: 'Player development evidence', scenario: 'Describe readiness, consistency and development needs.', outcome: 'Distinguish current performance from long-term potential.' },
    { title: 'Pathway decisions', scenario: 'Recommend exposure, promotion or continued development.', outcome: 'Explain a staged pathway with clear conditions.' },
    { title: 'Stakeholder conversations', scenario: 'Respond to parents, coaches and directors about progression.', outcome: 'Set expectations with empathy, precision and authority.' },
  ],
  'Performance Analyst': [
    { title: 'Patterns and evidence', scenario: 'Identify recurring tactical behaviour across clips or matches.', outcome: 'Describe what happened using specific evidence.' },
    { title: 'Impact and interpretation', scenario: 'Explain why a pattern matters and where the opportunity or risk appears.', outcome: 'Connect data to football consequences without overclaiming.' },
    { title: 'Staff recommendations', scenario: 'Deliver a concise written or spoken point for the coaching staff.', outcome: 'Turn analysis into one clear tactical action.' },
  ],
  'Fitness Coach': [
    { title: 'Load and recovery status', scenario: 'Summarize match demands, recovery markers and readiness.', outcome: 'Explain physical status accurately and concisely.' },
    { title: 'Risk and adjustment', scenario: 'Balance exposure, recovery and recent injury information.', outcome: 'Recommend an adjustment with calibrated risk language.' },
    { title: 'Player and staff communication', scenario: 'Explain monitoring and next steps to different audiences.', outcome: 'Make technical evidence practical and easy to act on.' },
  ],
  Physiotherapist: [
    { title: 'Symptoms and assessment', scenario: 'Describe the mechanism, symptoms and current functional limits.', outcome: 'Give an accurate update without implying an unconfirmed diagnosis.' },
    { title: 'Return-to-play risk', scenario: 'Explain what the player can do and what still limits return.', outcome: 'Communicate uncertainty and risk responsibly.' },
    { title: 'Multidisciplinary updates', scenario: 'Recommend next steps to coaching and performance staff.', outcome: 'Translate medical evidence into a clear football decision.' },
  ],
  'Sports Psychologist': [
    { title: 'Mental-performance status', scenario: 'Describe performance concerns while protecting confidential detail.', outcome: 'Separate relevant performance information from private content.' },
    { title: 'Pressure interventions', scenario: 'Respond to self-doubt, frustration and fear before performance.', outcome: 'Redirect attention toward controllable actions.' },
    { title: 'Staff guidance', scenario: 'Recommend appropriate support without overstating conclusions.', outcome: 'Communicate sensitively with clear professional boundaries.' },
  ],
  Nutritionist: [
    { title: 'Nutrition and recovery status', scenario: 'Summarize intake, appetite, body mass and recovery concerns.', outcome: 'Explain the performance relevance of the available evidence.' },
    { title: 'Practical athlete guidance', scenario: 'Offer realistic alternatives and agree on an achievable plan.', outcome: 'Make technical advice easy to follow under real constraints.' },
    { title: 'Staff updates and monitoring', scenario: 'Explain adjustments, risk and the markers that need follow-up.', outcome: 'Give the staff a concise, responsible recommendation.' },
  ],
}

const FALLBACK_MODULES: RoleModule[] = [
  { title: 'Role communication essentials', scenario: 'Explain routine information, needs and actions in your football role.', outcome: 'Communicate the main message clearly.' },
  { title: 'Professional decisions and feedback', scenario: 'Give reasons, respond to others and recommend a next step.', outcome: 'Connect evidence, reasoning and action.' },
  { title: 'Communication under pressure', scenario: 'Handle uncertainty, disagreement and time pressure.', outcome: 'Maintain clarity and control in demanding situations.' },
]

function collectDimensions(
  writing: DimensionSource,
  speaking: DimensionSource,
): ProfileDimension[] {
  const grouped = new Map<LearningDimension, ProfileDimension>()

  const add = (source: DimensionSource, skill: 'Writing' | 'Speaking') => {
    if (!source) return
    for (const [rawKey, level] of Object.entries(source)) {
      const key = DIMENSION_ALIASES[rawKey]
      if (!key || LEVEL_RANK[level] === undefined) continue
      const current = grouped.get(key) ?? {
        key,
        label: DIMENSION_LABELS[key],
        evidence: [],
        score: 0,
      }
      current.evidence.push({ skill, level })
      current.score = current.evidence.reduce((sum, item) => sum + LEVEL_RANK[item.level], 0) / current.evidence.length
      grouped.set(key, current)
    }
  }

  add(writing, 'Writing')
  add(speaking, 'Speaking')
  return Array.from(grouped.values())
}

function defaultDimensions(): ProfileDimension[] {
  return [
    'language_control_and_range',
    'task_effectiveness',
    'professional_football_communication',
  ].map((key) => ({
    key: key as LearningDimension,
    label: DIMENSION_LABELS[key as LearningDimension],
    evidence: [],
    score: 0,
  }))
}

export function buildCommunicationProfile({
  role,
  level,
  writingDimensions,
  speakingDimensions,
}: {
  role: string
  level: PlacementLevel
  writingDimensions?: DimensionSource
  speakingDimensions?: DimensionSource
}): CommunicationProfile {
  const evidenceDimensions = collectDimensions(writingDimensions, speakingDimensions)
  const dimensions = evidenceDimensions.length > 0 ? evidenceDimensions : defaultDimensions()
  const ranked = [...dimensions].sort((a, b) => a.score - b.score || a.label.localeCompare(b.label))
  const priorities = ranked.slice(0, Math.min(2, ranked.length))
  const priorityKeys = new Set(priorities.map((item) => item.key))
  const strengths = [...ranked]
    .reverse()
    .filter((item) => !priorityKeys.has(item.key))
    .slice(0, 2)
  const levelLanguage = LEVEL_LANGUAGE[level]
  const roleModules = ROLE_MODULES[role] ?? FALLBACK_MODULES

  const modules = roleModules.slice(0, 3).map<LearningModule>((module, index) => {
    const priority = priorities[index % priorities.length]
    return {
      id: `${role.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${level.toLowerCase()}-${index + 1}`,
      order: index + 1,
      title: module.title,
      scenario: module.scenario,
      communicationFocus: priority?.label ?? 'Integrated professional communication',
      grammarFocus: levelLanguage.grammar[index],
      vocabularyFocus: levelLanguage.vocabulary[index],
      outcome: module.outcome,
    }
  })

  return {
    role,
    level,
    levelLabel: levelLanguage.label,
    nextGoal: levelLanguage.nextGoal,
    strengths,
    priorities,
    modules,
  }
}
