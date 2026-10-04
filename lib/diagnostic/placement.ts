import {
  type ObjectiveEvidenceSummary,
  type ObjectiveItemEvidence,
  type PlacementLevel,
  type PlacementOutcome,
  type SpeakingEvaluation,
  type WritingEvaluation,
} from "./types";
import {
  productionPoints,
  validateProductionEvaluation,
} from "./production-scoring";

const PLACEMENT_LEVELS: PlacementLevel[] = ["A2", "B1", "B2", "C1"];
const REQUIRED_CORRECT_PER_LEVEL = 2;
const PRODUCTION_MAX_POINTS = 8;

export function summarizeObjectiveEvidence(
  evidence: ObjectiveItemEvidence[],
): ObjectiveEvidenceSummary {
  return PLACEMENT_LEVELS.reduce<ObjectiveEvidenceSummary>(
    (summary, level) => {
      const levelItems = evidence.filter((item) => item.level === level);
      const correct = levelItems.filter((item) => item.correct).length;
      summary[level] = {
        correct,
        total: levelItems.length,
        thresholdMet: correct >= REQUIRED_CORRECT_PER_LEVEL,
      };
      return summary;
    },
    {
      A2: { correct: 0, total: 0, thresholdMet: false },
      B1: { correct: 0, total: 0, thresholdMet: false },
      B2: { correct: 0, total: 0, thresholdMet: false },
      C1: { correct: 0, total: 0, thresholdMet: false },
    },
  );
}

export function calculatePlacement(
  objectiveEvidence: ObjectiveItemEvidence[],
  writing: WritingEvaluation,
  speaking: SpeakingEvaluation,
): PlacementOutcome {
  const objectiveSummary = summarizeObjectiveEvidence(objectiveEvidence);
  const objectiveCorrect = objectiveEvidence.filter((item) => item.correct).length;
  const common = {
    objectiveEvidence: objectiveSummary,
    objectiveCorrect,
    objectiveTotal: objectiveEvidence.length,
    maxPoints: objectiveEvidence.length + PRODUCTION_MAX_POINTS,
  };

  const writingValidation = validateProductionEvaluation(writing);
  const speakingValidation = validateProductionEvaluation(speaking);

  if (!writingValidation.valid || !speakingValidation.valid) {
    return {
      ...common,
      status: "human_review_required",
      level: null,
      reason: [...writingValidation.issues, ...speakingValidation.issues].join(" "),
      productionPoints: null,
      totalPoints: null,
    };
  }

  if (
    writing.status === "insufficient_evidence" ||
    speaking.status === "insufficient_evidence"
  ) {
    return {
      ...common,
      status: "human_review_required",
      level: null,
      reason: "At least one production task has insufficient evidence.",
      productionPoints: null,
      totalPoints: null,
    };
  }

  if (writing.status !== "assessed" || speaking.status !== "assessed") {
    return {
      ...common,
      status: "pending_production_evaluation",
      level: null,
      reason: "Writing and Speaking must be evaluated before placement is final.",
      productionPoints: null,
      totalPoints: null,
    };
  }

  const productionTotal =
    productionPoints(writing.overallLevel) +
    productionPoints(speaking.overallLevel);
  const totalPoints = objectiveCorrect + productionTotal;

  const passesA2 = objectiveSummary.A2.thresholdMet;
  const passesB1 = passesA2 && objectiveSummary.B1.thresholdMet;
  const passesB2 = passesB1 && objectiveSummary.B2.thresholdMet;
  const passesC1Objectives = passesB2 && objectiveSummary.C1.thresholdMet;
  const hasC1Production =
    writing.overallLevel === "C1" || speaking.overallLevel === "C1";

  let level: PlacementLevel = "A2";
  if (passesC1Objectives && hasC1Production) level = "C1";
  else if (passesB2) level = "B2";
  else if (passesB1) level = "B1";

  return {
    ...common,
    status: "ready",
    level,
    reason:
      level === "C1"
        ? "Objective thresholds and the C1 production gate were met."
        : "Placement follows the highest continuous objective threshold met.",
    productionPoints: productionTotal,
    totalPoints,
  };
}
