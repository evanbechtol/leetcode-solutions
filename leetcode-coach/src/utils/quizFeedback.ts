import type { QuizQuestion } from '../types'
import { questionOptionFeedback } from './questionConfig'

export const incorrectFeedbackFor = (question: QuizQuestion, selectedAnswer: number) =>
  questionOptionFeedback(question)[selectedAnswer] || question.hint

export const shouldRevealCorrectChoice = (submitted: boolean, isCorrect: boolean) => submitted && isCorrect
