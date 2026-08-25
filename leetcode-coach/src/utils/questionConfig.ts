import type { MisconceptionLink, MultipleChoiceConfig, QuizQuestion } from '../types'

export const multipleChoiceConfigFor = (question: QuizQuestion): MultipleChoiceConfig | null => {
  if (question.format === 'multiple-choice') return question.config
  if (question.format === 'iteration-visualization') return question.config.checkpoint
  return null
}

export const questionOptions = (question: QuizQuestion | null | undefined) => question ? multipleChoiceConfigFor(question)?.options ?? [] : []
export const questionAnswer = (question: QuizQuestion | null | undefined) => question ? multipleChoiceConfigFor(question)?.answer ?? -1 : -1
export const questionOptionFeedback = (question: QuizQuestion | null | undefined) => question ? multipleChoiceConfigFor(question)?.optionFeedback ?? [] : []
export const questionMisconceptionLinks = (question: QuizQuestion | null | undefined): Array<MisconceptionLink | undefined> => question
  ? multipleChoiceConfigFor(question)?.misconceptionLinks ?? []
  : []
