import { describe, expect, it } from 'vitest'
import quizViewSource from '../views/QuizView.vue?raw'
import type { QuizQuestion } from '../types'
import { incorrectFeedbackFor, shouldRevealCorrectChoice } from './quizFeedback'

const sample: QuizQuestion = {
  id: '1:static-v1:pattern', type: 'Pattern', format: 'multiple-choice', prompt: 'Prompt',
  explanation: 'Correct explanation', hint: 'Leading hint', reasoningSkillKeys: ['behavioral-pattern-recognition'], instructionalLevel: 'complete', contentVersion: 'test',
  config: { options: ['A', 'B', 'C', 'D'], answer: 2, optionFeedback: ['A misses', 'B misses', 'Correct explanation', 'D misses'], misconceptionLinks: [undefined, undefined, undefined, undefined] },
}

describe('quiz feedback disclosure', () => {
  it('uses feedback for the selected wrong option', () => {
    expect(incorrectFeedbackFor(sample, 1)).toBe('B misses')
  })

  it('does not reveal the correct choice after a wrong submission', () => {
    expect(shouldRevealCorrectChoice(true, false)).toBe(false)
    expect(shouldRevealCorrectChoice(true, true)).toBe(true)
  })

  it('uses a bounded single-column completion layout on narrow screens', () => {
    expect(quizViewSource).toContain("'quiz-layout-complete': sessionComplete")
    expect(quizViewSource).toContain('class="completion-actions mt-7"')
  })
})
