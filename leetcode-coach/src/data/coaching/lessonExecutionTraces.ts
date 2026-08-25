import type { Problem, VisualizationFrame } from '../../types'

type Variable = VisualizationFrame['variables'][number]
type Structure = NonNullable<VisualizationFrame['structures']>[number]
type ItemStatus = NonNullable<Structure['items'][number]['status']>
type FrameState = Omit<VisualizationFrame, 'phase' | 'input' | 'expectedOutput'>

const variable = (name: string, value: unknown, role: Variable['role'], previousValue?: unknown): Variable => ({
  name,
  value: String(value),
  role,
  ...(previousValue === undefined ? {} : { previousValue: String(previousValue), changed: String(previousValue) !== String(value) }),
})

const structure = (
  name: string,
  kind: Structure['kind'],
  description: string,
  values: Array<string | number>,
  statuses: Record<number, ItemStatus> = {},
): Structure => ({
  name,
  kind,
  description,
  items: values.map((value, index) => ({ key: String(index), value: String(value), status: statuses[index] })),
})

const keyedStructure = (
  name: string,
  kind: Structure['kind'],
  description: string,
  entries: Array<[string | number, string | number, ItemStatus?]>,
): Structure => ({
  name,
  kind,
  description,
  items: entries.map(([key, value, status]) => ({ key: String(key), value: String(value), status })),
})

const framesFor = (problem: Problem, states: FrameState[]): VisualizationFrame[] => states.map((state, index) => ({
  ...state,
  phase: `Step ${index}`,
  input: problem.examples[0].input,
  expectedOutput: problem.examples[0].output,
}))

const pending = 'Not produced yet'

const reverseLinkedListTrace = (problem: Problem): VisualizationFrame[] => {
  const values = [1, 2, 3, 4, 5]
  const states: FrameState[] = [
    {
      id: 'input', title: 'Load the linked list', action: 'Read head and preserve the five stable node identities.', currentOutput: pending,
      processed: 'No nodes', remaining: 'Nodes 1 → 2 → 3 → 4 → 5', activeCodeLines: [6],
      variables: [variable('head.val', 1, 'input'), variable('output', pending, 'output')],
      structures: [structure('input nodes', 'array', 'Stable nodes in original order', values)],
      invariant: 'The original next pointers still connect every node from 1 through 5.',
    },
    {
      id: 'initialize', title: 'Initialize the reversed prefix', action: 'Create dummy and set curr = head.', currentOutput: pending,
      processed: 'No nodes', remaining: 'Nodes 1 → 2 → 3 → 4 → 5', activeCodeLines: [7, 8],
      variables: [variable('curr.val', 1, 'control'), variable('dummy.next', 'null', 'state'), variable('output', pending, 'output')],
      structures: [structure('unprocessed chain', 'array', 'Nodes still reachable from curr', values, { 0: 'active' }), structure('reversed chain', 'array', 'Nodes reachable from dummy.next', [])],
      invariant: 'dummy.next heads the reversed processed prefix; curr heads the untouched suffix.',
    },
  ]

  const reversed: number[] = []
  for (let index = 0; index < values.length; index += 1) {
    const curr = values[index]
    const next = values[index + 1]
    reversed.unshift(curr)
    states.push({
      id: `move-node-${curr}`,
      title: `Move node ${curr} to the reversed prefix`,
      action: `Save next = ${next ?? 'null'}, point ${curr}.next to ${reversed[1] ?? 'null'}, move dummy.next to ${curr}, then advance curr.`,
      currentOutput: pending,
      processed: `Nodes ${values.slice(0, index + 1).join(', ')}`,
      remaining: next === undefined ? 'No nodes' : `Nodes ${values.slice(index + 1).join(' → ')}`,
      activeCodeLines: [9, 10, 11, 12, 13],
      variables: [
        variable('curr', next === undefined ? 'null' : `node ${next}`, 'control', `node ${curr}`),
        variable('next', next === undefined ? 'null' : `node ${next}`, 'state'),
        variable('dummy.next', `node ${curr}`, 'state', index ? `node ${values[index - 1]}` : 'null'),
        variable('output', pending, 'output'),
      ],
      structures: [
        structure('unprocessed chain', 'array', 'Nodes still reachable from curr', values.slice(index + 1), next === undefined ? {} : { 0: 'active' }),
        structure('reversed chain', 'array', 'Nodes reachable from dummy.next', [...reversed], Object.fromEntries(reversed.map((_, i) => [i, 'processed']))),
      ],
      invariant: 'The processed prefix is reversed exactly once, and the saved next reference prevents the suffix from being lost.',
    })
  }

  states.push({
    id: 'return-head', title: 'Return the new head', action: 'curr is null, so return dummy.next, which points to node 5.', currentOutput: '[5,4,3,2,1]',
    processed: 'All five nodes', remaining: 'Nothing', activeCodeLines: [14],
    variables: [variable('curr', 'null', 'control'), variable('dummy.next', 'node 5', 'state'), variable('output', '[5,4,3,2,1]', 'output', pending)],
    structures: [structure('reversed chain', 'array', 'Final next-pointer order', [5, 4, 3, 2, 1], { 0: 'result', 1: 'result', 2: 'result', 3: 'result', 4: 'result' })],
    invariant: 'Every original node appears once, every next pointer is reversed, and node 5 is the new head.',
  })
  return framesFor(problem, states)
}

const validParenthesesTrace = (problem: Problem): VisualizationFrame[] => {
  const chars = ['(', ')']
  return framesFor(problem, [
    {
      id: 'input', title: 'Load the two characters', action: 'Read s = "()" from left to right.', currentOutput: pending,
      processed: 'No characters', remaining: 'Indices 0–1', activeCodeLines: [1],
      variables: [variable('s.length', 2, 'input'), variable('output', pending, 'output')],
      structures: [structure('s', 'string', 'Characters by original index', chars)],
      invariant: 'No delimiter has been accepted or matched yet.',
    },
    {
      id: 'initialize', title: 'Create the stack and valid pairs', action: 'Initialize stk = [] and d = {(), [], {}}.', currentOutput: pending,
      processed: 'No characters', remaining: 'Indices 0–1', activeCodeLines: [2, 3],
      variables: [variable('c', 'Not read', 'control'), variable('output', pending, 'output')],
      structures: [structure('s', 'string', 'Characters by original index', chars), structure('stk', 'array', 'Unmatched opening delimiters; top is on the right', []), structure('d', 'set', 'Allowed opening-and-closing pairs', ['()', '[]', '{}'])],
      invariant: 'stk contains exactly the unmatched opening delimiters from the processed prefix.',
    },
    {
      id: 'read-open', title: 'Read the opening parenthesis', action: 'Set c = "(" and identify it as an opening delimiter.', currentOutput: pending,
      processed: 'Index 0 selected', remaining: 'Index 1', activeCodeLines: [4, 5],
      variables: [variable('c', '"("', 'control', 'Not read'), variable('c in "({["', 'true', 'state'), variable('output', pending, 'output')],
      structures: [structure('s', 'string', 'Characters by original index', chars, { 0: 'active' }), structure('stk', 'array', 'Unmatched opening delimiters', [])],
      invariant: 'The selected character must enter stk before a later closer can match it.',
    },
    {
      id: 'push-open', title: 'Push the opening parenthesis', action: 'Append "(" to stk.', currentOutput: pending,
      processed: 'Index 0', remaining: 'Index 1', activeCodeLines: [6],
      variables: [variable('c', '"("', 'control'), variable('len(stk)', 1, 'state', 0), variable('output', pending, 'output')],
      structures: [structure('s', 'string', 'Characters by original index', chars, { 0: 'processed' }), structure('stk', 'array', 'Unmatched opening delimiters', ['('], { 0: 'queued' })],
      invariant: 'stk = ["("] exactly represents the unmatched opening delimiter in s[0…0].',
    },
    {
      id: 'read-close', title: 'Read the closing parenthesis', action: 'Set c = ")"; it is not an opening delimiter, so the algorithm must match the stack top.', currentOutput: pending,
      processed: 'Index 0', remaining: 'Index 1 selected', activeCodeLines: [4, 5, 7],
      variables: [variable('c', '")"', 'control', '"("'), variable('len(stk)', 1, 'state'), variable('output', pending, 'output')],
      structures: [structure('s', 'string', 'Characters by original index', chars, { 0: 'processed', 1: 'active' }), structure('stk', 'array', 'Unmatched opening delimiters', ['('], { 0: 'active' })],
      invariant: 'A closing delimiter is valid only if an opener exists at the top of stk and the concatenated pair belongs to d.',
    },
    {
      id: 'match-close', title: 'Pop and validate the pair', action: 'Pop "("; "(" + ")" = "()", which belongs to d.', currentOutput: pending,
      processed: 'Indices 0–1', remaining: 'No characters', activeCodeLines: [7, 8],
      variables: [variable('c', '")"', 'control'), variable('stk.pop() + c', '"()"', 'state'), variable('"()" in d', 'true', 'state'), variable('output', pending, 'output')],
      structures: [structure('s', 'string', 'Characters by original index', chars, { 0: 'processed', 1: 'processed' }), structure('stk', 'array', 'Unmatched opening delimiters', []), structure('d', 'set', 'Allowed pairs', ['()', '[]', '{}'], { 0: 'result' })],
      invariant: 'The complete processed prefix is balanced, so stk is empty.',
    },
    {
      id: 'return-valid', title: 'Return true', action: 'The scan is complete and stk is empty, so return not stk = true.', currentOutput: 'true',
      processed: 'Both characters', remaining: 'Nothing', activeCodeLines: [9],
      variables: [variable('len(stk)', 0, 'state'), variable('not stk', 'true', 'state'), variable('output', 'true', 'output', pending)],
      structures: [structure('s', 'string', 'Matched input', chars, { 0: 'result', 1: 'result' }), structure('stk', 'array', 'No unmatched opening delimiters remain', [])],
      invariant: 'Every closing delimiter matched the most recent unmatched opener, and no opener remains.',
    },
  ])
}

interface HeapHead { value: number; list: number; position: number }

const mergeKListsTrace = (problem: Problem): VisualizationFrame[] => {
  const lists = [[1, 4, 5], [1, 3, 4], [2, 6]]
  const heap: HeapHead[] = lists.map((list, index) => ({ value: list[0], list: index, position: 0 }))
  const output: number[] = []
  const orderHeap = () => heap.sort((a, b) => a.value - b.value || a.list - b.list)
  const heapView = () => structure('pq', 'array', 'Heap frontier shown in next-removal priority order', orderHeap().map(({ value, list }) => `${value} from L${list}`), heap.length ? { 0: 'active' } : {})
  const listsView = () => keyedStructure('lists', 'array', 'Each sorted input list; the number after @ is its next unread position', lists.map((list, index) => [
    `L${index}`, `${list.join(' → ')} @ ${heap.find((item) => item.list === index)?.position ?? 'done'}`,
  ]))
  const states: FrameState[] = [
    {
      id: 'input', title: 'Load the sorted lists', action: 'Read the three sorted linked-list heads.', currentOutput: '[]',
      processed: 'No nodes', remaining: 'Eight nodes', activeCodeLines: [6],
      variables: [variable('len(lists)', 3, 'input'), variable('output', '[]', 'output')],
      structures: [keyedStructure('lists', 'array', 'Input linked lists', lists.map((list, i) => [`L${i}`, list.join(' → ')]))],
      invariant: 'Every individual input list is sorted in nondecreasing order.',
    },
    {
      id: 'heapify', title: 'Heapify the three heads', action: 'Insert the non-null heads 1 from L0, 1 from L1, and 2 from L2 into pq.', currentOutput: '[]',
      processed: 'No nodes', remaining: 'Eight nodes', activeCodeLines: [7, 8, 9],
      variables: [variable('len(pq)', 3, 'state'), variable('cur', 'dummy', 'control'), variable('output', '[]', 'output')],
      structures: [listsView(), heapView(), structure('merged', 'array', 'Nodes already linked after dummy', [])],
      invariant: 'pq contains exactly the smallest unmerged node from every nonempty list.',
    },
  ]

  let previousOutput = '[]'
  while (heap.length) {
    orderHeap()
    const node = heap.shift()!
    output.push(node.value)
    const nextPosition = node.position + 1
    if (nextPosition < lists[node.list].length) heap.push({ value: lists[node.list][nextPosition], list: node.list, position: nextPosition })
    const currentOutput = `[${output.join(',')}]`
    states.push({
      id: `append-${output.length}-${node.value}`,
      title: `Append ${node.value} from L${node.list}`,
      action: `Pop ${node.value} from pq, append that node to merged, then ${nextPosition < lists[node.list].length ? `push its successor ${lists[node.list][nextPosition]}` : `mark L${node.list} exhausted`}.`,
      currentOutput,
      processed: `${output.length} of 8 nodes`, remaining: `${8 - output.length} nodes`, activeCodeLines: [10, 11, 12, 13, 14, 15, 16],
      variables: [variable('node.val', node.value, 'control'), variable('len(pq)', heap.length, 'state'), variable('cur.val', node.value, 'state'), variable('output', currentOutput, 'output', previousOutput)],
      structures: [listsView(), heapView(), structure('merged', 'array', 'Nodes linked after dummy in final order so far', [...output], Object.fromEntries(output.map((_, i) => [i, 'processed'])))],
      invariant: 'merged is sorted, and pq still contains the smallest unmerged head from each remaining list.',
    })
    previousOutput = currentOutput
  }
  states.push({
    id: 'return-merged', title: 'Return the merged head', action: 'pq is empty, so return dummy.next.', currentOutput: '[1,1,2,3,4,4,5,6]',
    processed: 'All eight nodes', remaining: 'Nothing', activeCodeLines: [17],
    variables: [variable('len(pq)', 0, 'state'), variable('dummy.next.val', 1, 'state'), variable('output', '[1,1,2,3,4,4,5,6]', 'output', previousOutput)],
    structures: [structure('merged', 'array', 'Complete sorted linked list', output, Object.fromEntries(output.map((_, i) => [i, 'result'])))],
    invariant: 'All input nodes appear exactly once and the complete merged chain is sorted.',
  })
  return framesFor(problem, states)
}

const trappingRainWaterTrace = (problem: Problem): VisualizationFrame[] => {
  const height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]
  let left = 0
  let right = height.length - 1
  let leftMax = 0
  let rightMax = 0
  let water = 0
  const states: FrameState[] = [
    {
      id: 'input', title: 'Load the elevation map', action: 'Read every bar at its stable index.', currentOutput: pending,
      processed: 'No bars', remaining: 'Indices 0–11', activeCodeLines: [0],
      variables: [variable('height.length', 12, 'input'), variable('output', pending, 'output')],
      structures: [structure('height', 'array', 'Bar heights by index', height)],
      invariant: 'No position has been resolved, so no water has been counted.',
    },
    {
      id: 'initialize', title: 'Initialize both boundaries', action: 'Set left = 0, right = 11, both running maxima to 0, and water = 0.', currentOutput: '0',
      processed: 'No bars', remaining: 'Indices 0–11', activeCodeLines: [1, 2],
      variables: [variable('left', left, 'control'), variable('right', right, 'control'), variable('leftMax', leftMax, 'state'), variable('rightMax', rightMax, 'state'), variable('water', water, 'output')],
      structures: [structure('height', 'array', 'Unresolved bars between the pointers', height, { [left]: 'active', [right]: 'active' })],
      invariant: 'leftMax and rightMax summarize only boundary bars already reached from their respective sides.',
    },
  ]

  let iteration = 0
  while (left < right) {
    iteration += 1
    const oldLeft = left
    const oldRight = right
    const oldLeftMax = leftMax
    const oldRightMax = rightMax
    const oldWater = water
    let side: 'left' | 'right'
    let added: number
    let resolvedIndex: number
    if (height[left] <= height[right]) {
      side = 'left'
      resolvedIndex = left
      leftMax = Math.max(leftMax, height[left])
      added = leftMax - height[left]
      water += added
      left += 1
    } else {
      side = 'right'
      resolvedIndex = right
      rightMax = Math.max(rightMax, height[right])
      added = rightMax - height[right]
      water += added
      right -= 1
    }
    const statuses: Record<number, ItemStatus> = {}
    for (let i = 0; i < height.length; i += 1) statuses[i] = i < left || i > right ? 'processed' : 'candidate'
    if (left <= right) {
      statuses[left] = 'active'
      statuses[right] = 'active'
    }
    statuses[resolvedIndex] = added ? 'result' : 'processed'
    states.push({
      id: `resolve-${side}-${resolvedIndex}`,
      title: `Resolve index ${resolvedIndex} from the ${side}`,
      action: `${side === 'left' ? `height[${oldLeft}] = ${height[oldLeft]} ≤ height[${oldRight}] = ${height[oldRight]}` : `height[${oldLeft}] = ${height[oldLeft]} > height[${oldRight}] = ${height[oldRight]}`}; update ${side}Max and add ${added} unit${added === 1 ? '' : 's'} of water.`,
      currentOutput: String(water), processed: `${iteration} resolved positions`, remaining: `Indices ${left}–${right}`, activeCodeLines: side === 'left' ? [3, 4, 5, 6, 7] : [3, 8, 9, 10, 11],
      variables: [
        variable('left', left, 'control', oldLeft), variable('right', right, 'control', oldRight),
        variable('leftMax', leftMax, 'state', oldLeftMax), variable('rightMax', rightMax, 'state', oldRightMax),
        variable('water added', added, 'state'), variable('water', water, 'output', oldWater),
      ],
      structures: [structure('height', 'array', 'Resolved exterior and unresolved interval', height, statuses)],
      invariant: 'The side with the lower current boundary is safe to finalize; future interior bars cannot lower the opposite boundary already known.',
    })
  }
  states.push({
    id: 'return-water', title: 'Return the accumulated water', action: 'left equals right, so every trappable position has been resolved; return water = 6.', currentOutput: '6',
    processed: 'All positions', remaining: 'Nothing', activeCodeLines: [13],
    variables: [variable('left', 7, 'control'), variable('right', 7, 'control'), variable('water', 6, 'output')],
    structures: [structure('height', 'array', 'All bars after both scans meet', height, Object.fromEntries(height.map((_, i) => [i, i === 7 ? 'active' : 'processed'])))],
    invariant: 'water equals the sum of min(maxLeft, maxRight) − height[i] over all positions, which is 6.',
  })
  return framesFor(problem, states)
}

const wordLadderTrace = (problem: Problem): VisualizationFrame[] => {
  const words = ['hot', 'dot', 'dog', 'lot', 'log', 'cog']
  const wordSet = (remaining: string[], statuses: Record<number, ItemStatus> = {}) => structure('words', 'set', 'Unvisited dictionary words', words.map((word) => remaining.includes(word) ? word : `${word} (visited)`), statuses)
  return framesFor(problem, [
    {
      id: 'input', title: 'Load the transformation problem', action: 'Read beginWord, endWord, and all six allowed dictionary words.', currentOutput: pending,
      processed: 'No words', remaining: 'All reachable transformations', activeCodeLines: [1],
      variables: [variable('beginWord', '"hit"', 'input'), variable('endWord', '"cog"', 'input'), variable('output', pending, 'output')],
      structures: [wordSet(words)], invariant: 'No transformation has been explored yet.',
    },
    {
      id: 'initialize', title: 'Seed breadth-first search', action: 'Create words, enqueue "hit", and set ans = 1 because the sequence already contains beginWord.', currentOutput: pending,
      processed: 'No dequeued words', remaining: 'Queue contains hit', activeCodeLines: [2, 3, 4],
      variables: [variable('ans', 1, 'state'), variable('s', 'Not dequeued', 'control'), variable('output', pending, 'output')],
      structures: [structure('q', 'queue', 'Current BFS frontier', ['hit'], { 0: 'queued' }), wordSet(words)],
      invariant: 'Every word in q is at sequence length ans, and no visited dictionary word can be enqueued twice.',
    },
    {
      id: 'discover-hot', title: 'Expand hit and discover hot', action: 'Increment ans to 2, dequeue hit, change its middle letter to form hot, enqueue hot, and remove hot from words.', currentOutput: pending,
      processed: 'hit', remaining: 'Frontier hot', activeCodeLines: [5, 6, 7, 8, 9, 10, 11, 12, 13, 18, 19],
      variables: [variable('ans', 2, 'state', 1), variable('s', '"hit"', 'control'), variable('i', 1, 'control'), variable('t', '"hot"', 'state'), variable('output', pending, 'output')],
      structures: [structure('q', 'queue', 'Next BFS frontier', ['hot'], { 0: 'queued' }), wordSet(words.filter((word) => word !== 'hot'), { 0: 'processed' })],
      invariant: 'hot is the only unvisited dictionary word one valid change from hit, so it is the complete distance-2 frontier.',
    },
    {
      id: 'discover-dot-lot', title: 'Expand hot and discover dot and lot', action: 'Set ans = 3. Replacing the first letter of hot discovers dot and lot; enqueue each once and remove both from words.', currentOutput: pending,
      processed: 'hit, hot', remaining: 'Frontier dot, lot', activeCodeLines: [5, 6, 7, 8, 9, 10, 11, 12, 13, 18, 19],
      variables: [variable('ans', 3, 'state', 2), variable('s', '"hot"', 'control', '"hit"'), variable('t', '"lot"', 'state', '"hot"'), variable('output', pending, 'output')],
      structures: [structure('q', 'queue', 'Distance-3 frontier in discovery order', ['dot', 'lot'], { 0: 'queued', 1: 'queued' }), wordSet(['dog', 'log', 'cog'], { 0: 'processed', 1: 'processed', 3: 'processed' })],
      invariant: 'Every queued word has shortest sequence length 3 because BFS finishes the entire previous level first.',
    },
    {
      id: 'discover-dog-log', title: 'Expand level 3 and discover dog and log', action: 'Set ans = 4. dot discovers dog, then lot discovers log; both enter the next frontier.', currentOutput: pending,
      processed: 'hit, hot, dot, lot', remaining: 'Frontier dog, log; target cog unvisited', activeCodeLines: [5, 6, 7, 8, 9, 10, 11, 12, 13, 18, 19],
      variables: [variable('ans', 4, 'state', 3), variable('s', '"lot"', 'control', '"hot"'), variable('t', '"log"', 'state', '"lot"'), variable('output', pending, 'output')],
      structures: [structure('q', 'queue', 'Distance-4 frontier', ['dog', 'log'], { 0: 'queued', 1: 'queued' }), wordSet(['cog'], { 0: 'processed', 1: 'processed', 2: 'processed', 3: 'processed', 4: 'processed' })],
      invariant: 'dog and log are reached in four words, and no shorter path to cog was found in an earlier level.',
    },
    {
      id: 'find-cog', title: 'Discover the target from dog', action: 'Set ans = 5, dequeue dog, change d to c, and form cog. Because t equals endWord, return immediately.', currentOutput: '5',
      processed: 'hit, hot, dot, lot, dog', remaining: 'No search required after target discovery', activeCodeLines: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      variables: [variable('ans', 5, 'output', 4), variable('s', '"dog"', 'control', '"lot"'), variable('i', 0, 'control'), variable('t', '"cog"', 'state', '"log"'), variable('output', 5, 'output', pending)],
      structures: [structure('q', 'queue', 'Remaining same-level work is irrelevant after return', ['log'], { 0: 'queued' }), wordSet(['cog'], { 2: 'processed', 4: 'queued', 5: 'result' })],
      invariant: 'The first time BFS discovers cog is at the minimum possible sequence length, 5.',
    },
  ])
}

const longestSubstringTrace = (problem: Problem): VisualizationFrame[] => {
  const chars = [...'abcabcbb']
  const latest = new Map<string, number>()
  let left = 0
  let best = 0
  const stringView = (statuses: Record<number, ItemStatus> = {}) => structure('s', 'string', 'Characters by original index', chars, statuses)
  const mapView = () => keyedStructure('last', 'map', 'Character → latest processed index', [...latest.entries()].map(([key, value]) => [key, value]))
  const states: FrameState[] = [
    {
      id: 'input', title: 'Load the string', action: 'Read all eight characters at their stable indices.', currentOutput: pending,
      processed: 'No characters', remaining: 'Indices 0–7', activeCodeLines: [0],
      variables: [variable('s.length', 8, 'input'), variable('output', pending, 'output')],
      structures: [stringView()], invariant: 'No ending position has been evaluated yet.',
    },
    {
      id: 'initialize', title: 'Initialize the window state', action: 'Create last, then set left = 0 and best = 0.', currentOutput: '0',
      processed: 'No characters', remaining: 'Indices 0–7', activeCodeLines: [1, 2],
      variables: [variable('left', 0, 'control'), variable('best', 0, 'output'), variable('right', 'Not started', 'control')],
      structures: [stringView(), mapView()], invariant: 'The empty window contains no repeated character.',
    },
  ]

  chars.forEach((character, right) => {
    const oldLeft = left
    const oldBest = best
    const previousIndex = latest.get(character)
    if (previousIndex !== undefined) left = Math.max(left, previousIndex + 1)
    latest.set(character, right)
    const windowLength = right - left + 1
    best = Math.max(best, windowLength)
    const statuses: Record<number, ItemStatus> = {}
    for (let index = 0; index < chars.length; index += 1) {
      if (index < left) statuses[index] = 'discarded'
      else if (index < right) statuses[index] = 'candidate'
      else if (index === right) statuses[index] = 'active'
    }
    states.push({
      id: `right-${right}`, title: `Process s[${right}] = "${character}"`,
      action: previousIndex === undefined
        ? `"${character}" has not appeared, so left stays ${left}; record last["${character}"] = ${right}.`
        : `last["${character}"] = ${previousIndex}, so left = max(${oldLeft}, ${previousIndex} + 1) = ${left}; update its latest index to ${right}.`,
      currentOutput: String(best), processed: `Indices 0–${right}`, remaining: right === chars.length - 1 ? 'No characters' : `Indices ${right + 1}–7`, activeCodeLines: [3, 4, 5, 6],
      variables: [
        variable('right', right, 'control', right ? right - 1 : 'Not started'), variable('s[right]', `"${character}"`, 'control'),
        variable('previous index', previousIndex ?? 'Not found', 'state'), variable('left', left, 'control', oldLeft),
        variable('right - left + 1', windowLength, 'state'), variable('best', best, 'output', oldBest),
      ],
      structures: [stringView(statuses), mapView()],
      invariant: `s[${left}…${right}] = "${chars.slice(left, right + 1).join('')}" is unique, and best is the longest valid window ending at or before ${right}.`,
    })
  })
  states.push({
    id: 'return-best', title: 'Return the longest length', action: 'Every right boundary has been evaluated, so return best = 3.', currentOutput: '3',
    processed: 'All eight characters', remaining: 'Nothing', activeCodeLines: [8],
    variables: [variable('right', 'Loop complete', 'control', 7), variable('left', 7, 'control'), variable('best', 3, 'output'), variable('output', 3, 'output', pending)],
    structures: [stringView(Object.fromEntries(chars.map((_, index) => [index, 'processed']))), mapView()],
    invariant: 'Every possible ending index used its earliest valid left boundary, so no unique-character substring is longer than 3.',
  })
  return framesFor(problem, states)
}

const stockTrace = (problem: Problem): VisualizationFrame[] => {
  const prices = [7, 1, 5, 3, 6, 4]
  let minPrice = Number.POSITIVE_INFINITY
  let best = 0
  const states: FrameState[] = [
    {
      id: 'input', title: 'Load the daily prices', action: 'Read all six prices in chronological order.', currentOutput: pending,
      processed: 'No days', remaining: 'Days 0–5', activeCodeLines: [0],
      variables: [variable('prices.length', 6, 'input'), variable('output', pending, 'output')],
      structures: [structure('prices', 'array', 'Price by day index', prices)], invariant: 'A sale cannot occur before a buy day.',
    },
    {
      id: 'initialize', title: 'Initialize the prefix summary', action: 'Set minPrice = Infinity and best = 0.', currentOutput: '0',
      processed: 'No days', remaining: 'Days 0–5', activeCodeLines: [1, 2],
      variables: [variable('minPrice', 'Infinity', 'state'), variable('best', 0, 'output')],
      structures: [structure('prices', 'array', 'Unprocessed daily prices', prices)], invariant: 'best is zero before any valid buy-then-sell pair is considered.',
    },
  ]
  prices.forEach((price, day) => {
    const oldMin = minPrice
    const oldBest = best
    minPrice = Math.min(minPrice, price)
    const profitToday = price - minPrice
    best = Math.max(best, profitToday)
    const statuses: Record<number, ItemStatus> = Object.fromEntries(prices.map((_, index) => [index, index < day ? 'processed' : index === day ? 'active' : 'candidate']))
    states.push({
      id: `day-${day}`, title: `Process day ${day} at price ${price}`,
      action: `Update minPrice to ${minPrice}; selling today after the cheapest valid buy yields ${profitToday}, so best becomes ${best}.`, currentOutput: String(best),
      processed: `Days 0–${day}`, remaining: day === prices.length - 1 ? 'No days' : `Days ${day + 1}–${prices.length - 1}`, activeCodeLines: [3, 4, 5, 6],
      variables: [variable('price', price, 'control'), variable('minPrice', minPrice, 'state', oldMin === Number.POSITIVE_INFINITY ? 'Infinity' : oldMin), variable('price - minPrice', profitToday, 'state'), variable('best', best, 'output', oldBest)],
      structures: [structure('prices', 'array', 'Chronological prices; active is the current sell day', prices, statuses)],
      invariant: `After day ${day}, minPrice is the cheapest price in days 0–${day}, and best is the greatest valid profit within that prefix.`,
    })
  })
  states.push({
    id: 'return-best', title: 'Return the best profit', action: 'All sell days have been evaluated, so return best = 5.', currentOutput: '5',
    processed: 'All six days', remaining: 'Nothing', activeCodeLines: [7],
    variables: [variable('minPrice', 1, 'state'), variable('best', 5, 'output'), variable('output', 5, 'output', pending)],
    structures: [structure('prices', 'array', 'Buy at day 1 and sell at day 4', prices, { 1: 'result', 4: 'result' })],
    invariant: 'Every day was considered as a sell day against its cheapest earlier-or-current price, so no valid pair can have profit above 5.',
  })
  return framesFor(problem, states)
}

const maximumSubarrayTrace = (problem: Problem): VisualizationFrame[] => {
  const nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
  let f = nums[0]
  let ans = nums[0]
  const states: FrameState[] = [
    {
      id: 'input', title: 'Load the array', action: 'Read all nine values and the required maximum contiguous sum.', currentOutput: pending,
      processed: 'No values', remaining: 'Indices 0–8', activeCodeLines: [1],
      variables: [variable('nums.length', 9, 'input'), variable('output', pending, 'output')],
      structures: [structure('nums', 'array', 'Values by stable input index', nums)], invariant: 'No subarray ending position has been evaluated yet.',
    },
    {
      id: 'initialize', title: 'Use the first value as both DP states', action: 'Set ans = f = nums[0] = -2.', currentOutput: '-2',
      processed: 'Index 0', remaining: 'Indices 1–8', activeCodeLines: [2],
      variables: [variable('f', -2, 'state'), variable('ans', -2, 'output'), variable('x', 'Not read', 'control')],
      structures: [structure('nums', 'array', 'Index 0 is the only possible nonempty ending subarray', nums, { 0: 'active' })],
      invariant: 'f is the maximum sum of a nonempty subarray ending at index 0; ans is the maximum seen anywhere through index 0.',
    },
  ]
  for (let index = 1; index < nums.length; index += 1) {
    const x = nums[index]
    const oldF = f
    const oldAns = ans
    const carried = Math.max(f, 0)
    f = carried + x
    ans = Math.max(ans, f)
    const statuses: Record<number, ItemStatus> = Object.fromEntries(nums.map((_, i) => [i, i < index ? 'processed' : i === index ? 'active' : 'candidate']))
    states.push({
      id: `index-${index}`, title: `Compute the best subarray ending at index ${index}`,
      action: `${oldF} is ${oldF > 0 ? 'positive, so extend it' : 'not positive, so discard it'}; f = max(${oldF}, 0) + ${x} = ${f}, then ans = max(${oldAns}, ${f}) = ${ans}.`, currentOutput: String(ans),
      processed: `Indices 0–${index}`, remaining: index === nums.length - 1 ? 'No values' : `Indices ${index + 1}–8`, activeCodeLines: [3, 4, 5],
      variables: [variable('x', x, 'control'), variable('max(previous f, 0)', carried, 'state'), variable('f', f, 'state', oldF), variable('ans', ans, 'output', oldAns)],
      structures: [structure('nums', 'array', 'Current ending index and processed prefix', nums, statuses)],
      invariant: `f is the greatest sum ending exactly at index ${index}; ans is the greatest sum ending at any index from 0 through ${index}.`,
    })
  }
  states.push({
    id: 'return-answer', title: 'Return the global maximum', action: 'All ending positions have been evaluated, so return ans = 6.', currentOutput: '6',
    processed: 'All nine values', remaining: 'Nothing', activeCodeLines: [6],
    variables: [variable('f', 5, 'state'), variable('ans', 6, 'output'), variable('output', 6, 'output', pending)],
    structures: [structure('nums', 'array', 'The optimal subarray spans indices 3 through 6', nums, { 3: 'result', 4: 'result', 5: 'result', 6: 'result' })],
    invariant: 'Because every possible ending index contributed its best ending sum, ans = 6 is the maximum over all nonempty contiguous subarrays.',
  })
  return framesFor(problem, states)
}

const permutationsTrace = (problem: Problem): VisualizationFrame[] => {
  const nums = [1, 2, 3]
  const vis = [false, false, false]
  const candidate = [0, 0, 0]
  const answers: number[][] = []
  const states: FrameState[] = [
    {
      id: 'input', title: 'Load the three distinct values', action: 'Read nums = [1, 2, 3].', currentOutput: '[]',
      processed: 'No search decisions', remaining: 'Three output positions', activeCodeLines: [1],
      variables: [variable('n', 3, 'input'), variable('output', '[]', 'output')],
      structures: [structure('nums', 'array', 'Values available for each unused-choice decision', nums)],
      invariant: 'No value has been selected, so the current permutation prefix is empty.',
    },
    {
      id: 'initialize', title: 'Initialize the search state', action: 'Set vis to false, allocate t, create ans, and call dfs(0).', currentOutput: '[]',
      processed: 'Depth 0 entered', remaining: 'Positions 0–2', activeCodeLines: [13, 14, 15, 16],
      variables: [variable('i', 0, 'control'), variable('len(ans)', 0, 'output')],
      structures: [structure('nums', 'array', 'Input values', nums), structure('vis', 'array', 'Whether each input index is already in t', vis.map(String)), structure('t', 'array', 'Current candidate slots; 0 means unfilled', candidate)],
      invariant: 'At depth i, t[0…i−1] contains distinct selected values and vis marks exactly those input indices.',
    },
  ]

  let event = 0
  const addState = (state: FrameState) => states.push({ ...state, id: `${state.id}-${event += 1}` })
  const dfs = (depth: number) => {
    if (depth === nums.length) {
      answers.push([...candidate])
      addState({
        id: 'record', title: `Record permutation ${candidate.join('')}`, action: `Depth ${depth} equals n, so append a copy of [${candidate.join(', ')}] to ans.`, currentOutput: JSON.stringify(answers),
        processed: `${answers.length} of 6 permutations recorded`, remaining: `${6 - answers.length} permutations`, activeCodeLines: [3, 4, 5],
        variables: [variable('i', depth, 'control'), variable('len(ans)', answers.length, 'output', answers.length - 1), variable('t[:]', `[${candidate.join(', ')}]`, 'state')],
        structures: [structure('vis', 'array', 'All values used at the leaf', vis.map(String), { 0: 'processed', 1: 'processed', 2: 'processed' }), structure('t', 'array', 'Complete permutation copied into ans', candidate, { 0: 'result', 1: 'result', 2: 'result' }), keyedStructure('ans', 'array', 'Permutations recorded so far', answers.map((answer, index) => [index, `[${answer.join(', ')}]`]))],
        invariant: 'A result is recorded only after every input value has been selected exactly once.',
      })
      return
    }
    for (let index = 0; index < nums.length; index += 1) {
      if (vis[index]) continue
      const oldValue = candidate[depth]
      vis[index] = true
      candidate[depth] = nums[index]
      addState({
        id: 'choose', title: `Choose ${nums[index]} for position ${depth}`, action: `At dfs(${depth}), set vis[${index}] = true and t[${depth}] = ${nums[index]}, then recurse to dfs(${depth + 1}).`, currentOutput: JSON.stringify(answers),
        processed: `Candidate prefix length ${depth + 1}`, remaining: `${nums.length - depth - 1} positions in this branch`, activeCodeLines: [6, 7, 8, 9, 10],
        variables: [variable('i', depth, 'control'), variable('j', index, 'control'), variable('x', nums[index], 'state'), variable('len(ans)', answers.length, 'output')],
        structures: [structure('nums', 'array', 'Input value selected by j', nums, { [index]: 'active' }), structure('vis', 'array', 'Used input indices', vis.map(String), { [index]: 'active' }), structure('t', 'array', 'Current candidate permutation', candidate.map((value, slot) => slot <= depth ? value : 'unfilled'), { [depth]: 'active' })],
        invariant: 'The candidate prefix contains no repeated input index because only vis[j] = false choices are eligible.',
      })
      dfs(depth + 1)
      vis[index] = false
      addState({
        id: 'backtrack', title: `Release ${nums[index]} from position ${depth}`, action: `The recursive branch is complete; set vis[${index}] back to false so sibling branches may use ${nums[index]}.`, currentOutput: JSON.stringify(answers),
        processed: `${answers.length} of 6 permutations recorded`, remaining: `${6 - answers.length} permutations`, activeCodeLines: [11],
        variables: [variable('i', depth, 'control'), variable('j', index, 'control'), variable(`vis[${index}]`, 'false', 'state', 'true'), variable('len(ans)', answers.length, 'output')],
        structures: [structure('nums', 'array', 'Released input value', nums, { [index]: 'processed' }), structure('vis', 'array', 'Availability restored for sibling choices', vis.map(String), { [index]: 'processed' }), structure('t', 'array', 'Slots at and after i will be overwritten before use', candidate.map((value, slot) => slot < depth ? value : 'unfilled'))],
        invariant: 'Backtracking restores vis to exactly the state that existed before this choice.',
      })
      candidate[depth] = oldValue
    }
  }
  dfs(0)
  states.push({
    id: 'return-permutations', title: 'Return all six permutations', action: 'dfs(0) has explored every eligible choice at every position, so return ans.', currentOutput: JSON.stringify(answers),
    processed: 'All six permutations', remaining: 'Nothing', activeCodeLines: [17],
    variables: [variable('len(ans)', 6, 'output'), variable('i', 'returned from dfs(0)', 'control'), variable('output', JSON.stringify(answers), 'output')],
    structures: [keyedStructure('ans', 'array', 'Complete permutation set', answers.map((answer, index) => [index, `[${answer.join(', ')}]`, 'result']))],
    invariant: 'There are 3! = 6 leaves, each contains every input value once, and no two recorded permutations are identical.',
  })
  return framesFor(problem, states)
}

export const buildRemainingLessonTrace = (problem: Problem): VisualizationFrame[] | null => {
  if (problem.id === 3) return longestSubstringTrace(problem)
  if (problem.id === 206) return reverseLinkedListTrace(problem)
  if (problem.id === 20) return validParenthesesTrace(problem)
  if (problem.id === 23) return mergeKListsTrace(problem)
  if (problem.id === 42) return trappingRainWaterTrace(problem)
  if (problem.id === 127) return wordLadderTrace(problem)
  if (problem.id === 121) return stockTrace(problem)
  if (problem.id === 53) return maximumSubarrayTrace(problem)
  if (problem.id === 46) return permutationsTrace(problem)
  return null
}
