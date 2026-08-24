import type { AlgorithmBuildStep, Problem, QuestionStage, QuestionType, QuizQuestion, VisualizationFrame } from '../../types'
import { DEEP_PROBLEM_IDS, problemTeachingFacts } from './problemFacts'
import { patternProfiles, type PatternProfile } from './patterns'

interface Choice {
  text: string
  correct: boolean
  feedback: string
}

const hash = (value: string) => [...value].reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 2166136261)

const shuffled = <T>(items: T[], seed: string) => {
  const copy = [...items]
  let value = hash(seed)
  for (let index = copy.length - 1; index > 0; index -= 1) {
    value = (value * 1664525 + 1013904223) >>> 0
    const target = value % (index + 1)
    ;[copy[index], copy[target]] = [copy[target], copy[index]]
  }
  return copy
}

const question = (
  problem: Problem,
  stage: QuestionStage,
  type: QuestionType,
  prompt: string,
  correctText: string,
  distractors: string[],
  explanation: string,
  hint: string,
): QuizQuestion => {
  const choices = shuffled<Choice>([
    { text: correctText, correct: true, feedback: explanation },
    ...distractors.map((text) => ({
      text,
      correct: false,
      feedback: `“${text}” describes a different strategy or proof obligation. It does not match the structure required at this problem’s ${stage.replaceAll('-', ' ')} stage; re-check which state must remain valid after each step.`,
    })),
  ], `${problem.id}:${stage}`)

  return {
    id: `${problem.id}:static-v1:${stage}`,
    type,
    format: 'multiple-choice',
    stage,
    prompt,
    options: choices.map(({ text }) => text),
    answer: choices.findIndex(({ correct }) => correct),
    explanation,
    hint,
    optionFeedback: choices.map(({ feedback }) => feedback),
  }
}

const visualizationQuestion = (
  problem: Problem,
  profile: PatternProfile,
  contractText: string,
  input: string,
  output: string,
): QuizQuestion => {
  const base = question(
    problem,
    'visualization',
    'Algorithm',
    `Walk through how the verified ${profile.title} solution changes its state. Which update belongs in the repeated iteration?`,
    profile.transition,
    profileChoices(profile, 'transition'),
    `Each iteration applies this transition while preserving the stated invariant: ${profile.invariant}`,
    'Move through the frames in order. The correct update must consume new work and leave the invariant true.',
  )
  const frames: VisualizationFrame[] = [
    {
      id: 'input', phase: 'Before iteration 1', title: 'Read the concrete case',
      action: 'Identify the input, required output, and the part of the input that can change the maintained state.',
      state: [{ label: 'Example input', value: input }, { label: 'Contract', value: contractText }],
      invariant: 'No input has been processed yet, so the maintained state has not made any claims.',
    },
    {
      id: 'initialize', phase: 'Initialization', title: 'Create only the state the algorithm needs',
      action: profile.state,
      state: [{ label: 'Maintained state', value: profile.state }, { label: 'Processed region', value: 'Empty' }],
      invariant: 'The state correctly summarizes the empty processed region.',
    },
    {
      id: 'first-update', phase: 'Iteration 1', title: 'Consume the first eligible unit of work',
      action: profile.transition,
      state: [{ label: 'Update rule', value: profile.transition }, { label: 'Progress', value: 'One eligible item, node, edge, state, or decision has been processed.' }],
      invariant: profile.invariant,
    },
    {
      id: 'repeat', phase: 'Iterations 2…n', title: 'Repeat without undoing proven work',
      action: 'Apply the same transition to the next eligible unit or branch. Preserve the invariant when advancing, combining results, or backtracking.',
      state: [{ label: 'What changes', value: 'The state named by the transition and any newly finalized output or processed-region boundary.' }, { label: 'What stays true', value: profile.invariant }],
      invariant: profile.invariant,
    },
    {
      id: 'finish', phase: 'Termination', title: 'Read the answer from final state',
      action: profile.correctness,
      state: [{ label: 'Example output', value: output }, { label: 'Why no work remains', value: profile.correctness }],
      invariant: 'Every required input unit or reachable state has been resolved, so the final answer follows from the maintained invariant.',
    },
  ]
  return { ...base, id: `${problem.id}:static-v2:visualization`, format: 'iteration-visualization', visualization: { input, frames } }
}

const algorithmBuilderQuestion = (problem: Problem, profile: PatternProfile): QuizQuestion => {
  const correctSteps: AlgorithmBuildStep[] = [
    { id: 'initialize', text: `Initialize the state: ${profile.state}`, reason: 'The update rule cannot run until all state named by the invariant exists.' },
    { id: 'control', text: `Continue while eligible work remains, using this invariant as the loop or recursion contract: ${profile.invariant}`, reason: 'The control phase identifies valid remaining work and states what must be preserved before and after it.' },
    { id: 'iterate', text: `Repeat the transition: ${profile.transition}`, reason: 'This consumes new work while preserving the invariant.' },
    { id: 'finish', text: `Terminate and justify the result: ${profile.correctness}`, reason: 'Once no work remains, correctness connects the final invariant to the requested answer.' },
  ]
  const decoys: AlgorithmBuildStep[] = [
    { id: 'decoy-state', text: `Initialize unrelated state: ${patternProfiles[profile.distractors[0]].state}`, reason: 'This state belongs to a different algorithmic pattern.' },
    { id: 'decoy-transition', text: `Use a different update: ${patternProfiles[profile.distractors[1]].transition}`, reason: 'This transition does not preserve this problem’s invariant.' },
  ]
  const steps = shuffled([...correctSteps, ...decoys], `${problem.id}:build-algorithm`)
  return {
    id: `${problem.id}:static-v2:build-algorithm`,
    type: 'Algorithm',
    format: 'algorithm-builder',
    stage: 'build-algorithm',
    prompt: `Build the verified ${profile.title} algorithm by placing its four executable phases in dependency order.`,
    options: steps.map(({ text }) => text),
    answer: 0,
    explanation: 'Initialization creates the state, the invariant defines its meaning, the transition preserves that meaning while making progress, and termination connects final state to the answer.',
    hint: 'Start with the state required by the invariant. The repeating transition cannot come before that state and meaning exist.',
    optionFeedback: steps.map(({ id }) => id.startsWith('decoy') ? 'This step belongs to a different strategy. Re-check which state and invariant were established for this problem.' : 'This is a required phase; reconsider where its prerequisites are satisfied.'),
    builder: { steps, correctOrder: correctSteps.map(({ id }) => id) },
  }
}

const profileChoices = (profile: PatternProfile, field: keyof Pick<PatternProfile, 'recognition' | 'state' | 'invariant' | 'transition' | 'correctness' | 'bottleneck' | 'edgeCase' | 'tradeoff'>) =>
  profile.distractors.map((id) => patternProfiles[id][field])

const complexityDistractors = (correct: string, kind: 'time' | 'space') => {
  const candidates = kind === 'time'
    ? ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(V + E)', 'O((V + E) log V)']
    : ['O(1)', 'O(log n)', 'O(n)', 'O(n²)', 'O(V)', 'O(V + E)']
  return candidates.filter((candidate) => candidate !== correct).slice(0, 3)
}

const distinctAlternatives = (correct: string, values: string[]) => {
  const unique = [...new Set(values.map((value) => value.trim()).filter((value) => value && value !== correct))]
  const fallback = ['No result is returned.', 'The input is returned unchanged.', 'Only the input length is returned.']
  return [...unique, ...fallback.filter((value) => value !== correct && !unique.includes(value))].slice(0, 3)
}

export const compileQuestionPath = (problem: Problem, allProblems: Problem[]): QuizQuestion[] => {
  const fact = problemTeachingFacts[problem.id]
  if (!fact) throw new Error(`Missing verified teaching fact for problem ${problem.id}`)
  const profile = { ...patternProfiles[fact.pattern], ...fact.teaching }
  const time = fact.time ?? { value: profile.time, reason: profile.timeReason }
  const space = fact.space ?? { value: profile.space, reason: profile.spaceReason }
  const contractText = problem.description.split(/\n\s*\n|\n/)[0].trim()
  const descriptionChoices = distinctAlternatives(contractText, allProblems.filter((candidate) => candidate.id !== problem.id).map((candidate) => candidate.description.split(/\n\s*\n|\n/)[0].trim()))
  const example = problem.examples[0]
  const outputChoices = distinctAlternatives(example?.output ?? 'The required result', allProblems.flatMap((candidate) => candidate.examples.map(({ output }) => output)))

  const stages: Record<QuestionStage, QuizQuestion> = {
    contract: question(problem, 'contract', 'Comprehension', `Which statement is the actual contract for ${problem.title}?`, contractText, descriptionChoices, 'This is the exact required task; a valid algorithm must also satisfy the remaining qualifications in the full statement.', 'Separate what the function must return from examples of how it may be computed.'),
    bottleneck: question(problem, 'bottleneck', 'Pattern', 'What makes the straightforward approach unnecessarily expensive or unreliable?', profile.bottleneck, profileChoices(profile, 'bottleneck'), profile.bottleneck, 'Identify the work that would be repeated by a direct enumeration or rescan.'),
    pattern: question(problem, 'pattern', 'Pattern', `Which recognition signal most directly supports the verified ${profile.title} solution taught here?`, profile.recognition, profileChoices(profile, 'recognition'), `This signal justifies using ${profile.title}.`, 'Look for the structural property that the algorithm exploits, not merely a topic label.'),
    'data-structure': question(problem, 'data-structure', 'Data Structure', 'Before choosing an algorithm, which data structure or minimal maintained state is necessary to support an optimal solution?', profile.state, profileChoices(profile, 'state'), profile.state, 'Identify what must be stored or directly accessible before considering how the algorithm updates it. Some optimal solutions need only scalar variables rather than another collection.'),
    invariant: question(problem, 'invariant', 'Invariant', 'Which invariant must be true after every completed step?', profile.invariant, profileChoices(profile, 'invariant'), profile.invariant, 'Phrase the invariant as a claim about all work already processed.'),
    visualization: visualizationQuestion(problem, profile, contractText, example?.input ?? 'the provided input', example?.output ?? 'the required result'),
    'build-algorithm': algorithmBuilderQuestion(problem, profile),
    transition: question(problem, 'transition', 'Algorithm', 'Which transition advances the algorithm while preserving that invariant?', profile.transition, profileChoices(profile, 'transition'), profile.transition, 'The next step must make progress without invalidating the maintained state.'),
    trace: question(problem, 'trace', 'Algorithm', `Run the verified algorithm on this example: ${example?.input ?? 'the provided input'}. What result must the trace produce?`, example?.output ?? 'The required result', outputChoices, example?.explanation || `The trace must terminate at the documented output: ${example?.output}.`, 'Follow the maintained state one input element or graph step at a time; do not skip directly to a different example.'),
    correctness: question(problem, 'correctness', 'Correctness', 'Why does the verified algorithm cover all valid answers without accepting an invalid one?', profile.correctness, profileChoices(profile, 'correctness'), profile.correctness, 'Connect the invariant and transition to an exhaustive set of valid cases.'),
    'edge-case': question(problem, 'edge-case', 'Correctness', 'Which edge case is especially important for this implementation?', profile.edgeCase, profileChoices(profile, 'edgeCase'), profile.edgeCase, 'Test the boundary where the maintained state is empty, duplicated, or at its smallest legal size.'),
    'time-complexity': question(problem, 'time-complexity', 'Complexity', 'What is the time complexity of the verified solution?', time.value, complexityDistractors(time.value, 'time'), time.reason, 'Count how often each input item, node, edge, state, or heap entry can be processed.'),
    'space-complexity': question(problem, 'space-complexity', 'Complexity', 'What is the auxiliary space complexity of the verified solution?', space.value, complexityDistractors(space.value, 'space'), space.reason, 'Count retained state and the maximum recursion, queue, stack, map, or table size; exclude the returned output unless stated otherwise.'),
    tradeoff: question(problem, 'tradeoff', 'Complexity', 'Which tradeoff accurately characterizes this approach?', profile.tradeoff, profileChoices(profile, 'tradeoff'), profile.tradeoff, 'Compare this approach with the nearest plausible alternative and identify what resource or capability changes.'),
  }

  const baseline: QuestionStage[] = ['contract', 'data-structure', 'pattern', 'invariant', 'visualization', 'build-algorithm', 'transition', 'correctness', 'time-complexity', 'space-complexity']
  const deep: QuestionStage[] = ['contract', 'data-structure', 'pattern', 'invariant', 'visualization', 'bottleneck', 'build-algorithm', 'transition', 'correctness', 'edge-case', 'time-complexity', 'space-complexity', 'tradeoff']
  return (DEEP_PROBLEM_IDS.has(problem.id) ? deep : baseline).map((stage) => stages[stage])
}
