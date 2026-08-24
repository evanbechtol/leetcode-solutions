import { compileLessonVisualization } from './coaching/compiler'
import { problems } from './problems'

export const lessonVisualizationProblemIds: Record<string, number> = {
  'arrays-hash-maps': 1,
  'linked-lists': 206,
  'stacks-queues': 20,
  trees: 102,
  heaps: 23,
  graphs: 207,
  'two-pointers': 42,
  'sliding-window': 3,
  'binary-search': 704,
  'graph-traversal': 127,
  greedy: 121,
  'dynamic-programming': 53,
  backtracking: 37,
}

export const lessonVisualizationFor = (slug: string) => {
  const problem = problems.find(({ id }) => id === lessonVisualizationProblemIds[slug])
  return problem ? { problem, question: compileLessonVisualization(problem) } : null
}
