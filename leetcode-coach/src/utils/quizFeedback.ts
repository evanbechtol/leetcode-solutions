import type { QuizQuestion } from '../types'

export const incorrectFeedbackFor = (question: QuizQuestion, selectedAnswer: number) =>
  question.optionFeedback?.[selectedAnswer] || question.hint

export const shouldRevealCorrectChoice = (submitted: boolean, isCorrect: boolean) => submitted && isCorrect
