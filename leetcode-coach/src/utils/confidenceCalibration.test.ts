import { describe, expect, it } from 'vitest'
import type { AttemptRecord } from '../stores/progress'
import type { ConfidenceLevel, QuestionStage, QuizQuestion } from '../types'
import {
  CALIBRATION_EVIDENCE_THRESHOLD,
  calibrationInsightsFor,
  confidencePromptQuestionIdsFor,
} from './confidenceCalibration'

let attemptIndex = 0
const attempt = (correct: boolean, confidence?: ConfidenceLevel, firstAttempt = true): AttemptRecord => ({
  id: `attempt-${attemptIndex++}`,
  occurredAt: '2026-08-25T12:00:00.000Z',
  localDay: '2026-08-25',
  problemId: 1,
  questionId: 'confidence-fixture',
  questionType: 'Correctness',
  questionFormat: 'multiple-choice',
  stage: 'correctness',
  correct,
  firstAttempt,
  hintLevelReached: 0,
  confidence,
  reasoningSkillKeys: ['proof-structure'],
  instructionalLevel: 'retrieve',
  diagnosticKeys: [],
  evidence: {},
  contentVersion: 'test-v1',
  source: 'practice',
  topicKeys: ['Array'],
})

const question = (id: string, stage: QuestionStage) => ({ id, stage } as QuizQuestion)
const repeated = (count: number, correct: boolean, confidence?: ConfidenceLevel) => Array.from(
  { length: count },
  () => attempt(correct, confidence),
)

describe('confidence prompt selection', () => {
  it('selects at most one data-structure, correctness, and complexity checkpoint', () => {
    const selected = confidencePromptQuestionIdsFor([
      question('data', 'data-structure'),
      question('invariant', 'invariant'),
      question('correctness', 'correctness'),
      question('time', 'time-complexity'),
      question('space', 'space-complexity'),
    ])

    expect([...selected]).toEqual(['data', 'correctness', 'time'])
  })

  it('uses invariant and space complexity only as deterministic fallbacks', () => {
    expect([...confidencePromptQuestionIdsFor([
      question('invariant', 'invariant'),
      question('space', 'space-complexity'),
    ])]).toEqual(['invariant', 'space'])
  })
})

describe('confidence calibration', () => {
  it('recognizes correct high-confidence evidence as aligned', () => {
    expect(calibrationInsightsFor(repeated(5, true, 'high'))[0].kind).toBe('aligned-confidence')
  })

  it('turns correct low-confidence evidence into a retrieval recommendation', () => {
    expect(calibrationInsightsFor(repeated(5, true, 'low'))[0].kind).toBe('correct-but-unsure')
  })

  it('prioritizes repeated incorrect high-confidence evidence for repair', () => {
    expect(calibrationInsightsFor(repeated(5, false, 'high'))[0].kind).toBe('high-confidence-errors')
  })

  it('turns incorrect low-confidence evidence into a reviewed-lesson recommendation', () => {
    expect(calibrationInsightsFor(repeated(5, false, 'low'))[0].kind).toBe('uncertain-errors')
  })

  it('ignores skipped confidence checks and retry attempts', () => {
    expect(calibrationInsightsFor([
      ...repeated(5, true),
      ...Array.from({ length: 5 }, () => attempt(true, 'high', false)),
    ])).toEqual([])
  })

  it('shows an insufficient-evidence state before five eligible attempts', () => {
    const insight = calibrationInsightsFor(repeated(CALIBRATION_EVIDENCE_THRESHOLD - 1, true, 'high'))[0]
    expect(insight).toMatchObject({ kind: 'insufficient-evidence', evidenceCount: 4, title: 'Still learning your signal' })
  })
})
