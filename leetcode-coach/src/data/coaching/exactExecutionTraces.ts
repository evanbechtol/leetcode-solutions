import type { Problem, VisualizationFrame } from '../../types'
import { traceToVisualizationFrames } from '../../tracing/compatibility'
import { registerPilotTraceFixtures } from '../../tracing/fixtures'
import { exactTraceForProblem } from '../../tracing/registry'

type Variable = VisualizationFrame['variables'][number]
type Structure = NonNullable<VisualizationFrame['structures']>[number]
type ItemStatus = NonNullable<Structure['items'][number]['status']>

const variable = (name: string, value: string, role: Variable['role'], previousValue?: string): Variable => ({
  name, value, role, previousValue, changed: previousValue !== undefined && previousValue !== value,
})

const items = (values: Array<string | number>, statuses: Record<number, ItemStatus> = {}) => values.map((value, index) => ({
  key: String(index), value: String(value), status: statuses[index],
}))

const structure = (name: string, kind: Structure['kind'], description: string, values: Structure['items']): Structure => ({ name, kind, description, items: values })
const mapItems = (entries: Array<[string | number, string | number]>, status: ItemStatus = 'processed') => entries.map(([key, value]) => ({ key: String(key), value: String(value), status }))

const exactLongestSubstring = (problem: Problem): VisualizationFrame[] => {
  const input = problem.examples[0].input
  const output = problem.examples[0].output
  const chars = [...'abcabcbb']
  const stringView = (statuses: Record<number, ItemStatus> = {}) => structure('s', 'string', 'Characters by original index', items(chars, statuses))
  const last = (entries: Array<[string, number]>) => structure('last', 'map', 'character → latest index', mapItems(entries))
  return [
    { id: 'input', phase: 'Step 0', title: 'Load the string', action: 'Read all eight indexed characters in s.', input, expectedOutput: output, currentOutput: 'Not produced yet', processed: 'No characters', remaining: 'Indices 0–7', activeCodeLines: [0], variables: [variable('s.length', '8', 'input'), variable('output', 'Not produced yet', 'output')], structures: [stringView()], invariant: 'No window has been measured yet.' },
    { id: 'initialize', phase: 'Step 1', title: 'Initialize the sliding window', action: 'Create last, then set left = 0 and best = 0.', input, expectedOutput: output, currentOutput: '0', processed: 'No characters', remaining: 'Indices 0–7', activeCodeLines: [1, 2], variables: [variable('left', '0', 'state'), variable('best', '0', 'output'), variable('right', 'Not started', 'control')], structures: [stringView(), last([])], invariant: 'The empty window contains no duplicate character.' },
    { id: 'first-character', phase: 'Step 2', title: 'Expand to character a', action: 'Set right = 0. a is not in last, so left remains 0.', input, expectedOutput: output, currentOutput: '1', processed: 'Index 0', remaining: 'Indices 1–7', activeCodeLines: [3, 4, 5, 6], variables: [variable('right', '0', 'control', 'Not started'), variable('s[right]', '"a"', 'control'), variable('left', '0', 'state'), variable('best', '1', 'output', '0'), variable('right - left + 1', '1', 'state')], structures: [stringView({ 0: 'active' }), last([['a', 0]])], invariant: 'The active window s[0…0] = "a" contains unique characters.' },
    { id: 'first-window', phase: 'Step 3', title: 'Build the window abc', action: 'Process b at index 1 and c at index 2; neither has appeared before.', input, expectedOutput: output, currentOutput: '3', processed: 'Indices 0–2', remaining: 'Indices 3–7', activeCodeLines: [3, 4, 5, 6], variables: [variable('right', '2', 'control', '0'), variable('s[right]', '"c"', 'control', '"a"'), variable('left', '0', 'state'), variable('best', '3', 'output', '1'), variable('right - left + 1', '3', 'state', '1')], structures: [stringView({ 0: 'candidate', 1: 'candidate', 2: 'active' }), last([['a', 0], ['b', 1], ['c', 2]])], invariant: 's[0…2] = "abc" has no repeated character and best is its length, 3.' },
    { id: 'move-left', phase: 'Step 4', title: 'Move past the repeated a', action: 'At right = 3, last[a] = 0, so left becomes max(0, 0 + 1) = 1.', input, expectedOutput: output, currentOutput: '3', processed: 'Indices 0–3', remaining: 'Indices 4–7', activeCodeLines: [3, 4, 5, 6], variables: [variable('right', '3', 'control', '2'), variable('s[right]', '"a"', 'control', '"c"'), variable('left', '1', 'state', '0'), variable('last.get("a")', '0', 'state'), variable('best', '3', 'output')], structures: [stringView({ 0: 'discarded', 1: 'candidate', 2: 'candidate', 3: 'active' }), last([['a', 3], ['b', 1], ['c', 2]])], invariant: 'The active window s[1…3] = "bca" is unique; left never moves backward.' },
    { id: 'finish', phase: 'Step 5', title: 'Finish the scan', action: 'Continue through indices 4–7. No later valid window is longer than 3.', input, expectedOutput: output, currentOutput: '3', processed: 'Indices 0–7', remaining: 'Nothing', activeCodeLines: [3, 4, 5, 6, 8], variables: [variable('right', '7', 'control', '3'), variable('s[right]', '"b"', 'control', '"a"'), variable('left', '7', 'state', '1'), variable('best', '3', 'output')], structures: [stringView({ 0: 'discarded', 1: 'discarded', 2: 'discarded', 3: 'discarded', 4: 'discarded', 5: 'discarded', 6: 'discarded', 7: 'active' }), last([['a', 3], ['b', 7], ['c', 5]])], invariant: 'best is the greatest valid window length measured at every right boundary, so the answer is 3.' },
  ]
}

const exactTreeBfs = (problem: Problem): VisualizationFrame[] => {
  const input = problem.examples[0].input
  const output = problem.examples[0].output
  const tree = (statuses: Record<number, ItemStatus> = {}) => structure('root', 'tree', 'Nodes in level order; null children omitted', items([3, 9, 20, 15, 7], statuses))
  const queue = (values: number[], status: ItemStatus = 'queued') => structure('q', 'queue', 'FIFO frontier: next node is on the left', values.map((value, index) => ({ key: String(index), value: String(value), status })))
  return [
    { id: 'input', phase: 'Step 0', title: 'Load the tree', action: 'Read the root and required level-order output.', input, expectedOutput: output, currentOutput: '[]', processed: 'No nodes', remaining: 'Nodes 3, 9, 20, 15, 7', activeCodeLines: [0, 1, 2, 3, 4, 5, 6], variables: [variable('root.val', '3', 'input'), variable('ans', '[]', 'output')], structures: [tree()], invariant: 'No tree node has been added to the output.' },
    { id: 'initialize', phase: 'Step 1', title: 'Seed the BFS queue', action: 'Create ans = [] and q = deque([root]).', input, expectedOutput: output, currentOutput: '[]', processed: 'No nodes', remaining: 'Queue begins with node 3', activeCodeLines: [7, 8, 9, 10], variables: [variable('ans', '[]', 'output'), variable('root.val', '3', 'input'), variable('len(q)', '1', 'state')], structures: [tree({ 0: 'queued' }), queue([3])], invariant: 'q contains exactly the unprocessed nodes on the next breadth-first frontier.' },
    { id: 'root-level', phase: 'Step 2', title: 'Process level 0', action: 'Freeze len(q) = 1, pop node 3, and append 3 to t.', input, expectedOutput: output, currentOutput: '[[3]]', processed: 'Node 3', remaining: 'Nodes 9, 20, 15, 7', activeCodeLines: [11, 12, 13, 14, 15], variables: [variable('len(q)', '1', 'control'), variable('node.val', '3', 'control'), variable('t', '[3]', 'state'), variable('ans', '[[3]]', 'output', '[]')], structures: [tree({ 0: 'processed', 1: 'queued', 2: 'queued' }), queue([9, 20])], invariant: 't contains exactly the values from level 0, and q contains exactly level 1.' },
    { id: 'second-level', phase: 'Step 3', title: 'Process level 1', action: 'Pop 9 and 20 from the frozen two-node level, then enqueue children 15 and 7.', input, expectedOutput: output, currentOutput: '[[3], [9, 20]]', processed: 'Nodes 3, 9, 20', remaining: 'Nodes 15, 7', activeCodeLines: [11, 12, 13, 14, 15, 16, 17, 18, 19], variables: [variable('len(q)', '2', 'control', '1'), variable('node.val', '20', 'control', '3'), variable('t', '[9, 20]', 'state', '[3]'), variable('ans', '[[3], [9, 20]]', 'output', '[[3]]')], structures: [tree({ 0: 'processed', 1: 'processed', 2: 'processed', 3: 'queued', 4: 'queued' }), queue([15, 7])], invariant: 'Children enter q only after all nodes from their parent level were identified.' },
    { id: 'third-level', phase: 'Step 4', title: 'Process level 2', action: 'Pop 15 and 7. Both are leaves, so no new nodes enter q.', input, expectedOutput: output, currentOutput: '[[3], [9, 20], [15, 7]]', processed: 'All five nodes', remaining: 'Nothing', activeCodeLines: [11, 12, 13, 14, 15, 20], variables: [variable('len(q)', '2', 'control'), variable('node.val', '7', 'control', '20'), variable('t', '[15, 7]', 'state', '[9, 20]'), variable('ans', '[[3], [9, 20], [15, 7]]', 'output', '[[3], [9, 20]]')], structures: [tree({ 0: 'processed', 1: 'processed', 2: 'processed', 3: 'processed', 4: 'processed' }), queue([])], invariant: 'Each appended list contains one complete depth and the queue is now empty.' },
    { id: 'finish', phase: 'Step 5', title: 'Return every level', action: 'The queue is empty, so return ans.', input, expectedOutput: output, currentOutput: output, processed: 'All five nodes', remaining: 'Nothing', activeCodeLines: [21], variables: [variable('ans', output, 'output'), variable('len(q)', '0', 'state')], structures: [tree({ 0: 'result', 1: 'result', 2: 'result', 3: 'result', 4: 'result' }), queue([])], invariant: 'Every reachable node appears exactly once in the output level matching its distance from root.' },
  ]
}

const exactCourseSchedule = (problem: Problem): VisualizationFrame[] => {
  const input = problem.examples[0].input
  const output = problem.examples[0].output
  const graph = (edgeBuilt: boolean, statuses: Record<number, ItemStatus> = {}) => structure('g', 'graph', 'prerequisite → courses it unlocks', [
    { key: '0', value: edgeBuilt ? '[1]' : '[]', status: statuses[0] },
    { key: '1', value: '[]', status: statuses[1] },
  ])
  const indegree = (values: number[], statuses: Record<number, ItemStatus> = {}) => structure('indeg', 'array', 'Unmet prerequisites by course', items(values, statuses))
  const queue = (values: number[]) => structure('q', 'queue', 'Courses currently ready', values.map((value, index) => ({ key: String(index), value: String(value), status: 'queued' as const })))
  return [
    { id: 'input', phase: 'Step 0', title: 'Load courses and prerequisites', action: 'Read numCourses = 2 and the dependency [1, 0].', input, expectedOutput: output, currentOutput: 'Not produced yet', processed: 'No courses', remaining: 'Courses 0 and 1', activeCodeLines: [0, 1], variables: [variable('numCourses', '2', 'input'), variable('prerequisites', '[[1, 0]]', 'input'), variable('output', 'Not produced yet', 'output')], structures: [], invariant: 'No dependency has been represented yet.' },
    { id: 'initialize', phase: 'Step 1', title: 'Create graph and indegree state', action: 'Create two empty adjacency lists and two zero indegree counts.', input, expectedOutput: output, currentOutput: 'Not produced yet', processed: 'No prerequisite pairs', remaining: 'Pair [1, 0]', activeCodeLines: [2, 3], variables: [variable('numCourses', '2', 'input'), variable('output', 'Not produced yet', 'output')], structures: [graph(false), indegree([0, 0])], invariant: 'indeg[c] equals the number of represented incoming prerequisites for course c.' },
    { id: 'build-edge', phase: 'Step 2', title: 'Represent prerequisite 0 → course 1', action: 'Append 1 to g[0] and increment indeg[1] from 0 to 1.', input, expectedOutput: output, currentOutput: 'Not produced yet', processed: 'Pair [1, 0]', remaining: 'No prerequisite pairs', activeCodeLines: [4, 5, 6], variables: [variable('a', '1', 'control'), variable('b', '0', 'control'), variable('indeg[1]', '1', 'state', '0')], structures: [graph(true, { 0: 'active', 1: 'candidate' }), indegree([0, 1], { 1: 'active' })], invariant: 'Course 1 has one unmet prerequisite; course 0 has none.' },
    { id: 'ready-queue', phase: 'Step 3', title: 'Queue every zero-indegree course', action: 'Only course 0 has indegree zero, so initialize q = [0].', input, expectedOutput: output, currentOutput: 'Not produced yet', processed: 'No courses completed', remaining: 'Courses 0 and 1', activeCodeLines: [7], variables: [variable('i', '0', 'control'), variable('indeg[0]', '0', 'state'), variable('numCourses', '2 remaining', 'state')], structures: [graph(true), indegree([0, 1], { 0: 'queued' }), queue([0])], invariant: 'Every course in q has no unmet prerequisites.' },
    { id: 'unlock', phase: 'Step 4', title: 'Complete course 0 and unlock course 1', action: 'Process i = 0, reduce numCourses to 1, decrement indeg[1] to 0, and append 1 to q.', input, expectedOutput: output, currentOutput: 'Not produced yet', processed: 'Course 0', remaining: 'Course 1', activeCodeLines: [8, 9, 10, 11, 12, 13], variables: [variable('i', '0', 'control'), variable('j', '1', 'control'), variable('numCourses', '1 remaining', 'state', '2 remaining'), variable('indeg[1]', '0', 'state', '1')], structures: [graph(true, { 0: 'processed', 1: 'queued' }), indegree([0, 0], { 0: 'processed', 1: 'queued' }), queue([1])], invariant: 'Course 1 enters q exactly when its final unmet prerequisite is completed.' },
    { id: 'finish', phase: 'Step 5', title: 'Complete course 1', action: 'Process course 1, reduce numCourses to 0, then return numCourses == 0.', input, expectedOutput: output, currentOutput: output, processed: 'Courses 0 and 1', remaining: 'Nothing', activeCodeLines: [8, 9, 14], variables: [variable('i', '1', 'control', '0'), variable('numCourses', '0 remaining', 'state', '1 remaining'), variable('output', 'true', 'output', 'Not produced yet')], structures: [graph(true, { 0: 'processed', 1: 'processed' }), indegree([0, 0], { 0: 'processed', 1: 'processed' }), queue([])], invariant: 'Every course was processed in prerequisite order, so all courses can be finished.' },
  ]
}

export const buildExactExecutionTrace = (problem: Problem): VisualizationFrame[] | null => {
  registerPilotTraceFixtures()
  const typedTrace = exactTraceForProblem(problem.id)
  if (typedTrace) return traceToVisualizationFrames(typedTrace, problem.solutionLanguage ?? 'TypeScript')
  if (problem.id === 3) return exactLongestSubstring(problem)
  if (problem.id === 102) return exactTreeBfs(problem)
  if (problem.id === 207) return exactCourseSchedule(problem)
  return null
}
