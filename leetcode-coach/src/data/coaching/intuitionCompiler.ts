import type {
  ConstraintMutationQuestion,
  ConstraintSignalQuestion,
  HintLevel,
  NearTwinQuestion,
  OperationContractQuestion,
  Problem,
  QuestionStage,
  QuizQuestion,
  StateSufficiencyQuestion,
  StructuralAnalogyQuestion,
} from '../../types'
import { COACHING_CONTENT_VERSION } from './contentVersion'
import { PILOT_REASONING_MODELS } from './intuitionFacts'

const hints = (cue: string, concept: string, workedStep: string): HintLevel[] => [
  { id: 'cue', label: 'Look here', text: cue },
  { id: 'concept', label: 'Relationship to inspect', text: concept },
  { id: 'worked-step', label: 'Try one step', text: workedStep },
]

const base = (problem: Problem, suffix: string, stage: QuestionStage) => ({
  id: `${problem.id}:intuition-v1:${suffix}`,
  stage,
  contentVersion: COACHING_CONTENT_VERSION,
  prerequisites: stage === 'contract' ? [] : ['contract'] as QuestionStage[],
})

export const compilePilotCoreQuestions = (problem: Problem): Partial<Record<QuestionStage, QuizQuestion>> => {
  const model = PILOT_REASONING_MODELS[problem.id]
  if (!model) return {}

  const consequences = [
    ...model.decisiveConstraints.flatMap(({ consequence }) => consequence ? [consequence] : []),
    ...model.constraintDistractors,
  ]

  const constraintQuestion: ConstraintSignalQuestion = {
    ...base(problem, 'constraint-signals', 'contract'),
    type: 'Comprehension',
    format: 'constraint-signals',
    prompt: 'For each highlighted phrase, choose the conclusion that the contract actually supports.',
    explanation: 'You separated decisive constraints from surface details and connected each useful phrase to a justified algorithmic consequence. Formally, these are constraint signals. On a new problem, use them to narrow the solution space before naming a pattern.',
    hint: 'Start with the phrase that changes which candidates or operations are possible. Do not infer more than the wording guarantees.',
    hintLevels: hints(
      'Find the phrase that would change the valid solution if it were removed.',
      'Ask whether the phrase affects candidate shape, required output, legal operations, or resource limits.',
      'Take one phrase and complete: “Because the contract says ___, the solution may or must ___.”',
    ),
    teachingContext: { title: 'Read for consequences', body: 'A useful signal changes what a correct or efficient solution is allowed to do. A surface detail may describe the input without narrowing the algorithm.' },
    formalTerm: { name: 'Constraint signal', definition: 'A contract property that changes the valid strategy, required state, or feasible complexity.' },
    readingLevelNotes: ['Asks for a concrete consequence before introducing a pattern label.'],
    reasoningSkillKeys: ['constraint-signal'],
    instructionalLevel: 'complete',
    config: {
      sourceText: model.sourceText,
      signals: model.decisiveConstraints.map(({ id, label, importance, consequence }) => ({ id, label, importance, consequenceIds: consequence ? [consequence.id] : [] })),
      consequences,
    },
  }

  const operationQuestion: OperationContractQuestion = {
    ...base(problem, 'operation-contract', 'data-structure'),
    type: 'Data Structure',
    format: 'operation-contract',
    prompt: 'What must the solution do cheaply, and which maintained structure provides those operations?',
    explanation: 'You derived the structure from the operations the algorithm needs instead of recalling a problem-to-pattern label. This operation contract transfers whenever another problem needs the same capabilities.',
    hint: 'Describe the lookup, update, or removal the next step needs. Then choose a structure whose native operations match that list.',
    hintLevels: hints(
      'Focus on what one new input item needs from earlier work.',
      'Separate the information the output needs from operations that merely sound useful.',
      'For each selected operation, ask whether the structure supports it directly or would require a scan.',
    ),
    teachingContext: { title: 'Derive the structure', body: 'Data structures are capability bundles. First define the operations; only then choose the bundle that supports them at the needed cost.' },
    formalTerm: { name: 'Operation contract', definition: 'The set of lookups and updates an algorithm must perform efficiently to maintain its reasoning.' },
    readingLevelNotes: ['Withholds structure names until the learner commits to required operations.'],
    reasoningSkillKeys: ['operation-requirement'],
    instructionalLevel: 'construct',
    config: model.operationContract,
  }

  const stateQuestion: StateSufficiencyQuestion = {
    ...base(problem, 'state-sufficiency', 'invariant'),
    type: 'Invariant',
    format: 'state-sufficiency',
    prompt: 'At this checkpoint, what information must survive, what is redundant, and what is safe to forget?',
    explanation: 'You kept exactly the information that can still affect a future decision. This is minimal sufficient state: enough to preserve correctness without carrying history the transition never reads again.',
    hint: 'For each item, ask: can two executions with different values for this item require different next actions?',
    hintLevels: hints(
      'Identify what the very next update must read.',
      'If current state already summarizes an older detail, the raw history may be redundant or discardable.',
      'Imagine deleting one item. If the next correct action becomes ambiguous, that item is required.',
    ),
    teachingContext: { title: 'Keep only causal history', body: 'Past information matters only when changing it could change a future decision or the required output.' },
    formalTerm: { name: 'Minimal sufficient state', definition: 'The smallest maintained information that still determines every correct future transition and required output.' },
    readingLevelNotes: ['Distinguishes logically insufficient state from correct but redundant state.'],
    reasoningSkillKeys: ['state-sufficiency', 'safe-discard'],
    instructionalLevel: 'construct',
    config: model.maintainedState,
  }

  return { contract: constraintQuestion, 'data-structure': operationQuestion, invariant: stateQuestion }
}

export const compilePilotTransferQuestions = (problem: Problem): QuizQuestion[] => {
  const transfer = PILOT_REASONING_MODELS[problem.id]?.transferRelations
  if (!transfer) return []
  const questions: QuizQuestion[] = []

  if (transfer.nearTwin) {
    const question: NearTwinQuestion = {
      ...base(problem, 'near-twin', 'pattern'),
      type: 'Pattern',
      format: 'near-twin',
      prompt: 'One contract property changed. Does the original elimination rule still hold, and which property decides that?',
      explanation: 'The familiar surface shape is not enough. The changed ordering guarantee removes the proof that one side can be discarded. This marks a pattern boundary: the condition under which an otherwise familiar strategy stops being justified.',
      hint: 'Ignore the shared nouns. Compare the guarantee that connects one observation to all remaining candidates.',
      hintLevels: hints('Read the contract diff before thinking about an algorithm name.', 'Ask what fact made permanent elimination safe in the original.', 'Test whether a midpoint comparison constrains uninspected values on either side.'),
      teachingContext: { title: 'Find the boundary', body: 'Near-twin problems expose the one property a memorized pattern label tends to hide.' },
      formalTerm: { name: 'Pattern boundary', definition: 'A necessary contract property that determines whether a reasoning strategy remains valid.' },
      reasoningSkillKeys: ['pattern-boundary'],
      instructionalLevel: 'transfer',
      config: transfer.nearTwin,
    }
    questions.push(question)
  }

  if (transfer.mutation) {
    const question: ConstraintMutationQuestion = {
      ...base(problem, 'constraint-mutation', 'pattern'),
      type: 'Pattern',
      format: 'constraint-mutation',
      prompt: 'The contract changed in one place. Classify what the existing reasoning can keep and what must adapt.',
      explanation: 'You retrieved the original reasoning and changed only the parts affected by the new contract. This is counterfactual transfer: preserving valid structure instead of restarting from a memorized solution.',
      hint: 'Trace the changed sentence forward through state, iteration, output, and complexity. Leave an aspect unchanged unless the new requirement reaches it.',
      hintLevels: hints('Start with the exact added or removed sentence.', 'Ask which aspect directly reads or produces the changed requirement.', 'For each row, complete: “This stays valid because…” or “This changes because…”.'),
      teachingContext: { title: 'Adapt, do not restart', body: 'A small contract mutation should produce a precise reasoning diff, not an entirely new guess.' },
      formalTerm: { name: 'Counterfactual transfer', definition: 'Adapting known reasoning after changing one condition while preserving every unaffected part.' },
      reasoningSkillKeys: ['counterfactual-transfer'],
      instructionalLevel: 'transfer',
      config: transfer.mutation,
    }
    questions.push(question)
  }

  if (transfer.analogy) {
    const question: StructuralAnalogyQuestion = {
      ...base(problem, 'structural-analogy', 'pattern'),
      type: 'Pattern',
      format: 'structural-analogy',
      prompt: 'These problems look different. Map the roles that make their reasoning structurally equivalent.',
      explanation: 'You matched candidate state, violation or frontier behavior, and transition rules across different surface stories. That relational structure—not shared vocabulary—is what supports far transfer.',
      hint: 'Describe each role without using either problem’s topic label, then find the concrete element that performs it on each side.',
      hintLevels: hints('Begin with the active candidate or frontier.', 'Match behavior and purpose, not data type names.', 'Ask what expands progress, what signals invalidity or a boundary, and what restores or advances the state.'),
      teachingContext: { title: 'See through the story', body: 'Structural analogy asks whether two problems share the same causal roles even when their inputs and vocabulary differ.' },
      formalTerm: transfer.analogy.sharedFormalTerm ?? { name: 'Structural analogy', definition: 'A mapping between problems whose elements play the same abstract reasoning roles.' },
      reasoningSkillKeys: ['structural-analogy'],
      instructionalLevel: 'transfer',
      config: transfer.analogy,
    }
    questions.push(question)
  }

  return questions
}
