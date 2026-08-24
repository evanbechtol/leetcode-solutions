import { describe, expect, it } from 'vitest'
import type { QuizQuestion } from '../types'
import { incorrectFeedbackFor, shouldRevealCorrectChoice } from './quizFeedback'

const sample: QuizQuestion = {
  id: '1:static-v1:pattern', type: 'Pattern', prompt: 'Prompt', options: ['A', 'B', 'C', 'D'], answer: 2,
  explanation: 'Correct explanation', hint: 'Leading hint', optionFeedback: ['A misses', 'B misses', 'Correct explanation', 'D misses'],
}

describe('quiz feedback disclosure', () => {
  it('uses feedback for the selected wrong option', () => {
    expect(incorrectFeedbackFor(sample, 1)).toBe('B misses')
  })

  it('does not reveal the correct choice after a wrong submission', () => {
    expect(shouldRevealCorrectChoice(true, false)).toBe(false)
    expect(shouldRevealCorrectChoice(true, true)).toBe(true)
  })
})
