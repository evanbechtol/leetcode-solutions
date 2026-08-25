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
export type QuestionFormat = 'multiple-choice' | 'algorithm-builder' | 'iteration-visualization' | 'code-construction'

export type QuestionStage =
  | 'contract'
  | 'bottleneck'
  | 'pattern'
  | 'data-structure'
  | 'invariant'
  | 'visualization'
  | 'build-algorithm'
  | 'transition'
  | 'trace'
  | 'correctness'
  | 'edge-case'
  | 'time-complexity'
  | 'space-complexity'
  | 'tradeoff'

export interface AlgorithmBuildStep {
  id: string
  text: string
  reason: string
}

export interface AlgorithmBuilderConfig {
  steps: AlgorithmBuildStep[]
  correctOrder: string[]
}

export interface CodeConstructionChoice {
  id: string
  codeByLanguage: Record<string, string>
  feedback: string
}

export interface CodeConstructionStep {
  id: string
  concept: string
  prerequisites: string[]
  correctChoiceId: string
  choices: CodeConstructionChoice[]
  stateEffect: string
  exampleState: string
  explanation: string
  hints: HintLevel[]
}

export interface CodeConstructionConfig {
  languages: string[]
  exampleInput: string
  openingByLanguage: Record<string, string>
  closingByLanguage: Record<string, string>
  steps: CodeConstructionStep[]
}

export interface VisualizationFrame {
  id: string
  phase: string
  title: string
  action: string
  input: string
  expectedOutput: string
  currentOutput: string
  processed: string
  remaining: string
  activeCodeLines: number[]
  variables: Array<{
    name: string
    value: string
    previousValue?: string
    changed?: boolean
    role: 'input' | 'control' | 'state' | 'output'
  }>
  structures?: Array<{
    name: string
    kind: 'array' | 'string' | 'map' | 'queue' | 'graph' | 'tree' | 'set'
    description: string
    items: Array<{
      key: string
      value: string
      previousValue?: string
      changed?: boolean
      status?: 'active' | 'processed' | 'candidate' | 'discarded' | 'queued' | 'result'
    }>
  }>
  invariant: string
}

export interface IterationVisualizationConfig {
  input: string
  expectedOutput: string
  code: string
  language: string
  frames: VisualizationFrame[]
}

export interface AlgorithmBuilderInteractionState {
  format: 'algorithm-builder'
  chosenIds: string[]
}

export interface IterationVisualizationInteractionState {
  format: 'iteration-visualization'
  frameIndex: number
  furthestFrame: number
  selectedAnswer: number | null
}

export interface CodeConstructionInteractionState {
  format: 'code-construction'
  completedStepIds: string[]
  selectedChoiceId: string | null
  lastCheckedChoiceId: string | null
}

export type QuestionInteractionState = AlgorithmBuilderInteractionState | IterationVisualizationInteractionState | CodeConstructionInteractionState

export interface TeachingContext {
  title: string
  body: string
}

export interface FormalTerm {
  name: string
  definition: string
}

export interface HintLevel {
  id: 'cue' | 'concept' | 'worked-step'
  label: string
  text: string
}

export interface QuizQuestion {
  id: string
  type: QuestionType | LegacyQuestionType
  format?: QuestionFormat
  stage?: QuestionStage
  prompt: string
  options: string[]
  answer: number
  explanation: string
  hint: string
  hintLevels?: HintLevel[]
  prerequisites?: QuestionStage[]
  readingLevelNotes?: string[]
  teachingContext?: TeachingContext
  formalTerm?: FormalTerm
  optionFeedback?: string[]
  builder?: AlgorithmBuilderConfig
  construction?: CodeConstructionConfig
  visualization?: IterationVisualizationConfig
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
  questionFormat?: QuestionFormat
  correct: boolean
  answeredAt: string
}

export interface ProblemResult {
  problemId: number
  completedAt: string
  correct: number
  total: number
}
