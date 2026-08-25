import type { LearningTrack } from '../data/tracks'
import type { Problem } from '../types'
import type { AttemptRecord, ProblemCompletion, ProgressStateV2 } from '../stores/progress'

export type LearningMapStatus = 'not-started' | 'learning' | 'practiced' | 'stable' | 'complete-set'
export type LearningMapNodeKind = 'lesson' | 'entry-practice' | 'reinforce-transfer'

export interface LearningMapNode {
  id: string
  kind: LearningMapNodeKind
  title: string
  description: string
  status: Exclude<LearningMapStatus, 'complete-set'>
  to: string
  lessonSlug?: string
  problemId?: number
}

export interface LearningTrackMap {
  track: LearningTrack
  status: LearningMapStatus
  nodes: LearningMapNode[]
  completeSet: boolean
  completedCatalogProblems: number
  catalogProblemCount: number
  nextNode: LearningMapNode | null
}

const perfectCompletionDays = (problemId: number, completions: ProblemCompletion[], attempts: AttemptRecord[]) => {
  const ordered = completions.filter((item) => item.problemId === problemId).sort((left, right) => left.completedAt.localeCompare(right.completedAt))
  const days = new Set<string>()
  let previousCompletionAt = ''
  for (const completion of ordered) {
    const relevant = attempts.filter((attempt) => attempt.problemId === problemId
      && attempt.occurredAt > previousCompletionAt
      && attempt.occurredAt <= completion.completedAt)
    const correctFirstAttempts = relevant.filter((attempt) => attempt.firstAttempt && attempt.correct && attempt.hintLevelReached === 0)
    if (completion.total > 0 && completion.correct === completion.total && correctFirstAttempts.length >= completion.total && relevant.length) {
      days.add(relevant.at(-1)!.localDay)
    }
    previousCompletionAt = completion.completedAt
  }
  return days
}

export const practiceStatusFor = (problemId: number, state: ProgressStateV2): Exclude<LearningMapStatus, 'complete-set'> => {
  if (state.milestones.some(({ key }) => key.startsWith('stable:') && key.endsWith(`:${problemId}`))) return 'stable'
  const attempts = state.attempts.filter((attempt) => attempt.problemId === problemId)
  const completions = state.completedProblems.filter((completion) => completion.problemId === problemId)
  if (perfectCompletionDays(problemId, completions, attempts).size >= 2) return 'stable'
  if (completions.length) return 'practiced'
  if (attempts.length || state.localEvents.some((event) => event.name === 'problem_started' && event.properties?.problemId === problemId)) return 'learning'
  return 'not-started'
}

export const trackMapsFor = (
  state: ProgressStateV2,
  tracks: LearningTrack[],
  problems: Problem[],
): LearningTrackMap[] => tracks.map((track) => {
  const lessonNodes: LearningMapNode[] = track.lessonSlugs.map((lessonSlug, index) => ({
    id: `${track.id}:lesson:${lessonSlug}`,
    kind: 'lesson',
    title: index ? `${track.title} traversal lesson` : `${track.title} foundation`,
    description: 'Build the reviewed mental model and see the state change on a concrete example.',
    status: state.learner.openedLessonSlugs.includes(lessonSlug) ? 'learning' : 'not-started',
    to: `/learn/${lessonSlug}`,
    lessonSlug,
  }))
  const practiceIds = [...new Set([track.entryProblemId, ...track.representativeProblemIds])]
  const practiceNodes: LearningMapNode[] = practiceIds.map((problemId, index) => {
    const problem = problems.find((candidate) => candidate.id === problemId)
    const entry = problemId === track.entryProblemId
    return {
      id: `${track.id}:problem:${problemId}`,
      kind: entry ? 'entry-practice' : 'reinforce-transfer',
      title: problem?.title ?? `Problem ${problemId}`,
      description: entry ? 'Apply the foundation in a guided path.' : 'Reinforce the idea and transfer it to a different reviewed problem.',
      status: practiceStatusFor(problemId, state),
      to: `/problems/${problemId}?from=paths&track=${track.id}`,
      problemId,
    }
  })
  const topicProblems = problems.filter((problem) => problem.topics.includes(track.topic))
  const completedIds = new Set(state.completedProblems.map(({ problemId }) => problemId))
  const completedCatalogProblems = topicProblems.filter(({ id }) => completedIds.has(id)).length
  const completeSet = topicProblems.length > 0 && completedCatalogProblems === topicProblems.length
  const nodes = [...lessonNodes, ...practiceNodes]
  const status: LearningMapStatus = completeSet
    ? 'complete-set'
    : practiceNodes.some((node) => node.status === 'stable')
      ? 'stable'
      : practiceNodes.some((node) => node.status === 'practiced')
        ? 'practiced'
        : nodes.some((node) => node.status === 'learning')
          ? 'learning'
          : 'not-started'
  const nextNode = nodes.find((node) => node.status === 'not-started') ?? nodes.find((node) => node.status !== 'stable') ?? null
  return { track, status, nodes, completeSet, completedCatalogProblems, catalogProblemCount: topicProblems.length, nextNode }
})

export const mapForLesson = (maps: LearningTrackMap[], lessonSlug: string) => maps.find(({ track }) => track.lessonSlugs.includes(lessonSlug)) ?? null
export const mapForProblem = (maps: LearningTrackMap[], problemId: number) => maps.find(({ track }) => track.representativeProblemIds.includes(problemId) || track.entryProblemId === problemId) ?? null

export type MilestoneKind = 'stable' | 'complete-set' | 'repair' | 'consistency'
export interface EarnedMilestone {
  key: string
  kind: MilestoneKind
  label: string
  track?: string
  summary: string
}

export const earnedMilestonesFor = (state: ProgressStateV2, maps: LearningTrackMap[], consistencyBest: number): EarnedMilestone[] => {
  const milestones: EarnedMilestone[] = []
  for (const map of maps) {
    for (const node of map.nodes.filter((candidate) => candidate.problemId && candidate.status === 'stable')) {
      milestones.push({ key: `stable:${map.track.id}:${node.problemId}`, kind: 'stable', label: 'Stable concept', track: map.track.title, summary: 'Recalled a reviewed problem path perfectly on two separate days.' })
    }
    if (map.completeSet) milestones.push({ key: `complete-set:${map.track.id}`, kind: 'complete-set', label: 'Track complete', track: map.track.title, summary: 'Completed every loaded problem in this foundation set.' })
  }
  for (const repair of state.repairs.filter(({ status }) => status === 'validated')) {
    milestones.push({ key: `repair:${repair.id}`, kind: 'repair', label: 'Repair verified', summary: 'Returned to a difficult concept and verified the reasoning on later practice.' })
  }
  if (consistencyBest >= 7) milestones.push({ key: 'consistency:7', kind: 'consistency', label: 'Seven-day practice run', summary: 'Made room for useful practice on seven consecutive days.' })
  return milestones
}

export const milestonePresentationForKey = (key: string, maps: LearningTrackMap[]): EarnedMilestone | null => {
  const [kind, trackId] = key.split(':')
  const track = maps.find((map) => map.track.id === trackId)?.track.title
  if (kind === 'stable') return { key, kind, label: 'Stable concept', track, summary: 'Recalled a reviewed problem path perfectly on two separate days.' }
  if (kind === 'complete-set') return { key, kind, label: 'Track complete', track, summary: 'Completed every loaded problem in this foundation set.' }
  if (kind === 'repair') return { key, kind, label: 'Repair verified', summary: 'Returned to a difficult concept and verified the reasoning on later practice.' }
  if (key === 'consistency:7') return { key, kind: 'consistency', label: 'Seven-day practice run', summary: 'Made room for useful practice on seven consecutive days.' }
  return null
}
