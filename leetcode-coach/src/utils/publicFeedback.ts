import { COACHING_CONTENT_VERSION } from '../data/coaching/contentVersion'
import type { ProductEventName, ProgressStateV2, StorageLike } from '../stores/progress'

export const FEEDBACK_DRAFT_STORAGE_KEY = 'pathfinder-feedback-draft-v1'
export const FEEDBACK_DRAFT_VERSION = 1 as const
export const MAX_FEEDBACK_MESSAGE_LENGTH = 5000

export interface FeedbackDraft {
  version: typeof FEEDBACK_DRAFT_VERSION
  message: string
}

export interface DiagnosticSummary {
  progressSchemaVersion: number
  coachingContentVersion: string
  catalogProblemCount: number
  attemptCount: number
  completionCount: number
  repairCount: number
  localEventCount: number
  eventCounts: Partial<Record<ProductEventName, number>>
}

const cleanMessage = (message: string) => message.slice(0, MAX_FEEDBACK_MESSAGE_LENGTH)

export const parseFeedbackDraft = (raw: string | null): FeedbackDraft => {
  if (!raw) return { version: FEEDBACK_DRAFT_VERSION, message: '' }
  try {
    const value = JSON.parse(raw) as Partial<FeedbackDraft>
    if (value.version !== FEEDBACK_DRAFT_VERSION || typeof value.message !== 'string') throw new Error('Invalid feedback draft')
    return { version: FEEDBACK_DRAFT_VERSION, message: cleanMessage(value.message) }
  } catch {
    return { version: FEEDBACK_DRAFT_VERSION, message: '' }
  }
}

export const loadFeedbackDraft = (storage: StorageLike = localStorage) => parseFeedbackDraft(storage.getItem(FEEDBACK_DRAFT_STORAGE_KEY))

export const saveFeedbackDraft = (message: string, storage: StorageLike = localStorage) => {
  const draft = { version: FEEDBACK_DRAFT_VERSION, message: cleanMessage(message) } satisfies FeedbackDraft
  storage.setItem(FEEDBACK_DRAFT_STORAGE_KEY, JSON.stringify(draft))
  return draft
}

export const clearFeedbackDraft = (storage: StorageLike = localStorage) => storage.removeItem(FEEDBACK_DRAFT_STORAGE_KEY)

export const diagnosticSummaryFor = (state: ProgressStateV2, catalogProblemCount: number): DiagnosticSummary => {
  const eventCounts: DiagnosticSummary['eventCounts'] = {}
  for (const { name } of state.localEvents) eventCounts[name] = (eventCounts[name] ?? 0) + 1
  return {
    progressSchemaVersion: state.version,
    coachingContentVersion: COACHING_CONTENT_VERSION,
    catalogProblemCount,
    attemptCount: state.attempts.length,
    completionCount: state.completedProblems.length,
    repairCount: state.repairs.length,
    localEventCount: state.localEvents.length,
    eventCounts,
  }
}

export const formatFeedbackReport = ({
  message,
  route,
  appVersion,
  diagnostics,
}: {
  message: string
  route: string
  appVersion: string
  diagnostics?: DiagnosticSummary
}) => [
  '# Pathfinder beta feedback',
  '',
  cleanMessage(message).trim(),
  '',
  `Route: ${route}`,
  `App version: ${appVersion}`,
  `Coaching content: ${COACHING_CONTENT_VERSION}`,
  ...(diagnostics ? ['', '## Optional diagnostic summary', '', '```json', JSON.stringify(diagnostics, null, 2), '```'] : []),
].join('\n')
