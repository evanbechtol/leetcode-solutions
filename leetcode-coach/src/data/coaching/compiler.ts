import type {
  AlgorithmBuildStep,
  FormalTerm,
  HintLevel,
  Problem,
  QuestionStage,
  QuestionType,
  QuizQuestion,
  TeachingContext,
} from '../../types'
import { beginnerPatternProfiles, type BeginnerPatternProfile } from './beginnerProfiles'
import { DEEP_PROBLEM_IDS, problemTeachingFacts } from './problemFacts'
import { patternProfiles, type PatternProfile } from './patterns'
import { buildExecutionTrace } from './executionTrace'
import { codeConstructionByProblemId } from './codeConstruction'

interface Choice { text: string; correct: boolean; feedback: string }
interface Guidance { teachingContext: TeachingContext; formalTerm: FormalTerm }
type BeginnerField = keyof BeginnerPatternProfile

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

const guidance = (title: string, body: string, name: string, definition: string): Guidance => ({
  teachingContext: { title, body },
  formalTerm: { name, definition },
})

const wrongFeedback: Record<QuestionStage, string> = {
  contract: 'This result does not match what the example asks the function to produce. Compare the input with the requested output.',
  'data-structure': 'This remembers different information from what the solution will need later. Ask what must still be available after one step.',
  pattern: 'This approach does not naturally use the information you just chose. Match the strategy to what must be remembered.',
  invariant: 'This statement can become false during the solution. Look for the one promise that should survive every completed step.',
  visualization: 'This update does not both make progress and preserve the information already built. Follow one item through the frames.',
  'build-algorithm': 'This step is not ready yet or belongs to another approach. Check what information must exist before it can run.',
  transition: 'This action loses needed information or does not make useful progress. Apply it once to the example and inspect the result.',
  trace: 'This result does not follow from the example. Work through one input item or graph step at a time.',
  correctness: 'This reason leaves a valid case uncovered or allows an invalid case. Connect the repeated step to the final result.',
  bottleneck: 'This is not the work the faster solution avoids. Find the search or calculation repeated for many inputs.',
  'edge-case': 'This case matters less to this implementation. Test the boundary most likely to violate its stored information or update rule.',
  'time-complexity': 'This growth rate does not match how often the solution processes its input. Count the visits and costly operations again.',
  'space-complexity': 'This does not match the largest extra structure kept at one time. Count maps, queues, stacks, tables, and active calls.',
  tradeoff: 'This comparison does not describe what this solution gains and pays for. Compare it with the simplest nearby alternative.',
}

const prerequisitesByStage: Record<QuestionStage, QuestionStage[]> = {
  contract: [],
  'data-structure': ['contract'],
  pattern: ['contract', 'data-structure'],
  invariant: ['data-structure', 'pattern'],
  visualization: ['data-structure', 'pattern', 'invariant'],
  bottleneck: ['data-structure', 'pattern'],
  'build-algorithm': ['data-structure', 'pattern', 'invariant', 'transition', 'correctness'],
  transition: ['data-structure', 'pattern', 'invariant'],
  trace: ['visualization', 'transition'],
  correctness: ['invariant', 'transition'],
  'edge-case': ['transition', 'correctness'],
  'time-complexity': ['transition', 'correctness', 'build-algorithm'],
  'space-complexity': ['data-structure', 'time-complexity'],
  tradeoff: ['data-structure', 'pattern', 'correctness'],
}

const additionalHints: Record<QuestionStage, [string, string]> = {
  contract: ['Compare the example input with each possible result.', 'Cover the choices and state only what the function must return or change.'],
  'data-structure': ['List what a later step must recover from earlier work.', 'Process one item mentally, then write down what would be lost unless it were stored.'],
  pattern: ['Match the stored information to the kind of update or lookup it supports.', 'Take the state from the previous answer and ask how one new input should use it.'],
  invariant: ['Pause after one update and test which claim remains completely true.', 'Write a sentence beginning “Everything processed so far…” and test it on the example.'],
  visualization: ['Compare the state immediately before and after the highlighted lines.', 'Run only the first active code line and identify the variable that changes first.'],
  bottleneck: ['Count which operation the direct solution performs for many different candidates.', 'Circle repeated searches or calculations in a small manual run.'],
  'build-algorithm': ['Find the step whose required variables already exist.', 'Start with setup, then choose the first step that can legally read that state.'],
  transition: ['The correct action must change state and move closer to termination.', 'Apply each candidate once to the first example step and reject any that loses earlier work.'],
  trace: ['Record state after each single update instead of reasoning from memory.', 'Make a two-column table labeled “before” and “after” for the first step.'],
  correctness: ['Connect the promise maintained during the loop to the state at termination.', 'Assume every earlier step was correct; explain why one more update keeps the result valid.'],
  'edge-case': ['Look for the smallest input or the point where a boundary becomes empty.', 'Run the setup and first update on an empty, one-item, or duplicate-heavy case.'],
  'time-complexity': ['Count visits to each item and then include any nonconstant data-structure operation.', 'Write the cost of one update and multiply it by the maximum number of updates.'],
  'space-complexity': ['Find the largest extra structure that can exist at one time.', 'Mark every map, stack, queue, table, and active call, then ignore the required output.'],
  tradeoff: ['Compare time, extra memory, input mutation, and implementation complexity.', 'Name one resource this approach saves and one requirement or cost it adds.'],
}

const readingLevelNotes: Record<QuestionStage, string[]> = {
  contract: ['Uses “required result” before introducing the formal term “problem contract”.'],
  'data-structure': ['Allows scalar variables as maintained state; does not imply that every solution needs a collection.'],
  pattern: ['The algorithm name is withheld until correct feedback.'],
  invariant: ['Uses “promise” before defining “invariant”.'],
  visualization: ['State changes are observable before the term “iteration” is defined.'],
  bottleneck: ['Describes repeated work before introducing asymptotic analysis.'],
  'build-algorithm': ['Uses dependency order without assuming control-flow vocabulary.'],
  transition: ['Uses “one safe step” before defining “state transition”.'],
  trace: ['Defines dry run only after the learner follows a concrete example.'],
  correctness: ['Requests a plain-language reason before defining a correctness argument.'],
  'edge-case': ['Provides boundary examples without assuming prior testing terminology.'],
  'time-complexity': ['The teaching context defines growth before formal Big-O reasoning.'],
  'space-complexity': ['Distinguishes extra memory from input and output before defining auxiliary space.'],
  tradeoff: ['Names concrete resources before introducing the formal term “trade-off”.'],
}

const buildHintLevels = (stage: QuestionStage, firstHint: string): HintLevel[] => [
  { id: 'cue', label: 'Look here', text: firstHint },
  { id: 'concept', label: 'What to track', text: additionalHints[stage][0] },
  { id: 'worked-step', label: 'Try one step', text: additionalHints[stage][1] },
]

const question = (
  problem: Problem,
  stage: QuestionStage,
  type: QuestionType,
  prompt: string,
  correctText: string,
  distractors: string[],
  explanation: string,
  hint: string,
  learnerGuidance: Guidance,
): QuizQuestion => {
  const choices = shuffled<Choice>([
    { text: correctText, correct: true, feedback: explanation },
    ...distractors.map((text) => ({ text, correct: false, feedback: wrongFeedback[stage] })),
  ], `${problem.id}:${stage}`)

  return {
    id: `${problem.id}:static-v3:${stage}`,
    type,
    format: 'multiple-choice',
    stage,
    prompt,
    options: choices.map(({ text }) => text),
    answer: choices.findIndex(({ correct }) => correct),
    explanation,
    hint,
    hintLevels: buildHintLevels(stage, hint),
    prerequisites: prerequisitesByStage[stage],
    readingLevelNotes: readingLevelNotes[stage],
    ...learnerGuidance,
    optionFeedback: choices.map(({ feedback }) => feedback),
  }
}

const profileChoices = (profile: PatternProfile, field: BeginnerField) =>
  profile.distractors.map((id) => beginnerPatternProfiles[id][field])

const visualizationQuestion = (
  problem: Problem,
  profile: PatternProfile,
  beginner: BeginnerPatternProfile,
  input: string,
  output: string,
): QuizQuestion => {
  const base = question(
    problem, 'visualization', 'Algorithm',
    'Walk through the example. Which action should repeat at each step?',
    beginner.step, profileChoices(profile, 'step'),
    `Repeat this action while keeping the same promise true: ${beginner.promise}`,
    'The right action must use the current item and leave the stored information ready for the next one.',
    guidance('Watch the information change', 'Move through the frames slowly. At each frame, notice what changed and what stayed true.', 'Iteration', 'One repeated pass through a step of an algorithm.'),
  )
  const frames = buildExecutionTrace(problem, beginner, input, output)
  return {
    ...base,
    id: `${problem.id}:static-v4:visualization`,
    format: 'iteration-visualization',
    visualization: {
      input,
      expectedOutput: output,
      code: problem.solution,
      language: problem.solutionLanguage ?? 'TypeScript',
      frames,
    },
  }
}

export const compileLessonVisualization = (problem: Problem): QuizQuestion => {
  const fact = problemTeachingFacts[problem.id]
  if (!fact) throw new Error(`Missing verified teaching fact for problem ${problem.id}`)
  const profile = { ...patternProfiles[fact.pattern], ...fact.teaching }
  const beginner = { ...beginnerPatternProfiles[fact.pattern], ...fact.beginner }
  const example = problem.examples[0]
  return visualizationQuestion(problem, profile, beginner, example?.input ?? 'the provided input', example?.output ?? 'the required output')
}

const algorithmBuilderQuestion = (problem: Problem, profile: PatternProfile, beginner: BeginnerPatternProfile): QuizQuestion => {
  const correctSteps: AlgorithmBuildStep[] = [
    { id: 'initialize', text: `Set up: ${beginner.memory}`, reason: 'The solution needs this information before it can process anything.' },
    { id: 'control', text: 'Continue while there is unfinished work.', reason: 'The solution must know whether another item, node, edge, or choice remains.' },
    { id: 'iterate', text: `For one step: ${beginner.step}`, reason: 'This handles new work without losing what earlier steps established.' },
    { id: 'finish', text: `Finish: ${beginner.why}`, reason: 'When no work remains, the stored information now gives the requested result.' },
  ]
  const decoys: AlgorithmBuildStep[] = [
    { id: 'decoy-state', text: `Set up: ${beginnerPatternProfiles[profile.distractors[0]].memory}`, reason: 'This information supports a different approach.' },
    { id: 'decoy-transition', text: `For one step: ${beginnerPatternProfiles[profile.distractors[1]].step}`, reason: 'This action belongs to a different approach.' },
  ]
  const steps = shuffled([...correctSteps, ...decoys], `${problem.id}:build-algorithm`)
  return {
    id: `${problem.id}:static-v3:build-algorithm`,
    type: 'Algorithm',
    format: 'algorithm-builder',
    stage: 'build-algorithm',
    prompt: 'Put the four parts of the solution in the order they must happen.',
    options: steps.map(({ text }) => text),
    answer: 0,
    explanation: 'First create the needed information. Then repeat the safe update while work remains. Finally, use the completed state as the answer.',
    hint: 'Start with the information the first real step needs. Finish only after every required piece of work is handled.',
    hintLevels: buildHintLevels('build-algorithm', 'Start with the information the first real step needs.'),
    prerequisites: prerequisitesByStage['build-algorithm'],
    readingLevelNotes: readingLevelNotes['build-algorithm'],
    ...guidance('Build before seeing code', 'A complete algorithm needs a setup, a stopping rule, a repeated action, and a way to produce the answer.', 'Algorithm structure', 'The ordered parts that initialize, repeat, and finish a solution.'),
    optionFeedback: steps.map(({ id }) => id.startsWith('decoy')
      ? 'This step belongs to a different strategy. Use the information and action established for this problem.'
      : 'This step is needed, but something it depends on may need to happen first.'),
    builder: { steps, correctOrder: correctSteps.map(({ id }) => id) },
  }
}

const codeConstructionQuestion = (problem: Problem, profile: PatternProfile): QuizQuestion => ({
  id: `${problem.id}:static-v4:code-construction`,
  type: 'Algorithm',
  format: 'code-construction',
  stage: 'build-algorithm',
  prompt: `Construct the optimal ${profile.title.toLocaleLowerCase()} implementation one decision at a time.`,
  options: [],
  answer: 0,
  explanation: 'Each selected line preserves the required state, makes progress, and assembles the reviewed canonical implementation.',
  hint: 'Use the state established by earlier decisions. Choose the next line that reads only available information and preserves the invariant.',
  hintLevels: buildHintLevels('build-algorithm', 'Use the state established by earlier decisions.'),
  prerequisites: prerequisitesByStage['build-algorithm'],
  readingLevelNotes: ['Introduces one implementation decision at a time and explains its state effect before showing the complete implementation.'],
  ...guidance('Build the implementation', 'Choose one line or block at a time. Correct code stays in place so each new decision can build on it.', 'Code construction', 'The process of translating an algorithm into ordered, executable statements.'),
  construction: codeConstructionByProblemId[problem.id],
})

const complexityDistractors = (correct: string, kind: 'time' | 'space') => {
  const candidates = kind === 'time'
    ? ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(V + E)', 'O((V + E) log V)']
    : ['O(1)', 'O(log n)', 'O(n)', 'O(n²)', 'O(V)', 'O(V + E)']
  return candidates.filter((candidate) => candidate !== correct).slice(0, 3)
}

const distinctAlternatives = (correct: string, values: string[]) => {
  const unique = [...new Set(values.map((value) => value.trim()).filter((value) => value && value !== correct))]
  const fallback = ['No value is returned.', 'The input is returned unchanged.', 'Only the input length is returned.']
  return [...unique, ...fallback.filter((value) => value !== correct && !unique.includes(value))].slice(0, 3)
}

export const compileQuestionPath = (problem: Problem, allProblems: Problem[]): QuizQuestion[] => {
  const fact = problemTeachingFacts[problem.id]
  if (!fact) throw new Error(`Missing verified teaching fact for problem ${problem.id}`)

  const profile = { ...patternProfiles[fact.pattern], ...fact.teaching }
  const beginner = { ...beginnerPatternProfiles[fact.pattern], ...fact.beginner }
  const time = fact.time ?? { value: profile.time, reason: profile.timeReason }
  const space = fact.space ?? { value: profile.space, reason: profile.spaceReason }
  const example = problem.examples[0]
  const correctOutput = example?.output ?? 'The required result'
  const outputChoices = distinctAlternatives(correctOutput, allProblems.flatMap((candidate) => candidate.examples.map(({ output }) => output)))

  const stages: Record<QuestionStage, QuizQuestion> = {
    contract: question(
      problem, 'contract', 'Comprehension',
      'Look at the example. Which output matches what the problem asks us to produce?',
      correctOutput, outputChoices,
      `The example produces ${correctOutput}.`,
      'Focus only on the requested result. You do not need to know the algorithm yet.',
      guidance('Start with the result', 'First understand the input and required output. Ignore how to compute it for now.', 'Problem contract', 'The exact input, required output, and rules a valid solution must follow.'),
    ),
    'data-structure': question(
      problem, 'data-structure', 'Data Structure',
      'What information should the solution keep while it works?',
      beginner.memory, profileChoices(profile, 'memory'), beginner.memory,
      'Ask what one step will need from earlier work. Some solutions need only a few variables.',
      guidance('Decide what must be remembered', 'A data structure organizes information so later steps can find or update it. Sometimes a few variables are enough.', 'Maintained state', 'The information an algorithm keeps while it processes the input.'),
    ),
    pattern: question(
      problem, 'pattern', 'Pattern',
      'Which approach best uses the information you just chose?',
      beginner.clue, profileChoices(profile, 'clue'),
      `This clue points to ${profile.title}: ${beginner.clue}`,
      'Match the approach to the information that must be looked up, updated, or moved.',
      guidance('Turn memory into a strategy', 'Now choose a repeatable approach that naturally uses the information from the previous question.', profile.title, beginner.clue),
    ),
    invariant: question(
      problem, 'invariant', 'Invariant',
      'What must stay true after every completed step?',
      beginner.promise, profileChoices(profile, 'promise'), beginner.promise,
      'Imagine pausing after one step. Which statement should still be completely true?',
      guidance('Find the promise', 'A reliable solution keeps one important promise true as it makes progress.', 'Invariant', 'A statement that remains true before and after every repeated step.'),
    ),
    visualization: visualizationQuestion(problem, profile, beginner, example?.input ?? 'the provided input', correctOutput),
    bottleneck: question(
      problem, 'bottleneck', 'Pattern',
      'What work does the faster solution avoid repeating?',
      beginner.repeatedWork, profileChoices(profile, 'repeatedWork'), beginner.repeatedWork,
      'Find the search, comparison, or calculation a basic solution performs again and again.',
      guidance('Find the repeated work', 'Faster solutions often store or reuse a result instead of calculating the same thing again.', 'Bottleneck', 'The part of a solution that contributes most to its running time or memory use.'),
    ),
    'build-algorithm': codeConstructionByProblemId[problem.id]
      ? codeConstructionQuestion(problem, profile)
      : algorithmBuilderQuestion(problem, profile, beginner),
    transition: question(
      problem, 'transition', 'Algorithm',
      'What should the solution do with one new piece of work?',
      beginner.step, profileChoices(profile, 'step'), beginner.step,
      'Apply the action once. It should make progress and keep the earlier promise true.',
      guidance('Choose one safe step', 'The repeated action should handle new work without destroying correct information from earlier work.', 'State transition', 'The rule that changes an algorithm from one valid state to the next.'),
    ),
    trace: question(
      problem, 'trace', 'Algorithm',
      `What result should the algorithm produce for ${example?.input ?? 'the example input'}?`,
      correctOutput, outputChoices,
      example?.explanation ?? `Following the steps produces ${correctOutput}.`,
      'Write down the stored information after each step instead of jumping to the end.',
      guidance('Test the steps on an example', 'A small example reveals whether each update uses the right information and still makes progress.', 'Dry run', 'A manual, step-by-step execution of an algorithm on a specific input.'),
    ),
    correctness: question(
      problem, 'correctness', 'Correctness',
      'Why can we trust the final answer?',
      beginner.why, profileChoices(profile, 'why'), beginner.why,
      'Connect the promise kept after every step to the moment when no work remains.',
      guidance('Connect the steps to the answer', 'A solution is correct when its repeated step handles every required case and its final state means the requested answer.', 'Correctness argument', 'A clear reason the algorithm returns the right result for every valid input.'),
    ),
    'edge-case': question(
      problem, 'edge-case', 'Correctness',
      'Which input is most likely to break a careless version of this solution?',
      beginner.watchOut, profileChoices(profile, 'watchOut'), beginner.watchOut,
      'Test the smallest input, repeated values, empty state, and the point where boundaries change.',
      guidance('Stress the fragile step', 'Edge cases are small or unusual inputs that challenge an assumption in the setup or repeated action.', 'Edge case', 'A valid input near a boundary or unusual condition that needs special attention.'),
    ),
    'time-complexity': question(
      problem, 'time-complexity', 'Complexity',
      'How does the amount of work grow as the input grows?',
      time.value, complexityDistractors(time.value, 'time'), time.reason,
      'Count how many times each item can be visited, then include sorting or priority-queue work.',
      guidance('Count the work', 'Focus on how often input items, nodes, edges, or table states are processed as the input grows.', 'Time complexity', 'A description of how an algorithm\'s work grows with the size of its input.'),
    ),
    'space-complexity': question(
      problem, 'space-complexity', 'Complexity',
      'How much extra memory does the solution need?',
      space.value, complexityDistractors(space.value, 'space'), space.reason,
      'Count the largest map, queue, stack, table, and active call path kept at one time.',
      guidance('Count extra memory', 'Count memory created by the solution. Do not count the input or returned output unless the problem says to.', 'Auxiliary space', 'The extra memory an algorithm uses beyond its input and required output.'),
    ),
    tradeoff: question(
      problem, 'tradeoff', 'Complexity',
      'What does this approach gain, and what does it give up?',
      beginner.tradeoff, profileChoices(profile, 'tradeoff'), beginner.tradeoff,
      'Compare its running time, memory, input changes, and implementation difficulty with a simpler approach.',
      guidance('Compare the cost', 'An optimization usually improves one property by spending another resource or adding a requirement.', 'Trade-off', 'A choice that improves one property while accepting a cost or limitation elsewhere.'),
    ),
  }

  const baseline: QuestionStage[] = ['contract', 'data-structure', 'pattern', 'invariant', 'transition', 'correctness', 'build-algorithm', 'time-complexity', 'space-complexity']
  const deep: QuestionStage[] = ['contract', 'data-structure', 'pattern', 'invariant', 'bottleneck', 'transition', 'correctness', 'edge-case', 'tradeoff', 'build-algorithm', 'time-complexity', 'space-complexity']
  return (DEEP_PROBLEM_IDS.has(problem.id) ? deep : baseline).map((stage) => stages[stage])
}
