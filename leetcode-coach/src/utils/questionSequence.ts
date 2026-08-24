import type { QuizQuestion } from '../types'

const isAlgorithmDependent = (question: QuizQuestion) => question.type !== 'Comprehension' && question.type !== 'Data Structure'

export const hasDataStructureGateBeforeAlgorithms = (questions: QuizQuestion[]) => {
  const dataStructureIndex = questions.findIndex((question) => question.type === 'Data Structure')
  if (dataStructureIndex < 0) return false
  return questions.every((question, index) => !isAlgorithmDependent(question) || index > dataStructureIndex)
}

export const sequenceDataStructureBeforeAlgorithms = (questions: QuizQuestion[]) => {
  const comprehension = questions.filter((question) => question.type === 'Comprehension')
  const dataStructure = questions.filter((question) => question.type === 'Data Structure')
  const algorithmDependent = questions.filter((question) => isAlgorithmDependent(question))
  return [...comprehension, ...dataStructure, ...algorithmDependent]
}
