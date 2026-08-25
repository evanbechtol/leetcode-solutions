import { describe, expect, it } from 'vitest'
import { createProductEvent, emptyProgressState } from '../stores/progress'
import {
  FEEDBACK_DRAFT_STORAGE_KEY,
  diagnosticSummaryFor,
  formatFeedbackReport,
  loadFeedbackDraft,
  parseFeedbackDraft,
  saveFeedbackDraft,
} from './publicFeedback'

const memoryStorage = () => {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    values,
  }
}

describe('local-first public feedback', () => {
  it('saves and validates only the local message draft', () => {
    const storage = memoryStorage()
    saveFeedbackDraft('A focused report', storage)
    expect(loadFeedbackDraft(storage).message).toBe('A focused report')
    expect(JSON.parse(storage.values.get(FEEDBACK_DRAFT_STORAGE_KEY)!)).toEqual({ version: 1, message: 'A focused report' })
    expect(parseFeedbackDraft('{"version":99,"message":"stale"}').message).toBe('')
  })

  it('builds aggregate diagnostics without answers, confidence, dates, or event properties', () => {
    const state = emptyProgressState(new Date('2026-08-25T12:00:00.000Z'))
    state.attempts.push({
      id: 'private-attempt', occurredAt: '2026-08-25T12:00:00.000Z', localDay: '2026-08-25', problemId: 1,
      questionId: 'private-question', questionType: 'Invariant', questionFormat: 'multiple-choice', correct: false,
      firstAttempt: true, hintLevelReached: 0, confidence: 'high', reasoningSkillKeys: [], instructionalLevel: 'complete',
      diagnosticKeys: ['private-error'], evidence: { selectedText: 'private-answer' }, contentVersion: 'test', source: 'practice', topicKeys: ['private-topic'],
    })
    state.localEvents.push(createProductEvent('answer_submitted', { problemId: 1, correct: false }, new Date('2026-08-25T12:01:00.000Z')))

    const serialized = JSON.stringify(diagnosticSummaryFor(state, 136))
    expect(serialized).toContain('"attemptCount":1')
    expect(serialized).toContain('"answer_submitted":1')
    expect(serialized).not.toContain('private-attempt')
    expect(serialized).not.toContain('private-question')
    expect(serialized).not.toContain('private-error')
    expect(serialized).not.toContain('private-answer')
    expect(serialized).not.toContain('confidence')
    expect(serialized).not.toContain('occurredAt')
    expect(serialized).not.toContain('problemId')
  })

  it('includes diagnostics only after explicit opt-in by the caller', () => {
    const base = { message: 'The button needs a clearer name.', route: '/today', appVersion: '0.1.0' }
    expect(formatFeedbackReport(base)).not.toContain('Optional diagnostic summary')
    expect(formatFeedbackReport({ ...base, diagnostics: diagnosticSummaryFor(emptyProgressState(), 136) })).toContain('Optional diagnostic summary')
  })
})
