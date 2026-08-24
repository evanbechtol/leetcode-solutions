import type { Problem, QuestionStage, QuestionType, QuizQuestion } from '../../types'
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
    stage,
    prompt,
    options: choices.map(({ text }) => text),
    answer: choices.findIndex(({ correct }) => correct),
    explanation,
    hint,
    optionFeedback: choices.map(({ feedback }) => feedback),
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
  const otherProfiles = profile.distractors.map((id) => patternProfiles[id])
  const contractText = problem.description.split(/\n\s*\n|\n/)[0].trim()
  const descriptionChoices = distinctAlternatives(contractText, allProblems.filter((candidate) => candidate.id !== problem.id).map((candidate) => candidate.description.split(/\n\s*\n|\n/)[0].trim()))
  const example = problem.examples[0]
  const outputChoices = distinctAlternatives(example?.output ?? 'The required result', allProblems.flatMap((candidate) => candidate.examples.map(({ output }) => output)))

  const stages: Record<QuestionStage, QuizQuestion> = {
    contract: question(problem, 'contract', 'Comprehension', `Which statement is the actual contract for ${problem.title}?`, contractText, descriptionChoices, 'This is the exact required task; a valid algorithm must also satisfy the remaining qualifications in the full statement.', 'Separate what the function must return from examples of how it may be computed.'),
    bottleneck: question(problem, 'bottleneck', 'Pattern', 'What makes the straightforward approach unnecessarily expensive or unreliable?', profile.bottleneck, profileChoices(profile, 'bottleneck'), profile.bottleneck, 'Identify the work that would be repeated by a direct enumeration or rescan.'),
    pattern: question(problem, 'pattern', 'Pattern', `Which recognition signal most directly supports the verified ${profile.title} solution taught here?`, profile.recognition, profileChoices(profile, 'recognition'), `This signal justifies using ${profile.title}.`, 'Look for the structural property that the algorithm exploits, not merely a topic label.'),
    'data-structure': question(problem, 'data-structure', 'Data Structure', 'What state should the algorithm maintain?', profile.state, profileChoices(profile, 'state'), profile.state, 'Choose the smallest state that supports every required transition.'),
    invariant: question(problem, 'invariant', 'Invariant', 'Which invariant must be true after every completed step?', profile.invariant, profileChoices(profile, 'invariant'), profile.invariant, 'Phrase the invariant as a claim about all work already processed.'),
    transition: question(problem, 'transition', 'Algorithm', 'Which transition advances the algorithm while preserving that invariant?', profile.transition, profileChoices(profile, 'transition'), profile.transition, 'The next step must make progress without invalidating the maintained state.'),
    trace: question(problem, 'trace', 'Algorithm', `Run the verified algorithm on this example: ${example?.input ?? 'the provided input'}. What result must the trace produce?`, example?.output ?? 'The required result', outputChoices, example?.explanation || `The trace must terminate at the documented output: ${example?.output}.`, 'Follow the maintained state one input element or graph step at a time; do not skip directly to a different example.'),
    correctness: question(problem, 'correctness', 'Correctness', 'Why does the verified algorithm cover all valid answers without accepting an invalid one?', profile.correctness, profileChoices(profile, 'correctness'), profile.correctness, 'Connect the invariant and transition to an exhaustive set of valid cases.'),
    'edge-case': question(problem, 'edge-case', 'Correctness', 'Which edge case is especially important for this implementation?', profile.edgeCase, profileChoices(profile, 'edgeCase'), profile.edgeCase, 'Test the boundary where the maintained state is empty, duplicated, or at its smallest legal size.'),
    'time-complexity': question(problem, 'time-complexity', 'Complexity', 'What is the time complexity of the verified solution?', time.value, complexityDistractors(time.value, 'time'), time.reason, 'Count how often each input item, node, edge, state, or heap entry can be processed.'),
    'space-complexity': question(problem, 'space-complexity', 'Complexity', 'What is the auxiliary space complexity of the verified solution?', space.value, complexityDistractors(space.value, 'space'), space.reason, 'Count retained state and the maximum recursion, queue, stack, map, or table size; exclude the returned output unless stated otherwise.'),
    tradeoff: question(problem, 'tradeoff', 'Complexity', 'Which tradeoff accurately characterizes this approach?', profile.tradeoff, profileChoices(profile, 'tradeoff'), profile.tradeoff, 'Compare this approach with the nearest plausible alternative and identify what resource or capability changes.'),
  }

  const baseline: QuestionStage[] = ['contract', 'pattern', 'data-structure', 'invariant', 'transition', 'correctness', 'time-complexity', 'space-complexity']
  const deep: QuestionStage[] = ['contract', 'bottleneck', 'pattern', 'data-structure', 'invariant', 'transition', 'trace', 'correctness', 'edge-case', 'time-complexity', 'space-complexity', 'tradeoff']
  return (DEEP_PROBLEM_IDS.has(problem.id) ? deep : baseline).map((stage) => stages[stage])
}
