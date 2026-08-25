import { describe, expect, it } from 'vitest'
import type { AnswerRecord } from '../types'
import {
  PROGRESS_V1_STORAGE_KEY,
  PROGRESS_V2_STORAGE_KEY,
  compactProgress,
  createAttempt,
  emptyProgressState,
  importProgress,
  loadProgressState,
  localDayFor,
  type ProgressContentIndex,
  type StorageLike,
} from './progress'

const content: ProgressContentIndex = {
  problemTopics: { 1: ['Array', 'Hash Table'], 3: ['String'] },
  knownProblemIds: new Set([1, 3]),
  knownQuestionIds: { 1: new Set(['one']), 3: new Set(['three']) },
}

const storage = (values = new Map<string, string>()): StorageLike & { values: Map<string, string> } => ({
  values,
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: (key) => values.delete(key),
})

const legacyAnswer = (): AnswerRecord => ({
  problemId: 1,
  questionId: 'one',
  questionType: 'Time Complexity',
  correct: true,
  answeredAt: '2026-01-02T12:00:00.000Z',
})

describe('versioned local progress', () => {
  it('migrates V1 answers, completions, and answer streaks without losing the original evidence', () => {
    const values = new Map<string, string>([[PROGRESS_V1_STORAGE_KEY, JSON.stringify({
      answers: [legacyAnswer()],
      results: [{ problemId: 1, completedAt: '2026-01-03T12:00:00.000Z', correct: 4, total: 9 }],
      streak: 3,
      bestStreak: 8,
    })]])

    const loaded = loadProgressState(storage(values), content, new Date('2026-01-04T12:00:00.000Z'))

    expect(loaded.migratedFromV1).toBe(true)
    expect(loaded.recovery).toBeNull()
    expect(loaded.state.attempts).toHaveLength(1)
    expect(loaded.state.attempts[0]).toMatchObject({
      problemId: 1,
      questionId: 'one',
      questionType: 'Complexity',
      questionFormat: 'multiple-choice',
      contentVersion: 'legacy-v1',
      topicKeys: ['Array', 'Hash Table'],
    })
    expect(loaded.state.completedProblems[0]).toMatchObject({ problemId: 1, correct: 4, total: 9, contentVersion: 'legacy-v1' })
    expect(loaded.state.legacyAnswerStreak).toBe(3)
    expect(loaded.state.legacyBestAnswerStreak).toBe(8)
  })

  it('does not overwrite malformed V2 progress and makes the raw recovery payload available', () => {
    const raw = '{not-valid-json'
    const loaded = loadProgressState(storage(new Map([[PROGRESS_V2_STORAGE_KEY, raw]])), content)

    expect(loaded.migratedFromV1).toBe(false)
    expect(loaded.state.attempts).toEqual([])
    expect(loaded.recovery).toEqual({ storageKey: PROGRESS_V2_STORAGE_KEY, raw, reason: 'invalid-v2' })
  })

  it('normalizes additive V2 fields from an earlier local release', () => {
    const earlierV2 = emptyProgressState(new Date('2026-08-24T12:00:00.000Z'))
    delete (earlierV2.learner as Partial<typeof earlierV2.learner>).onboardingDecisionIds
    const loaded = loadProgressState(storage(new Map([[PROGRESS_V2_STORAGE_KEY, JSON.stringify(earlierV2)]])), content)

    expect(loaded.recovery).toBeNull()
    expect(loaded.state.learner.onboardingDecisionIds).toEqual([])
  })

  it('rejects partial and future-version backups without changing the current progress', () => {
    const current = emptyProgressState(new Date('2026-08-24T12:00:00.000Z'))
    current.attempts.push(createAttempt({
      problemId: 1, questionId: 'one', questionType: 'Pattern', questionFormat: 'multiple-choice', correct: true,
      firstAttempt: true, hintLevelReached: 0, contentVersion: 'test', source: 'practice', topicKeys: ['Array'],
    }))

    for (const invalidBackup of [{ version: 2 }, { ...current, version: 3 }]) {
      const result = importProgress(JSON.stringify(invalidBackup), current, content)
      expect(result.state).toBeNull()
      expect(result.error).toContain('valid Pathfinder progress export')
      expect(current.attempts).toHaveLength(1)
    }
  })

  it('compacts expired attempts into topic-aware weekly aggregates while retaining current details and repairs', () => {
    const state = emptyProgressState(new Date('2026-08-24T12:00:00.000Z'))
    state.attempts.push(
      createAttempt({
        problemId: 1, questionId: 'one', questionType: 'Pattern', questionFormat: 'multiple-choice', correct: false,
        firstAttempt: true, hintLevelReached: 0, contentVersion: 'test', source: 'practice', topicKeys: ['Array'],
      }, new Date('2025-01-01T12:00:00.000Z')),
      createAttempt({
        problemId: 3, questionId: 'three', questionType: 'Pattern', questionFormat: 'multiple-choice', correct: true,
        firstAttempt: true, hintLevelReached: 0, contentVersion: 'test', source: 'practice', topicKeys: ['String'],
      }, new Date('2026-08-23T12:00:00.000Z')),
    )
    state.repairs.push({
      id: 'repair-1', misconceptionKey: 'array-complement', conceptKey: 'array', sourceAttemptId: state.attempts[0].id,
      status: 'open', openedAt: '2025-01-01T12:00:00.000Z', nextDueOn: '2025-01-02',
    })

    const compacted = compactProgress(state, new Date('2026-08-24T12:00:00.000Z'))

    expect(compacted.attempts).toHaveLength(1)
    expect(compacted.attempts[0].problemId).toBe(3)
    expect(compacted.weeklyAggregates).toContainEqual(expect.objectContaining({ topicKey: 'Array', total: 1, correct: 0 }))
    expect(compacted.repairs).toEqual(state.repairs)
  })

  it('merges valid exported progress by stable ID but refuses unknown problem completions', () => {
    const current = emptyProgressState(new Date('2026-08-24T12:00:00.000Z'))
    current.learner.dailyMinutes = 5
    const imported = emptyProgressState(new Date('2026-08-24T12:00:00.000Z'))
    imported.learner.dailyMinutes = 15
    imported.attempts.push(createAttempt({
      problemId: 1, questionId: 'one', questionType: 'Pattern', questionFormat: 'multiple-choice', correct: true,
      firstAttempt: true, hintLevelReached: 0, contentVersion: 'test', source: 'practice', topicKeys: ['Array'],
    }))
    imported.completedProblems.push(
      { id: 'known', problemId: 1, completedAt: '2026-08-24T12:00:00.000Z', correct: 4, total: 9, contentVersion: 'test' },
      { id: 'unknown', problemId: 999, completedAt: '2026-08-24T12:00:00.000Z', correct: 4, total: 9, contentVersion: 'test' },
    )

    const merged = importProgress(JSON.stringify(imported), current, content)

    expect(merged.error).toBeNull()
    expect(merged.state?.learner.dailyMinutes).toBe(5)
    expect(merged.state?.attempts).toHaveLength(1)
    expect(merged.state?.completedProblems.map(({ problemId }) => problemId)).toEqual([1])
  })

  it('round-trips learner settings, current attempts, completions, and repairs into a fresh state', () => {
    const source = emptyProgressState(new Date('2026-08-24T12:00:00.000Z'))
    source.learner = {
      ...source.learner,
      onboardingStatus: 'complete',
      experience: 'some-foundations',
      dailyMinutes: 15,
      preferredLanguage: 'Python',
      selectedTrackIds: ['arrays'],
    }
    source.attempts.push(createAttempt({
      problemId: 1, questionId: 'one', questionType: 'Data Structure', questionFormat: 'multiple-choice', correct: true,
      firstAttempt: true, hintLevelReached: 1, contentVersion: 'test', source: 'practice', topicKeys: ['Array'],
    }))
    source.completedProblems.push({ id: 'completion-1', problemId: 1, completedAt: '2026-08-24T12:00:00.000Z', correct: 5, total: 5, contentVersion: 'test' })
    source.repairs.push({ id: 'repair-1', misconceptionKey: 'array-complement', conceptKey: 'array', sourceAttemptId: source.attempts[0].id, status: 'open', openedAt: '2026-08-24T12:00:00.000Z', nextDueOn: '2026-08-25' })

    const restored = importProgress(JSON.stringify(source), emptyProgressState(new Date('2026-08-24T12:00:00.000Z')), content)

    expect(restored.state).toMatchObject({
      learner: { onboardingStatus: 'complete', experience: 'some-foundations', dailyMinutes: 15, preferredLanguage: 'Python', selectedTrackIds: ['arrays'] },
      completedProblems: [{ id: 'completion-1', problemId: 1 }],
      repairs: [{ id: 'repair-1', misconceptionKey: 'array-complement' }],
    })
    expect(restored.state?.attempts).toHaveLength(1)
  })

  it('uses the browser-local calendar day instead of UTC day boundaries', () => {
    const localDate = new Date(2026, 0, 2, 0, 30)
    expect(localDayFor(localDate)).toBe('2026-01-02')
  })
})
