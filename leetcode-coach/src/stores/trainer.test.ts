import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AnswerRecord } from '../types'
import { ACTIVE_PROBLEM_SESSION_KEY } from '../utils/activeProblemSession'
import { onboardingDecisions } from '../data/onboarding'
import { categoryRepairLink } from '../data/repairMetadata'
import { problems } from '../data/problems'
import { PROGRESS_V1_STORAGE_KEY, PROGRESS_V2_STORAGE_KEY } from './progress'
import { normalizeAnswerRecord, QUESTION_FORMATS, QUESTION_TYPES, useTrainerStore } from './trainer'
import { questionAnswer } from '../utils/questionConfig'
import { evaluateConstraintSignals } from '../utils/questionEvaluation'

const moveToMultipleChoice = (store: ReturnType<typeof useTrainerStore>, stage?: string) => {
  const index = store.activeQuestions.findIndex((question) => question.format === 'multiple-choice' && (!stage || question.stage === stage))
  store.currentQuestionIndex = index
  const question = store.currentQuestion
  if (!question || question.format !== 'multiple-choice') throw new Error('Expected multiple-choice question')
  return question
}

const legacy = (questionType: AnswerRecord['questionType']): AnswerRecord => ({
  problemId: 1, questionId: 'legacy', questionType, correct: true, answeredAt: '2026-01-01T00:00:00.000Z',
})

describe('progress compatibility', () => {
  it('reports the seven approved reasoning groups', () => {
    expect(QUESTION_TYPES).toEqual(['Comprehension', 'Pattern', 'Data Structure', 'Invariant', 'Algorithm', 'Correctness', 'Complexity'])
  })

  it('tracks recognition, construction, and visualization separately', () => {
    expect(QUESTION_FORMATS.map(({ format }) => format)).toEqual([
      'multiple-choice', 'algorithm-builder', 'code-construction', 'constraint-signals', 'operation-contract',
      'state-sufficiency', 'near-twin', 'constraint-mutation', 'structural-analogy',
    ])
  })

  it('migrates both legacy complexity categories without losing the record', () => {
    expect(normalizeAnswerRecord(legacy('Time Complexity')).questionType).toBe('Complexity')
    expect(normalizeAnswerRecord(legacy('Space Complexity')).questionType).toBe('Complexity')
    expect(normalizeAnswerRecord(legacy('Pattern'))).toEqual({ ...legacy('Pattern'), questionFormat: 'multiple-choice' })
  })
})

describe('active problem persistence', () => {
  const values = new Map<string, string>()
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
  }

  beforeEach(() => {
    values.clear()
    vi.stubGlobal('localStorage', storage)
    setActivePinia(createPinia())
  })

  afterEach(() => vi.unstubAllGlobals())

  it('restores the same question and submitted answer after a reload', async () => {
    const firstStore = useTrainerStore()
    expect(firstStore.startProblem(1)).toBe(true)
    firstStore.currentQuestionIndex = 2
    firstStore.selectedAnswer = questionAnswer(firstStore.currentQuestion)
    expect(firstStore.submitAnswer()).toBe(true)
    await nextTick()

    setActivePinia(createPinia())
    const reloadedStore = useTrainerStore()
    expect(reloadedStore.startProblem(1)).toBe(true)
    expect(reloadedStore.currentQuestionIndex).toBe(2)
    expect(reloadedStore.selectedAnswer).toBe(questionAnswer(reloadedStore.currentQuestion))
    expect(reloadedStore.submitted).toBe(true)
    expect(reloadedStore.answerCorrect).toBe(true)
    expect(reloadedStore.firstTryCorrect).toBe(1)
  })

  it('restores unfinished algorithm-builder choices', async () => {
    const firstStore = useTrainerStore()
    firstStore.startProblem(121)
    const builderIndex = firstStore.activeQuestions.findIndex(({ format }) => format === 'algorithm-builder')
    firstStore.currentQuestionIndex = builderIndex
    const builderQuestion = firstStore.currentQuestion
    if (!builderQuestion || builderQuestion.format !== 'algorithm-builder') throw new Error('Expected builder')
    const chosenIds = builderQuestion.config.correctOrder.slice(0, 2)
    firstStore.setInteractionState({ format: 'algorithm-builder', chosenIds })
    await nextTick()

    setActivePinia(createPinia())
    const reloadedStore = useTrainerStore()
    reloadedStore.startProblem(121)
    expect(reloadedStore.currentQuestionIndex).toBe(builderIndex)
    expect(reloadedStore.interactionState).toEqual({ format: 'algorithm-builder', chosenIds })
  })

  it('restores retained code-construction decisions and the current choice', async () => {
    const firstStore = useTrainerStore()
    firstStore.startProblem(1)
    const constructionIndex = firstStore.activeQuestions.findIndex(({ format }) => format === 'code-construction')
    firstStore.currentQuestionIndex = constructionIndex
    const constructionQuestion = firstStore.currentQuestion
    if (!constructionQuestion || constructionQuestion.format !== 'code-construction') throw new Error('Expected construction')
    const construction = constructionQuestion.config
    const completedStepIds = construction.steps.slice(0, 2).map(({ id }) => id)
    const selectedChoiceId = construction.steps[2].choices[1].id
    firstStore.setInteractionState({ format: 'code-construction', completedStepIds, selectedChoiceId, lastCheckedChoiceId: selectedChoiceId })
    await nextTick()

    setActivePinia(createPinia())
    const reloadedStore = useTrainerStore()
    reloadedStore.startProblem(1)
    expect(reloadedStore.currentQuestionIndex).toBe(constructionIndex)
    expect(reloadedStore.interactionState).toEqual({ format: 'code-construction', completedStepIds, selectedChoiceId, lastCheckedChoiceId: selectedChoiceId })
  })

  it('clears only the current construction choice on retry', () => {
    const store = useTrainerStore()
    store.startProblem(1)
    const constructionQuestion = store.activeQuestions.find(({ format }) => format === 'code-construction')
    if (!constructionQuestion || constructionQuestion.format !== 'code-construction') throw new Error('Expected construction')
    const construction = constructionQuestion.config
    const completedStepIds = construction.steps.slice(0, 2).map(({ id }) => id)
    store.setInteractionState({ format: 'code-construction', completedStepIds, selectedChoiceId: 'wrong-line', lastCheckedChoiceId: 'wrong-line' })

    store.tryAgain()

    expect(store.interactionState).toEqual({ format: 'code-construction', completedStepIds, selectedChoiceId: null, lastCheckedChoiceId: null })
  })

  it('removes the active session when the problem is cleared', async () => {
    const store = useTrainerStore()
    store.startProblem(1)
    await nextTick()
    expect(values.has(ACTIVE_PROBLEM_SESSION_KEY)).toBe(true)

    store.clearCurrentProblem()
    await nextTick()
    expect(values.has(ACTIVE_PROBLEM_SESSION_KEY)).toBe(false)
  })

  it('migrates the existing V1 payload into V2 before practice continues', () => {
    values.set(PROGRESS_V1_STORAGE_KEY, JSON.stringify({
      answers: [legacy('Pattern')],
      results: [{ problemId: 1, completedAt: '2026-01-01T00:00:00.000Z', correct: 3, total: 9 }],
      streak: 2,
      bestStreak: 5,
    }))

    const store = useTrainerStore()

    expect(store.answers).toHaveLength(1)
    expect(store.results).toHaveLength(1)
    expect(store.streak).toBe(2)
    expect(store.bestStreak).toBe(5)
    expect(store.progressState.repairs).toEqual([])
    expect(values.has(PROGRESS_V1_STORAGE_KEY)).toBe(false)
    expect(JSON.parse(values.get(PROGRESS_V2_STORAGE_KEY) || '{}').version).toBe(2)
  })

  it('records the selected option, hint use, topic evidence, and reviewed content version in V2 attempts', () => {
    const store = useTrainerStore()
    store.startProblem(1)
    store.revealNextHint()
    const question = moveToMultipleChoice(store)
    store.selectedAnswer = question.config.answer

    expect(store.submitAnswer()).toBe(true)

    expect(store.progressState.attempts).toHaveLength(1)
    expect(store.progressState.attempts[0]).toMatchObject({
      problemId: 1,
      selectedOptionIndex: question.config.answer,
      hintLevelReached: 1,
      firstAttempt: true,
      source: 'practice',
      topicKeys: ['Array', 'Hash Table'],
      contentVersion: '2026-08-25-intuition-v1',
    })
  })

  it('records structured reasoning evidence and confidence for a Wave 1 interaction', () => {
    const store = useTrainerStore()
    store.startProblem(1)
    const question = store.currentQuestion
    if (!question || question.format !== 'constraint-signals') throw new Error('Expected constraint signals')
    const mappings = Object.fromEntries(question.config.signals.map((signal) => [signal.id, signal.consequenceIds[0] ?? null]))
    const evaluation = evaluateConstraintSignals(question.config, mappings)
    store.confidence = 'high'

    expect(store.submitInteraction({
      ...evaluation,
      firstAttempt: true,
      hintLevelReached: 0,
      feedback: question.explanation,
      state: { format: 'constraint-signals', mappings },
    })).toBe(true)
    expect(store.progressState.attempts.at(-1)).toMatchObject({
      questionFormat: 'constraint-signals',
      reasoningSkillKeys: ['constraint-signal'],
      confidence: 'high',
      diagnosticKeys: [],
      evidence: { decisiveSignalsFound: expect.arrayContaining(['return-indices', 'different-elements']) },
    })
  })

  it('exports and imports V2 progress without duplicating stable attempt IDs', () => {
    const store = useTrainerStore()
    store.startProblem(1)
    const question = moveToMultipleChoice(store)
    store.selectedAnswer = question.config.answer
    store.submitAnswer()
    const exported = store.exportProgressData()

    expect(store.importProgressData(exported)).toEqual({ ok: true, error: null })
    expect(store.progressState.attempts).toHaveLength(1)
  })

  it('persists an in-progress onboarding decision so a refresh can resume it', () => {
    const store = useTrainerStore()
    store.beginOnboarding({ experience: 'new-to-dsa', dailyMinutes: 5, preferredLanguage: 'Python', selectedTrackIds: ['arrays'] })
    const firstDecision = onboardingDecisions[0]
    store.recordOnboardingAnswer(firstDecision.problem.id, firstDecision.question, questionAnswer(firstDecision.question))
    store.advanceOnboardingDecision(firstDecision.question.id)

    expect(store.progressState.learner).toMatchObject({
      onboardingStatus: 'in-progress',
      dailyMinutes: 5,
      preferredLanguage: 'Python',
      selectedTrackIds: ['arrays'],
      onboardingDecisionIds: [firstDecision.question.id],
    })
    expect(store.progressState.attempts.at(-1)).toMatchObject({
      source: 'onboarding',
      questionId: firstDecision.question.id,
      correct: true,
    })
  })

  it('creates, resumes, and completes a local daily session without changing the answer streak', () => {
    const store = useTrainerStore()
    store.updateLearnerProfile({ selectedTrackIds: ['arrays'], dailyMinutes: 5 })
    const session = store.ensureTodaySession()
    const originalStreak = store.streak

    expect(session.taskIds).toEqual(['lesson:arrays-hash-maps', 'problem:1'])
    expect(store.ensureTodaySession().id).toBe(session.id)
    expect(store.completeDailyTask(session.taskIds[0])).toBe(true)
    expect(store.streak).toBe(originalStreak)
    expect(store.todaySession?.status).toBe('in-progress')
    expect(store.completeDailyTask(session.taskIds[1])).toBe(true)
    expect(store.todaySession?.status).toBe('complete')
    expect(store.practiceConsistency.current).toBe(1)
  })

  it('opens a safe repair after an incorrect reviewed decision and moves it through the daily review lifecycle', () => {
    const store = useTrainerStore()
    store.startProblem(1)
    const sourceQuestion = moveToMultipleChoice(store)
    const wrongOption = (sourceQuestion.config.answer + 1) % sourceQuestion.config.options.length
    store.selectedAnswer = wrongOption

    expect(store.submitAnswer()).toBe(false)
    expect(store.repairCards).toHaveLength(1)
    expect(store.repairCards[0]).toMatchObject({ label: 'Practice this concept', status: 'open', sourceProblemId: 1 })

    const session = store.ensureTodaySession()
    const repairTask = session.taskIds.find((id) => id.startsWith('repair:'))!
    expect(store.beginDailyTask(repairTask)).toBe(true)
    expect(store.repairCards[0].status).toBe('scheduled')
    expect(store.completeDailyTask(repairTask)).toBe(true)
    expect(store.repairCards[0].status).toBe('revisited')

    expect(store.snoozeRepair(store.repairCards[0].id)).toBe(true)
    expect(store.repairCards[0].snoozed).toBe(true)

    store.tryAgain()
    store.selectedAnswer = wrongOption
    expect(store.submitAnswer()).toBe(false)
    expect(store.repairCards[0]).toMatchObject({ status: 'open', snoozed: false, repeatCount: 2 })
  })

  it('validates a revisited repair only after a first-try, different-day transfer decision', () => {
    const store = useTrainerStore()
    store.startProblem(1)
    const sourceQuestion = moveToMultipleChoice(store)
    store.selectedAnswer = (sourceQuestion.config.answer + 1) % sourceQuestion.config.options.length
    store.submitAnswer()
    const repair = store.progressState.repairs[0]
    const source = store.progressState.attempts.find(({ id }) => id === repair.sourceAttemptId)!
    source.localDay = '2026-08-23'
    source.occurredAt = '2026-08-23T12:00:00.000Z'
    repair.status = 'revisited'

    const session = store.ensureTodaySession()
    session.taskIds = [`repair-retrieval:${repair.id}:121`]
    session.completedTaskIds = []
    session.status = 'planned'
    store.startProblem(121)
    expect(store.todayTasks[0]).toMatchObject({ id: `repair-retrieval:${repair.id}:121`, problemId: 121 })
    const transferQuestion = moveToMultipleChoice(store, sourceQuestion.stage)
    expect(transferQuestion.stage).toBe(sourceQuestion.stage)
    expect(repair.misconceptionKey).toBe(categoryRepairLink(problems.find(({ id }) => id === 1)!, sourceQuestion.stage).key)
    expect(categoryRepairLink(problems.find(({ id }) => id === 121)!, transferQuestion.stage).key).toBe(repair.misconceptionKey)
    store.selectedAnswer = transferQuestion.config.answer

    expect(store.submitAnswer()).toBe(true)
    expect(store.progressState.attempts.at(-1)?.source).toBe('daily-session')
    expect(store.progressState.repairs[0]).toMatchObject({ status: 'validated', validatedAt: expect.any(String) })
  })
})
