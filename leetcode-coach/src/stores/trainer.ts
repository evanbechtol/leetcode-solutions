import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { problems } from '../data/problems'
import type { AnswerRecord, Filters, ProblemResult, QuestionFormat, QuestionInteractionState, QuestionType, QuizQuestion } from '../types'
import { drawRandomProblem } from '../utils/randomSelection'
import { hasDataStructureGateBeforeAlgorithms, sequenceDataStructureBeforeAlgorithms } from '../utils/questionSequence'
import { ACTIVE_PROBLEM_SESSION_KEY, parseActiveProblemSession } from '../utils/activeProblemSession'

const STORAGE_KEY = 'pathfinder-progress-v1'
const QUIZ_CACHE_KEY = 'pathfinder-generated-quizzes-v1'
const aiCoachEnabled = import.meta.env.MODE === 'ai' || import.meta.env.VITE_AI_COACH_ENABLED === 'true'
export const QUESTION_TYPES: QuestionType[] = ['Comprehension', 'Pattern', 'Data Structure', 'Invariant', 'Algorithm', 'Correctness', 'Complexity']
export const QUESTION_FORMATS: Array<{ format: QuestionFormat; label: string }> = [
  { format: 'multiple-choice', label: 'Decision questions' },
  { format: 'algorithm-builder', label: 'Build the algorithm' },
  { format: 'code-construction', label: 'Construct the code' },
]

interface PersistedProgress {
  answers: AnswerRecord[]
  results: ProblemResult[]
  streak: number
  bestStreak: number
}

function loadProgress(): PersistedProgress {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '')
    return {
      answers: Array.isArray(value.answers) ? value.answers.map(normalizeAnswerRecord) : [],
      results: Array.isArray(value.results) ? value.results : [],
      streak: Number(value.streak) || 0,
      bestStreak: Number(value.bestStreak) || 0,
    }
  } catch {
    return { answers: [], results: [], streak: 0, bestStreak: 0 }
  }
}

export function normalizeAnswerRecord(answer: AnswerRecord): AnswerRecord {
  if (answer.questionType === 'Time Complexity' || answer.questionType === 'Space Complexity') {
    return { ...answer, questionType: 'Complexity', questionFormat: answer.questionFormat ?? 'multiple-choice' }
  }
  return { ...answer, questionFormat: answer.questionFormat ?? 'multiple-choice' }
}

export const useTrainerStore = defineStore('trainer', () => {
  const saved = loadProgress()
  const answers = ref<AnswerRecord[]>(saved.answers)
  const results = ref<ProblemResult[]>(saved.results)
  const streak = ref(saved.streak)
  const bestStreak = ref(saved.bestStreak)
  const currentProblemId = ref<number | null>(null)
  const currentQuestionIndex = ref(0)
  const selectedAnswer = ref<number | null>(null)
  const submitted = ref(false)
  const answerCorrect = ref<boolean | null>(null)
  const firstTryCorrect = ref(0)
  const revealedHintCount = ref(0)
  const attemptedCurrent = ref(new Set<string>())
  const interactionState = ref<QuestionInteractionState | null>(null)
  const problemComplete = ref(false)
  const activeQuestions = ref<QuizQuestion[]>([])
  const quizCache = ref<Record<number, QuizQuestion[]>>((() => {
    try { return JSON.parse(localStorage.getItem(QUIZ_CACHE_KEY) || '{}') }
    catch { return {} }
  })())
  const filters = ref<Filters>({ difficulties: [], sets: [], topics: [], algorithms: [] })
  let problemQueue: number[] = []
  let problemPoolKey = ''

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
  const typeStats = computed(() => {
    return QUESTION_TYPES.map((type) => {
      const relevant = answers.value.filter((answer) => answer.questionType === type)
      const correct = relevant.filter((answer) => answer.correct).length
      return { type, correct, total: relevant.length, accuracy: relevant.length ? Math.round((correct / relevant.length) * 100) : 0 }
    })
  })
  const formatStats = computed(() => QUESTION_FORMATS.map(({ format, label }) => {
    const relevant = answers.value.filter((answer) => (answer.questionFormat ?? 'multiple-choice') === format)
    const correct = relevant.filter((answer) => answer.correct).length
    return { format, label, correct, total: relevant.length, accuracy: relevant.length ? Math.round((correct / relevant.length) * 100) : 0 }
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

  watch([answers, results, streak, bestStreak], () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers: answers.value, results: results.value, streak: streak.value, bestStreak: bestStreak.value }))
  }, { deep: true })
  watch(quizCache, () => localStorage.setItem(QUIZ_CACHE_KEY, JSON.stringify(quizCache.value)), { deep: true })

  watch([
    currentProblemId,
    currentQuestionIndex,
    selectedAnswer,
    submitted,
    answerCorrect,
    firstTryCorrect,
    revealedHintCount,
    attemptedCurrent,
    interactionState,
    problemComplete,
    activeQuestions,
  ], () => {
    if (currentProblemId.value === null || !currentQuestion.value) return
    localStorage.setItem(ACTIVE_PROBLEM_SESSION_KEY, JSON.stringify({
      version: 1,
      problemId: currentProblemId.value,
      questionId: currentQuestion.value.id,
      questionIndex: currentQuestionIndex.value,
      selectedAnswer: selectedAnswer.value,
      submitted: submitted.value,
      answerCorrect: answerCorrect.value,
      firstTryCorrect: firstTryCorrect.value,
      revealedHintCount: revealedHintCount.value,
      attemptedQuestionIds: [...attemptedCurrent.value],
      interactionState: interactionState.value,
      completed: problemComplete.value,
    }))
  }, { deep: true })

  function resetProblemSessionState() {
    currentQuestionIndex.value = 0
    selectedAnswer.value = null
    submitted.value = false
    answerCorrect.value = null
    firstTryCorrect.value = 0
    revealedHintCount.value = 0
    attemptedCurrent.value = new Set()
    interactionState.value = null
    problemComplete.value = false
  }

  function initializeProblem(problemId: number) {
    const selected = availableProblems.value.find((problem) => problem.id === problemId)
    if (!selected) return false
    const questions = selected.questions.length ? selected.questions : (quizCache.value[selected.id] || [])
    const rawSession = localStorage.getItem(ACTIVE_PROBLEM_SESSION_KEY)
    const restored = parseActiveProblemSession(rawSession, selected.id, questions)
    if (rawSession && !restored) localStorage.removeItem(ACTIVE_PROBLEM_SESSION_KEY)

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
    return initializeProblem(problemId)
  }

  function startRandomProblem() {
    const problemId = pickRandomProblemId()
    return problemId === null ? false : initializeProblem(problemId)
  }

  function clearCurrentProblem() {
    localStorage.removeItem(ACTIVE_PROBLEM_SESSION_KEY)
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

  function recordAnswer(correct: boolean) {
    if (!currentProblem.value || !currentQuestion.value || submitted.value) return null
    const key = `${currentProblem.value.id}:${currentQuestion.value.id}`
    const firstAttempt = !attemptedCurrent.value.has(key)
    attemptedCurrent.value.add(key)
    answers.value.push({
      problemId: currentProblem.value.id,
      questionId: currentQuestion.value.id,
      questionType: currentQuestion.value.type,
      questionFormat: currentQuestion.value.format ?? 'multiple-choice',
      correct,
      answeredAt: new Date().toISOString(),
    })
    if (correct) {
      if (firstAttempt) firstTryCorrect.value++
      streak.value++
      bestStreak.value = Math.max(bestStreak.value, streak.value)
    } else {
      streak.value = 0
    }
    answerCorrect.value = correct
    submitted.value = true
    return correct
  }

  function submitAnswer() {
    if (selectedAnswer.value === null || !currentProblem.value || !currentQuestion.value) return null
    const correct = selectedAnswer.value === currentQuestion.value.answer
    return recordAnswer(correct)
  }

  function submitEvaluatedAnswer(correct: boolean) {
    return recordAnswer(correct)
  }

  function tryAgain() {
    selectedAnswer.value = null
    submitted.value = false
    answerCorrect.value = null
    interactionState.value = interactionState.value?.format === 'code-construction'
      ? { ...interactionState.value, selectedChoiceId: null, lastCheckedChoiceId: null }
      : null
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
      interactionState.value = null
      return true
    }
    if (!problemComplete.value) {
      results.value.push({ problemId: currentProblem.value.id, completedAt: new Date().toISOString(), correct: firstTryCorrect.value, total: activeQuestions.value.length })
      problemComplete.value = true
    }
    return false
  }

  function resetProgress() {
    answers.value = []
    results.value = []
    streak.value = 0
    bestStreak.value = 0
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(ACTIVE_PROBLEM_SESSION_KEY)
  }

  return {
    answers, results, streak, bestStreak, currentProblemId, currentQuestionIndex, selectedAnswer, submitted, answerCorrect,
    firstTryCorrect, revealedHintCount, interactionState, problemComplete, filters, activeQuestions, currentProblem, currentQuestion, questionCount, availableProblems, matchingProblems,
    totalCorrect, accuracy, completedProblemIds, typeStats, formatStats, topicMastery, aiCoachEnabled, catalogSize: problems.length, startProblem,
    pickRandomProblemId, startRandomProblem, clearCurrentProblem, setGeneratedQuestions, submitAnswer, submitEvaluatedAnswer, tryAgain, setInteractionState, revealNextHint, nextQuestion, resetProgress,
  }
})
