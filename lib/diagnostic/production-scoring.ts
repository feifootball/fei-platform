import {
  CEFR_LEVELS,
  type CefrLevel,
  type ProductionEvaluation,
  type ProductionSkill,
} from "./types";

const LEVEL_RANK: Record<CefrLevel, number> = {
  A1: 0,
  A2: 1,
  B1: 2,
  B2: 3,
  C1: 4,
};

export interface EvaluationValidation {
  valid: boolean;
  issues: string[];
}

export function productionPoints(level: CefrLevel): number {
  return LEVEL_RANK[level];
}

export function areAdjacentLevels(
  first: CefrLevel,
  second: CefrLevel,
): boolean {
  return Math.abs(LEVEL_RANK[first] - LEVEL_RANK[second]) === 1;
}

export function validateProductionEvaluation(
  evaluation: ProductionEvaluation,
): EvaluationValidation {
  const issues: string[] = [];

  if (evaluation.status !== "assessed") {
    if (evaluation.overallLevel !== null) {
      issues.push("An unresolved evaluation cannot contain an overall level.");
    }
    return { valid: issues.length === 0, issues };
  }

  const floorRank = LEVEL_RANK[evaluation.evidenceFloor];
  const overallRank = LEVEL_RANK[evaluation.overallLevel];
  const ceilingRank = LEVEL_RANK[evaluation.evidenceCeiling];

  if (floorRank > overallRank || overallRank > ceilingRank) {
    issues.push("Evidence floor, overall level, and ceiling are out of order.");
  }

  if (
    evaluation.borderlineAlternative !== null &&
    !areAdjacentLevels(evaluation.overallLevel, evaluation.borderlineAlternative)
  ) {
    issues.push("A borderline alternative must be adjacent to the overall level.");
  }

  const languageControl = evaluation.dimensions.language_control_and_range;
  if (overallRank > LEVEL_RANK[languageControl]) {
    issues.push("Overall level cannot exceed Language Control & Range.");
  }

  if (evaluation.skill === "writing" && evaluation.overallLevel === "C1") {
    const taskFulfilment = evaluation.dimensions.task_fulfilment;
    const professionalCommunication =
      evaluation.dimensions.professional_football_communication;
    const hasRequiredC1Evidence =
      taskFulfilment === "C1" || professionalCommunication === "C1";
    const hasDimensionBelowB2 = Object.values(evaluation.dimensions).some(
      (level) => LEVEL_RANK[level] < LEVEL_RANK.B2,
    );

    if (languageControl !== "C1") {
      issues.push("Writing C1 requires Language Control & Range at C1.");
    }
    if (!hasRequiredC1Evidence) {
      issues.push("Writing C1 requires Task Fulfilment or PFC at C1.");
    }
    if (hasDimensionBelowB2) {
      issues.push("Writing C1 cannot contain a dimension below B2.");
    }
  }

  return { valid: issues.length === 0, issues };
}

export function createPendingEvaluation(
  skill: ProductionSkill,
  rationale: string,
): ProductionEvaluation {
  const common = {
    status: "pending_evaluation" as const,
    overallLevel: null,
    evidenceFloor: null,
    evidenceCeiling: null,
    borderlineAlternative: null,
    confidence: null,
    dimensions: null,
    evaluator: "human" as const,
    rationale,
    flags: [],
  };

  if (skill === "writing") {
    return { ...common, skill };
  }

  return { ...common, skill, audioStatus: "assessable" };
}

export function isCefrLevel(value: unknown): value is CefrLevel {
  return CEFR_LEVELS.includes(value as CefrLevel);
}
