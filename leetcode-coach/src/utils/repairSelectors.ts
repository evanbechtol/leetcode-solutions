import type { Problem } from '../types'
import { categoryRepairLink } from '../data/repairMetadata'
import { COACHING_CONTENT_VERSION } from '../data/coaching/contentVersion'
import type { AttemptRecord, ProgressStateV2, RepairRecord } from '../stores/progress'
import type { DailyTask } from './dailySession'
import { learningTracks } from '../data/tracks'
import { questionMisconceptionLinks, questionOptionFeedback } from './questionConfig'
import { compilePilotTransferQuestions } from '../data/coaching/intuitionCompiler'
import { repairStageForDiagnostics } from './adaptiveQuestions'

export interface RepairCard {
  id: string
  misconceptionKey: string
  label: string
  concept: string
  lessonSlug: string
  repairMode: 'lesson' | 'trace' | 'retry' | 'transfer'
  sourceProblemId: number
  sourceProblemTitle: string
  sourceQuestionType: string
  questionFormat: string
  status: RepairRecord['status']
  nextDueOn: string
  snoozedUntil?: string
  snoozed: boolean
  why: string
  contentUpdated: boolean
  repeatCount: number
  lastOccurredAt: string
}

const sourceAttemptFor = (repair: RepairRecord, attempts: AttemptRecord[]) => attempts.find(({ id }) => id === repair.sourceAttemptId)

export const repairCardsFor = (state: ProgressStateV2, problems: Problem[], today: string): RepairCard[] => state.repairs.flatMap((repair) => {
  const attempt = sourceAttemptFor(repair, state.attempts)
  const problem = attempt && problems.find(({ id }) => id === attempt.problemId)
  const question = problem && [...problem.questions, ...compilePilotTransferQuestions(problem)].find(({ id }) => id === attempt?.questionId)
  if (!attempt || !problem || !question) return []

  const link = questionMisconceptionLinks(question)[attempt.selectedOptionIndex ?? -1]
    ?? categoryRepairLink(problem, repairStageForDiagnostics(attempt.diagnosticKeys) ?? question.stage)
  const contentUpdated = attempt.contentVersion !== COACHING_CONTENT_VERSION
  const why = !contentUpdated && attempt.selectedOptionIndex !== undefined
    ? questionOptionFeedback(question)[attempt.selectedOptionIndex] || 'That choice does not preserve the information the next step needs.'
    : 'The current reviewed lesson explains this decision; the coaching content has been updated since this attempt.'
  const repeatCount = state.attempts.filter((candidate) => !candidate.correct && candidate.problemId === attempt.problemId && candidate.questionId === attempt.questionId).length

  return [{
    id: repair.id,
    misconceptionKey: repair.misconceptionKey,
    label: link.label,
    concept: link.conceptKey,
    lessonSlug: link.lessonSlug,
    repairMode: link.repairMode,
    sourceProblemId: problem.id,
    sourceProblemTitle: problem.title,
    sourceQuestionType: question.type,
    questionFormat: attempt.questionFormat,
    status: repair.status,
    nextDueOn: repair.nextDueOn,
    snoozedUntil: repair.snoozedUntil,
    snoozed: Boolean(repair.snoozedUntil && repair.snoozedUntil > today),
    why,
    contentUpdated,
    repeatCount,
    lastOccurredAt: attempt.occurredAt,
  }]
}).sort((left, right) => {
  const due = left.nextDueOn.localeCompare(right.nextDueOn)
  if (due) return due
  const repeats = right.repeatCount - left.repeatCount
  if (repeats) return repeats
  return right.lastOccurredAt.localeCompare(left.lastOccurredAt)
})

export const dueRepairCardsFor = (cards: RepairCard[], today: string) => cards.filter((card) => card.status !== 'validated'
  && (!card.snoozedUntil || card.snoozedUntil <= today)
  && card.nextDueOn <= today)

export const repairTaskFor = (card: RepairCard): DailyTask => {
  const track = learningTracks.find((candidate) => candidate.lessonSlugs.includes(card.lessonSlug))
  const transferProblemId = track?.representativeProblemIds.find((id) => id !== card.sourceProblemId)
  if (card.status === 'revisited' && transferProblemId !== undefined) {
    return {
      id: `repair-retrieval:${card.id}:${transferProblemId}`,
      kind: 'retrieval',
      problemId: transferProblemId,
      title: `Verify: ${card.concept}`,
      description: 'Make the same kind of decision in a different reviewed problem, after time away from the original answer.',
      reason: 'A focused review is complete; this checks whether the concept now transfers.',
    }
  }
  return {
    id: `repair:${card.id}`,
    kind: card.repairMode === 'trace' ? 'trace' : 'repair',
    lessonSlug: card.lessonSlug,
    problemId: card.sourceProblemId,
    title: `${card.label}: ${card.concept}`,
    description: 'Return to one reviewed explanation, then make a fresh decision with that idea in mind.',
    reason: `A recent ${card.sourceQuestionType.toLocaleLowerCase()} decision on ${card.sourceProblemTitle} is ready for a focused review.`,
  }
}
