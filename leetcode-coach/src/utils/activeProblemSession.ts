import type { QuestionInteractionState, QuizQuestion } from '../types'

export const ACTIVE_PROBLEM_SESSION_KEY = 'pathfinder-active-problem-v1'

export interface ActiveProblemSession {
  version: 1
  problemId: number
  questionId: string
  questionIndex: number
  selectedAnswer: number | null
  submitted: boolean
  answerCorrect: boolean | null
  firstTryCorrect: number
  revealedHintCount: number
  attemptedQuestionIds: string[]
  interactionState: QuestionInteractionState | null
  completed: boolean
}

const isIntegerInRange = (value: unknown, minimum: number, maximum: number) =>
  Number.isInteger(value) && Number(value) >= minimum && Number(value) <= maximum

const validInteractionState = (value: unknown, question: QuizQuestion): QuestionInteractionState | null => {
  if (value === null || value === undefined) return null
  if (!value || typeof value !== 'object') return null
  const state = value as Partial<QuestionInteractionState>

  if (question.format === 'algorithm-builder' && state.format === 'algorithm-builder') {
    const chosenIds = (state as { chosenIds?: unknown }).chosenIds
    const validIds = new Set(question.builder?.steps.map(({ id }) => id) ?? [])
    if (!Array.isArray(chosenIds) || chosenIds.some((id) => typeof id !== 'string' || !validIds.has(id))) return null
    if (new Set(chosenIds).size !== chosenIds.length || chosenIds.length > (question.builder?.correctOrder.length ?? 0)) return null
    return { format: 'algorithm-builder', chosenIds: [...chosenIds] }
  }

  if (question.format === 'iteration-visualization' && state.format === 'iteration-visualization') {
    const candidate = state as { frameIndex?: unknown; furthestFrame?: unknown; selectedAnswer?: unknown }
    const lastFrame = (question.visualization?.frames.length ?? 0) - 1
    if (!isIntegerInRange(candidate.frameIndex, 0, lastFrame) || !isIntegerInRange(candidate.furthestFrame, 0, lastFrame)) return null
    if (Number(candidate.frameIndex) > Number(candidate.furthestFrame)) return null
    if (candidate.selectedAnswer !== null && !isIntegerInRange(candidate.selectedAnswer, 0, question.options.length - 1)) return null
    return {
      format: 'iteration-visualization',
      frameIndex: Number(candidate.frameIndex),
      furthestFrame: Number(candidate.furthestFrame),
      selectedAnswer: candidate.selectedAnswer === null ? null : Number(candidate.selectedAnswer),
    }
  }

  if (question.format === 'code-construction' && state.format === 'code-construction') {
    const candidate = state as { completedStepIds?: unknown; selectedChoiceId?: unknown; lastCheckedChoiceId?: unknown }
    const steps = question.construction?.steps ?? []
    if (!Array.isArray(candidate.completedStepIds) || candidate.completedStepIds.some((id) => typeof id !== 'string')) return null
    const completedStepIds = candidate.completedStepIds as string[]
    if (completedStepIds.length > steps.length || completedStepIds.some((id, index) => id !== steps[index]?.id)) return null
    const currentStep = steps[completedStepIds.length]
    const validChoiceIds = new Set(currentStep?.choices.map(({ id }) => id) ?? [])
    const validChoice = (id: unknown) => id === null || (typeof id === 'string' && validChoiceIds.has(id))
    if (!validChoice(candidate.selectedChoiceId) || !validChoice(candidate.lastCheckedChoiceId)) return null
    return {
      format: 'code-construction',
      completedStepIds: [...completedStepIds],
      selectedChoiceId: candidate.selectedChoiceId as string | null,
      lastCheckedChoiceId: candidate.lastCheckedChoiceId as string | null,
    }
  }

  return null
}

export const parseActiveProblemSession = (
  raw: string | null,
  problemId: number,
  questions: QuizQuestion[],
): ActiveProblemSession | null => {
  if (!raw || !questions.length) return null
  try {
    const value = JSON.parse(raw) as Partial<ActiveProblemSession>
    if (value.version !== 1 || value.problemId !== problemId) return null
    if (!isIntegerInRange(value.questionIndex, 0, questions.length - 1)) return null
    const questionIndex = Number(value.questionIndex)
    const question = questions[questionIndex]
    if (value.questionId !== question.id) return null
    if (value.selectedAnswer !== null && !isIntegerInRange(value.selectedAnswer, 0, question.options.length - 1)) return null
    if (typeof value.submitted !== 'boolean' || (value.answerCorrect !== null && typeof value.answerCorrect !== 'boolean')) return null
    if (value.submitted !== (typeof value.answerCorrect === 'boolean')) return null
    if (!isIntegerInRange(value.firstTryCorrect, 0, questions.length)) return null
    if (!isIntegerInRange(value.revealedHintCount, 0, question.hintLevels?.length ?? 0)) return null
    if (!Array.isArray(value.attemptedQuestionIds) || value.attemptedQuestionIds.some((id) => typeof id !== 'string')) return null
    if (typeof value.completed !== 'boolean' || (value.completed && questionIndex !== questions.length - 1)) return null

    return {
      version: 1,
      problemId,
      questionId: question.id,
      questionIndex,
      selectedAnswer: value.selectedAnswer === null ? null : Number(value.selectedAnswer),
      submitted: value.submitted,
      answerCorrect: value.answerCorrect,
      firstTryCorrect: Number(value.firstTryCorrect),
      revealedHintCount: Number(value.revealedHintCount),
      attemptedQuestionIds: [...new Set(value.attemptedQuestionIds)],
      interactionState: validInteractionState(value.interactionState, question),
      completed: value.completed,
    }
  } catch {
    return null
  }
}
