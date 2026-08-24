import { describe, expect, it } from 'vitest'
import { problems } from '../problems'
import { compileQuestionPath } from './compiler'
import { DEEP_PROBLEM_IDS, problemTeachingFacts } from './problemFacts'
import { validateCoachingContent } from './validation'

describe('deterministic coaching catalog', () => {
  it('covers all 134 dataset problems plus two curated-only problems', () => {
    expect(Object.keys(problemTeachingFacts)).toHaveLength(136)
    expect(validateCoachingContent(problems)).toEqual([])
  })

  it('builds eight baseline stages and twelve deep stages', () => {
    for (const problem of problems) {
      expect(problem.questions).toHaveLength(DEEP_PROBLEM_IDS.has(problem.id) ? 12 : 8)
    }
    expect(DEEP_PROBLEM_IDS).toHaveLength(30)
  })

  it('produces stable paths with shuffled, aligned feedback', () => {
    for (const problem of problems) {
      const first = compileQuestionPath(problem, problems)
      const second = compileQuestionPath(problem, problems)
      expect(first).toEqual(second)
      for (const question of first) {
        expect(new Set(question.options)).toHaveLength(4)
        expect(question.optionFeedback).toHaveLength(4)
        expect(question.optionFeedback?.[question.answer]).toBe(question.explanation)
      }
    }
  })
})
