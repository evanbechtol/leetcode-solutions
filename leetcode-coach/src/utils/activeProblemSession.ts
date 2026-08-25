import type {
  ConfidenceLevel,
  MutationImpactType,
  QuestionInteractionState,
  QuizQuestion,
  StateItemClassification,
} from '../types'
import { questionOptions } from './questionConfig'

export const ACTIVE_PROBLEM_SESSION_KEY = 'pathfinder-active-problem-v1'
export const ACTIVE_PROBLEM_SESSION_VERSION = 2 as const

export interface ActiveProblemSession {
  version: typeof ACTIVE_PROBLEM_SESSION_VERSION
  contentVersion: string
  problemId: number
  questionId: string
  questionIds: string[]
  questionIndex: number
  selectedAnswer: number | null
  submitted: boolean
  answerCorrect: boolean | null
  firstTryCorrect: number
  revealedHintCount: number
  confidence: ConfidenceLevel | null
  attemptedQuestionIds: string[]
  interactionState: QuestionInteractionState | null
  completed: boolean
}

const isIntegerInRange = (value: unknown, minimum: number, maximum: number) =>
  Number.isInteger(value) && Number(value) >= minimum && Number(value) <= maximum
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const uniqueStrings = (value: unknown): string[] | null => Array.isArray(value)
  && value.every((entry) => typeof entry === 'string')
  && new Set(value).size === value.length
  ? [...value]
  : null
const recordEntriesAre = (value: unknown, predicate: (key: string, entry: unknown) => boolean) => isRecord(value)
  && Object.entries(value).every(([key, entry]) => predicate(key, entry))

const validInteractionState = (value: unknown, question: QuizQuestion): QuestionInteractionState | null => {
  if (value === null || value === undefined || !isRecord(value)) return null

  if (question.format === 'multiple-choice' && value.format === 'multiple-choice') {
    const selectedAnswer = value.selectedAnswer
    if (selectedAnswer !== null && !isIntegerInRange(selectedAnswer, 0, question.config.options.length - 1)) return null
    return { format: 'multiple-choice', selectedAnswer: selectedAnswer === null ? null : Number(selectedAnswer) }
  }

  if (question.format === 'algorithm-builder' && value.format === 'algorithm-builder') {
    const chosenIds = uniqueStrings(value.chosenIds)
    const validIds = new Set(question.config.steps.map(({ id }) => id))
    if (!chosenIds || chosenIds.some((id) => !validIds.has(id)) || chosenIds.length > question.config.correctOrder.length) return null
    return { format: 'algorithm-builder', chosenIds }
  }

  if (question.format === 'iteration-visualization' && value.format === 'iteration-visualization') {
    const lastFrame = question.config.frames.length - 1
    if (!isIntegerInRange(value.frameIndex, 0, lastFrame) || !isIntegerInRange(value.furthestFrame, 0, lastFrame)) return null
    if (Number(value.frameIndex) > Number(value.furthestFrame)) return null
    if (value.selectedAnswer !== null && !isIntegerInRange(value.selectedAnswer, 0, question.config.checkpoint.options.length - 1)) return null
    return {
      format: 'iteration-visualization',
      frameIndex: Number(value.frameIndex),
      furthestFrame: Number(value.furthestFrame),
      selectedAnswer: value.selectedAnswer === null ? null : Number(value.selectedAnswer),
    }
  }

  if (question.format === 'code-construction' && value.format === 'code-construction') {
    const completedStepIds = uniqueStrings(value.completedStepIds)
    const steps = question.config.steps
    if (!completedStepIds || completedStepIds.length > steps.length || completedStepIds.some((id, index) => id !== steps[index]?.id)) return null
    const currentStep = steps[completedStepIds.length]
    const validChoiceIds = new Set(currentStep?.choices.map(({ id }) => id) ?? [])
    const validChoice = (id: unknown) => id === null || (typeof id === 'string' && validChoiceIds.has(id))
    if (!validChoice(value.selectedChoiceId) || !validChoice(value.lastCheckedChoiceId)) return null
    return {
      format: 'code-construction',
      completedStepIds,
      selectedChoiceId: value.selectedChoiceId as string | null,
      lastCheckedChoiceId: value.lastCheckedChoiceId as string | null,
    }
  }

  if (question.format === 'constraint-signals' && value.format === 'constraint-signals') {
    const signalIds = new Set(question.config.signals.map(({ id }) => id))
    const consequenceIds = new Set(question.config.consequences.map(({ id }) => id))
    if (!recordEntriesAre(value.mappings, (id, entry) => signalIds.has(id) && (entry === null || (typeof entry === 'string' && consequenceIds.has(entry))))) return null
    return { format: 'constraint-signals', mappings: { ...(value.mappings as Record<string, string | null>) } }
  }

  if (question.format === 'operation-contract' && value.format === 'operation-contract') {
    const selectedOperationIds = uniqueStrings(value.selectedOperationIds)
    const operationIds = new Set(question.config.operationOptions.map(({ id }) => id))
    const structureIds = new Set(question.config.structures.map(({ id }) => id))
    if (!selectedOperationIds || selectedOperationIds.some((id) => !operationIds.has(id))) return null
    if (value.selectedStructureId !== null && (typeof value.selectedStructureId !== 'string' || !structureIds.has(value.selectedStructureId))) return null
    if (typeof value.operationsCommitted !== 'boolean') return null
    return {
      format: 'operation-contract',
      selectedOperationIds,
      selectedStructureId: value.selectedStructureId as string | null,
      operationsCommitted: value.operationsCommitted,
    }
  }

  if (question.format === 'state-sufficiency' && value.format === 'state-sufficiency') {
    const itemIds = new Set(question.config.items.map(({ id }) => id))
    const classifications = new Set<StateItemClassification>(['required', 'optional-redundant', 'discardable'])
    if (!recordEntriesAre(value.classifications, (id, entry) => itemIds.has(id) && classifications.has(entry as StateItemClassification))) return null
    return { format: 'state-sufficiency', classifications: { ...(value.classifications as Record<string, StateItemClassification>) } }
  }

  if (question.format === 'near-twin' && value.format === 'near-twin') {
    const relationshipIds = new Set(question.config.relationshipOptions.map(({ id }) => id))
    const factIds = new Set(question.config.facts.map(({ id }) => id))
    const reasonIds = uniqueStrings(value.reasonIds)
    if (value.relationshipId !== null && (typeof value.relationshipId !== 'string' || !relationshipIds.has(value.relationshipId))) return null
    if (!reasonIds || reasonIds.some((id) => !factIds.has(id))) return null
    return { format: 'near-twin', relationshipId: value.relationshipId as string | null, reasonIds }
  }

  if (question.format === 'constraint-mutation' && value.format === 'constraint-mutation') {
    const aspectIds = new Set(question.config.aspects.map(({ id }) => id))
    const impactTypes = new Set<MutationImpactType>(['unchanged', 'modified', 'new', 'invalidated'])
    if (!recordEntriesAre(value.impacts, (id, entry) => aspectIds.has(id) && impactTypes.has(entry as MutationImpactType))) return null
    return { format: 'constraint-mutation', impacts: { ...(value.impacts as Record<string, MutationImpactType>) } }
  }

  if (question.format === 'structural-analogy' && value.format === 'structural-analogy') {
    const roleIds = new Set(question.config.roles.map(({ id }) => id))
    const choiceAIds = new Set(question.config.choicesA.map(({ id }) => id))
    const choiceBIds = new Set(question.config.choicesB.map(({ id }) => id))
    if (!recordEntriesAre(value.mappings, (id, entry) => isRecord(entry)
      && roleIds.has(id)
      && typeof entry.problemAChoiceId === 'string'
      && typeof entry.problemBChoiceId === 'string'
      && (entry.problemAChoiceId === '' || choiceAIds.has(entry.problemAChoiceId))
      && (entry.problemBChoiceId === '' || choiceBIds.has(entry.problemBChoiceId)))) return null
    return {
      format: 'structural-analogy',
      mappings: structuredClone(value.mappings) as Record<string, { problemAChoiceId: string; problemBChoiceId: string }>,
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
    const value = JSON.parse(raw) as Record<string, unknown>
    if (![1, ACTIVE_PROBLEM_SESSION_VERSION].includes(value.version as number) || value.problemId !== problemId) return null
    if (!isIntegerInRange(value.questionIndex, 0, questions.length - 1)) return null
    const questionIndex = Number(value.questionIndex)
    const question = questions[questionIndex]
    if (value.questionId !== question.id) return null
    const options = questionOptions(question)
    if (value.selectedAnswer !== null && !isIntegerInRange(value.selectedAnswer, 0, options.length - 1)) return null
    if (typeof value.submitted !== 'boolean' || (value.answerCorrect !== null && typeof value.answerCorrect !== 'boolean')) return null
    if (value.submitted !== (typeof value.answerCorrect === 'boolean')) return null
    if (!isIntegerInRange(value.firstTryCorrect, 0, questions.length)) return null
    if (!isIntegerInRange(value.revealedHintCount, 0, question.hintLevels?.length ?? 0)) return null
    if (value.confidence !== undefined && value.confidence !== null && !['low', 'medium', 'high'].includes(value.confidence as string)) return null
    const attemptedQuestionIds = uniqueStrings(value.attemptedQuestionIds)
    if (!attemptedQuestionIds || typeof value.completed !== 'boolean' || (value.completed && questionIndex !== questions.length - 1)) return null
    const questionIds = value.version === ACTIVE_PROBLEM_SESSION_VERSION ? uniqueStrings(value.questionIds) : questions.map(({ id }) => id)
    if (!questionIds || questionIds.length !== questions.length || questionIds.some((id, index) => id !== questions[index]?.id)) return null

    return {
      version: ACTIVE_PROBLEM_SESSION_VERSION,
      contentVersion: typeof value.contentVersion === 'string' ? value.contentVersion : 'legacy-active-v1',
      problemId,
      questionId: question.id,
      questionIds,
      questionIndex,
      selectedAnswer: value.selectedAnswer === null ? null : Number(value.selectedAnswer),
      submitted: value.submitted,
      answerCorrect: value.answerCorrect as boolean | null,
      firstTryCorrect: Number(value.firstTryCorrect),
      revealedHintCount: Number(value.revealedHintCount),
      confidence: value.confidence === undefined ? null : value.confidence as ConfidenceLevel | null,
      attemptedQuestionIds,
      interactionState: validInteractionState(value.interactionState, question),
      completed: value.completed,
    }
  } catch {
    return null
  }
}

export const questionPathFromActiveSession = (raw: string | null, problemId: number, candidates: QuizQuestion[]) => {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as Record<string, unknown>
    if (value.version !== ACTIVE_PROBLEM_SESSION_VERSION || value.problemId !== problemId) return null
    const questionIds = uniqueStrings(value.questionIds)
    if (!questionIds?.length) return null
    const byId = new Map(candidates.map((question) => [question.id, question]))
    const restored = questionIds.map((id) => byId.get(id))
    return restored.every((question): question is QuizQuestion => Boolean(question)) ? restored : null
  } catch {
    return null
  }
}
