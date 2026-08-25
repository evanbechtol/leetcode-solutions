import { QUESTION_FORMATS } from '../types'
import type { AnswerRecord, ConfidenceLevel, InstructionalLevel, ProblemResult, QuestionFormat, QuestionStage, QuestionType, ReasoningSkillKey } from '../types'

export const PROGRESS_V1_STORAGE_KEY = 'pathfinder-progress-v1'
export const PROGRESS_V2_STORAGE_KEY = 'pathfinder-progress-v2'
export const PROGRESS_SCHEMA_VERSION = 2 as const
export const MAX_DETAILED_ATTEMPTS = 5000
export const DETAILED_ATTEMPT_RETENTION_DAYS = 365

export type LearnerExperience = 'new-to-dsa' | 'some-foundations' | 'interview-review'
export type DailyMinutes = 5 | 10 | 15
export type ProgressSource = 'practice' | 'daily-session' | 'repair' | 'onboarding'
export type { ConfidenceLevel } from '../types'

export interface LearnerProfile {
  onboardingStatus: 'not-started' | 'in-progress' | 'complete'
  experience: LearnerExperience
  dailyMinutes: DailyMinutes
  preferredLanguage?: string
  selectedTrackIds: string[]
  onboardingDecisionIds: string[]
  onboardingStartedAt?: string
  createdAt: string
  updatedAt: string
}

export interface AttemptRecord {
  id: string
  occurredAt: string
  localDay: string
  problemId: number
  questionId: string
  questionType: QuestionType
  questionFormat: QuestionFormat
  stage?: QuestionStage
  selectedOptionIndex?: number
  correct: boolean
  firstAttempt: boolean
  hintLevelReached: 0 | 1 | 2 | 3
  confidence?: ConfidenceLevel
  reasoningSkillKeys: ReasoningSkillKey[]
  instructionalLevel: InstructionalLevel
  diagnosticKeys: string[]
  evidence: Record<string, unknown>
  contentVersion: string
  source: ProgressSource
  topicKeys: string[]
}

export interface ProblemCompletion {
  id: string
  problemId: number
  completedAt: string
  correct: number
  total: number
  contentVersion: string
}

export interface RepairRecord {
  id: string
  misconceptionKey: string
  conceptKey: string
  sourceAttemptId: string
  status: 'open' | 'scheduled' | 'revisited' | 'validated'
  openedAt: string
  nextDueOn: string
  snoozedUntil?: string
  lastReviewedAt?: string
  validatedAt?: string
}

export interface DailySessionRecord {
  id: string
  localDay: string
  plannedMinutes: DailyMinutes
  taskIds: string[]
  completedTaskIds: string[]
  status: 'planned' | 'in-progress' | 'complete' | 'skipped'
  rebuildCount?: number
  startedAt?: string
  completedAt?: string
}

export interface WeeklyAggregate {
  id: string
  week: string
  topicKey: string
  questionType: QuestionType
  questionFormat: QuestionFormat
  confidence: ConfidenceLevel | 'not-recorded'
  correct: number
  total: number
}

export interface MilestoneRecord {
  id: string
  key: string
  earnedAt: string
}

export interface ProductEvent {
  id: string
  name: string
  occurredAt: string
  properties?: Record<string, string | number | boolean>
}

export interface ProgressStateV2 {
  version: typeof PROGRESS_SCHEMA_VERSION
  learner: LearnerProfile
  attempts: AttemptRecord[]
  completedProblems: ProblemCompletion[]
  repairs: RepairRecord[]
  dailySessions: DailySessionRecord[]
  weeklyAggregates: WeeklyAggregate[]
  milestones: MilestoneRecord[]
  localEvents: ProductEvent[]
  legacyAnswerStreak: number
  legacyBestAnswerStreak: number
}

export interface ProgressContentIndex {
  problemTopics: Record<number, string[]>
  knownProblemIds: Set<number>
  knownQuestionIds?: Record<number, Set<string>>
}

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface ProgressRecovery {
  storageKey: string
  raw: string
  reason: 'invalid-v2' | 'invalid-import'
}

export interface ProgressLoadResult {
  state: ProgressStateV2
  migratedFromV1: boolean
  recovery: ProgressRecovery | null
}

export interface ProgressImportResult {
  state: ProgressStateV2 | null
  error: string | null
}

interface PersistedProgressV1 {
  answers: AnswerRecord[]
  results: ProblemResult[]
  streak: number
  bestStreak: number
}

const QUESTION_TYPES: QuestionType[] = ['Comprehension', 'Pattern', 'Data Structure', 'Invariant', 'Algorithm', 'Correctness', 'Complexity']
const QUESTION_STAGES: QuestionStage[] = ['contract', 'bottleneck', 'pattern', 'data-structure', 'invariant', 'visualization', 'build-algorithm', 'transition', 'trace', 'correctness', 'edge-case', 'time-complexity', 'space-complexity', 'tradeoff']
const CONFIDENCE_LEVELS: ConfidenceLevel[] = ['low', 'medium', 'high']
const INSTRUCTIONAL_LEVELS: InstructionalLevel[] = ['observe', 'complete', 'construct', 'retrieve', 'transfer']
const PROGRESS_SOURCES: ProgressSource[] = ['practice', 'daily-session', 'repair', 'onboarding']

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const isString = (value: unknown): value is string => typeof value === 'string'
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const isNonNegativeInteger = (value: unknown): value is number => isFiniteNumber(value) && Number.isInteger(value) && value >= 0
const isQuestionType = (value: unknown): value is QuestionType => QUESTION_TYPES.includes(value as QuestionType)
const isQuestionFormat = (value: unknown): value is QuestionFormat => QUESTION_FORMATS.includes(value as QuestionFormat)
const isQuestionStage = (value: unknown): value is QuestionStage => QUESTION_STAGES.includes(value as QuestionStage)
const isConfidenceLevel = (value: unknown): value is ConfidenceLevel => CONFIDENCE_LEVELS.includes(value as ConfidenceLevel)
const isProgressSource = (value: unknown): value is ProgressSource => PROGRESS_SOURCES.includes(value as ProgressSource)
const isDailyMinutes = (value: unknown): value is DailyMinutes => value === 5 || value === 10 || value === 15
const asStringArray = (value: unknown): string[] | null => Array.isArray(value) && value.every(isString) ? [...new Set(value)] : null
const hasPrimitiveProperties = (value: Record<string, unknown>) => Object.values(value).every((property) => ['string', 'number', 'boolean'].includes(typeof property))
const isStoredV1QuestionType = (value: unknown): value is AnswerRecord['questionType'] => isQuestionType(value) || value === 'Time Complexity' || value === 'Space Complexity'

export const localDayFor = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const weekFor = (date: Date) => {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const weekday = (day.getDay() + 6) % 7
  day.setDate(day.getDate() - weekday)
  return localDayFor(day)
}

const idFor = (prefix: string) => {
  const uuid = globalThis.crypto?.randomUUID?.()
  return uuid ? `${prefix}-${uuid}` : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const normalizeAnswer = (answer: AnswerRecord): AnswerRecord => {
  const questionType = answer.questionType === 'Time Complexity' || answer.questionType === 'Space Complexity'
    ? 'Complexity'
    : answer.questionType
  return { ...answer, questionType, questionFormat: answer.questionFormat ?? 'multiple-choice' }
}

export const emptyProgressState = (now = new Date()): ProgressStateV2 => {
  const timestamp = now.toISOString()
  return {
    version: PROGRESS_SCHEMA_VERSION,
    learner: {
      onboardingStatus: 'not-started',
      experience: 'new-to-dsa',
      dailyMinutes: 10,
      selectedTrackIds: [],
      onboardingDecisionIds: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    attempts: [],
    completedProblems: [],
    repairs: [],
    dailySessions: [],
    weeklyAggregates: [],
    milestones: [],
    localEvents: [],
    legacyAnswerStreak: 0,
    legacyBestAnswerStreak: 0,
  }
}

const validLearnerProfile = (value: unknown): value is LearnerProfile => {
  if (!isRecord(value)) return false
  return ['not-started', 'in-progress', 'complete'].includes(value.onboardingStatus as string)
    && ['new-to-dsa', 'some-foundations', 'interview-review'].includes(value.experience as string)
    && isDailyMinutes(value.dailyMinutes)
    && (value.preferredLanguage === undefined || isString(value.preferredLanguage))
    && asStringArray(value.selectedTrackIds) !== null
    && (value.onboardingDecisionIds === undefined || asStringArray(value.onboardingDecisionIds) !== null)
    && (value.onboardingStartedAt === undefined || isString(value.onboardingStartedAt))
    && isString(value.createdAt)
    && isString(value.updatedAt)
}

const validAttempt = (value: unknown): value is AttemptRecord => {
  if (!isRecord(value)) return false
  return isString(value.id)
    && isString(value.occurredAt)
    && isString(value.localDay)
    && isNonNegativeInteger(value.problemId)
    && isString(value.questionId)
    && isQuestionType(value.questionType)
    && isQuestionFormat(value.questionFormat)
    && (value.stage === undefined || isQuestionStage(value.stage))
    && (value.selectedOptionIndex === undefined || isNonNegativeInteger(value.selectedOptionIndex))
    && typeof value.correct === 'boolean'
    && typeof value.firstAttempt === 'boolean'
    && [0, 1, 2, 3].includes(value.hintLevelReached as number)
    && (value.confidence === undefined || isConfidenceLevel(value.confidence))
    && (value.reasoningSkillKeys === undefined || asStringArray(value.reasoningSkillKeys) !== null)
    && (value.instructionalLevel === undefined || INSTRUCTIONAL_LEVELS.includes(value.instructionalLevel as InstructionalLevel))
    && (value.diagnosticKeys === undefined || asStringArray(value.diagnosticKeys) !== null)
    && (value.evidence === undefined || isRecord(value.evidence))
    && isString(value.contentVersion)
    && isProgressSource(value.source)
    && asStringArray(value.topicKeys) !== null
}

const validCompletion = (value: unknown): value is ProblemCompletion => {
  if (!isRecord(value)) return false
  return isString(value.id)
    && isNonNegativeInteger(value.problemId)
    && isString(value.completedAt)
    && isNonNegativeInteger(value.correct)
    && isNonNegativeInteger(value.total)
    && isString(value.contentVersion)
}

const validRepair = (value: unknown): value is RepairRecord => {
  if (!isRecord(value)) return false
  return isString(value.id) && isString(value.misconceptionKey) && isString(value.conceptKey) && isString(value.sourceAttemptId)
    && ['open', 'scheduled', 'revisited', 'validated'].includes(value.status as string)
    && isString(value.openedAt) && isString(value.nextDueOn)
    && (value.snoozedUntil === undefined || isString(value.snoozedUntil))
    && (value.lastReviewedAt === undefined || isString(value.lastReviewedAt))
    && (value.validatedAt === undefined || isString(value.validatedAt))
}

const validDailySession = (value: unknown): value is DailySessionRecord => {
  if (!isRecord(value)) return false
  return isString(value.id) && isString(value.localDay) && isDailyMinutes(value.plannedMinutes)
    && asStringArray(value.taskIds) !== null && asStringArray(value.completedTaskIds) !== null
    && ['planned', 'in-progress', 'complete', 'skipped'].includes(value.status as string)
    && (value.rebuildCount === undefined || isNonNegativeInteger(value.rebuildCount))
    && (value.startedAt === undefined || isString(value.startedAt))
    && (value.completedAt === undefined || isString(value.completedAt))
}

const validWeeklyAggregate = (value: unknown): value is WeeklyAggregate => {
  if (!isRecord(value)) return false
  return isString(value.id) && isString(value.week) && isString(value.topicKey)
    && isQuestionType(value.questionType) && isQuestionFormat(value.questionFormat)
    && (value.confidence === 'not-recorded' || isConfidenceLevel(value.confidence))
    && isNonNegativeInteger(value.correct) && isNonNegativeInteger(value.total)
}

const validMilestone = (value: unknown): value is MilestoneRecord => isRecord(value) && isString(value.id) && isString(value.key) && isString(value.earnedAt)
const validEvent = (value: unknown): value is ProductEvent => isRecord(value)
  && isString(value.id) && isString(value.name) && isString(value.occurredAt)
  && (value.properties === undefined || (isRecord(value.properties) && hasPrimitiveProperties(value.properties)))

export const isProgressStateV2 = (value: unknown): value is ProgressStateV2 => {
  if (!isRecord(value) || value.version !== PROGRESS_SCHEMA_VERSION || !validLearnerProfile(value.learner)) return false
  const arrays = [
    [value.attempts, validAttempt],
    [value.completedProblems, validCompletion],
    [value.repairs, validRepair],
    [value.dailySessions, validDailySession],
    [value.weeklyAggregates, validWeeklyAggregate],
    [value.milestones, validMilestone],
    [value.localEvents, validEvent],
  ] as const
  return arrays.every(([entries, predicate]) => Array.isArray(entries) && entries.every(predicate))
    && isNonNegativeInteger(value.legacyAnswerStreak)
    && isNonNegativeInteger(value.legacyBestAnswerStreak)
}

// V2 gains additive fields over time. Normalize older valid V2 records before
// views consume them so a minor local release never turns into data recovery.
const normalizeProgressV2 = (state: ProgressStateV2): ProgressStateV2 => ({
  ...state,
  attempts: state.attempts.map((attempt) => ({
    ...attempt,
    reasoningSkillKeys: attempt.reasoningSkillKeys ?? [],
    instructionalLevel: attempt.instructionalLevel ?? 'complete',
    diagnosticKeys: attempt.diagnosticKeys ?? [],
    evidence: attempt.evidence ?? {},
  })),
  learner: {
    ...state.learner,
    onboardingDecisionIds: state.learner.onboardingDecisionIds ?? [],
  },
})

const parseV1 = (value: unknown): PersistedProgressV1 | null => {
  if (!isRecord(value) || !Array.isArray(value.answers) || !Array.isArray(value.results)) return null
  const answers = value.answers.filter((answer): answer is AnswerRecord => isRecord(answer)
    && isNonNegativeInteger(answer.problemId)
    && isString(answer.questionId)
    && isStoredV1QuestionType(answer.questionType)
    && typeof answer.correct === 'boolean'
    && isString(answer.answeredAt))
  const results = value.results.filter((result): result is ProblemResult => isRecord(result)
    && isNonNegativeInteger(result.problemId)
    && isString(result.completedAt)
    && isNonNegativeInteger(result.correct)
    && isNonNegativeInteger(result.total))
  if (answers.length !== value.answers.length || results.length !== value.results.length) return null
  return {
    answers: answers.map(normalizeAnswer),
    results,
    streak: isNonNegativeInteger(value.streak) ? value.streak : 0,
    bestStreak: isNonNegativeInteger(value.bestStreak) ? value.bestStreak : 0,
  }
}

export const migrateV1Progress = (
  legacy: PersistedProgressV1,
  content: ProgressContentIndex,
  now = new Date(),
): ProgressStateV2 => {
  const state = emptyProgressState(now)
  state.attempts = legacy.answers.map((answer, index) => ({
    id: `legacy-attempt-${index}-${answer.problemId}-${answer.questionId}`,
    occurredAt: answer.answeredAt,
    localDay: localDayFor(new Date(answer.answeredAt)),
    problemId: answer.problemId,
    questionId: answer.questionId,
    questionType: answer.questionType === 'Time Complexity' || answer.questionType === 'Space Complexity' ? 'Complexity' : answer.questionType,
    questionFormat: answer.questionFormat ?? 'multiple-choice',
    correct: answer.correct,
    firstAttempt: false,
    hintLevelReached: 0,
    reasoningSkillKeys: [],
    instructionalLevel: 'complete',
    diagnosticKeys: [],
    evidence: {},
    contentVersion: 'legacy-v1',
    source: 'practice',
    topicKeys: content.problemTopics[answer.problemId] ?? [],
  }))
  state.completedProblems = legacy.results.map((result, index) => ({
    id: `legacy-completion-${index}-${result.problemId}-${result.completedAt}`,
    problemId: result.problemId,
    completedAt: result.completedAt,
    correct: result.correct,
    total: result.total,
    contentVersion: 'legacy-v1',
  }))
  state.legacyAnswerStreak = legacy.streak
  state.legacyBestAnswerStreak = legacy.bestStreak
  return state
}

const parseJson = (raw: string | null): unknown => {
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return undefined }
}

export const loadProgressState = (
  storage: StorageLike,
  content: ProgressContentIndex,
  now = new Date(),
): ProgressLoadResult => {
  const rawV2 = storage.getItem(PROGRESS_V2_STORAGE_KEY)
  if (rawV2 !== null) {
    const parsedV2 = parseJson(rawV2)
    if (isProgressStateV2(parsedV2)) return { state: compactProgress(normalizeProgressV2(parsedV2), now), migratedFromV1: false, recovery: null }
    return {
      state: emptyProgressState(now),
      migratedFromV1: false,
      recovery: { storageKey: PROGRESS_V2_STORAGE_KEY, raw: rawV2, reason: 'invalid-v2' },
    }
  }
  const rawV1 = storage.getItem(PROGRESS_V1_STORAGE_KEY)
  const legacy = parseV1(parseJson(rawV1))
  if (!legacy) return { state: emptyProgressState(now), migratedFromV1: false, recovery: null }
  return { state: compactProgress(migrateV1Progress(legacy, content, now), now), migratedFromV1: true, recovery: null }
}

const aggregateKeyFor = (attempt: AttemptRecord, topicKey: string) => [
  weekFor(new Date(attempt.occurredAt)),
  topicKey,
  attempt.questionType,
  attempt.questionFormat,
  attempt.confidence ?? 'not-recorded',
].join('|')

const aggregateAttempts = (attempts: AttemptRecord[], existing: WeeklyAggregate[]) => {
  const aggregates = new Map(existing.map((aggregate) => [aggregate.id, { ...aggregate }]))
  for (const attempt of attempts) {
    const topics = attempt.topicKeys.length ? attempt.topicKeys : ['Uncategorized']
    for (const topicKey of topics) {
      const key = aggregateKeyFor(attempt, topicKey)
      const current = aggregates.get(key) ?? {
        id: key,
        week: weekFor(new Date(attempt.occurredAt)),
        topicKey,
        questionType: attempt.questionType,
        questionFormat: attempt.questionFormat,
        confidence: attempt.confidence ?? 'not-recorded',
        correct: 0,
        total: 0,
      }
      current.total += 1
      if (attempt.correct) current.correct += 1
      aggregates.set(key, current)
    }
  }
  return [...aggregates.values()].sort((left, right) => left.id.localeCompare(right.id))
}

export const compactProgress = (state: ProgressStateV2, now = new Date()): ProgressStateV2 => {
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - DETAILED_ATTEMPT_RETENTION_DAYS)
  const chronological = [...state.attempts].sort((left, right) => left.occurredAt.localeCompare(right.occurredAt))
  const overflow = Math.max(0, chronological.length - MAX_DETAILED_ATTEMPTS)
  const expired = chronological.filter((attempt, index) => index < overflow || new Date(attempt.occurredAt) < cutoff)
  if (!expired.length) return state
  const retainedIds = new Set(chronological.slice(overflow).filter((attempt) => new Date(attempt.occurredAt) >= cutoff).map(({ id }) => id))
  return {
    ...state,
    attempts: state.attempts.filter(({ id }) => retainedIds.has(id)),
    weeklyAggregates: aggregateAttempts(expired, state.weeklyAggregates),
  }
}

const uniqueById = <T extends { id: string }>(items: T[]) => {
  const byId = new Map<string, T>()
  for (const item of items) if (!byId.has(item.id)) byId.set(item.id, item)
  return [...byId.values()]
}

const eligibleAttempts = (attempts: AttemptRecord[], content: ProgressContentIndex) => attempts.filter((attempt) => content.knownProblemIds.has(attempt.problemId))
const eligibleCompletions = (completions: ProblemCompletion[], content: ProgressContentIndex) => completions.filter((completion) => content.knownProblemIds.has(completion.problemId))

const isPristineProgress = (state: ProgressStateV2) => state.attempts.length === 0
  && state.completedProblems.length === 0
  && state.repairs.length === 0
  && state.dailySessions.length === 0
  && state.weeklyAggregates.length === 0
  && state.milestones.length === 0
  && state.learner.onboardingStatus === 'not-started'
  && state.learner.experience === 'new-to-dsa'
  && state.learner.dailyMinutes === 10
  && state.learner.preferredLanguage === undefined
  && state.learner.selectedTrackIds.length === 0
  && state.learner.onboardingDecisionIds.length === 0
  && state.learner.onboardingStartedAt === undefined

export const mergeImportedProgress = (
  current: ProgressStateV2,
  imported: ProgressStateV2,
  content: ProgressContentIndex,
  now = new Date(),
): ProgressStateV2 => compactProgress({
  ...current,
  // Current-browser preferences win. On a new device, the defaults are replaced by imported settings below.
  learner: isPristineProgress(current) ? imported.learner : current.learner,
  attempts: uniqueById([...current.attempts, ...eligibleAttempts(imported.attempts, content)]),
  completedProblems: uniqueById([...current.completedProblems, ...eligibleCompletions(imported.completedProblems, content)]),
  repairs: uniqueById([...current.repairs, ...imported.repairs]),
  dailySessions: uniqueById([...current.dailySessions, ...imported.dailySessions]),
  weeklyAggregates: aggregateAttempts([], uniqueById([...current.weeklyAggregates, ...imported.weeklyAggregates])),
  milestones: uniqueById([...current.milestones, ...imported.milestones]),
  localEvents: uniqueById([...current.localEvents, ...imported.localEvents]).slice(-1000),
  legacyAnswerStreak: Math.max(current.legacyAnswerStreak, imported.legacyAnswerStreak),
  legacyBestAnswerStreak: Math.max(current.legacyBestAnswerStreak, imported.legacyBestAnswerStreak),
}, now)

export const importProgress = (
  raw: string,
  current: ProgressStateV2,
  content: ProgressContentIndex,
  now = new Date(),
): ProgressImportResult => {
  const parsed = parseJson(raw)
  if (!isProgressStateV2(parsed)) return { state: null, error: 'This file is not a valid Pathfinder progress export.' }
  return { state: mergeImportedProgress(current, parsed, content, now), error: null }
}

export const serializeProgress = (state: ProgressStateV2) => JSON.stringify(state, null, 2)

export const createAttempt = (
  input: Omit<AttemptRecord, 'id' | 'occurredAt' | 'localDay' | 'reasoningSkillKeys' | 'instructionalLevel' | 'diagnosticKeys' | 'evidence'>
    & Partial<Pick<AttemptRecord, 'reasoningSkillKeys' | 'instructionalLevel' | 'diagnosticKeys' | 'evidence'>>,
  now = new Date(),
): AttemptRecord => ({
  ...input,
  reasoningSkillKeys: input.reasoningSkillKeys ?? [],
  instructionalLevel: input.instructionalLevel ?? 'complete',
  diagnosticKeys: input.diagnosticKeys ?? [],
  evidence: input.evidence ?? {},
  id: idFor('attempt'),
  occurredAt: now.toISOString(),
  localDay: localDayFor(now),
})

export const createCompletion = (
  input: Omit<ProblemCompletion, 'id' | 'completedAt'>,
  now = new Date(),
): ProblemCompletion => ({ ...input, id: idFor('completion'), completedAt: now.toISOString() })

export const createRepair = (
  input: Omit<RepairRecord, 'id' | 'openedAt'>,
  now = new Date(),
): RepairRecord => ({ ...input, id: idFor('repair'), openedAt: now.toISOString() })

export const createProductEvent = (
  name: string,
  properties?: ProductEvent['properties'],
  now = new Date(),
): ProductEvent => ({ id: idFor('event'), name, occurredAt: now.toISOString(), properties })
