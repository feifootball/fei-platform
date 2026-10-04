export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;

export type CefrLevel = (typeof CEFR_LEVELS)[number];
export type PlacementLevel = Exclude<CefrLevel, "A1">;
export type ProductionSkill = "writing" | "speaking";
export type EvaluationConfidence = "high" | "medium" | "low";

export type WritingDimension =
  | "task_fulfilment"
  | "clarity_and_organisation"
  | "language_control_and_range"
  | "professional_football_communication";

export type SpeakingDimension =
  | "task_fulfilment_and_professional_relevance"
  | "clarity_organisation_and_interactional_effectiveness"
  | "language_control_and_range"
  | "fluency_and_intelligibility"
  | "professional_football_communication";

export type ProductionEvaluationStatus =
  | "assessed"
  | "insufficient_evidence"
  | "technical_unassessable"
  | "pending_evaluation"
  | "evaluation_error";

interface EvaluationMetadata {
  evaluator: "human" | "imported_model" | "fixture";
  evaluatorId?: string;
  evaluatedAt?: string;
  rationale: string;
  flags: string[];
}

interface AssessedEvaluationBase extends EvaluationMetadata {
  status: "assessed";
  overallLevel: CefrLevel;
  evidenceFloor: CefrLevel;
  evidenceCeiling: CefrLevel;
  borderlineAlternative: CefrLevel | null;
  confidence: EvaluationConfidence;
}

interface UnresolvedEvaluationBase extends EvaluationMetadata {
  status: Exclude<ProductionEvaluationStatus, "assessed">;
  overallLevel: null;
  evidenceFloor: null;
  evidenceCeiling: null;
  borderlineAlternative: null;
  confidence: null;
  dimensions: null;
}

export type WritingEvaluation =
  | (AssessedEvaluationBase & {
      skill: "writing";
      dimensions: Record<WritingDimension, CefrLevel>;
    })
  | (UnresolvedEvaluationBase & { skill: "writing" });

export type SpeakingEvaluation =
  | (AssessedEvaluationBase & {
      skill: "speaking";
      dimensions: Record<SpeakingDimension, CefrLevel>;
      audioStatus: "assessable" | "limited";
    })
  | (UnresolvedEvaluationBase & {
      skill: "speaking";
      audioStatus: "assessable" | "limited" | "unassessable";
    });

export type ProductionEvaluation = WritingEvaluation | SpeakingEvaluation;

export interface ObjectiveItemEvidence {
  itemId: string;
  level: PlacementLevel;
  section: "reading" | "listening" | "vocabulary";
  correct: boolean;
}

export interface ObjectiveLevelEvidence {
  correct: number;
  total: number;
  thresholdMet: boolean;
}

export interface ObjectiveEvidenceSummary {
  A2: ObjectiveLevelEvidence;
  B1: ObjectiveLevelEvidence;
  B2: ObjectiveLevelEvidence;
  C1: ObjectiveLevelEvidence;
}

export type PlacementStatus =
  | "ready"
  | "pending_production_evaluation"
  | "human_review_required";

export interface PlacementOutcome {
  status: PlacementStatus;
  level: PlacementLevel | null;
  reason: string;
  objectiveEvidence: ObjectiveEvidenceSummary;
  objectiveCorrect: number;
  objectiveTotal: number;
  productionPoints: number | null;
  totalPoints: number | null;
  maxPoints: number;
}
