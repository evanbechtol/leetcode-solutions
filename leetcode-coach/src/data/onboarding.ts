import type { Problem, QuestionStage, QuizQuestion } from '../types'
import { problems } from './problems'
import { learningTrackById, type LearningTrack } from './tracks'

export interface OnboardingDecision {
  problem: Problem
  question: QuizQuestion
}

interface DecisionReference {
  problemId: number
  stage: QuestionStage
}

// These questions are compiled from reviewed coaching facts that already ship
// in the guided-problem paths. Do not substitute generated diagnostic content.
const diagnosticReferences: DecisionReference[] = [
  { problemId: 1, stage: 'contract' },
  { problemId: 1, stage: 'data-structure' },
  { problemId: 704, stage: 'pattern' },
  { problemId: 3, stage: 'data-structure' },
  { problemId: 121, stage: 'time-complexity' },
  { problemId: 704, stage: 'space-complexity' },
]

const decisionFor = ({ problemId, stage }: DecisionReference): OnboardingDecision => {
  const problem = problems.find((candidate) => candidate.id === problemId)
  const question = problem?.questions.find((candidate) => candidate.stage === stage)
  if (!problem || !question) throw new Error(`Missing reviewed onboarding decision for problem ${problemId} at ${stage}`)
  return { problem, question }
}

export const onboardingDecisions = diagnosticReferences.map(decisionFor)

export interface OnboardingRecommendation {
  selectedTrack: LearningTrack
  recommendedTrack: LearningTrack
  lessonSlug: string
  problemId: number
  reason: string
  diagnosticCorrect: number
  diagnosticTotal: number
}

export const recommendationFor = (
  trackId: string,
  diagnosticCorrect: number,
): OnboardingRecommendation => {
  const selectedTrack = learningTrackById[trackId] ?? learningTrackById.arrays
  const needsPrerequisite = diagnosticCorrect <= Math.floor(onboardingDecisions.length / 2)
  const recommendedTrack = needsPrerequisite && selectedTrack.prerequisiteTrackIds.length
    ? learningTrackById[selectedTrack.prerequisiteTrackIds[0]]
    : selectedTrack

  return {
    selectedTrack,
    recommendedTrack,
    lessonSlug: recommendedTrack.lessonSlugs[0],
    problemId: recommendedTrack.entryProblemId,
    reason: recommendedTrack.id === selectedTrack.id
      ? `You chose ${selectedTrack.title}. Start with its foundation lesson, then apply the idea in one guided problem.`
      : `A few core decisions are worth reinforcing before ${selectedTrack.title}. Begin with ${recommendedTrack.title}; you can return to your chosen track at any time.`,
    diagnosticCorrect,
    diagnosticTotal: onboardingDecisions.length,
  }
}
