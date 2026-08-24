import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AnswerRecord } from '../types'
import { ACTIVE_PROBLEM_SESSION_KEY } from '../utils/activeProblemSession'
import { normalizeAnswerRecord, QUESTION_FORMATS, QUESTION_TYPES, useTrainerStore } from './trainer'

const legacy = (questionType: AnswerRecord['questionType']): AnswerRecord => ({
  problemId: 1, questionId: 'legacy', questionType, correct: true, answeredAt: '2026-01-01T00:00:00.000Z',
})

describe('progress compatibility', () => {
  it('reports the seven approved reasoning groups', () => {
    expect(QUESTION_TYPES).toEqual(['Comprehension', 'Pattern', 'Data Structure', 'Invariant', 'Algorithm', 'Correctness', 'Complexity'])
  })

  it('tracks recognition, construction, and visualization separately', () => {
    expect(QUESTION_FORMATS.map(({ format }) => format)).toEqual(['multiple-choice', 'algorithm-builder', 'code-construction'])
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
    firstStore.selectedAnswer = firstStore.currentQuestion!.answer
    expect(firstStore.submitAnswer()).toBe(true)
    await nextTick()

    setActivePinia(createPinia())
    const reloadedStore = useTrainerStore()
    expect(reloadedStore.startProblem(1)).toBe(true)
    expect(reloadedStore.currentQuestionIndex).toBe(2)
    expect(reloadedStore.selectedAnswer).toBe(reloadedStore.currentQuestion!.answer)
    expect(reloadedStore.submitted).toBe(true)
    expect(reloadedStore.answerCorrect).toBe(true)
    expect(reloadedStore.firstTryCorrect).toBe(1)
  })

  it('restores unfinished algorithm-builder choices', async () => {
    const firstStore = useTrainerStore()
    firstStore.startProblem(121)
    const builderIndex = firstStore.activeQuestions.findIndex(({ format }) => format === 'algorithm-builder')
    firstStore.currentQuestionIndex = builderIndex
    const chosenIds = firstStore.currentQuestion!.builder!.correctOrder.slice(0, 2)
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
    const construction = firstStore.currentQuestion!.construction!
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
    const construction = store.activeQuestions.find(({ format }) => format === 'code-construction')!.construction!
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
})
