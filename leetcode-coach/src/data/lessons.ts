import { expandedLessonDeepDives } from './deepDives'

export interface LessonFrame {
  label: string
  values: string[]
  active?: number[]
  settled?: number[]
  note: string
}

export interface LessonDiagramNode {
  value: string
  role: 'root' | 'internal' | 'leaf'
  children?: LessonDiagramNode[]
}

export interface LessonDeepDive {
  title: string
  introduction: string[]
  facts: { value: string; label: string }[]
  diagram?: { caption: string; root: LessonDiagramNode }
  models?: {
    title: string
    description: string
    items: { label: string; value: string; tone?: 'primary' | 'secondary' | 'accent' }[]
    note?: string
  }[]
  vocabulary: { term: string; definition: string }[]
  representations: { title: string; bestFor: string; description: string; code: string }[]
  algorithms: {
    title: string
    label: string
    summary: string
    invariant?: string
    useWhen: string
    example: string[]
    code: string
    complexity: string
  }[]
}

export interface Lesson {
  slug: string
  title: string
  category: 'Data Structure' | 'Algorithmic Pattern'
  icon: string
  level: 'Foundation' | 'Intermediate' | 'Advanced'
  minutes: number
  summary: string
  mentalModel: string | string[]
  signals: string[]
  problemTypes: string[]
  avoidWhen: string[]
  complexity: { operation: string; time: string; space?: string; note: string }[]
  steps: string[]
  walkthrough: { title: string; input: string; frames: LessonFrame[] }
  code: string
  pitfalls: string[]
  relatedTopics: string[]
  deepDive?: LessonDeepDive
}

export const lessons: Lesson[] = [
  {
    slug: 'arrays-hash-maps', title: 'Arrays & Hash Maps', category: 'Data Structure', icon: 'mdi-grid', level: 'Foundation', minutes: 35,
    summary: 'Turn repeated searches into direct lookups and use indexes to reason about contiguous data.',
    mentalModel: [
      'An array is an ordered collection of elements addressed by integer indexes. Its index-based organization provides O(1) random access to an existing position, while inserting or deleting near the beginning or middle generally requires shifting elements and takes O(n) time.',
      'A hash map stores associations between unique keys and values. It applies a hash function to each key to select an internal bucket, providing O(1) average lookup, insertion, and deletion when collisions remain well controlled.',
      'Use an array when order, position, or contiguous traversal is central; use a hash map when the problem depends on keyed retrieval, membership, frequencies, or previously observed values. The structures are often combined by scanning an array in order while a map records information from the portion already processed.',
    ],
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
    slug: 'linked-lists', title: 'Linked Lists', category: 'Data Structure', icon: 'mdi-link-variant', level: 'Foundation', minutes: 30,
    summary: 'Model sequences through references when local rewiring matters more than random access.',
    mentalModel: [
      'A linked list is an ordered collection of nodes connected by references. Each node stores a value and, in a singly linked list, a reference to the next node; the head identifies the first node and null ordinarily marks the end.',
      'Linked lists do not provide constant-time indexed access because reaching a position requires following every preceding link, which takes O(n) time. Inserting or removing next to a node is O(1) once that node and any required predecessor are already known, because only a fixed number of references change.',
      'Use a linked list when the input is already node-based or when local insertion, removal, splitting, or reordering is more important than random access. Before overwriting a reference, preserve any link still needed to reach the unprocessed portion of the list.',
    ],
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
    slug: 'stacks-queues', title: 'Stacks & Queues', category: 'Data Structure', icon: 'mdi-tray-full', level: 'Foundation', minutes: 31,
    summary: 'Use access order—last-in-first-out or first-in-first-out—to encode unfinished work.',
    mentalModel: [
      'A stack and a queue are abstract data types that restrict the order in which stored elements are removed. A stack follows last in, first out (LIFO), while a queue follows first in, first out (FIFO).',
      'Stacks support push, pop, and peek at one end and are commonly used for nested scopes, undo operations, recursion, and monotonic processing. Queues add at the back and remove from the front, preserving arrival or discovery order for scheduling, buffering, and breadth-first traversal.',
      'Choose between them according to which pending item must be processed next. Use a stack when the most recently discovered work must be completed first; use a queue when work must be processed in the order it was discovered.',
    ],
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
    slug: 'trees', title: 'Trees & Binary Search Trees', category: 'Data Structure', icon: 'mdi-file-tree-outline', level: 'Intermediate', minutes: 32,
    summary: 'Learn how trees model hierarchy, how they live in memory, and how leaf detection, DFS, BFS, and BST search explore them.',
    deepDive: {
      title: 'Tree foundations',
      introduction: [
        'A tree is a connected graph with no cycles. Between any two nodes there is exactly one simple path. A tree with n nodes always has n - 1 edges. Those properties are what make it possible to explore a branch without worrying that it will loop back—unless the input is represented as an undirected adjacency list, where you still track the parent or a visited set.',
        'A rooted tree chooses one node as the root and gives every other node exactly one parent. That creates direction: away from the root toward children, and back toward ancestors. Trees are useful because many hierarchical problems become the same smaller problem applied recursively to each child subtree.',
        'A binary tree allows at most two children named left and right. A binary search tree (BST) adds an ordering invariant: every value in a node’s left subtree is smaller, and every value in its right subtree is larger under the usual distinct-key definition. A binary tree is not automatically a BST.',
        'Trees preserve relationships that a flat array would erase. File systems and the browser DOM model containment; syntax trees model expressions; tries model shared prefixes; balanced search trees support ordered lookup and range operations. The shape matters: hierarchy is available in any tree, but fast ordered search requires a maintained BST invariant and controlled height.',
      ],
      facts: [
        { value: 'n - 1', label: 'edges for n nodes' },
        { value: '1', label: 'unique path per pair' },
        { value: '≤ 2', label: 'children in a binary tree' },
        { value: 'O(h)', label: 'typical DFS stack' },
      ],
      diagram: {
        caption: 'A binary search tree rooted at 8. Green nodes are leaves: they have no children.',
        root: {
          value: '8', role: 'root', children: [
            { value: '3', role: 'internal', children: [
              { value: '1', role: 'leaf' },
              { value: '6', role: 'leaf' },
            ] },
            { value: '10', role: 'internal', children: [
              { value: '9', role: 'leaf' },
              { value: '14', role: 'leaf' },
            ] },
          ],
        },
      },
      vocabulary: [
        { term: 'Root', definition: 'The only node with no parent; the entry point for a rooted tree.' },
        { term: 'Edge', definition: 'A connection between two nodes. In a rooted tree it links a parent and child.' },
        { term: 'Parent / child', definition: 'Adjacent nodes one step closer to or farther from the root.' },
        { term: 'Sibling', definition: 'Nodes that share the same parent.' },
        { term: 'Leaf', definition: 'A node with no children. In a binary tree: left === null and right === null.' },
        { term: 'Internal node', definition: 'Any node with at least one child.' },
        { term: 'Ancestor', definition: 'A node on the path from the root to a given node; descendants reverse that relation.' },
        { term: 'Subtree', definition: 'A node together with every descendant below it. A subtree is itself a tree.' },
        { term: 'Depth', definition: 'Number of edges from the root to a node. The root has depth 0.' },
        { term: 'Height', definition: 'Longest downward path from a node to a leaf. State whether you count edges or nodes.' },
        { term: 'Width', definition: 'Number of nodes on one level. Maximum width controls peak BFS queue space.' },
        { term: 'Balanced', definition: 'Height stays proportional to log n. “Balanced” needs a precise invariant for the tree type.' },
      ],
      representations: [
        {
          title: 'Linked nodes',
          bestFor: 'Binary-tree LeetCode problems',
          description: 'Each object stores a value and references to its children. null marks a missing child. The shape lives in the references, not in indexes.',
          code: `class TreeNode {
  constructor(
    public val: number,
    public left: TreeNode | null = null,
    public right: TreeNode | null = null,
  ) {}
}`,
        },
        {
          title: 'Adjacency list',
          bestFor: 'General or undirected trees',
          description: 'Store every node’s neighbors. Because each edge appears in both directions, DFS/BFS must remember the parent or maintain a visited set.',
          code: `const neighbors = new Map<number, number[]>([
  [8, [3, 10]],
  [3, [8, 1, 6]],
  [10, [8, 9, 14]],
])`,
        },
        {
          title: 'Level-order array',
          bestFor: 'Input, output, and serialization',
          description: 'LeetCode writes trees breadth-first, using null for missing positions. The array is a transport format that is converted into linked nodes before your function runs.',
          code: `[8, 3, 10, 1, 6, 9, 14]

// Dense heap-style arrays can use:
// left(i)  = 2 * i + 1
// right(i) = 2 * i + 2`,
        },
      ],
      algorithms: [
        {
          title: 'Find every leaf',
          label: 'Base case recognition',
          summary: 'A leaf is detected locally: the node exists and has no left or right child. Once found, record it and stop descending that path. Do not confuse a node with one missing child for a leaf.',
          invariant: 'Every completed recursive call returns all and only the leaves in that node’s subtree, from left to right.',
          useWhen: 'Collecting boundaries, comparing leaf sequences, pruning, summing terminal paths, or defining recursion base cases.',
          example: ['Visit 8 → recurse', 'Visit 3 → recurse', '1 is a leaf → collect', '6 is a leaf → collect', '9 and 14 are leaves → collect', 'Result: [1, 6, 9, 14]'],
          code: `function collectLeaves(root: TreeNode | null): number[] {
  if (!root) return []
  if (!root.left && !root.right) return [root.val]
  return [
    ...collectLeaves(root.left),
    ...collectLeaves(root.right),
  ]
}`,
          complexity: 'O(n) time because each node is checked once; O(h) call-stack space, plus the output.',
        },
        {
          title: 'Depth-first search (DFS)',
          label: 'Go deep, then backtrack',
          summary: 'DFS completely explores one subtree before its sibling. Recursion uses the call stack implicitly; iterative DFS uses an explicit stack. The moment you process the root determines the traversal order.',
          invariant: 'On entry to dfs(node), the active call stack is the unique path from the root to node; when the call returns, that entire subtree has been processed.',
          useWhen: 'Subtree calculations, path questions, structural validation, backtracking, serialization, or when memory should scale with height rather than width.',
          example: ['Preorder · root, left, right → 8, 3, 1, 6, 10, 9, 14', 'Inorder · left, root, right → 1, 3, 6, 8, 9, 10, 14', 'Postorder · left, right, root → 1, 6, 3, 9, 14, 10, 8', 'Inorder is sorted only because this example is a BST.'],
          code: `function dfs(node: TreeNode | null): void {
  if (!node) return              // empty subtree
  visit(node)                    // preorder position
  dfs(node.left)
  // visit(node)                 // inorder position
  dfs(node.right)
  // visit(node)                 // postorder position
}`,
          complexity: 'O(n) time for a full traversal; O(h) stack space—O(log n) when balanced and O(n) when skewed.',
        },
        {
          title: 'Breadth-first search (BFS)',
          label: 'Explore one level at a time',
          summary: 'BFS uses a queue. The queue’s current length tells you exactly how many nodes belong to the next level. In an unweighted tree, the first time BFS reaches a node is through the minimum number of edges from the start.',
          invariant: 'At the start of each outer iteration, every unprocessed queue entry belongs to the same next level; children appended during that iteration belong to the following level.',
          useWhen: 'Level order, minimum depth, nearest target, right/left side views, per-level averages, or any prompt involving distance from the root.',
          example: ['Queue starts [8]', 'Level 0 → [8]; enqueue 3, 10', 'Level 1 → [3, 10]; enqueue 1, 6, 9, 14', 'Level 2 → [1, 6, 9, 14]', 'Result: [[8], [3, 10], [1, 6, 9, 14]]'],
          code: `function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return []
  const queue = [root]
  const levels: number[][] = []

  for (let front = 0; front < queue.length;) {
    const levelSize = queue.length - front
    const level: number[] = []
    for (let i = 0; i < levelSize; i++) {
      const node = queue[front++]
      level.push(node.val)
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }
    levels.push(level)
  }
  return levels
}`,
          complexity: 'O(n) time; O(w) auxiliary space where w is the tree’s maximum width (O(n) in the worst case).',
        },
        {
          title: 'Search a binary search tree',
          label: 'Use the ordering invariant',
          summary: 'Compare the target with the current value. Equality finishes; a smaller target can only be in the left subtree, and a larger target only in the right. This pruning is the feature a plain binary tree does not provide.',
          invariant: 'If the target exists, it remains inside the subtree rooted at node. Each comparison discards a subtree that cannot contain it under BST ordering.',
          useWhen: 'The prompt explicitly guarantees BST ordering and asks for search, insertion, bounds, successor/predecessor, or ordered statistics.',
          example: ['Find 9: start at 8', '9 > 8 → discard the entire left subtree', '9 < 10 → go left', '9 === 9 → found after three comparisons'],
          code: `function searchBST(root: TreeNode | null, target: number) {
  let node = root
  while (node) {
    if (node.val === target) return node
    node = target < node.val ? node.left : node.right
  }
  return null
}`,
          complexity: 'O(h) time and O(1) iterative space. That is O(log n) when balanced but O(n) for a skewed BST.',
        },
      ],
    },
    mentalModel: [
      'A rooted tree is a hierarchical collection of nodes connected by edges. One node is designated as the root, every other node has exactly one parent, and each node together with its descendants forms a subtree that is itself a tree.',
      'A binary tree permits at most two children per node. A binary search tree adds an ordering invariant: values in a node’s left subtree are smaller and values in its right subtree are larger under the usual distinct-key definition; an ordinary binary tree does not provide this guarantee.',
      'Tree algorithms usually process a node and recursively or iteratively combine information from its child subtrees. Use depth-first traversal for path and subtree computations, breadth-first traversal for level-based questions, and BST ordering only when the problem explicitly guarantees it.',
    ],
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
    slug: 'heaps', title: 'Heaps & Priority Queues', category: 'Data Structure', icon: 'mdi-triangle-outline', level: 'Intermediate', minutes: 32,
    summary: 'Continuously expose the most urgent item without fully sorting everything.',
    mentalModel: [
      'A binary heap is a complete binary tree that satisfies a local ordering property. In a min-heap, every parent is less than or equal to its children; in a max-heap, every parent is greater than or equal to its children.',
      'The root is therefore the global minimum or maximum, but the remaining elements are not fully sorted. Array-based heaps provide O(1) access to the root and O(log n) insertion or root removal by restoring heap order along one root-to-leaf path.',
      'Use a heap when an algorithm repeatedly needs the current highest- or lowest-priority item, such as top-k selection, scheduling, merging sorted inputs, or shortest-path processing. A heap is not appropriate for efficient arbitrary-value search or sorted iteration.',
    ],
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
    slug: 'graphs', title: 'Graphs', category: 'Data Structure', icon: 'mdi-graph-outline', level: 'Intermediate', minutes: 40,
    summary: 'Represent arbitrary relationships, then explore each reachable state without losing track of visits.',
    mentalModel: [
      'A graph is a collection of vertices connected by edges and is used to represent arbitrary relationships. Edges may be directed or undirected and may carry weights such as distance, cost, or time.',
      'Unlike a tree, a graph may contain cycles, multiple paths between vertices, and disconnected components. Adjacency lists store each vertex’s neighbors efficiently for sparse graphs, while adjacency matrices trade O(V²) space for constant-time edge lookup.',
      'Use graph algorithms when the problem describes networks, dependencies, routes, transformations, or connectivity. Traversals must track visited vertices or an equivalent state when cycles are possible, and the correct path algorithm depends on edge direction and weight.',
    ],
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
    slug: 'two-pointers', title: 'Two Pointers', category: 'Algorithmic Pattern', icon: 'mdi-arrow-split-vertical', level: 'Foundation', minutes: 30,
    summary: 'Exploit ordering or opposing constraints so one pointer movement eliminates many candidates.',
    mentalModel: [
      'Two pointers is a traversal technique that maintains two indexes or node references with distinct roles. The pointers may begin at opposite ends, move in the same direction as read and write positions, or advance at different speeds.',
      'Each movement must preserve an invariant and prove that discarded positions cannot be required by a future answer. Sorted order, monotonic behavior, or a finalized output partition commonly provides that proof and allows a quadratic comparison process to become linear.',
      'Use two pointers for sorted pair searches, in-place compaction, symmetric comparisons, linked-list distance, and contiguous boundary problems. Do not apply opposite-end elimination to unsorted data unless another property justifies the movement.',
    ],
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
    slug: 'sliding-window', title: 'Sliding Window', category: 'Algorithmic Pattern', icon: 'mdi-arrow-expand-horizontal', level: 'Intermediate', minutes: 32,
    summary: 'Maintain a contiguous candidate incrementally instead of recomputing every subarray or substring.',
    mentalModel: [
      'A sliding window represents one contiguous range of an array or string using left and right boundaries. The algorithm maintains state that describes exactly the elements currently inside that range, such as a sum, frequency map, or distinct-value count.',
      'A fixed-size window adds one entering element and removes one leaving element per step. A variable-size window expands the right boundary and advances the left boundary when necessary to restore a validity condition; each boundary ordinarily moves only forward, producing O(n) total movement.',
      'Use sliding windows for contiguous subarray or substring problems when window state can be updated incrementally and invalidity can be repaired monotonically. It does not directly apply to non-contiguous subsequences, and sum-based windows may be invalid when arbitrary negative values are present.',
    ],
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
    slug: 'binary-search', title: 'Binary Search', category: 'Algorithmic Pattern', icon: 'mdi-call-split', level: 'Intermediate', minutes: 33,
    summary: 'Search a monotonic decision boundary by discarding half of the remaining possibilities.',
    mentalModel: [
      'Binary search is an algorithm for locating a target or boundary in an ordered search space by comparing a midpoint and discarding one half of the remaining candidates after each iteration.',
      'Exact-value search normally requires a sorted, randomly accessible collection. Boundary and answer-space variants instead require a monotonic predicate whose result changes direction at most once, such as false values followed permanently by true values.',
      'Use binary search only after defining the candidate interval and the invariant for discarded values. A correct implementation reduces the search space to O(log n) midpoint checks, although each feasibility check may perform additional work.',
    ],
    signals: ['Input is sorted or the answer space is ordered', 'A feasibility predicate is monotonic', 'Constraints demand O(log n)', 'The problem asks for minimum possible maximum or maximum possible minimum'],
    problemTypes: ['Exact lookup and insertion position', 'First/last occurrence', 'Search in rotated arrays', 'Capacity and rate optimization', 'Square roots and numeric thresholds'],
    avoidWhen: ['The predicate is not monotonic', 'Computing feasibility is more expensive than direct solving', 'The search boundaries cannot be defined safely'],
    complexity: [{ operation: 'Binary search', time: 'O(log n)', space: 'O(1)', note: 'Each decision halves the candidate interval.' }],
    steps: ['Define inclusive or half-open boundaries and never mix conventions.', 'Write the monotonic predicate in one sentence.', 'Compute mid without overflowing.', 'On equality or feasibility, decide whether to return or keep searching for a boundary.'],
    walkthrough: { title: 'Find 9', input: '[-1, 0, 3, 5, 9, 12]', frames: [
      { label: 'mid index = 2 (value 3)', values: ['-1', '0', '3', '5', '9', '12'], active: [2], note: 'nums[2] = 3 < 9, so indices 0–2 cannot contain the target.' },
      { label: 'mid index = 4 (value 9)', values: ['5', '9', '12'], active: [1], settled: [0], note: 'nums[4] = 9 matches the target. Only two comparisons were needed.' },
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
    slug: 'graph-traversal', title: 'BFS & DFS', category: 'Algorithmic Pattern', icon: 'mdi-routes', level: 'Intermediate', minutes: 35,
    summary: 'Choose exploration order based on whether depth, layers, paths, or shortest steps matter.',
    mentalModel: [
      'Breadth-first search (BFS) and depth-first search (DFS) are graph-traversal algorithms that systematically visit reachable vertices. Both maintain a frontier of discovered work and track visited state to prevent repeated processing and cycles.',
      'BFS uses a FIFO queue and processes vertices in nondecreasing unweighted distance from the source, which makes first discovery a shortest-edge path. DFS uses recursion or a LIFO stack and completes one branch before returning to explore alternatives.',
      'Use BFS for minimum-edge distance, nearest-target, and level-order questions. Use DFS for components, path exploration, subtree-style aggregation, and entry/exit processing; with adjacency lists, both require O(V + E) time for a full traversal.',
    ],
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
    slug: 'greedy', title: 'Greedy Algorithms', category: 'Algorithmic Pattern', icon: 'mdi-chart-timeline-variant-shimmer', level: 'Advanced', minutes: 34,
    summary: 'Commit to a locally best choice only when an exchange argument proves no optimal solution is lost.',
    mentalModel: [
      'A greedy algorithm constructs a solution through a sequence of locally selected, irreversible choices. The choice rule is problem-specific and must preserve the existence of a globally optimal completion.',
      'Correctness requires a proof, commonly an exchange argument, staying-ahead argument, or cut property, showing that an optimal solution can include the greedy choice without becoming worse. A plausible local heuristic without this property is not a valid greedy algorithm.',
      'Use greedy methods when earlier alternatives can be summarized or safely discarded and the remaining problem retains the same structure. If locally optimal choices can block a better global combination, dynamic programming, search, or backtracking is required instead.',
    ],
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
    slug: 'dynamic-programming', title: 'Dynamic Programming', category: 'Algorithmic Pattern', icon: 'mdi-table-large', level: 'Advanced', minutes: 38,
    summary: 'Name the state that captures all relevant history, then reuse overlapping subproblem answers.',
    mentalModel: [
      'Dynamic programming solves a problem by defining reusable subproblems, expressing each subproblem in terms of smaller states, and storing results so equivalent states are not recomputed. It is applicable when subproblems overlap and valid solutions have optimal or compositional substructure.',
      'A state definition specifies exactly what one cached value means. Base cases solve the smallest states directly, and a recurrence enumerates the legal final decisions that lead into the current state; evaluation order must ensure every dependency is already available.',
      'Memoization evaluates recursive states on demand, while tabulation fills a table in dependency order. Use dynamic programming when many decision paths reach the same state; compress space only after identifying which earlier states future transitions still require.',
    ],
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
    slug: 'backtracking', title: 'Backtracking', category: 'Algorithmic Pattern', icon: 'mdi-source-branch', level: 'Advanced', minutes: 36,
    summary: 'Explore a decision tree while undoing choices and pruning branches that cannot produce valid answers.',
    mentalModel: [
      'Backtracking is depth-first search over a decision tree whose nodes represent partial candidates and whose edges represent choices. The active recursion path contains the decisions used to construct the current candidate.',
      'Each branch follows a choose, explore, and unchoose sequence: apply one legal choice, recurse into the resulting state, then restore every mutation before examining a sibling choice. Pruning ends a branch as soon as its partial state cannot produce an eligible solution.',
      'Use backtracking to enumerate combinations, permutations, placements, and constraint-satisfying paths when the search space is manageable or can be pruned. When different branches repeatedly reach an equivalent state and only a count or optimum is needed, dynamic programming may be more appropriate.',
    ],
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
].map((lesson) => ({
  ...lesson,
  deepDive: lesson.deepDive ?? expandedLessonDeepDives[lesson.slug],
}))
