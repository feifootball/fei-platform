import {
  type CefrLevel,
  type ProductionEvaluation,
  type ProductionSkill,
  type SpeakingDimension,
  type WritingDimension,
} from './types'
import { isCefrLevel, validateProductionEvaluation } from './production-scoring'

const WRITING_DIMENSIONS: WritingDimension[] = [
  'task_fulfilment',
  'clarity_and_organisation',
  'language_control_and_range',
  'professional_football_communication',
]

const SPEAKING_DIMENSIONS: SpeakingDimension[] = [
  'task_fulfilment_and_professional_relevance',
  'clarity_organisation_and_interactional_effectiveness',
  'language_control_and_range',
  'fluency_and_intelligibility',
  'professional_football_communication',
]

const UNRESOLVED_STATUSES = new Set([
  'insufficient_evidence',
  'technical_unassessable',
  'pending_evaluation',
  'evaluation_error',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function readDimensions<T extends string>(
  value: unknown,
  keys: T[],
): Record<T, CefrLevel> | null {
  if (!isRecord(value)) return null

  const entries = keys.map((key) => [key, value[key]] as const)
  if (entries.some(([, level]) => !isCefrLevel(level))) return null

  return Object.fromEntries(entries) as Record<T, CefrLevel>
}

export interface ParsedEvaluation {
  evaluation: ProductionEvaluation | null
  issues: string[]
}

export function parseProductionEvaluation(
  value: unknown,
  expectedSkill: ProductionSkill,
): ParsedEvaluation {
  if (!isRecord(value)) {
    return { evaluation: null, issues: [`${expectedSkill} must be an object.`] }
  }

  const skill = value.skill
  const status = value.status
  const evaluator = value.evaluator
  const rationale = value.rationale
  const flags = value.flags

  if (skill !== expectedSkill) {
    return { evaluation: null, issues: [`Expected ${expectedSkill} evaluation.`] }
  }
  if (!['human', 'imported_model', 'fixture'].includes(String(evaluator))) {
    return { evaluation: null, issues: [`${expectedSkill} evaluator is invalid.`] }
  }
  if (typeof rationale !== 'string' || !isStringArray(flags)) {
    return { evaluation: null, issues: [`${expectedSkill} metadata is incomplete.`] }
  }

  const metadata = {
    evaluator: evaluator as 'human' | 'imported_model' | 'fixture',
    evaluatorId: typeof value.evaluatorId === 'string' ? value.evaluatorId : undefined,
    evaluatedAt: typeof value.evaluatedAt === 'string' ? value.evaluatedAt : undefined,
    rationale,
    flags,
  }

  if (UNRESOLVED_STATUSES.has(String(status))) {
    const unresolved = {
      ...metadata,
      skill: expectedSkill,
      status: status as 'insufficient_evidence' | 'technical_unassessable' | 'pending_evaluation' | 'evaluation_error',
      overallLevel: null,
      evidenceFloor: null,
      evidenceCeiling: null,
      borderlineAlternative: null,
      confidence: null,
      dimensions: null,
    }

    const evaluation: ProductionEvaluation = expectedSkill === 'speaking'
      ? {
          ...unresolved,
          skill: 'speaking',
          audioStatus: value.audioStatus === 'limited' || value.audioStatus === 'unassessable'
            ? value.audioStatus
            : 'assessable',
        }
      : { ...unresolved, skill: 'writing' }

    return { evaluation, issues: [] }
  }

  if (status !== 'assessed') {
    return { evaluation: null, issues: [`${expectedSkill} status is invalid.`] }
  }

  if (
    !isCefrLevel(value.overallLevel) ||
    !isCefrLevel(value.evidenceFloor) ||
    !isCefrLevel(value.evidenceCeiling) ||
    !['high', 'medium', 'low'].includes(String(value.confidence)) ||
    (value.borderlineAlternative !== null && !isCefrLevel(value.borderlineAlternative))
  ) {
    return { evaluation: null, issues: [`${expectedSkill} assessed levels are invalid.`] }
  }

  const common = {
    ...metadata,
    status: 'assessed' as const,
    overallLevel: value.overallLevel,
    evidenceFloor: value.evidenceFloor,
    evidenceCeiling: value.evidenceCeiling,
    borderlineAlternative: value.borderlineAlternative,
    confidence: value.confidence as 'high' | 'medium' | 'low',
  }

  const evaluation: ProductionEvaluation | null = expectedSkill === 'writing'
    ? (() => {
        const dimensions = readDimensions(value.dimensions, WRITING_DIMENSIONS)
        return dimensions ? { ...common, skill: 'writing', dimensions } : null
      })()
    : (() => {
        const dimensions = readDimensions(value.dimensions, SPEAKING_DIMENSIONS)
        const audioStatus = value.audioStatus
        if (!dimensions || (audioStatus !== 'assessable' && audioStatus !== 'limited')) return null
        return { ...common, skill: 'speaking', dimensions, audioStatus }
      })()

  if (!evaluation) {
    return { evaluation: null, issues: [`${expectedSkill} dimensions are invalid.`] }
  }

  const validation = validateProductionEvaluation(evaluation)
  return validation.valid
    ? { evaluation, issues: [] }
    : { evaluation: null, issues: validation.issues }
}
