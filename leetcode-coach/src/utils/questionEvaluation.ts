import type { AlgorithmBuilderConfig, CodeConstructionStep } from '../types'

export const evaluateAlgorithmOrder = (config: AlgorithmBuilderConfig, chosenIds: string[]) => {
  const firstMismatch = chosenIds.findIndex((id, index) => id !== config.correctOrder[index])
  const ready = chosenIds.length === config.correctOrder.length
  return {
    ready,
    correct: ready && firstMismatch === -1,
    firstMismatch,
  }
}

export const evaluateSelectedOption = (answer: number, selectedAnswer: number | null) => ({
  ready: selectedAnswer !== null,
  correct: selectedAnswer !== null && selectedAnswer === answer,
})

export const evaluateCodeConstructionChoice = (step: CodeConstructionStep, selectedChoiceId: string | null) => {
  const choice = step.choices.find(({ id }) => id === selectedChoiceId)
  return {
    ready: Boolean(choice),
    correct: choice?.id === step.correctChoiceId,
    feedback: choice?.feedback ?? '',
  }
}
