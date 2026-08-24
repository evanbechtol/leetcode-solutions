export interface LessonFrame {
  label: string
  values: string[]
  active?: number[]
  settled?: number[]
  note: string
}

export interface Lesson {
  slug: string
  title: string
  category: 'Data Structure' | 'Algorithmic Pattern'
  icon: string
  level: 'Foundation' | 'Intermediate' | 'Advanced'
  minutes: number
  summary: string
  mentalModel: string
  signals: string[]
  problemTypes: string[]
  avoidWhen: string[]
  complexity: { operation: string; time: string; space?: string; note: string }[]
  steps: string[]
  walkthrough: { title: string; input: string; frames: LessonFrame[] }
  code: string
  pitfalls: string[]
  relatedTopics: string[]
}

export const lessons: Lesson[] = [
  {
    slug: 'arrays-hash-maps', title: 'Arrays & Hash Maps', category: 'Data Structure', icon: 'mdi-grid', level: 'Foundation', minutes: 14,
    summary: 'Turn repeated searches into direct lookups and use indexes to reason about contiguous data.',
    mentalModel: 'An array is a numbered row of boxes; a hash map is a labeled index card pointing directly to a box. Arrays make position cheap. Hash maps make identity cheap. Many optimal solutions combine both: scan the array once while the map remembers exactly what the prefix has taught you.',
    signals: ['You repeatedly ask “have I seen this value?”', 'The output needs an original index or frequency', 'A nested loop compares every pair', 'Order matters, but sorting would destroy useful positions'],
    problemTypes: ['Pair or complement search', 'Frequency counting and grouping', 'Prefix state and cumulative totals', 'Deduplication and membership', 'Index-to-value transformations'],
    avoidWhen: ['You need ordered predecessor or range queries', 'The key space is tiny enough for a fixed array', 'Worst-case deterministic lookup is mandatory'],
    complexity: [
      { operation: 'Array indexed access', time: 'O(1)', note: 'Memory address is computed directly.' },
      { operation: 'Array search', time: 'O(n)', note: 'Unsorted values may all need inspection.' },
      { operation: 'Hash lookup / insert', time: 'O(1) avg.', space: 'O(n)', note: 'Collisions make the theoretical worst case O(n).' },
    ],
    steps: ['Name the exact fact each iteration needs from the past.', 'Choose a map key that answers that question directly.', 'Check for the needed key before inserting when self-matching is illegal.', 'Prove each element causes only constant expected work.'],
    walkthrough: { title: 'Two Sum: target = 9', input: '[2, 7, 11, 15]', frames: [
      { label: 'Scan 2', values: ['2', '7', '11', '15'], active: [0], note: 'Need 7. It is not in seen, so remember 2 → index 0.' },
      { label: 'Scan 7', values: ['2', '7', '11', '15'], active: [1], settled: [0], note: 'Need 2. The map returns index 0 immediately: answer [0, 1].' },
    ] },
    code: `function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i]
    if (seen.has(need)) return [seen.get(need)!, i]
    seen.set(nums[i], i)
  }
  return []
}`,
    pitfalls: ['Inserting before checking can pair an element with itself.', 'Using an object without considering string coercion or prototype keys.', 'Claiming O(1) space when the map grows with the input.'],
    relatedTopics: ['Array', 'Hash Table'],
  },
  {
    slug: 'linked-lists', title: 'Linked Lists', category: 'Data Structure', icon: 'mdi-link-variant', level: 'Foundation', minutes: 13,
    summary: 'Model sequences through references when local rewiring matters more than random access.',
    mentalModel: 'A linked list is a treasure hunt: every node tells you where the next node lives. You cannot jump to position i, but once you hold a node, inserting or removing beside it is only pointer rewiring. Draw arrows before writing assignments—the old links disappear as soon as you overwrite them.',
    signals: ['The input is already expressed as nodes', 'You must reverse or reconnect a sequence in place', 'Fast and slow movement can reveal structure', 'The problem asks about cycles, middles, or intersections'],
    problemTypes: ['In-place reversal', 'Cycle detection', 'Merging sorted chains', 'Finding the middle or kth-from-end node', 'Reordering and partitioning nodes'],
    avoidWhen: ['Frequent random indexed access is required', 'Cache locality and compact storage dominate', 'A dynamic array already provides cheap append and iteration'],
    complexity: [
      { operation: 'Access by position', time: 'O(n)', note: 'Traversal must begin from a known node.' },
      { operation: 'Insert/remove after known node', time: 'O(1)', note: 'Only a constant number of links change.' },
      { operation: 'Search', time: 'O(n)', space: 'O(1)', note: 'Each node may need inspection.' },
    ],
    steps: ['Preserve the next pointer before changing the current link.', 'State what every pointer means at the top of the loop.', 'Use a dummy head when the real head may change.', 'Test zero, one, and two-node lists explicitly.'],
    walkthrough: { title: 'Reverse 1 → 2 → 3', input: 'head = [1, 2, 3]', frames: [
      { label: 'Start', values: ['prev: ∅', 'curr: 1', 'next: 2'], active: [1], note: 'Save node 2 before redirecting node 1.' },
      { label: 'Rewire', values: ['∅ ← 1', 'curr: 2', 'next: 3'], active: [1], settled: [0], note: 'Node 1 now points backward; advance both working pointers.' },
      { label: 'Finish', values: ['3', '2', '1'], settled: [0, 1, 2], note: 'When curr becomes null, prev is the new head.' },
    ] },
    code: `function reverseList(head: ListNode | null): ListNode | null {
  let previous: ListNode | null = null
  let current = head
  while (current) {
    const next = current.next
    current.next = previous
    previous = current
    current = next
  }
  return previous
}`,
    pitfalls: ['Overwriting current.next before saving it loses the remaining list.', 'Forgetting that deleting the head requires changing the caller-visible head.', 'Comparing node values when the problem asks about node identity.'],
    relatedTopics: ['Linked List', 'Two Pointers'],
  },
  {
    slug: 'stacks-queues', title: 'Stacks & Queues', category: 'Data Structure', icon: 'mdi-tray-full', level: 'Foundation', minutes: 12,
    summary: 'Use access order—last-in-first-out or first-in-first-out—to encode unfinished work.',
    mentalModel: 'A stack is a pile of plates: the most recent unfinished item is resolved first. A queue is a checkout line: earlier discoveries are processed first. The question is not “can I store these items?” but “which pending item must I revisit next?”',
    signals: ['Nested structures must close in reverse order', 'The nearest unresolved candidate matters', 'Work should be processed in discovery order', 'You need levels, layers, or shortest unweighted steps'],
    problemTypes: ['Balanced delimiters and expression parsing', 'Monotonic next-greater/smaller queries', 'Breadth-first traversal', 'Scheduling and buffering', 'Undo/history and iterative DFS'],
    avoidWhen: ['You need arbitrary removal or priority-based order', 'Items must be searched by key', 'A simple pointer over existing data already expresses the order'],
    complexity: [
      { operation: 'Push / pop stack', time: 'O(1)', note: 'Operate at one end.' },
      { operation: 'Enqueue / dequeue', time: 'O(1)', note: 'Use a deque or head index—not Array.shift().' },
      { operation: 'Monotonic stack pass', time: 'O(n)', space: 'O(n)', note: 'Every element enters and leaves at most once.' },
    ],
    steps: ['Define what an item on the structure represents.', 'Choose stack when newer work blocks older work; queue when order must be preserved.', 'Establish the condition that removes an item.', 'Amortize total pushes and removals across the full input.'],
    walkthrough: { title: 'Validate “([])”', input: 'characters = (, [, ], )', frames: [
      { label: 'Open', values: ['(', '['], active: [1], note: 'Opening brackets are unfinished obligations; push them.' },
      { label: 'Close ]', values: ['('], settled: [1], note: 'The top is [, so ] resolves the most recent obligation.' },
      { label: 'Close )', values: ['empty'], settled: [0], note: 'The final close matches (. An empty stack means all obligations resolved.' },
    ] },
    code: `function isValid(s: string): boolean {
  const pairs = new Map([[')', '('], [']', '['], ['}', '{']])
  const stack: string[] = []
  for (const char of s) {
    if (!pairs.has(char)) stack.push(char)
    else if (stack.pop() !== pairs.get(char)) return false
  }
  return stack.length === 0
}`,
    pitfalls: ['Using Array.shift() repeatedly can make a JavaScript queue O(n²).', 'Checking membership but not nesting order for parentheses.', 'Saying a monotonic stack is O(n²) because it contains a while loop.'],
    relatedTopics: ['Stack', 'Queue', 'Monotonic Stack'],
  },
  {
    slug: 'trees', title: 'Trees & Binary Search Trees', category: 'Data Structure', icon: 'mdi-file-tree-outline', level: 'Intermediate', minutes: 17,
    summary: 'Decompose hierarchical problems into a node decision plus answers from independent subtrees.',
    mentalModel: 'A tree is recursive by construction: every child is the root of a smaller tree. Decide what information a subtree should return to its parent. In a binary search tree, ordering adds a compass—smaller values live left and larger values right—so entire branches can be discarded.',
    signals: ['The data has parent/child hierarchy', 'The answer depends on combining child results', 'You must enumerate root-to-leaf paths', 'Ordering lets you prune one subtree'],
    problemTypes: ['Depth, diameter, and balance', 'Lowest common ancestor', 'Serialization and reconstruction', 'Path sums and views', 'BST search, validation, and order statistics'],
    avoidWhen: ['The relationship is many-to-many rather than hierarchical', 'Data is flat and no hierarchy is used', 'A balanced BST is assumed but not guaranteed'],
    complexity: [
      { operation: 'Full traversal', time: 'O(n)', space: 'O(h)', note: 'h is tree height; recursion stack is O(log n) balanced, O(n) skewed.' },
      { operation: 'Balanced BST search', time: 'O(log n)', note: 'One subtree is discarded per comparison.' },
      { operation: 'Unbalanced BST search', time: 'O(n)', note: 'A skewed tree degenerates into a list.' },
    ],
    steps: ['Define the base case for an empty node.', 'Specify exactly what the recursive call returns.', 'Compute left and right answers before combining them.', 'Separate information returned upward from global information updated at a node.'],
    walkthrough: { title: 'Compute maximum depth', input: '[3, 9, 20, null, null, 15, 7]', frames: [
      { label: 'Leaves', values: ['9 → 1', '15 → 1', '7 → 1'], settled: [0, 1, 2], note: 'A leaf is one level deeper than two empty children.' },
      { label: 'Node 20', values: ['left: 1', 'right: 1', '20 → 2'], active: [2], note: 'Return 1 + max(leftDepth, rightDepth).' },
      { label: 'Root 3', values: ['left: 1', 'right: 2', '3 → 3'], settled: [2], note: 'The root combines subtree summaries; no path enumeration is needed.' },
    ] },
    code: `function maxDepth(root: TreeNode | null): number {
  if (!root) return 0
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right))
}`,
    pitfalls: ['Confusing node count with edge count in height definitions.', 'Recomputing subtree information and accidentally creating O(n²).', 'Assuming every binary tree has BST ordering.'],
    relatedTopics: ['Tree', 'Binary Tree', 'Binary Search Tree'],
  },
  {
    slug: 'heaps', title: 'Heaps & Priority Queues', category: 'Data Structure', icon: 'mdi-triangle-outline', level: 'Intermediate', minutes: 14,
    summary: 'Continuously expose the most urgent item without fully sorting everything.',
    mentalModel: 'A heap is a tournament podium, not a sorted list. It guarantees only that the winner is at the top. Removing the winner promotes and repairs in logarithmic time. This is exactly enough when you repeatedly need the current smallest or largest item.',
    signals: ['You repeatedly need the smallest or largest remaining item', 'The problem asks for top k while data streams in', 'Events must be processed by time, distance, or cost', 'Sorting everything feels wasteful because only an extreme matters'],
    problemTypes: ['Top-k and kth-largest', 'Merge k sorted sequences', 'Scheduling and interval rooms', 'Dijkstra’s frontier', 'Running median using two heaps'],
    avoidWhen: ['You need fast arbitrary search', 'All output must be globally sorted once', 'The value domain is small enough for counting'],
    complexity: [
      { operation: 'Peek extreme', time: 'O(1)', note: 'The heap invariant keeps it at the root.' },
      { operation: 'Insert / remove extreme', time: 'O(log n)', note: 'Repair follows one root-to-leaf path.' },
      { operation: 'Build heap', time: 'O(n)', space: 'O(n)', note: 'Bottom-up heapify is linear, not O(n log n).' },
    ],
    steps: ['Name the priority key and whether lower or higher wins.', 'Store only k items when the rest can never affect the answer.', 'After insertion or removal, restore the heap invariant.', 'Distinguish heap size k from input size n in the complexity.'],
    walkthrough: { title: 'Keep the 3 largest values', input: '[4, 1, 7, 2, 9]', frames: [
      { label: 'Fill min-heap', values: ['1', '4', '7'], active: [0], note: 'The smallest of the current top three stays exposed at the root.' },
      { label: 'Read 2', values: ['2', '4', '7'], active: [0], note: '2 beats the root 1, so replace it; 1 can never enter the top three.' },
      { label: 'Read 9', values: ['4', '7', '9'], settled: [0, 1, 2], note: 'Replace 2. The heap contains the answer set without sorting all five.' },
    ] },
    code: `function findKthLargest(nums: number[], k: number): number {
  const heap = new MinPriorityQueue<number>()
  for (const value of nums) {
    heap.enqueue(value)
    if (heap.size() > k) heap.dequeue()
  }
  return heap.front()!
}`,
    pitfalls: ['Choosing a max-heap when a size-k min-heap is needed.', 'Expecting iteration over a heap to produce sorted order.', 'Forgetting that library priority queue APIs differ substantially by language.'],
    relatedTopics: ['Heap', 'Priority Queue', 'Sorting'],
  },
  {
    slug: 'graphs', title: 'Graphs', category: 'Data Structure', icon: 'mdi-graph-outline', level: 'Intermediate', minutes: 18,
    summary: 'Represent arbitrary relationships, then explore each reachable state without losing track of visits.',
    mentalModel: 'A graph is a map of places and connections. Unlike a tree, a place can have many parents and cycles can lead you back where you started. The visited set is not an optimization—it is often what makes the traversal terminate and what defines whether a state has already been solved.',
    signals: ['Entities are connected by arbitrary relationships', 'The input contains edges, dependencies, flights, roads, or transformations', 'You must find connected components or reachability', 'States can transition into other states'],
    problemTypes: ['Connected components and islands', 'Shortest unweighted paths', 'Cycle detection', 'Dependency ordering', 'Network propagation and state-space search'],
    avoidWhen: ['The relationship is strictly hierarchical and a tree is simpler', 'A grid can be processed directly without materializing adjacency', 'Only aggregate counts matter and edges are irrelevant'],
    complexity: [
      { operation: 'BFS / DFS', time: 'O(V + E)', space: 'O(V)', note: 'Each vertex and edge is processed a constant number of times.' },
      { operation: 'Adjacency list storage', time: 'O(V + E)', space: 'O(V + E)', note: 'Best for sparse graphs.' },
      { operation: 'Adjacency matrix storage', time: 'O(1) edge check', space: 'O(V²)', note: 'Useful when the graph is dense.' },
    ],
    steps: ['Choose nodes and define exactly what an edge means.', 'Build adjacency only when the input format requires it.', 'Mark visited when enqueuing to avoid duplicate frontier entries.', 'Process one component, then restart from unvisited nodes if the graph may be disconnected.'],
    walkthrough: { title: 'BFS shortest path from A', input: 'A—B, A—C, B—D, C—E', frames: [
      { label: 'Distance 0', values: ['A'], active: [0], note: 'Start at A and mark it visited immediately.' },
      { label: 'Distance 1', values: ['B', 'C'], active: [0, 1], settled: [0], note: 'A queue preserves the layer in which nodes were discovered.' },
      { label: 'Distance 2', values: ['D', 'E'], active: [0, 1], settled: [0, 1], note: 'The first arrival is shortest because every edge has equal cost.' },
    ] },
    code: `function bfs(start: string, graph: Map<string, string[]>): string[] {
  const queue = [start]
  const visited = new Set([start])
  const order: string[] = []
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head]
    order.push(node)
    for (const next of graph.get(node) ?? []) {
      if (!visited.has(next)) {
        visited.add(next)
        queue.push(next)
      }
    }
  }
  return order
}`,
    pitfalls: ['Marking visited when dequeuing allows duplicates into the queue.', 'Using BFS for weighted shortest paths without additional conditions.', 'Forgetting disconnected components because traversal starts only once.'],
    relatedTopics: ['Graph', 'Breadth-First Search', 'Depth-First Search'],
  },
  {
    slug: 'two-pointers', title: 'Two Pointers', category: 'Algorithmic Pattern', icon: 'mdi-arrow-split-vertical', level: 'Foundation', minutes: 12,
    summary: 'Exploit ordering or opposing constraints so one pointer movement eliminates many candidates.',
    mentalModel: 'Two pointers are two boundaries negotiating toward an answer. A movement must be justified: it should discard candidates that can no longer win. The pattern is powerful only when ordering, monotonicity, or a partition invariant proves that discarded work is irrelevant.',
    signals: ['The input is sorted or can be processed from both ends', 'You seek a pair under a sum or distance constraint', 'You must compact or partition in place', 'A brute-force solution enumerates pairs or intervals'],
    problemTypes: ['Pair sum in sorted data', 'Palindrome comparison', 'Container and trapping-water geometry', 'Deduplication and partitioning', 'Fast/slow cycle and sequence problems'],
    avoidWhen: ['No movement rule can safely eliminate candidates', 'The data needs keyed lookup rather than ordering', 'Sorting would violate index or streaming requirements'],
    complexity: [{ operation: 'Opposing pointer scan', time: 'O(n)', space: 'O(1)', note: 'Each pointer crosses the sequence at most once.' }],
    steps: ['Choose what each pointer bounds or represents.', 'Write the invariant that makes a movement safe.', 'Compare the current state to the target.', 'Move exactly the pointer whose change can improve feasibility.'],
    walkthrough: { title: 'Sorted pair sum: target = 10', input: '[1, 2, 4, 6, 9]', frames: [
      { label: '1 + 9 = 10', values: ['L: 1', '2', '4', '6', 'R: 9'], active: [0, 4], note: 'The target is reached immediately.' },
      { label: 'Why movement works', values: ['sum too small → L++', 'sum too large → R--'], settled: [0, 1], note: 'Sorted order proves the opposite movement cannot fix the sum.' },
    ] },
    code: `function hasPairWithSum(nums: number[], target: number): boolean {
  let left = 0, right = nums.length - 1
  while (left < right) {
    const sum = nums[left] + nums[right]
    if (sum === target) return true
    if (sum < target) left++
    else right--
  }
  return false
}`,
    pitfalls: ['Moving a pointer based on intuition without proving elimination.', 'Using the pattern on unsorted values when the rule depends on order.', 'Allowing both pointers to refer to the same element.'],
    relatedTopics: ['Two Pointers', 'Array', 'String'],
  },
  {
    slug: 'sliding-window', title: 'Sliding Window', category: 'Algorithmic Pattern', icon: 'mdi-arrow-expand-horizontal', level: 'Intermediate', minutes: 15,
    summary: 'Maintain a contiguous candidate incrementally instead of recomputing every subarray or substring.',
    mentalModel: 'A window is a living summary of one interval. The right edge admits new information; the left edge removes information until the invariant is valid again. The core design question is what state lets additions and removals happen cheaply.',
    signals: ['The answer is a contiguous subarray or substring', 'You need a longest, shortest, or count under a condition', 'The condition changes predictably when an edge moves', 'Nested loops repeatedly summarize overlapping ranges'],
    problemTypes: ['Longest substring under a uniqueness/frequency rule', 'Minimum-length subarray meeting a target', 'Fixed-size rolling averages', 'Anagram and permutation windows', 'At-most-k distinct constraints'],
    avoidWhen: ['Negative values destroy the monotonic shrink rule for sum windows', 'The answer is a noncontiguous subsequence', 'Removing the left item cannot update state efficiently'],
    complexity: [{ operation: 'Variable window', time: 'O(n)', space: 'O(k)', note: 'Each edge advances at most n times; k is tracked state size.' }],
    steps: ['Define the window as [left, right] and state its invariant.', 'Expand right and update state.', 'While invalid, remove nums[left] and advance left.', 'Record the answer only when the invariant required by the problem holds.'],
    walkthrough: { title: 'Longest unique substring', input: '"abca"', frames: [
      { label: 'Expand', values: ['a', 'b', 'c'], active: [0, 1, 2], note: '“abc” is valid, so best becomes 3.' },
      { label: 'Duplicate a', values: ['a', 'b', 'c', 'a'], active: [0, 3], note: 'The new a violates uniqueness.' },
      { label: 'Shrink', values: ['b', 'c', 'a'], active: [0, 1, 2], settled: [0], note: 'Move left past the previous a. The window is valid again.' },
    ] },
    code: `function longestUnique(s: string): number {
  const last = new Map<string, number>()
  let left = 0, best = 0
  for (let right = 0; right < s.length; right++) {
    if (last.has(s[right])) left = Math.max(left, last.get(s[right])! + 1)
    last.set(s[right], right)
    best = Math.max(best, right - left + 1)
  }
  return best
}`,
    pitfalls: ['Shrinking once when the invariant requires a while loop.', 'Moving left backward based on an old character position.', 'Calling every two-pointer solution a sliding window even when no interval state is maintained.'],
    relatedTopics: ['Sliding Window', 'String', 'Hash Table'],
  },
  {
    slug: 'binary-search', title: 'Binary Search', category: 'Algorithmic Pattern', icon: 'mdi-call-split', level: 'Intermediate', minutes: 15,
    summary: 'Search a monotonic decision boundary by discarding half of the remaining possibilities.',
    mentalModel: 'Binary search is broader than finding a value in a sorted array. It locates the first point where a monotonic statement changes from false to true. Once you can ask a yes/no feasibility question whose answer never flips back, you can search the answer space itself.',
    signals: ['Input is sorted or the answer space is ordered', 'A feasibility predicate is monotonic', 'Constraints demand O(log n)', 'The problem asks for minimum possible maximum or maximum possible minimum'],
    problemTypes: ['Exact lookup and insertion position', 'First/last occurrence', 'Search in rotated arrays', 'Capacity and rate optimization', 'Square roots and numeric thresholds'],
    avoidWhen: ['The predicate is not monotonic', 'Computing feasibility is more expensive than direct solving', 'The search boundaries cannot be defined safely'],
    complexity: [{ operation: 'Binary search', time: 'O(log n)', space: 'O(1)', note: 'Each decision halves the candidate interval.' }],
    steps: ['Define inclusive or half-open boundaries and never mix conventions.', 'Write the monotonic predicate in one sentence.', 'Compute mid without overflowing.', 'On equality or feasibility, decide whether to return or keep searching for a boundary.'],
    walkthrough: { title: 'Find 9', input: '[-1, 0, 3, 5, 9, 12]', frames: [
      { label: 'mid = 3', values: ['-1', '0', '3', '5', '9', '12'], active: [2], note: '3 < 9, so indexes 0–2 cannot contain the target.' },
      { label: 'mid = 4', values: ['5', '9', '12'], active: [1], settled: [0], note: '9 matches. Only two comparisons were needed.' },
    ] },
    code: `function search(nums: number[], target: number): number {
  let left = 0, right = nums.length - 1
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)
    if (nums[mid] === target) return mid
    if (nums[mid] < target) left = mid + 1
    else right = mid - 1
  }
  return -1
}`,
    pitfalls: ['Using left < right with inclusive boundaries and skipping the final candidate.', 'Returning on the first match when the first or last match is required.', 'Binary-searching an answer without proving predicate monotonicity.'],
    relatedTopics: ['Binary Search', 'Array'],
  },
  {
    slug: 'graph-traversal', title: 'BFS & DFS', category: 'Algorithmic Pattern', icon: 'mdi-routes', level: 'Intermediate', minutes: 16,
    summary: 'Choose exploration order based on whether depth, layers, paths, or shortest steps matter.',
    mentalModel: 'DFS follows one corridor until it ends, then backtracks. BFS sends a wave outward one distance layer at a time. Both can visit the same nodes in O(V + E); the right choice is determined by what the order of discovery means to the answer.',
    signals: ['You need reachability or component membership', 'The space consists of states and legal transitions', 'Shortest unweighted distance suggests layers', 'Path construction or subtree aggregation suggests depth'],
    problemTypes: ['Grid islands and flood fill', 'Shortest mutation or word ladder', 'Tree traversal and path enumeration', 'Cycle detection', 'Component counting'],
    avoidWhen: ['Edges have different weights and shortest distance is required', 'The state space is enormous without pruning', 'A topological or union-find formulation answers the question more directly'],
    complexity: [{ operation: 'Traversal', time: 'O(V + E)', space: 'O(V)', note: 'The frontier and visited set can both grow with vertices.' }],
    steps: ['Define a state and enumerate its legal neighbors.', 'Choose BFS for minimum unweighted steps; DFS for exhaustive paths or recursive structure.', 'Mark states before adding them to the frontier.', 'Store parent or distance metadata only when the output needs it.'],
    walkthrough: { title: 'Choose the frontier', input: 'start → {A, B}; A → C; B → D', frames: [
      { label: 'BFS queue', values: ['A', 'B', 'C', 'D'], active: [0, 1], note: 'A and B are processed before deeper nodes, preserving distance.' },
      { label: 'DFS stack', values: ['A', 'C', 'B', 'D'], active: [0, 1], note: 'One branch completes before the next begins, matching recursive path work.' },
    ] },
    code: `function shortestSteps(start: string, goal: string, next: (s: string) => string[]): number {
  const queue: Array<[string, number]> = [[start, 0]]
  const seen = new Set([start])
  for (let head = 0; head < queue.length; head++) {
    const [state, distance] = queue[head]
    if (state === goal) return distance
    for (const neighbor of next(state)) if (!seen.has(neighbor)) {
      seen.add(neighbor)
      queue.push([neighbor, distance + 1])
    }
  }
  return -1
}`,
    pitfalls: ['Using recursive DFS on a path deep enough to overflow the call stack.', 'Using BFS without a visited set and expanding the same state repeatedly.', 'Assuming DFS’s first discovered path is shortest.'],
    relatedTopics: ['Breadth-First Search', 'Depth-First Search', 'Graph'],
  },
  {
    slug: 'greedy', title: 'Greedy Algorithms', category: 'Algorithmic Pattern', icon: 'mdi-chart-timeline-variant-shimmer', level: 'Advanced', minutes: 17,
    summary: 'Commit to a locally best choice only when an exchange argument proves no optimal solution is lost.',
    mentalModel: 'Greedy is not “take what looks best.” It is “take a choice that some optimal solution can always be rearranged to include.” The implementation is often short; the proof is the algorithm. Look for a choice that leaves the most flexible future.',
    signals: ['A local decision permanently simplifies the remaining problem', 'Intervals can be sorted by a strategic endpoint', 'You can exchange an optimal solution’s first choice with yours', 'Only a compact best-so-far state matters'],
    problemTypes: ['Interval scheduling and merging', 'Jump reachability', 'Resource assignment', 'Minimum removals or maximum compatible choices', 'One-pass profit and prefix decisions'],
    avoidWhen: ['A locally attractive choice can block a better combination', 'Future value depends on multiple unresolved state dimensions', 'No exchange, cut, or staying-ahead argument is available'],
    complexity: [{ operation: 'Greedy scan', time: 'O(n)', space: 'O(1)', note: 'If sorting is required first, total time is usually O(n log n).' }],
    steps: ['Identify the decision that preserves maximum future freedom.', 'Sort if an ordering makes that decision safe.', 'State the invariant after each committed choice.', 'Prove safety with exchange, cut, or staying-ahead reasoning.'],
    walkthrough: { title: 'Maximum non-overlapping intervals', input: '[1,3], [2,4], [3,5]', frames: [
      { label: 'Choose earliest finish', values: ['[1,3]', '[2,4]', '[3,5]'], active: [0], note: '[1,3] leaves at least as much future room as any overlapping alternative.' },
      { label: 'Skip overlap', values: ['[2,4]'], settled: [0], note: '[2,4] starts before the current end, so it cannot join the solution.' },
      { label: 'Choose next', values: ['[1,3]', '[3,5]'], settled: [0, 1], note: 'Two intervals fit. Exchanging a later-finishing first choice cannot improve this.' },
    ] },
    code: `function maxCompatible(intervals: number[][]): number {
  intervals.sort((a, b) => a[1] - b[1])
  let count = 0, end = -Infinity
  for (const [start, finish] of intervals) {
    if (start >= end) {
      count++
      end = finish
    }
  }
  return count
}`,
    pitfalls: ['Calling a one-pass algorithm greedy without proving the choice.', 'Sorting by start time when earliest finish preserves more options.', 'Applying greedy to knapsack-like problems where combinations matter.'],
    relatedTopics: ['Greedy', 'Sorting', 'Intervals'],
  },
  {
    slug: 'dynamic-programming', title: 'Dynamic Programming', category: 'Algorithmic Pattern', icon: 'mdi-table-large', level: 'Advanced', minutes: 21,
    summary: 'Name the state that captures all relevant history, then reuse overlapping subproblem answers.',
    mentalModel: 'Dynamic programming is controlled forgetting. A state keeps exactly the history the future needs and discards everything else. The recurrence describes the final decision that leads into that state. Memoization evaluates states on demand; tabulation chooses an order where dependencies are already known.',
    signals: ['Brute force branches into repeated subproblems', 'The answer asks for a count, optimum, or feasibility over choices', 'A prefix/index plus a small amount of state determines the future', 'The problem has optimal substructure but greedy choices are unsafe'],
    problemTypes: ['Sequence and grid optimization', 'Knapsack and subset decisions', 'String alignment and edit distance', 'Counting paths or constructions', 'State-machine stock problems'],
    avoidWhen: ['Subproblems do not overlap', 'The state needs essentially the entire history', 'A greedy invariant or closed form solves the problem directly'],
    complexity: [{ operation: 'DP evaluation', time: 'states × transitions', space: 'number of stored states', note: 'Count reachable states first; then work per state.' }],
    steps: ['Write the state in plain language before writing an array.', 'Define what one answer value means—including index boundaries.', 'Derive the recurrence from the final choice.', 'Set base cases, evaluation order, and impossible-state values.', 'Look for dimensions that can be compressed after correctness is clear.'],
    walkthrough: { title: 'Climbing stairs', input: 'n = 5', frames: [
      { label: 'Base states', values: ['dp[0]=1', 'dp[1]=1'], settled: [0, 1], note: 'There is one way to stand before climbing and one way to reach step 1.' },
      { label: 'Transition', values: ['1', '1', '2', '3'], active: [3], note: 'Every path to i ends with a 1-step from i−1 or a 2-step from i−2.' },
      { label: 'Answer', values: ['dp[5] = 8'], settled: [0], note: 'Five recursive levels collapse into five reusable states.' },
    ] },
    code: `function climbStairs(n: number): number {
  let twoBack = 1, oneBack = 1
  for (let step = 2; step <= n; step++) {
    ;[twoBack, oneBack] = [oneBack, oneBack + twoBack]
  }
  return oneBack
}`,
    pitfalls: ['Choosing a state that omits information needed by future decisions.', 'Writing a recurrence before defining what dp[i] means.', 'Using exponential recursion without memoization.', 'Compressing space before verifying dependency order.'],
    relatedTopics: ['Dynamic Programming', 'Memoization', 'Tabulation'],
  },
  {
    slug: 'backtracking', title: 'Backtracking', category: 'Algorithmic Pattern', icon: 'mdi-source-branch', level: 'Advanced', minutes: 17,
    summary: 'Explore a decision tree while undoing choices and pruning branches that cannot produce valid answers.',
    mentalModel: 'Backtracking is depth-first search over choices. The current path is a whiteboard: make a choice, recurse, then erase it exactly once. Constraints are valuable because they let you stop exploring a branch before it reaches a complete candidate.',
    signals: ['The output asks for all combinations, permutations, or arrangements', 'Each position has a small set of choices', 'Partial candidates can be proven invalid', 'The search space is exponential but constraints are modest'],
    problemTypes: ['Subsets, permutations, and combinations', 'Sudoku and constraint placement', 'Word search and grid paths', 'Palindrome partitioning', 'Expression construction'],
    avoidWhen: ['Only an optimum is needed and DP can merge equivalent states', 'The branching space is huge with little pruning', 'A direct combinatorial formula answers the question'],
    complexity: [{ operation: 'Search tree', time: 'O(branching^depth)', space: 'O(depth)', note: 'Output storage and copying paths may add substantial cost.' }],
    steps: ['Define the partial candidate and the next choice position.', 'Check whether the candidate is complete.', 'Iterate legal choices and mutate state.', 'Recurse, then undo the exact mutation.', 'Prune as soon as a partial state cannot lead to a solution.'],
    walkthrough: { title: 'Subsets of [1, 2]', input: '[1, 2]', frames: [
      { label: 'Choose 1', values: ['[]', '[1]'], active: [1], note: 'Record the current path, then explore including the next value.' },
      { label: 'Choose 2', values: ['[1]', '[1,2]'], active: [1], note: 'At depth two, [1,2] is a complete branch.' },
      { label: 'Undo', values: ['[1]', '[]', '[2]'], settled: [0], note: 'Pop choices so sibling branches start with clean state.' },
    ] },
    code: `function subsets(nums: number[]): number[][] {
  const result: number[][] = [], path: number[] = []
  function visit(index: number) {
    if (index === nums.length) return void result.push([...path])
    visit(index + 1)
    path.push(nums[index])
    visit(index + 1)
    path.pop()
  }
  visit(0)
  return result
}`,
    pitfalls: ['Pushing the same mutable path reference into every result.', 'Forgetting to undo a choice after recursion.', 'Using backtracking for a problem that asks only for a count and has overlapping states.'],
    relatedTopics: ['Backtracking', 'Recursion', 'Depth-First Search'],
  },
]
