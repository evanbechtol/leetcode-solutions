import { describe, expect, it } from 'vitest'
import type { AnswerRecord } from '../types'
import { normalizeAnswerRecord, QUESTION_FORMATS, QUESTION_TYPES } from './trainer'

const legacy = (questionType: AnswerRecord['questionType']): AnswerRecord => ({
  problemId: 1, questionId: 'legacy', questionType, correct: true, answeredAt: '2026-01-01T00:00:00.000Z',
})

describe('progress compatibility', () => {
  it('reports the seven approved reasoning groups', () => {
    expect(QUESTION_TYPES).toEqual(['Comprehension', 'Pattern', 'Data Structure', 'Invariant', 'Algorithm', 'Correctness', 'Complexity'])
  })

  it('tracks recognition, construction, and visualization separately', () => {
    expect(QUESTION_FORMATS.map(({ format }) => format)).toEqual(['multiple-choice', 'algorithm-builder', 'iteration-visualization'])
  })

  it('migrates both legacy complexity categories without losing the record', () => {
    expect(normalizeAnswerRecord(legacy('Time Complexity')).questionType).toBe('Complexity')
    expect(normalizeAnswerRecord(legacy('Space Complexity')).questionType).toBe('Complexity')
    expect(normalizeAnswerRecord(legacy('Pattern'))).toEqual({ ...legacy('Pattern'), questionFormat: 'multiple-choice' })
  })
})
