import type { DailyMinutes, DailySessionRecord } from '../stores/progress'
import type { LearningTrack } from '../data/tracks'

export type DailyTaskKind = 'lesson' | 'problem' | 'repair' | 'trace' | 'retrieval'

export interface DailyTask {
  id: string
  kind: DailyTaskKind
  title: string
  description: string
  reason: string
  lessonSlug?: string
  problemId?: number
}

export interface DailyPlanningInput {
  localDay: string
  dailyMinutes: DailyMinutes
  selectedTrackIds: string[]
  tracks: LearningTrack[]
  completedProblemIds: Set<number>
  completedBeforeTodayIds: Set<number>
  priorSessions: DailySessionRecord[]
  dueRepairTasks?: DailyTask[]
  excludedTaskIds?: string[]
}

const taskLimit = (minutes: DailyMinutes) => minutes === 5 ? 2 : minutes === 10 ? 3 : 4
const lessonTask = (track: LearningTrack): DailyTask => ({
  id: `lesson:${track.lessonSlugs[0]}`,
  kind: 'lesson',
  lessonSlug: track.lessonSlugs[0],
  title: `Learn: ${track.title}`,
  description: 'Build the mental model before asking the implementation to make sense.',
  reason: `This is the authored foundation for your ${track.title} track.`,
})
const problemTask = (problemId: number, track: LearningTrack, transfer = false): DailyTask => ({
  id: `${transfer ? 'transfer' : 'problem'}:${problemId}`,
  kind: 'problem',
  problemId,
  title: transfer ? `Transfer: ${track.title}` : `Guided practice: ${track.title}`,
  description: transfer ? 'Use the same idea in a different reviewed problem.' : 'Practice the foundation in a guided decision path.',
  reason: transfer ? 'You have completed the entry problem, so this checks whether the idea transfers.' : `This is the authored entry problem for ${track.title}.`,
})
const retrievalTask = (problemId: number): DailyTask => ({
  id: `retrieval:${problemId}`,
  kind: 'retrieval',
  problemId,
  title: 'Retrieval check',
  description: 'Return to a completed problem after a day away and recall the key decisions.',
  reason: 'Short delayed recall helps distinguish recognition from durable learning.',
})

export const taskForId = (taskId: string, tracks: LearningTrack[]): DailyTask | null => {
  const [kind, rawId] = taskId.split(':')
  if (kind === 'lesson') {
    const track = tracks.find((candidate) => candidate.lessonSlugs.includes(rawId))
    return track ? lessonTask(track) : null
  }
  const problemId = Number(rawId)
  if (!Number.isInteger(problemId)) return null
  const track = tracks.find((candidate) => candidate.representativeProblemIds.includes(problemId) || candidate.entryProblemId === problemId)
  if (!track) return null
  if (kind === 'retrieval') return retrievalTask(problemId)
  if (kind === 'problem') return problemTask(problemId, track)
  if (kind === 'transfer') return problemTask(problemId, track, true)
  return null
}

export const planDailyTasks = (input: DailyPlanningInput): DailyTask[] => {
  const excluded = new Set(input.excludedTaskIds)
  const selected = input.tracks.filter((track) => input.selectedTrackIds.includes(track.id))
  const primary = selected[0] ?? input.tracks.find((track) => track.id === 'arrays') ?? input.tracks[0]
  if (!primary) return []

  const prerequisite = primary.prerequisiteTrackIds
    .map((id) => input.tracks.find((track) => track.id === id))
    .find((track) => track && !input.completedProblemIds.has(track.entryProblemId))
  const track = prerequisite ?? primary
  const candidates = [track.entryProblemId, ...track.representativeProblemIds]
  const nextProblemId = candidates.find((id) => !input.completedProblemIds.has(id))
  const transferProblemId = candidates.find((id) => id !== nextProblemId && input.completedProblemIds.has(id) === false)
  const retrievalProblemId = [...input.completedBeforeTodayIds].find((id) => !candidates.includes(id) || id !== nextProblemId)
  const hasPreviousSession = input.priorSessions.some((session) => session.completedTaskIds.length > 0)

  const proposed: DailyTask[] = []
  const firstDueRepair = input.dueRepairTasks?.find((task) => !excluded.has(task.id))
  if (firstDueRepair) proposed.push(firstDueRepair)
  if (!hasPreviousSession) proposed.push(lessonTask(track))
  if (nextProblemId !== undefined) proposed.push(problemTask(nextProblemId, track))
  if (input.dailyMinutes === 15 && transferProblemId !== undefined && input.completedProblemIds.has(track.entryProblemId)) {
    proposed.push(problemTask(transferProblemId, track, true))
  }
  if (input.dailyMinutes >= 10 && retrievalProblemId !== undefined) proposed.push(retrievalTask(retrievalProblemId))
  if (!proposed.length) proposed.push(lessonTask(track))

  const scheduledProblemIds = new Set<number>()
  return proposed.filter((task) => {
    if (excluded.has(task.id)) return false
    if (task.problemId === undefined) return true
    if (scheduledProblemIds.has(task.problemId)) return false
    scheduledProblemIds.add(task.problemId)
    return true
  }).slice(0, taskLimit(input.dailyMinutes))
}

export const consistencyFor = (sessions: DailySessionRecord[], today: string) => {
  const activeDays = new Set(sessions.filter((session) => session.completedTaskIds.length > 0).map(({ localDay }) => localDay))
  const asDate = (value: string) => new Date(`${value}T12:00:00`)
  const shifted = (date: Date, days: number) => {
    const next = new Date(date)
    next.setDate(next.getDate() + days)
    return next.toISOString().slice(0, 10)
  }
  let current = 0
  for (let offset = 0; offset < 3650; offset += 1) {
    const day = shifted(asDate(today), -offset)
    if (!activeDays.has(day)) break
    current += 1
  }
  const ordered = [...activeDays].sort()
  let best = 0
  let run = 0
  let previous: string | null = null
  for (const day of ordered) {
    run = previous && shifted(asDate(previous), 1) === day ? run + 1 : 1
    best = Math.max(best, run)
    previous = day
  }
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const day = shifted(asDate(today), index - 6)
    return { day, active: activeDays.has(day) }
  })
  return { current, best, lastSevenDays }
}
