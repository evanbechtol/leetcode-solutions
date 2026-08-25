import { describe, expect, it } from 'vitest'
import { learningTracks } from '../data/tracks'
import { problems } from '../data/problems'
import { createAttempt, createCompletion, emptyProgressState } from '../stores/progress'
import { earnedMilestonesFor, practiceStatusFor, trackMapsFor } from './learningMap'

const perfectRun = (state: ReturnType<typeof emptyProgressState>, problemId: number, day: string) => {
  const attemptTime = new Date(`${day}T10:00:00.000Z`)
  state.attempts.push(createAttempt({
    problemId, questionId: `question-${day}`, questionType: 'Pattern', questionFormat: 'multiple-choice', correct: true,
    firstAttempt: true, hintLevelReached: 0, contentVersion: 'test', source: 'practice', topicKeys: [],
  }, attemptTime))
  state.completedProblems.push(createCompletion({ problemId, correct: 1, total: 1, contentVersion: 'test' }, new Date(`${day}T10:05:00.000Z`)))
}

describe('learning map evidence', () => {
  it('moves practice from learning to practiced and requires two perfect distinct days for stable', () => {
    const state = emptyProgressState(new Date('2026-08-20T12:00:00.000Z'))
    state.attempts.push(createAttempt({ problemId: 1, questionId: 'started', questionType: 'Pattern', questionFormat: 'multiple-choice', correct: false, firstAttempt: true, hintLevelReached: 0, contentVersion: 'test', source: 'practice', topicKeys: [] }, new Date('2026-08-20T10:00:00.000Z')))
    expect(practiceStatusFor(1, state)).toBe('learning')

    state.attempts = []
    perfectRun(state, 1, '2026-08-20')
    expect(practiceStatusFor(1, state)).toBe('practiced')
    perfectRun(state, 1, '2026-08-21')
    expect(practiceStatusFor(1, state)).toBe('stable')
  })

  it('does not count hints, retries, or two completions on one day as stable', () => {
    const state = emptyProgressState()
    perfectRun(state, 1, '2026-08-20')
    perfectRun(state, 1, '2026-08-20')
    expect(practiceStatusFor(1, state)).toBe('practiced')

    state.attempts.push(createAttempt({ problemId: 1, questionId: 'hinted', questionType: 'Pattern', questionFormat: 'multiple-choice', correct: true, firstAttempt: true, hintLevelReached: 1, contentVersion: 'test', source: 'practice', topicKeys: [] }, new Date('2026-08-21T10:00:00.000Z')))
    state.completedProblems.push(createCompletion({ problemId: 1, correct: 1, total: 1, contentVersion: 'test' }, new Date('2026-08-21T10:05:00.000Z')))
    expect(practiceStatusFor(1, state)).toBe('practiced')
  })

  it('uses authored lessons and problems and reserves complete-set for the track capstone', () => {
    const state = emptyProgressState()
    state.learner.openedLessonSlugs.push('arrays-hash-maps')
    const arrayProblemIds = problems.filter((problem) => problem.topics.includes('Array')).map(({ id }) => id)
    for (const problemId of arrayProblemIds) state.completedProblems.push(createCompletion({ problemId, correct: 1, total: 1, contentVersion: 'test' }))
    const arrays = trackMapsFor(state, learningTracks, problems).find(({ track }) => track.id === 'arrays')!

    expect(arrays.completeSet).toBe(true)
    expect(arrays.status).toBe('complete-set')
    expect(arrays.nodes.every(({ status }) => status !== ('complete-set' as typeof status))).toBe(true)
    expect(arrays.nodes.every(({ to }) => to.startsWith('/learn/') || to.startsWith('/problems/'))).toBe(true)
  })

  it('creates only display-safe, deterministic milestone summaries', () => {
    const state = emptyProgressState()
    state.repairs.push({ id: 'repair-1', misconceptionKey: 'private-error', conceptKey: 'private-concept', sourceAttemptId: 'a', status: 'validated', openedAt: '2026-08-20T00:00:00.000Z', nextDueOn: '2026-08-21', validatedAt: '2026-08-22T00:00:00.000Z' })
    const milestones = earnedMilestonesFor(state, trackMapsFor(state, learningTracks, problems), 7)
    expect(milestones.map(({ key }) => key)).toEqual(['repair:repair-1', 'consistency:7'])
    expect(JSON.stringify(milestones)).not.toContain('private-error')
    expect(JSON.stringify(milestones)).not.toContain('private-concept')
  })
})
