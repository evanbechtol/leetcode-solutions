import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { problems } from '../data/problems'
import { learningTracks } from '../data/tracks'
import { COACHING_CONTENT_VERSION } from '../data/coaching/contentVersion'
import { compilePilotTransferQuestions } from '../data/coaching/intuitionCompiler'
import { categoryRepairLink } from '../data/repairMetadata'
import type { AnswerRecord, ConfidenceLevel, Filters, ProblemResult, QuestionFormat, QuestionInteractionResult, QuestionInteractionState, QuestionType, QuizQuestion } from '../types'
import { drawRandomProblem } from '../utils/randomSelection'
import { hasDataStructureGateBeforeAlgorithms, sequenceDataStructureBeforeAlgorithms } from '../utils/questionSequence'
import { ACTIVE_PROBLEM_SESSION_KEY, ACTIVE_PROBLEM_SESSION_VERSION, parseActiveProblemSession, questionPathFromActiveSession } from '../utils/activeProblemSession'
import { consistencyFor, planDailyTasks, taskForId, type DailyTask } from '../utils/dailySession'
import { dueRepairCardsFor, repairCardsFor, repairTaskFor } from '../utils/repairSelectors'
import { questionAnswer, questionMisconceptionLinks } from '../utils/questionConfig'
import { repairStageForDiagnostics, selectAdaptiveQuestionPath } from '../utils/adaptiveQuestions'
import {
  PROGRESS_V1_STORAGE_KEY,
  PROGRESS_V2_STORAGE_KEY,
  compactProgress,
  createAttempt,
  createCompletion,
  createProductEvent,
  createRepair,
  emptyProgressState,
  importProgress,
  localDayFor,
  loadProgressState,
  serializeProgress,
  type ProgressContentIndex,
  type DailySessionRecord,
  type LearnerProfile,
  type ProgressRecovery,
  type ProgressStateV2,
  type StorageLike,
} from './progress'

const QUIZ_CACHE_KEY = 'pathfinder-generated-quizzes-v1'
const aiCoachEnabled = import.meta.env.MODE === 'ai' || import.meta.env.VITE_AI_COACH_ENABLED === 'true'
export const QUESTION_TYPES: QuestionType[] = ['Comprehension', 'Pattern', 'Data Structure', 'Invariant', 'Algorithm', 'Correctness', 'Complexity']
export const QUESTION_FORMATS: Array<{ format: QuestionFormat; label: string }> = [
  { format: 'multiple-choice', label: 'Decision questions' },
  { format: 'algorithm-builder', label: 'Build the algorithm' },
  { format: 'code-construction', label: 'Construct the code' },
  { format: 'constraint-signals', label: 'Constraint signals' },
  { format: 'operation-contract', label: 'Operation contracts' },
  { format: 'state-sufficiency', label: 'Minimal state' },
  { format: 'near-twin', label: 'Pattern boundaries' },
  { format: 'constraint-mutation', label: 'Constraint transfer' },
  { format: 'structural-analogy', label: 'Structural analogies' },
]
const REASONING_SKILL_LABELS = {
  'constraint-signal': 'Constraint signals',
  'operation-requirement': 'Required operations',
  'state-sufficiency': 'State sufficiency',
  'safe-discard': 'Safe forgetting',
  'pattern-boundary': 'Pattern boundaries',
  'counterfactual-transfer': 'Constraint adaptation',
  'structural-analogy': 'Structural analogy',
} as const

const progressContentIndex: ProgressContentIndex = {
  problemTopics: Object.fromEntries(problems.map((problem) => [problem.id, [...problem.topics]])),
  knownProblemIds: new Set(problems.map(({ id }) => id)),
  knownQuestionIds: Object.fromEntries(problems.map((problem) => [problem.id, new Set([
    ...problem.questions.map(({ id }) => id),
    ...compilePilotTransferQuestions(problem).map(({ id }) => id),
  ])])),
}

const localStorageFor = (): StorageLike => globalThis.localStorage as StorageLike

export function normalizeAnswerRecord(answer: AnswerRecord): AnswerRecord {
  if (answer.questionType === 'Time Complexity' || answer.questionType === 'Space Complexity') {
    return { ...answer, questionType: 'Complexity', questionFormat: answer.questionFormat ?? 'multiple-choice' }
  }
  return { ...answer, questionFormat: answer.questionFormat ?? 'multiple-choice' }
}

type LearnerPreferences = Pick<LearnerProfile, 'experience' | 'dailyMinutes' | 'preferredLanguage' | 'selectedTrackIds'>

const toAnswerRecord = (attempt: ProgressStateV2['attempts'][number]): AnswerRecord => ({
  problemId: attempt.problemId,
  questionId: attempt.questionId,
  questionType: attempt.questionType,
  questionFormat: attempt.questionFormat,
  correct: attempt.correct,
  answeredAt: attempt.occurredAt,
})

const toProblemResult = (completion: ProgressStateV2['completedProblems'][number]): ProblemResult => ({
  problemId: completion.problemId,
  completedAt: completion.completedAt,
  correct: completion.correct,
  total: completion.total,
})

const normalizedQuestionType = (question: QuizQuestion): QuestionType => {
  if (question.type === 'Time Complexity' || question.type === 'Space Complexity') return 'Complexity'
  return question.type
}

const repairIdForTask = (taskId: string) => {
  if (taskId.startsWith('repair:')) return taskId.slice('repair:'.length)
  if (taskId.startsWith('repair-retrieval:')) return taskId.split(':')[1] ?? null
  return null
}

export const useTrainerStore = defineStore('trainer', () => {
  const storage = localStorageFor()
  const loadedProgress = loadProgressState(storage, progressContentIndex)
  const progressState = ref<ProgressStateV2>(loadedProgress.state)
  const progressRecovery = ref<ProgressRecovery | null>(loadedProgress.recovery)
  const progressMigrationStatus = loadedProgress.migratedFromV1
    ? 'migrated-from-v1'
    : loadedProgress.recovery
      ? 'recovery-required'
      : storage.getItem(PROGRESS_V2_STORAGE_KEY)
        ? 'loaded-v2'
        : 'new'
  const progressStorageError = ref<string | null>(null)
  const currentProblemId = ref<number | null>(null)
  const currentQuestionIndex = ref(0)
  const selectedAnswer = ref<number | null>(null)
  const submitted = ref(false)
  const answerCorrect = ref<boolean | null>(null)
  const firstTryCorrect = ref(0)
  const revealedHintCount = ref(0)
  const confidence = ref<ConfidenceLevel | null>(null)
  const attemptedCurrent = ref(new Set<string>())
  const interactionState = ref<QuestionInteractionState | null>(null)
  const problemComplete = ref(false)
  const activeQuestions = ref<QuizQuestion[]>([])
  const quizCache = ref<Record<number, QuizQuestion[]>>((() => {
    try { return JSON.parse(storage.getItem(QUIZ_CACHE_KEY) || '{}') }
    catch { return {} }
  })())
  const filters = ref<Filters>({ difficulties: [], sets: [], topics: [], algorithms: [] })
  let problemQueue: number[] = []
  let problemPoolKey = ''

  function persistProgress() {
    const compacted = compactProgress(progressState.value)
    if (compacted !== progressState.value) progressState.value = compacted
    try {
      storage.setItem(PROGRESS_V2_STORAGE_KEY, serializeProgress(compacted))
      progressStorageError.value = null
      return true
    } catch {
      progressStorageError.value = 'Progress could not be saved in this browser. Export a backup before clearing site data.'
      return false
    }
  }

  if (loadedProgress.migratedFromV1 && persistProgress()) storage.removeItem(PROGRESS_V1_STORAGE_KEY)

  const answers = computed(() => progressState.value.attempts.map(toAnswerRecord))
  const results = computed(() => progressState.value.completedProblems.map(toProblemResult))
  const streak = computed(() => progressState.value.legacyAnswerStreak)
  const bestStreak = computed(() => progressState.value.legacyBestAnswerStreak)
  const currentProblem = computed(() => problems.find((problem) => problem.id === currentProblemId.value) ?? null)
  const currentQuestion = computed(() => activeQuestions.value[currentQuestionIndex.value] ?? null)
  const questionCount = computed(() => activeQuestions.value.length)
  const availableProblems = computed(() => problems.filter((problem) => problem.questions.length > 0))
  const matchingProblems = computed(() => availableProblems.value.filter((problem) => {
    const f = filters.value
    return (!f.difficulties.length || f.difficulties.includes(problem.difficulty))
      && (!f.sets.length || f.sets.some((item) => problem.set.includes(item)))
      && (!f.topics.length || f.topics.some((item) => problem.topics.includes(item)))
      && (!f.algorithms.length || f.algorithms.some((item) => problem.algorithms.includes(item)))
  }))
  const totalCorrect = computed(() => answers.value.filter((answer) => answer.correct).length)
  const accuracy = computed(() => answers.value.length ? Math.round((totalCorrect.value / answers.value.length) * 100) : 0)
  const completedProblemIds = computed(() => new Set(results.value.map((result) => result.problemId)))
  const typeStats = computed(() => QUESTION_TYPES.map((type) => {
    const relevant = answers.value.filter((answer) => answer.questionType === type)
    const correct = relevant.filter((answer) => answer.correct).length
    return { type, correct, total: relevant.length, accuracy: relevant.length ? Math.round((correct / relevant.length) * 100) : 0 }
  }))
  const formatStats = computed(() => QUESTION_FORMATS.map(({ format, label }) => {
    const relevant = answers.value.filter((answer) => (answer.questionFormat ?? 'multiple-choice') === format)
    const correct = relevant.filter((answer) => answer.correct).length
    return { format, label, correct, total: relevant.length, accuracy: relevant.length ? Math.round((correct / relevant.length) * 100) : 0 }
  }))
  const reasoningSkillStats = computed(() => Object.entries(REASONING_SKILL_LABELS).map(([skill, label]) => {
    const relevant = progressState.value.attempts.filter((attempt) => attempt.reasoningSkillKeys.includes(skill as keyof typeof REASONING_SKILL_LABELS))
    const correct = relevant.filter((attempt) => attempt.correct).length
    const highConfidenceErrors = relevant.filter((attempt) => !attempt.correct && attempt.confidence === 'high').length
    return { skill, label, correct, total: relevant.length, accuracy: relevant.length ? Math.round((correct / relevant.length) * 100) : 0, highConfidenceErrors }
  }))
  const topicMastery = computed(() => {
    const coreTopics = ['Array', 'String', 'Hash Table', 'Linked List', 'Tree', 'Graph', 'Dynamic Programming', 'Heap']
    return coreTopics.map((topic) => {
      const topicProblems = problems.filter((problem) => problem.topics.includes(topic))
      const completed = topicProblems.filter((problem) => completedProblemIds.value.has(problem.id)).length
      const total = topicProblems.length
      return { topic, completed, total, progress: total ? Math.round((completed / total) * 100) : 0, mastered: total > 0 && completed === total }
    })
  })
  const todayLocalDay = computed(() => localDayFor(new Date()))
  const todaySession = computed(() => progressState.value.dailySessions.find((session) => session.localDay === todayLocalDay.value) ?? null)
  const repairCards = computed(() => repairCardsFor(progressState.value, problems, todayLocalDay.value))
  const dueRepairCards = computed(() => dueRepairCardsFor(repairCards.value, todayLocalDay.value))
  const todayTasks = computed(() => (todaySession.value?.taskIds ?? [])
    .map((taskId) => {
      const repairId = repairIdForTask(taskId)
      if (!repairId) return taskForId(taskId, learningTracks)
      const card = repairCards.value.find((candidate) => candidate.id === repairId)
      return card ? repairTaskFor(card) : null
    })
    .filter((task): task is DailyTask => task !== null)
    .map((task) => ({ ...task, completed: todaySession.value?.completedTaskIds.includes(task.id) ?? false })))
  const completedBeforeTodayIds = computed(() => {
    const earliestRetrievalDay = new Date()
    earliestRetrievalDay.setDate(earliestRetrievalDay.getDate() - 7)
    const threshold = localDayFor(earliestRetrievalDay)
    return new Set(progressState.value.completedProblems
      .filter((completion) => localDayFor(new Date(completion.completedAt)) <= threshold)
      .map(({ problemId }) => problemId))
  })
  const practiceConsistency = computed(() => consistencyFor(progressState.value.dailySessions, todayLocalDay.value))

  watch(progressState, () => persistProgress(), { deep: true })
  watch(quizCache, () => storage.setItem(QUIZ_CACHE_KEY, JSON.stringify(quizCache.value)), { deep: true })
  watch([
    currentProblemId,
    currentQuestionIndex,
    selectedAnswer,
    submitted,
    answerCorrect,
    firstTryCorrect,
    revealedHintCount,
    confidence,
    attemptedCurrent,
    interactionState,
    problemComplete,
    activeQuestions,
  ], () => {
    if (currentProblemId.value === null || !currentQuestion.value) return
    storage.setItem(ACTIVE_PROBLEM_SESSION_KEY, JSON.stringify({
      version: ACTIVE_PROBLEM_SESSION_VERSION,
      contentVersion: COACHING_CONTENT_VERSION,
      problemId: currentProblemId.value,
      questionId: currentQuestion.value.id,
      questionIds: activeQuestions.value.map(({ id }) => id),
      questionIndex: currentQuestionIndex.value,
      selectedAnswer: selectedAnswer.value,
      submitted: submitted.value,
      answerCorrect: answerCorrect.value,
      firstTryCorrect: firstTryCorrect.value,
      revealedHintCount: revealedHintCount.value,
      confidence: confidence.value,
      attemptedQuestionIds: [...attemptedCurrent.value],
      interactionState: interactionState.value,
      completed: problemComplete.value,
    }))
  }, { deep: true })

  function recordProductEvent(name: string, properties?: Record<string, string | number | boolean>) {
    progressState.value.localEvents.push(createProductEvent(name, properties))
    if (progressState.value.localEvents.length > 1000) progressState.value.localEvents.splice(0, progressState.value.localEvents.length - 1000)
  }

  function openRepairForAttempt(attempt: ProgressStateV2['attempts'][number], problem = currentProblem.value, question = currentQuestion.value) {
    if (!problem || !question) return
    const repairStage = repairStageForDiagnostics(attempt.diagnosticKeys) ?? question.stage
    const link = questionMisconceptionLinks(question)[attempt.selectedOptionIndex ?? -1]
      ?? categoryRepairLink(problem, repairStage)
    const existing = progressState.value.repairs.find((repair) => repair.misconceptionKey === link.key)
    if (existing) {
      existing.sourceAttemptId = attempt.id
      existing.status = 'open'
      existing.nextDueOn = attempt.localDay
      existing.snoozedUntil = undefined
      recordProductEvent('repair_reopened', { problemId: attempt.problemId })
      return
    }
    progressState.value.repairs.push(createRepair({
      misconceptionKey: link.key,
      conceptKey: link.conceptKey,
      sourceAttemptId: attempt.id,
      status: 'open',
      nextDueOn: attempt.localDay,
    }))
    recordProductEvent('repair_opened', { problemId: attempt.problemId, mode: link.repairMode })
  }

  function snoozeRepair(repairId: string, days = 7) {
    const repair = progressState.value.repairs.find(({ id }) => id === repairId)
    if (!repair || repair.status === 'validated') return false
    const until = new Date()
    until.setDate(until.getDate() + days)
    repair.snoozedUntil = localDayFor(until)
    repair.nextDueOn = repair.snoozedUntil
    recordProductEvent('repair_snoozed', { days })
    return true
  }

  function activeDailyTaskIdForProblem(problemId: number) {
    return todayTasks.value.find((task) => task.problemId === problemId && !task.completed)?.id ?? null
  }

  function validateRepairFromAttempt(attempt: ProgressStateV2['attempts'][number], dailyTaskId: string | null, problem = currentProblem.value, question = currentQuestion.value) {
    const repairId = dailyTaskId ? repairIdForTask(dailyTaskId) : null
    if (!repairId || !dailyTaskId?.startsWith('repair-retrieval:') || !problem || !question || !attempt.correct || !attempt.firstAttempt) return
    const repair = progressState.value.repairs.find(({ id }) => id === repairId)
    const sourceAttempt = repair && progressState.value.attempts.find(({ id }) => id === repair.sourceAttemptId)
    const currentLink = questionMisconceptionLinks(question)[attempt.selectedOptionIndex ?? -1]
      ?? categoryRepairLink(problem, question.stage)
    if (!repair || !sourceAttempt || repair.status !== 'revisited') return
    if (attempt.localDay <= sourceAttempt.localDay || (attempt.problemId === sourceAttempt.problemId && attempt.questionId === sourceAttempt.questionId)) return
    if (currentLink.key !== repair.misconceptionKey) return
    repair.status = 'validated'
    repair.validatedAt = attempt.occurredAt
    repair.lastReviewedAt = attempt.occurredAt
    recordProductEvent('repair_validated', { problemId: attempt.problemId })
  }

  function updateLearnerProfile(preferences: Partial<LearnerPreferences>) {
    progressState.value.learner = {
      ...progressState.value.learner,
      ...preferences,
      selectedTrackIds: preferences.selectedTrackIds ? [...new Set(preferences.selectedTrackIds)] : progressState.value.learner.selectedTrackIds,
      updatedAt: new Date().toISOString(),
    }
  }

  function beginOnboarding(preferences: LearnerPreferences) {
    updateLearnerProfile(preferences)
    progressState.value.learner = {
      ...progressState.value.learner,
      onboardingStatus: 'in-progress',
      onboardingDecisionIds: [],
      onboardingStartedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    recordProductEvent('onboarding_started', { dailyMinutes: preferences.dailyMinutes, trackCount: preferences.selectedTrackIds.length })
  }

  function recordOnboardingAnswer(problemId: number, question: QuizQuestion, selectedOptionIndex: number) {
    return recordOnboardingInteraction(problemId, question, {
      complete: true,
      correct: selectedOptionIndex === questionAnswer(question),
      firstAttempt: true,
      hintLevelReached: 0,
      diagnosticKeys: selectedOptionIndex === questionAnswer(question) ? [] : [`multiple-choice:${selectedOptionIndex}`],
      evidence: { selectedAnswer: selectedOptionIndex },
      feedback: '',
      state: { format: 'multiple-choice', selectedAnswer: selectedOptionIndex },
    })
  }

  function recordOnboardingInteraction(problemId: number, question: QuizQuestion, result: QuestionInteractionResult) {
    const startedAt = progressState.value.learner.onboardingStartedAt
    const savedAttempt = progressState.value.attempts.find((attempt) => attempt.source === 'onboarding'
      && attempt.problemId === problemId
      && attempt.questionId === question.id
      && (!startedAt || attempt.occurredAt >= startedAt))
    if (savedAttempt) return savedAttempt.correct
    const correct = result.correct
    const firstAttempt = !progressState.value.attempts.some((attempt) => attempt.problemId === problemId && attempt.questionId === question.id)
    const selectedOptionIndex = result.state.format === 'multiple-choice' || result.state.format === 'iteration-visualization'
      ? result.state.selectedAnswer ?? undefined
      : undefined
    const attempt = createAttempt({
      problemId,
      questionId: question.id,
      questionType: normalizedQuestionType(question),
      questionFormat: question.format ?? 'multiple-choice',
      stage: question.stage,
      selectedOptionIndex,
      correct,
      firstAttempt,
      hintLevelReached: 0,
      contentVersion: question.contentVersion,
      source: 'onboarding',
      topicKeys: [...(problems.find((problem) => problem.id === problemId)?.topics ?? [])],
      reasoningSkillKeys: [...question.reasoningSkillKeys],
      instructionalLevel: question.instructionalLevel,
      diagnosticKeys: [...result.diagnosticKeys],
      evidence: result.evidence,
    })
    progressState.value.attempts.push(attempt)
    recordProductEvent('onboarding_decision_answered', { problemId, correct })
    return correct
  }

  function advanceOnboardingDecision(questionId: string) {
    if (progressState.value.learner.onboardingDecisionIds.includes(questionId)) return
    progressState.value.learner = {
      ...progressState.value.learner,
      onboardingDecisionIds: [...progressState.value.learner.onboardingDecisionIds, questionId],
      updatedAt: new Date().toISOString(),
    }
  }

  function completeOnboarding() {
    progressState.value.learner = {
      ...progressState.value.learner,
      onboardingStatus: 'complete',
      updatedAt: new Date().toISOString(),
    }
    recordProductEvent('onboarding_completed')
  }

  function skipOnboarding() {
    progressState.value.learner = {
      ...progressState.value.learner,
      onboardingStatus: 'complete',
      onboardingDecisionIds: [],
      onboardingStartedAt: undefined,
      updatedAt: new Date().toISOString(),
    }
    recordProductEvent('onboarding_skipped')
  }

  function restartOnboarding() {
    progressState.value.learner = {
      ...progressState.value.learner,
      onboardingStatus: 'not-started',
      onboardingDecisionIds: [],
      onboardingStartedAt: undefined,
      updatedAt: new Date().toISOString(),
    }
    recordProductEvent('onboarding_restarted')
  }

  function sessionTasksForToday(excludedTaskIds: string[] = []) {
    return planDailyTasks({
      localDay: todayLocalDay.value,
      dailyMinutes: progressState.value.learner.dailyMinutes,
      selectedTrackIds: progressState.value.learner.selectedTrackIds,
      tracks: learningTracks,
      completedProblemIds: completedProblemIds.value,
      completedBeforeTodayIds: completedBeforeTodayIds.value,
      priorSessions: progressState.value.dailySessions,
      dueRepairTasks: dueRepairCards.value.map(repairTaskFor),
      excludedTaskIds,
    })
  }

  function ensureTodaySession() {
    if (todaySession.value) return todaySession.value
    const tasks = sessionTasksForToday()
    const session: DailySessionRecord = {
      id: `daily-${todayLocalDay.value}`,
      localDay: todayLocalDay.value,
      plannedMinutes: progressState.value.learner.dailyMinutes,
      taskIds: tasks.map(({ id }) => id),
      completedTaskIds: [],
      status: 'planned',
      rebuildCount: 0,
    }
    progressState.value.dailySessions.push(session)
    recordProductEvent('daily_session_created', { taskCount: tasks.length, plannedMinutes: session.plannedMinutes })
    return session
  }

  function beginDailyTask(taskId: string) {
    const session = ensureTodaySession()
    if (!session.taskIds.includes(taskId) || session.status === 'complete') return false
    if (session.status === 'planned') {
      session.status = 'in-progress'
      session.startedAt = new Date().toISOString()
      recordProductEvent('daily_task_started', { taskId })
    }
    const repairId = repairIdForTask(taskId)
    if (repairId) {
      const repair = progressState.value.repairs.find(({ id }) => id === repairId)
      if (repair && repair.status === 'open') repair.status = 'scheduled'
    }
    return true
  }

  function completeDailyTask(taskId: string) {
    const session = ensureTodaySession()
    if (!session.taskIds.includes(taskId) || session.completedTaskIds.includes(taskId)) return false
    session.completedTaskIds.push(taskId)
    if (session.status === 'planned') session.startedAt = new Date().toISOString()
    session.status = session.completedTaskIds.length === session.taskIds.length ? 'complete' : 'in-progress'
    if (session.status === 'complete') session.completedAt = new Date().toISOString()
    const repairId = repairIdForTask(taskId)
    if (repairId) {
      const repair = progressState.value.repairs.find(({ id }) => id === repairId)
      if (repair && repair.status !== 'validated') {
        repair.status = 'revisited'
        repair.lastReviewedAt = new Date().toISOString()
      }
    }
    recordProductEvent(session.status === 'complete' ? 'daily_session_completed' : 'daily_task_completed', { taskId })
    return true
  }

  function rebuildTodaySession() {
    const session = ensureTodaySession()
    if (session.status !== 'planned' || (session.rebuildCount ?? 0) >= 1) return false
    const replacement = sessionTasksForToday(session.taskIds.slice(0, 1))
    if (!replacement.length) return false
    session.taskIds = replacement.map(({ id }) => id)
    session.rebuildCount = (session.rebuildCount ?? 0) + 1
    recordProductEvent('daily_session_rebuilt', { taskCount: replacement.length })
    return true
  }

  function resetProblemSessionState() {
    currentQuestionIndex.value = 0
    selectedAnswer.value = null
    submitted.value = false
    answerCorrect.value = null
    firstTryCorrect.value = 0
    revealedHintCount.value = 0
    confidence.value = null
    attemptedCurrent.value = new Set()
    interactionState.value = null
    problemComplete.value = false
  }

  function initializeProblem(problemId: number) {
    const selected = availableProblems.value.find((problem) => problem.id === problemId)
    if (!selected) return false
    const rawSession = storage.getItem(ACTIVE_PROBLEM_SESSION_KEY)
    const baseQuestions = selected.questions.length ? selected.questions : (quizCache.value[selected.id] || [])
    const transferQuestions = compilePilotTransferQuestions(selected)
    const restoredPath = questionPathFromActiveSession(rawSession, selected.id, [...baseQuestions, ...transferQuestions])
    const dailySession = Boolean(todayTasks.value.find((task) => task.problemId === selected.id && !task.completed))
    const questions = restoredPath ?? selectAdaptiveQuestionPath(baseQuestions, transferQuestions, progressState.value.attempts, { dailySession })
    const restored = parseActiveProblemSession(rawSession, selected.id, questions)
    if (rawSession && !restored) storage.removeItem(ACTIVE_PROBLEM_SESSION_KEY)

    currentProblemId.value = selected.id
    activeQuestions.value = questions
    resetProblemSessionState()
    if (restored) {
      currentQuestionIndex.value = restored.questionIndex
      selectedAnswer.value = restored.selectedAnswer
      submitted.value = restored.submitted
      answerCorrect.value = restored.answerCorrect
      firstTryCorrect.value = restored.firstTryCorrect
      revealedHintCount.value = restored.revealedHintCount
      confidence.value = restored.confidence
      attemptedCurrent.value = new Set(restored.attemptedQuestionIds)
      interactionState.value = restored.interactionState
      problemComplete.value = restored.completed
    }
    return true
  }

  function pickRandomProblemId() {
    if (!matchingProblems.value.length) return null
    const eligibleIds = matchingProblems.value.map(({ id }) => id)
    const nextPoolKey = [...eligibleIds].sort((left, right) => left - right).join(',')
    if (nextPoolKey !== problemPoolKey) {
      problemQueue = []
      problemPoolKey = nextPoolKey
    }
    const draw = drawRandomProblem(eligibleIds, currentProblemId.value, problemQueue)
    if (draw.selectedId === null) return null
    problemQueue = draw.remainingQueue
    return draw.selectedId
  }

  function startProblem(problemId: number) {
    const started = initializeProblem(problemId)
    if (started) recordProductEvent('problem_started', { problemId })
    return started
  }

  function startRandomProblem() {
    const problemId = pickRandomProblemId()
    return problemId === null ? false : startProblem(problemId)
  }

  function clearCurrentProblem() {
    storage.removeItem(ACTIVE_PROBLEM_SESSION_KEY)
    currentProblemId.value = null
    activeQuestions.value = []
    resetProblemSessionState()
  }

  function setGeneratedQuestions(questions: QuizQuestion[]) {
    if (!currentProblem.value || questions.length !== 5) return false
    const sequencedQuestions = sequenceDataStructureBeforeAlgorithms(questions)
    if (!hasDataStructureGateBeforeAlgorithms(sequencedQuestions)) return false
    activeQuestions.value = sequencedQuestions
    quizCache.value[currentProblem.value.id] = sequencedQuestions
    return true
  }

  function recordAnswer(correct: boolean, selectedOptionIndex?: number, result?: QuestionInteractionResult) {
    if (!currentProblem.value || !currentQuestion.value || submitted.value) return null
    const key = `${currentProblem.value.id}:${currentQuestion.value.id}`
    const firstAttempt = !attemptedCurrent.value.has(key)
    attemptedCurrent.value.add(key)
    const dailyTaskId = activeDailyTaskIdForProblem(currentProblem.value.id)
    const attempt = createAttempt({
      problemId: currentProblem.value.id,
      questionId: currentQuestion.value.id,
      questionType: normalizedQuestionType(currentQuestion.value),
      questionFormat: currentQuestion.value.format ?? 'multiple-choice',
      stage: currentQuestion.value.stage,
      selectedOptionIndex,
      correct,
      firstAttempt,
      hintLevelReached: Math.min(revealedHintCount.value, 3) as 0 | 1 | 2 | 3,
      confidence: confidence.value ?? undefined,
      contentVersion: currentQuestion.value.contentVersion,
      source: dailyTaskId ? 'daily-session' : 'practice',
      topicKeys: [...currentProblem.value.topics],
      reasoningSkillKeys: [...currentQuestion.value.reasoningSkillKeys],
      instructionalLevel: currentQuestion.value.instructionalLevel,
      diagnosticKeys: [...(result?.diagnosticKeys ?? [])],
      evidence: result?.evidence ?? {},
    })
    progressState.value.attempts.push(attempt)
    if (!correct) openRepairForAttempt(attempt)
    else validateRepairFromAttempt(attempt, dailyTaskId)
    if (correct) {
      if (firstAttempt) firstTryCorrect.value++
      progressState.value.legacyAnswerStreak += 1
      progressState.value.legacyBestAnswerStreak = Math.max(progressState.value.legacyBestAnswerStreak, progressState.value.legacyAnswerStreak)
    } else {
      progressState.value.legacyAnswerStreak = 0
    }
    recordProductEvent('answer_submitted', { problemId: currentProblem.value.id, correct, firstAttempt })
    answerCorrect.value = correct
    submitted.value = true
    return correct
  }

  function submitAnswer() {
    if (selectedAnswer.value === null || !currentProblem.value || !currentQuestion.value) return null
    return recordAnswer(selectedAnswer.value === questionAnswer(currentQuestion.value), selectedAnswer.value)
  }

  function submitEvaluatedAnswer(correct: boolean) {
    return recordAnswer(correct)
  }

  function submitInteraction(result: QuestionInteractionResult) {
    if (!result.complete) return null
    const selectedOptionIndex = result.state.format === 'multiple-choice' || result.state.format === 'iteration-visualization'
      ? result.state.selectedAnswer ?? undefined
      : undefined
    return recordAnswer(result.correct, selectedOptionIndex, result)
  }

  function tryAgain() {
    selectedAnswer.value = null
    confidence.value = null
    submitted.value = false
    answerCorrect.value = null
    interactionState.value = interactionState.value?.format === 'multiple-choice'
      ? null
      : interactionState.value?.format === 'code-construction'
        ? { ...interactionState.value, selectedChoiceId: null, lastCheckedChoiceId: null }
        : interactionState.value
  }

  function setInteractionState(state: QuestionInteractionState | null) {
    interactionState.value = state
  }

  function revealNextHint() {
    const maximum = currentQuestion.value?.hintLevels?.length ?? 0
    revealedHintCount.value = Math.min(revealedHintCount.value + 1, maximum)
  }

  function nextQuestion() {
    if (!currentProblem.value) return false
    if (currentQuestionIndex.value < activeQuestions.value.length - 1) {
      currentQuestionIndex.value++
      selectedAnswer.value = null
      submitted.value = false
      answerCorrect.value = null
      revealedHintCount.value = 0
      confidence.value = null
      interactionState.value = null
      return true
    }
    if (!problemComplete.value) {
      progressState.value.completedProblems.push(createCompletion({
        problemId: currentProblem.value.id,
        correct: firstTryCorrect.value,
        total: activeQuestions.value.length,
        contentVersion: COACHING_CONTENT_VERSION,
      }))
      recordProductEvent('problem_completed', { problemId: currentProblem.value.id, firstTryCorrect: firstTryCorrect.value, total: activeQuestions.value.length })
      problemComplete.value = true
    }
    return false
  }

  function exportProgressData() {
    return serializeProgress(progressState.value)
  }

  function exportRecoveryData() {
    return progressRecovery.value?.raw ?? null
  }

  function importProgressData(raw: string) {
    const imported = importProgress(raw, progressState.value, progressContentIndex)
    if (!imported.state) {
      progressRecovery.value = { storageKey: PROGRESS_V2_STORAGE_KEY, raw, reason: 'invalid-import' }
      return { ok: false, error: imported.error }
    }
    progressState.value = imported.state
    progressRecovery.value = null
    recordProductEvent('progress_imported')
    return { ok: true, error: null }
  }

  function resetProgress() {
    progressState.value = emptyProgressState()
    progressRecovery.value = null
    storage.removeItem(PROGRESS_V1_STORAGE_KEY)
    storage.removeItem(PROGRESS_V2_STORAGE_KEY)
    storage.removeItem(ACTIVE_PROBLEM_SESSION_KEY)
  }

  return {
    answers, results, streak, bestStreak, progressState, progressRecovery, progressMigrationStatus, progressStorageError,
    currentProblemId, currentQuestionIndex, selectedAnswer, submitted, answerCorrect,
    firstTryCorrect, revealedHintCount, confidence, interactionState, problemComplete, filters, activeQuestions, currentProblem, currentQuestion, questionCount, availableProblems, matchingProblems,
    totalCorrect, accuracy, completedProblemIds, typeStats, formatStats, reasoningSkillStats, topicMastery, aiCoachEnabled, catalogSize: problems.length,
    todaySession, todayTasks, practiceConsistency, repairCards, dueRepairCards,
    startProblem, pickRandomProblemId, startRandomProblem, clearCurrentProblem, setGeneratedQuestions, submitAnswer, submitEvaluatedAnswer, submitInteraction, tryAgain,
    setInteractionState, revealNextHint, nextQuestion, resetProgress, exportProgressData, exportRecoveryData, importProgressData, recordProductEvent,
    updateLearnerProfile, beginOnboarding, recordOnboardingAnswer, recordOnboardingInteraction, advanceOnboardingDecision, completeOnboarding, skipOnboarding, restartOnboarding,
    ensureTodaySession, beginDailyTask, completeDailyTask, rebuildTodaySession, snoozeRepair,
  }
})
