import type { AttemptRecord } from '../stores/progress'
import type { QuizQuestion, ReasoningSkillKey } from '../types'

export const CALIBRATION_EVIDENCE_THRESHOLD = 5

export const REASONING_SKILL_LABELS: Record<ReasoningSkillKey, string> = {
  'constraint-signal': 'Constraint signals',
  'runtime-feasibility': 'Runtime feasibility',
  'operation-requirement': 'Required operations',
  'state-sufficiency': 'State sufficiency',
  'safe-discard': 'Safe forgetting',
  'pattern-boundary': 'Pattern boundaries',
  'counterfactual-transfer': 'Constraint adaptation',
  'structural-analogy': 'Structural analogy',
  'representation-generation': 'State representation',
  'derivation-completion': 'Algorithm derivation',
  monotonicity: 'Monotonic reasoning',
  'greedy-safety': 'Greedy safety',
  'worst-case-construction': 'Worst-case reasoning',
  'behavioral-pattern-recognition': 'Behavioral patterns',
  'proof-structure': 'Correctness proofs',
}

const PROMPT_STAGE_PRIORITY = {
  'data-structure': ['data-structure'],
  correctness: ['correctness', 'invariant'],
  complexity: ['time-complexity', 'space-complexity'],
} as const

export const confidencePromptQuestionIdsFor = (questions: QuizQuestion[]) => {
  const questionIds = new Set<string>()
  for (const stages of Object.values(PROMPT_STAGE_PRIORITY)) {
    const question = stages
      .map((stage) => questions.find((candidate) => candidate.stage === stage))
      .find((candidate) => candidate !== undefined)
    if (question) questionIds.add(question.id)
  }
  return questionIds
}

export type CalibrationInsightKind =
  | 'insufficient-evidence'
  | 'aligned-confidence'
  | 'correct-but-unsure'
  | 'high-confidence-errors'
  | 'uncertain-errors'
  | 'mixed-signal'

export interface CalibrationInsight {
  skill: ReasoningSkillKey
  label: string
  kind: CalibrationInsightKind
  evidenceCount: number
  title: string
  summary: string
  nextAction: string
}

const insightFor = (skill: ReasoningSkillKey, attempts: AttemptRecord[]): CalibrationInsight => {
  const label = REASONING_SKILL_LABELS[skill]
  const correct = attempts.filter((attempt) => attempt.correct).length
  const correctHigh = attempts.filter((attempt) => attempt.correct && attempt.confidence === 'high').length
  const correctLow = attempts.filter((attempt) => attempt.correct && attempt.confidence === 'low').length
  const incorrectHigh = attempts.filter((attempt) => !attempt.correct && attempt.confidence === 'high').length
  const incorrectLow = attempts.filter((attempt) => !attempt.correct && attempt.confidence === 'low').length
  const base = { skill, label, evidenceCount: attempts.length }

  if (attempts.length < CALIBRATION_EVIDENCE_THRESHOLD) {
    return {
      ...base,
      kind: 'insufficient-evidence',
      title: 'Still learning your signal',
      summary: `Pathfinder needs ${CALIBRATION_EVIDENCE_THRESHOLD - attempts.length} more confidence ${CALIBRATION_EVIDENCE_THRESHOLD - attempts.length === 1 ? 'check' : 'checks'} for ${label.toLocaleLowerCase()}.`,
      nextAction: 'Keep practicing normally; confidence is optional and never changes your score.',
    }
  }
  if (incorrectHigh >= 2) {
    return {
      ...base,
      kind: 'high-confidence-errors',
      title: 'A confident miss is ready for review',
      summary: `Some ${label.toLocaleLowerCase()} decisions felt settled but did not preserve the reviewed reasoning.`,
      nextAction: 'Open the related Error Atlas repair before the next retrieval check.',
    }
  }
  if (correctLow >= 2 && correct / attempts.length >= 0.6) {
    return {
      ...base,
      kind: 'correct-but-unsure',
      title: 'You are often right even when unsure',
      summary: `Your ${label.toLocaleLowerCase()} decisions are landing more often than your confidence suggests.`,
      nextAction: 'Use a short retrieval check to make the reasoning easier to recall.',
    }
  }
  if (correct >= 4 && correctHigh >= 3) {
    return {
      ...base,
      kind: 'aligned-confidence',
      title: 'Your confidence matches consistent success',
      summary: `You are usually accurate and confident with ${label.toLocaleLowerCase()}.`,
      nextAction: 'Try a transfer problem that uses the same reasoning in a different setting.',
    }
  }
  if (incorrectLow >= 2 && correct / attempts.length < 0.6) {
    return {
      ...base,
      kind: 'uncertain-errors',
      title: 'Your uncertainty is pointing to a useful review',
      summary: `${label} decisions often feel uncertain and are not yet consistent.`,
      nextAction: 'Revisit the reviewed lesson, then retry one focused decision.',
    }
  }
  return {
    ...base,
    kind: 'mixed-signal',
    title: 'Your signal is still settling',
    summary: `${label} confidence and correctness vary across recent decisions.`,
    nextAction: 'Add one delayed retrieval check before drawing a stronger conclusion.',
  }
}

const INSIGHT_PRIORITY: Record<CalibrationInsightKind, number> = {
  'high-confidence-errors': 0,
  'correct-but-unsure': 1,
  'uncertain-errors': 2,
  'aligned-confidence': 3,
  'mixed-signal': 4,
  'insufficient-evidence': 5,
}

export const calibrationInsightsFor = (attempts: AttemptRecord[]): CalibrationInsight[] => {
  const eligible = attempts.filter((attempt) => attempt.firstAttempt && attempt.confidence !== undefined)
  const bySkill = new Map<ReasoningSkillKey, AttemptRecord[]>()
  for (const attempt of eligible) {
    for (const skill of attempt.reasoningSkillKeys) {
      const records = bySkill.get(skill) ?? []
      records.push(attempt)
      bySkill.set(skill, records)
    }
  }
  return [...bySkill.entries()]
    .map(([skill, records]) => insightFor(skill, records))
    .sort((left, right) => INSIGHT_PRIORITY[left.kind] - INSIGHT_PRIORITY[right.kind]
      || right.evidenceCount - left.evidenceCount
      || left.label.localeCompare(right.label))
}
