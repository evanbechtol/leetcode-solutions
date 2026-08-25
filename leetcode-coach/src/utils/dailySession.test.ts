import { describe, expect, it } from 'vitest'
import { learningTracks } from '../data/tracks'
import { consistencyFor, planDailyTasks } from './dailySession'

const plan = (overrides: Partial<Parameters<typeof planDailyTasks>[0]> = {}) => planDailyTasks({
  localDay: '2026-08-24',
  dailyMinutes: 10,
  selectedTrackIds: ['arrays'],
  tracks: learningTracks,
  completedProblemIds: new Set(),
  completedBeforeTodayIds: new Set(),
  priorSessions: [],
  ...overrides,
})

describe('daily mastery planner', () => {
  it('creates a small deterministic first session from the authored starting track', () => {
    const first = plan()
    const second = plan()

    expect(first).toEqual(second)
    expect(first.map(({ id }) => id)).toEqual(['lesson:arrays-hash-maps', 'problem:1'])
    expect(first.length).toBeLessThanOrEqual(3)
  })

  it('uses an authored prerequisite rather than inferred tags when a selected track needs a foundation', () => {
    const tasks = plan({ selectedTrackIds: ['graphs'] })
    expect(tasks[0].id).toBe('lesson:trees')
    expect(tasks[1].id).toBe('problem:104')
  })

  it('places a due repair before ordinary planned work and never schedules its source problem twice', () => {
    const repair = { id: 'repair:example', kind: 'repair' as const, problemId: 1, lessonSlug: 'arrays-hash-maps', title: 'Practice this concept', description: 'Review one decision.', reason: 'A reviewed repair is due.' }
    const tasks = plan({ dueRepairTasks: [repair] })

    expect(tasks[0].id).toBe('repair:example')
    expect(tasks.filter(({ problemId }) => problemId === 1)).toHaveLength(1)
  })

  it('never adds a fake task once its valid candidate set is exhausted', () => {
    const tasks = plan({
      dailyMinutes: 5,
      completedProblemIds: new Set([1, 121]),
      priorSessions: [{ id: 'old', localDay: '2026-08-23', plannedMinutes: 5, taskIds: ['problem:1'], completedTaskIds: ['problem:1'], status: 'complete' }],
    })
    expect(tasks).toHaveLength(1)
    expect(tasks[0].id).toBe('lesson:arrays-hash-maps')
  })

  it('counts consistency from completed daily tasks and pauses rather than resetting after a gap', () => {
    const consistency = consistencyFor([
      { id: 'a', localDay: '2026-08-20', plannedMinutes: 5, taskIds: ['lesson:arrays-hash-maps'], completedTaskIds: ['lesson:arrays-hash-maps'], status: 'complete' },
      { id: 'b', localDay: '2026-08-22', plannedMinutes: 5, taskIds: ['problem:1'], completedTaskIds: ['problem:1'], status: 'complete' },
      { id: 'c', localDay: '2026-08-23', plannedMinutes: 5, taskIds: ['problem:1'], completedTaskIds: ['problem:1'], status: 'complete' },
    ], '2026-08-24')

    expect(consistency.current).toBe(0)
    expect(consistency.best).toBe(2)
    expect(consistency.lastSevenDays.filter(({ active }) => active)).toHaveLength(3)
  })
})
