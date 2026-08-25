import type { InstructionalLevel, QuizQuestion, ReasoningSkillKey } from '../types'
import type { AttemptRecord } from '../stores/progress'

const localDay = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const instructionalLevelFor = (
  skill: ReasoningSkillKey,
  attempts: AttemptRecord[],
  currentProblemId: number,
  now = new Date(),
): InstructionalLevel => {
  const relevant = attempts.filter((attempt) => attempt.reasoningSkillKeys.includes(skill))
  if (!relevant.length) return 'complete'
  const successful = relevant.filter(({ correct, hintLevelReached }) => correct && hintLevelReached <= 1)
  if (successful.length < 2) return 'complete'
  const onDifferentProblem = successful.some(({ problemId, firstAttempt }) => problemId !== currentProblemId && firstAttempt)
  if (!onDifferentProblem) return 'construct'
  const beforeToday = successful.some(({ localDay: attemptDay, firstAttempt }) => firstAttempt && attemptDay < localDay(now))
  return beforeToday ? 'transfer' : 'retrieve'
}

const prerequisiteSkills = (question: QuizQuestion): ReasoningSkillKey[] => {
  if (question.format === 'near-twin') return ['constraint-signal']
  if (question.format === 'constraint-mutation') return ['constraint-signal', 'operation-requirement', 'state-sufficiency']
  if (question.format === 'structural-analogy') return ['operation-requirement', 'state-sufficiency']
  return question.reasoningSkillKeys
}

const eligibleTransfer = (question: QuizQuestion, attempts: AttemptRecord[], problemId: number, now: Date) => prerequisiteSkills(question)
  .every((skill) => ['retrieve', 'transfer'].includes(instructionalLevelFor(skill, attempts, problemId, now)))

export const selectAdaptiveQuestionPath = (
  basePath: QuizQuestion[],
  transferQuestions: QuizQuestion[],
  attempts: AttemptRecord[],
  options: { dailySession: boolean; now?: Date },
) => {
  const now = options.now ?? new Date()
  const problemId = basePath[0]?.id ? Number(basePath[0].id.split(':')[0]) : -1
  const leveled = basePath.map((question) => {
    const levels = question.reasoningSkillKeys.map((skill) => instructionalLevelFor(skill, attempts, problemId, now))
    const rank: InstructionalLevel[] = ['observe', 'complete', 'construct', 'retrieve', 'transfer']
    const instructionalLevel = levels.reduce((lowest, level) => rank.indexOf(level) < rank.indexOf(lowest) ? level : lowest, levels[0] ?? question.instructionalLevel)
    return { ...question, instructionalLevel }
  })
  if (!options.dailySession) return leveled

  const eligible = transferQuestions
    .filter((question) => eligibleTransfer(question, attempts, problemId, now))
    .sort((left, right) => {
      const leftCount = attempts.filter(({ reasoningSkillKeys }) => reasoningSkillKeys.some((skill) => left.reasoningSkillKeys.includes(skill))).length
      const rightCount = attempts.filter(({ reasoningSkillKeys }) => reasoningSkillKeys.some((skill) => right.reasoningSkillKeys.includes(skill))).length
      return leftCount - rightCount || left.id.localeCompare(right.id)
    })
  const selected = eligible[0]
  if (!selected) return leveled
  const patternIndex = leveled.findIndex(({ stage }) => stage === 'pattern')
  if (patternIndex < 0) return leveled
  return leveled.map((question, index) => index === patternIndex ? selected : question)
}

export const repairStageForDiagnostics = (diagnosticKeys: string[]) => {
  if (diagnosticKeys.some((key) => key.startsWith('constraint-signal:') || key.startsWith('pattern-boundary:') || key.startsWith('constraint-mutation:'))) return 'contract' as const
  if (diagnosticKeys.some((key) => key.startsWith('operation-') || key.startsWith('structure-') || key.startsWith('state-classification:'))) return 'data-structure' as const
  if (diagnosticKeys.some((key) => key.startsWith('structural-analogy:'))) return 'pattern' as const
  return undefined
}
