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

export const QUESTION_FORMATS = [
  'multiple-choice',
  'algorithm-builder',
  'iteration-visualization',
  'code-construction',
  'constraint-signals',
  'operation-contract',
  'state-sufficiency',
  'near-twin',
  'constraint-mutation',
  'structural-analogy',
] as const

export type QuestionFormat = typeof QUESTION_FORMATS[number]

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

export type ReasoningSkillKey =
  | 'constraint-signal'
  | 'runtime-feasibility'
  | 'operation-requirement'
  | 'state-sufficiency'
  | 'safe-discard'
  | 'pattern-boundary'
  | 'counterfactual-transfer'
  | 'structural-analogy'
  | 'representation-generation'
  | 'derivation-completion'
  | 'monotonicity'
  | 'greedy-safety'
  | 'worst-case-construction'
  | 'behavioral-pattern-recognition'
  | 'proof-structure'

export type InstructionalLevel = 'observe' | 'complete' | 'construct' | 'retrieve' | 'transfer'
export type ConfidenceLevel = 'low' | 'medium' | 'high'

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

export type RepairMode = 'lesson' | 'trace' | 'retry' | 'transfer'

export interface MisconceptionLink {
  key: string
  label: string
  conceptKey: string
  lessonSlug: string
  repairMode: RepairMode
  specificity: 'reviewed-option' | 'category'
}

export interface BaseQuestion {
  id: string
  type: QuestionType | LegacyQuestionType
  format: QuestionFormat
  stage?: QuestionStage
  prompt: string
  explanation: string
  hint: string
  hintLevels?: HintLevel[]
  prerequisites?: QuestionStage[]
  readingLevelNotes?: string[]
  teachingContext?: TeachingContext
  formalTerm?: FormalTerm
  reasoningSkillKeys: ReasoningSkillKey[]
  instructionalLevel: InstructionalLevel
  contentVersion: string
}

export interface MultipleChoiceConfig {
  options: string[]
  answer: number
  optionFeedback: string[]
  misconceptionLinks: Array<MisconceptionLink | undefined>
}

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
  checkpoint: MultipleChoiceConfig
}

export interface ConstraintSignalConfig {
  sourceText: string
  signals: Array<{
    id: string
    label: string
    importance: 'decisive' | 'supporting' | 'incidental'
    consequenceIds: string[]
  }>
  consequences: Array<{
    id: string
    text: string
    feedback: string
  }>
}

export interface OperationContractConfig {
  operationOptions: Array<{
    id: string
    label: string
    required: boolean
    feedback: string
  }>
  structures: Array<{
    id: string
    label: string
    satisfiesOperationIds: string[]
    tradeoff: string
  }>
  correctStructureIds: string[]
}

export type StateItemClassification = 'required' | 'optional-redundant' | 'discardable'

export interface StateSufficiencyConfig {
  checkpoint: {
    input: string
    stateDescription: string
  }
  items: Array<{
    id: string
    label: string
    classification: StateItemClassification
    feedback: string
  }>
  minimalRequiredSets: string[][]
  maxItems?: number
}

export interface MiniProblem {
  title: string
  contract: string
}

export interface NearTwinConfig {
  baseProblem: MiniProblem
  variantProblem: MiniProblem
  changedFactIds: string[]
  facts: Array<{ id: string; label: string; feedback: string }>
  relationshipOptions: Array<{ id: string; label: string; feedback: string }>
  correctRelationshipId: string
  decisiveReasonIds: string[]
}

export type MutationImpactType = 'unchanged' | 'modified' | 'new' | 'invalidated'

export interface ConstraintMutationConfig {
  original: MiniProblem
  mutation: {
    label: string
    removedText?: string[]
    addedText?: string[]
  }
  aspects: Array<{
    id: string
    label: string
    correctImpact: MutationImpactType
    feedback: string
  }>
}

export interface AnalogyChoice {
  id: string
  label: string
}

export interface StructuralAnalogyConfig {
  problemA: MiniProblem
  problemB: MiniProblem
  roles: Array<{
    id: string
    label: string
    problemAChoiceId: string
    problemBChoiceId: string
    explanation: string
  }>
  choicesA: AnalogyChoice[]
  choicesB: AnalogyChoice[]
  sharedFormalTerm?: FormalTerm
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  format: 'multiple-choice'
  config: MultipleChoiceConfig
}

export interface AlgorithmBuilderQuestion extends BaseQuestion {
  format: 'algorithm-builder'
  config: AlgorithmBuilderConfig
}

export interface IterationVisualizationQuestion extends BaseQuestion {
  format: 'iteration-visualization'
  config: IterationVisualizationConfig
}

export interface CodeConstructionQuestion extends BaseQuestion {
  format: 'code-construction'
  config: CodeConstructionConfig
}

export interface ConstraintSignalQuestion extends BaseQuestion {
  format: 'constraint-signals'
  config: ConstraintSignalConfig
}

export interface OperationContractQuestion extends BaseQuestion {
  format: 'operation-contract'
  config: OperationContractConfig
}

export interface StateSufficiencyQuestion extends BaseQuestion {
  format: 'state-sufficiency'
  config: StateSufficiencyConfig
}

export interface NearTwinQuestion extends BaseQuestion {
  format: 'near-twin'
  config: NearTwinConfig
}

export interface ConstraintMutationQuestion extends BaseQuestion {
  format: 'constraint-mutation'
  config: ConstraintMutationConfig
}

export interface StructuralAnalogyQuestion extends BaseQuestion {
  format: 'structural-analogy'
  config: StructuralAnalogyConfig
}

export type QuizQuestion =
  | MultipleChoiceQuestion
  | AlgorithmBuilderQuestion
  | IterationVisualizationQuestion
  | CodeConstructionQuestion
  | ConstraintSignalQuestion
  | OperationContractQuestion
  | StateSufficiencyQuestion
  | NearTwinQuestion
  | ConstraintMutationQuestion
  | StructuralAnalogyQuestion

export interface MultipleChoiceInteractionState {
  format: 'multiple-choice'
  selectedAnswer: number | null
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

export interface ConstraintSignalInteractionState {
  format: 'constraint-signals'
  mappings: Record<string, string | null>
}

export interface OperationContractInteractionState {
  format: 'operation-contract'
  selectedOperationIds: string[]
  selectedStructureId: string | null
  operationsCommitted: boolean
}

export interface StateSufficiencyInteractionState {
  format: 'state-sufficiency'
  classifications: Record<string, StateItemClassification>
}

export interface NearTwinInteractionState {
  format: 'near-twin'
  relationshipId: string | null
  reasonIds: string[]
}

export interface ConstraintMutationInteractionState {
  format: 'constraint-mutation'
  impacts: Record<string, MutationImpactType>
}

export interface StructuralAnalogyInteractionState {
  format: 'structural-analogy'
  mappings: Record<string, { problemAChoiceId: string; problemBChoiceId: string }>
}

export type QuestionInteractionState =
  | MultipleChoiceInteractionState
  | AlgorithmBuilderInteractionState
  | IterationVisualizationInteractionState
  | CodeConstructionInteractionState
  | ConstraintSignalInteractionState
  | OperationContractInteractionState
  | StateSufficiencyInteractionState
  | NearTwinInteractionState
  | ConstraintMutationInteractionState
  | StructuralAnalogyInteractionState

export interface QuestionInteractionResult {
  complete: boolean
  correct: boolean
  firstAttempt: boolean
  hintLevelReached: 0 | 1 | 2 | 3
  diagnosticKeys: string[]
  evidence: Record<string, unknown>
  feedback: string
  state: QuestionInteractionState
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
