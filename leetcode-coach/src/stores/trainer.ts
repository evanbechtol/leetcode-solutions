import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { problems } from '../data/problems'
import type { AnswerRecord, Filters, ProblemResult, QuestionType, QuizQuestion } from '../types'

const STORAGE_KEY = 'pathfinder-progress-v1'
const QUIZ_CACHE_KEY = 'pathfinder-generated-quizzes-v1'
const aiCoachEnabled = import.meta.env.MODE === 'ai' || import.meta.env.VITE_AI_COACH_ENABLED === 'true'
export const QUESTION_TYPES: QuestionType[] = ['Comprehension', 'Pattern', 'Data Structure', 'Invariant', 'Algorithm', 'Correctness', 'Complexity']

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
    return { ...answer, questionType: 'Complexity' }
  }
  return answer
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
  const firstTryCorrect = ref(0)
  const attemptedCurrent = ref(new Set<string>())
  const activeQuestions = ref<QuizQuestion[]>([])
  const quizCache = ref<Record<number, QuizQuestion[]>>((() => {
    try { return JSON.parse(localStorage.getItem(QUIZ_CACHE_KEY) || '{}') }
    catch { return {} }
  })())
  const filters = ref<Filters>({ difficulties: [], sets: [], topics: [], algorithms: [] })

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

  function startRandomProblem() {
    if (!matchingProblems.value.length) return false
    const pool = matchingProblems.value.filter((problem) => problem.id !== currentProblemId.value)
    const options = pool.length ? pool : matchingProblems.value
    const selected = options[Math.floor(Math.random() * options.length)]
    currentProblemId.value = selected.id
    activeQuestions.value = selected.questions.length ? selected.questions : (quizCache.value[selected.id] || [])
    currentQuestionIndex.value = 0
    selectedAnswer.value = null
    submitted.value = false
    firstTryCorrect.value = 0
    attemptedCurrent.value = new Set()
    return true
  }

  function setGeneratedQuestions(questions: QuizQuestion[]) {
    if (!currentProblem.value || questions.length !== 5) return false
    activeQuestions.value = questions
    quizCache.value[currentProblem.value.id] = questions
    return true
  }

  function submitAnswer() {
    if (selectedAnswer.value === null || !currentProblem.value || !currentQuestion.value) return null
    const correct = selectedAnswer.value === currentQuestion.value.answer
    const key = `${currentProblem.value.id}:${currentQuestion.value.id}`
    const firstAttempt = !attemptedCurrent.value.has(key)
    attemptedCurrent.value.add(key)
    answers.value.push({ problemId: currentProblem.value.id, questionId: currentQuestion.value.id, questionType: currentQuestion.value.type, correct, answeredAt: new Date().toISOString() })
    if (correct) {
      if (firstAttempt) firstTryCorrect.value++
      streak.value++
      bestStreak.value = Math.max(bestStreak.value, streak.value)
    } else {
      streak.value = 0
    }
    submitted.value = true
    return correct
  }

  function tryAgain() {
    selectedAnswer.value = null
    submitted.value = false
  }

  function nextQuestion() {
    if (!currentProblem.value) return false
    if (currentQuestionIndex.value < activeQuestions.value.length - 1) {
      currentQuestionIndex.value++
      selectedAnswer.value = null
      submitted.value = false
      return true
    }
    results.value.push({ problemId: currentProblem.value.id, completedAt: new Date().toISOString(), correct: firstTryCorrect.value, total: activeQuestions.value.length })
    return false
  }

  function resetProgress() {
    answers.value = []
    results.value = []
    streak.value = 0
    bestStreak.value = 0
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    answers, results, streak, bestStreak, currentProblemId, currentQuestionIndex, selectedAnswer, submitted,
    firstTryCorrect, filters, activeQuestions, currentProblem, currentQuestion, questionCount, availableProblems, matchingProblems,
    totalCorrect, accuracy, completedProblemIds, typeStats, topicMastery, aiCoachEnabled, catalogSize: problems.length, startRandomProblem,
    setGeneratedQuestions, submitAnswer, tryAgain, nextQuestion, resetProgress,
  }
})
