export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type QuestionType =
  | 'Comprehension'
  | 'Pattern'
  | 'Data Structure'
  | 'Invariant'
  | 'Algorithm'
  | 'Correctness'
  | 'Complexity'

export type LegacyQuestionType = 'Time Complexity' | 'Space Complexity'

export type QuestionStage =
  | 'contract'
  | 'bottleneck'
  | 'pattern'
  | 'data-structure'
  | 'invariant'
  | 'transition'
  | 'trace'
  | 'correctness'
  | 'edge-case'
  | 'time-complexity'
  | 'space-complexity'
  | 'tradeoff'

export interface QuizQuestion {
  id: string
  type: QuestionType | LegacyQuestionType
  stage?: QuestionStage
  prompt: string
  options: string[]
  answer: number
  explanation: string
  hint: string
  optionFeedback?: string[]
}

export interface Problem {
  id: number
  title: string
  difficulty: Difficulty
  set: string[]
  topics: string[]
  algorithms: string[]
  description: string
  examples: { input: string; output: string; explanation?: string }[]
  constraints: string[]
  insight: string
  solution: string
  questions: QuizQuestion[]
  starterCode?: string
  solutionLanguage?: string
  codeSamples?: Record<string, string>
  source?: {
    name: string
    version: string
    repository: string
    license: string
    slug: string
  }
}

export interface Filters {
  difficulties: Difficulty[]
  sets: string[]
  topics: string[]
  algorithms: string[]
}

export interface AnswerRecord {
  problemId: number
  questionId: string
  questionType: QuestionType | LegacyQuestionType
  correct: boolean
  answeredAt: string
}

export interface ProblemResult {
  problemId: number
  completedAt: string
  correct: number
  total: number
}
