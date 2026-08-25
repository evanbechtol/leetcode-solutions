import type { MisconceptionLink, Problem, QuestionStage } from '../types'

const lessonByTopic: Record<string, string> = {
  'Linked List': 'linked-lists', Tree: 'trees', Graph: 'graphs', Heap: 'heaps',
  'Dynamic Programming': 'dynamic-programming', String: 'sliding-window', Array: 'arrays-hash-maps',
  'Hash Table': 'arrays-hash-maps', 'Binary Search': 'binary-search', 'Two Pointers': 'two-pointers',
}

const conceptForStage: Record<QuestionStage, string> = {
  contract: 'Reading the required result', bottleneck: 'Finding repeated work', pattern: 'Choosing an approach from the stored state',
  'data-structure': 'Choosing what the solution must remember', invariant: 'Keeping the solution’s promise true', visualization: 'Following state changes',
  'build-algorithm': 'Ordering the implementation decisions', transition: 'Making one safe state update', trace: 'Tracing one step at a time',
  correctness: 'Connecting the repeated step to the result', 'edge-case': 'Checking a boundary case', 'time-complexity': 'Counting repeated work',
  'space-complexity': 'Counting extra stored state', tradeoff: 'Comparing solution costs',
}

export const lessonSlugForProblem = (problem: Problem) => problem.topics.map((topic) => lessonByTopic[topic]).find(Boolean) ?? 'arrays-hash-maps'

export const categoryRepairLink = (problem: Problem, stage: QuestionStage | undefined, specificity: MisconceptionLink['specificity'] = 'category'): MisconceptionLink => {
  const safeStage = stage ?? 'pattern'
  const lessonSlug = lessonSlugForProblem(problem)
  return {
    key: `${lessonSlug}:${safeStage}`,
    label: 'Practice this concept',
    conceptKey: conceptForStage[safeStage],
    lessonSlug,
    repairMode: safeStage === 'visualization' || safeStage === 'trace' ? 'trace' : 'lesson',
    specificity,
  }
}
