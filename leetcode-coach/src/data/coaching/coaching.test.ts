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

  it('builds ten baseline stages and thirteen deep stages', () => {
    for (const problem of problems) {
      expect(problem.questions).toHaveLength(DEEP_PROBLEM_IDS.has(problem.id) ? 13 : 10)
      expect(problem.questions[4].format).toBe('iteration-visualization')
      expect(problem.questions.filter(({ format }) => format === 'algorithm-builder')).toHaveLength(1)
      expect(problem.questions.filter(({ format }) => format === 'iteration-visualization')).toHaveLength(1)
    }
    expect(DEEP_PROBLEM_IDS).toHaveLength(30)
  })

  it('produces stable paths with shuffled, aligned feedback', () => {
    for (const problem of problems) {
      const first = compileQuestionPath(problem, problems)
      const second = compileQuestionPath(problem, problems)
      expect(first).toEqual(second)
      for (const question of first) {
        if (question.format === 'algorithm-builder') {
          expect(new Set(question.builder?.steps.map(({ id }) => id))).toHaveLength(6)
          expect(question.builder?.correctOrder).toHaveLength(4)
        } else {
          expect(new Set(question.options)).toHaveLength(4)
          expect(question.optionFeedback).toHaveLength(4)
          expect(question.optionFeedback?.[question.answer]).toBe(question.explanation)
        }
      }
    }
  })
})
