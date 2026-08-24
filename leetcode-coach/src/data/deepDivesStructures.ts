import type { LessonDeepDive } from './lessons'

export const structureDeepDives: Record<string, LessonDeepDive> = {
  'arrays-hash-maps': {
    title: 'Arrays and hash maps from first principles',
    introduction: [
      'An array is an ordered sequence of elements. Every element has an integer position called an index, normally starting at 0. Indexing is fast because the runtime can locate the slot directly. Arrays preserve order, allow duplicates, and are the natural representation for contiguous input such as prices by day, characters in a string, or cells in a row.',
      'A low-level fixed array occupies one contiguous region of memory and has a fixed length. JavaScript and TypeScript use dynamic arrays: they still provide constant-time indexed access, but the runtime manages capacity and may occasionally allocate a larger backing store. Appending is O(1) amortized, while inserting or removing near the front or middle is O(n) because later elements must shift.',
      'A hash map is an associative data structure that stores key-value pairs. A hash function converts a key into a bucket location; collisions occur when different keys choose the same bucket and must be resolved. Lookup, insertion, and deletion are O(1) on average with a healthy hash distribution, but they are not mathematically guaranteed O(1) in the worst case.',
      'Use an array when position and order are central. Use a hash map when identity, membership, counts, or retrieving a value by key is central. Many optimal algorithms scan an array once while a map summarizes everything already seen. The map adds O(n) space to remove a repeated O(n) search.',
    ],
    facts: [
      { value: 'O(1)', label: 'array index access' },
      { value: 'O(n)', label: 'middle insert/delete' },
      { value: 'O(1) avg', label: 'hash lookup/insert' },
      { value: 'key → value', label: 'map relationship' },
    ],
    models: [
      {
        title: 'Array: ordered positions',
        description: 'The index answers “where?” and the element is the value stored there.',
        items: [
          { label: 'index 0', value: '12' }, { label: 'index 1', value: '7' },
          { label: 'index 2', value: '12', tone: 'accent' }, { label: 'index 3', value: '4' },
        ],
        note: 'Duplicates are allowed. Reading values[2] returns 12 without scanning indexes 0 and 1.',
      },
      {
        title: 'Hash map: named lookups',
        description: 'The key answers “which one?” and points to its associated value.',
        items: [
          { label: '"apple"', value: '3', tone: 'primary' },
          { label: '"pear"', value: '1' },
          { label: '"plum"', value: '2', tone: 'secondary' },
        ],
        note: 'Keys are unique. Setting "apple" again updates its value rather than adding a second apple key.',
      },
    ],
    vocabulary: [
      { term: 'Index', definition: 'The integer position of an array element. Valid indexes for length n are 0 through n - 1.' },
      { term: 'Element', definition: 'A value stored at one array index.' },
      { term: 'Contiguous', definition: 'Stored in adjacent logical slots, enabling direct index calculation and good cache locality.' },
      { term: 'Dynamic array', definition: 'An array abstraction that grows by allocating extra capacity and occasionally resizing.' },
      { term: 'Key / value', definition: 'A map key uniquely identifies the associated value.' },
      { term: 'Hash function', definition: 'Deterministically converts a key into a bucket location.' },
      { term: 'Collision', definition: 'Two distinct keys map to the same bucket. A correct map compares keys to resolve it.' },
      { term: 'Load factor', definition: 'Stored entries divided by bucket capacity. Maps resize to keep collisions controlled.' },
      { term: 'Set', definition: 'A hash-based collection of keys without separate values, used for membership and uniqueness.' },
      { term: 'Frequency map', definition: 'A map from each distinct value to the number of times it occurs.' },
      { term: 'Complement', definition: 'The value needed to complete a target, such as target - current in Two Sum.' },
      { term: 'Amortized', definition: 'A bound averaged across an operation sequence; rare resizes are spread across many cheap appends.' },
    ],
    representations: [
      {
        title: 'Indexed sequence', bestFor: 'Ordered data and position-based traversal',
        description: 'Use bracket indexing for direct reads and writes. A for loop makes the index explicit when the answer needs positions.',
        code: `const values = [12, 7, 12, 4]
const third = values[2]       // 12
values[1] = 9                // [12, 9, 12, 4]
values.push(5)               // amortized O(1)
values.splice(1, 0, 8)       // O(n): shifts later values`,
      },
      {
        title: 'Map and Set', bestFor: 'Keyed retrieval and membership',
        description: 'Map associates keys with values. Set answers whether a key exists. Prefer these over an array when a scan would be repeated.',
        code: `const counts = new Map<string, number>()
counts.set('apple', 3)
counts.set('apple', counts.get('apple')! + 1)

const seen = new Set<number>([4, 9])
seen.has(9)                  // true`,
      },
      {
        title: 'Fixed counting array', bestFor: 'Small, known integer or character domains',
        description: 'When keys are guaranteed to be in a compact range, an array can replace a map with lower overhead. The key itself becomes the index.',
        code: `// Lowercase English letters only
const frequency = Array(26).fill(0)
for (const char of word) {
  const index = char.charCodeAt(0) - 97
  frequency[index]++
}`,
      },
    ],
    algorithms: [
      {
        title: 'Build a frequency map', label: 'Summarize repeated values',
        summary: 'Scan once and store how many times each value has appeared. The map turns later questions such as “how many a characters?” from another O(n) scan into an average O(1) lookup.',
        invariant: 'Before processing position i, counts contains the exact frequencies in positions 0 through i - 1. After incrementing the current value, it is correct through i.',
        useWhen: 'Counting duplicates, comparing multisets, finding modes, grouping equal values, or replacing nested equality checks.',
        example: [
          'Input “banana”; start counts = {}.',
          'i = 0, char = b. b is absent, so write b → 1. counts = { b: 1 }.',
          'i = 1, char = a. Write a → 1. counts = { b: 1, a: 1 }.',
          'i = 2, char = n. Write n → 1. counts = { b: 1, a: 1, n: 1 }.',
          'i = 3, char = a. Read 1 and write 2. counts = { b: 1, a: 2, n: 1 }.',
          'i = 4, char = n. Read 1 and write 2. counts = { b: 1, a: 2, n: 2 }.',
          'i = 5, char = a. Read 2 and write 3. Final counts = { b: 1, a: 3, n: 2 }.',
        ],
        code: `function frequencies(values: string[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return counts
}`,
        complexity: 'O(n) expected time and O(k) space, where k is the number of distinct values and k ≤ n.',
      },
      {
        title: 'Two Sum with a one-pass map', label: 'Trade memory for lookup speed',
        summary: 'The brute-force solution tries every pair, requiring O(n²) time. Instead, at each index compute the one complement that would finish the target. A map of earlier value → index tells you whether that complement already exists. Check before inserting so an element cannot pair with itself.',
        invariant: 'At the start of iteration i, seen contains every value from indexes 0 through i - 1 and no value from i onward. Therefore a successful lookup always identifies a distinct earlier element.',
        useWhen: 'A pair must satisfy an equation, original indexes matter, input is unsorted, and expected O(n) time is worth O(n) extra space.',
        example: [
          'nums = [3, 2, 4, 7], target = 6. Start seen = {}.',
          'i = 0, current = 3, need = 6 - 3 = 3. seen has no 3. Insert 3 → 0.',
          'i = 1, current = 2, need = 6 - 2 = 4. seen has no 4. Insert 2 → 1.',
          'i = 2, current = 4, need = 6 - 4 = 2. seen contains 2 → 1.',
          'Return [1, 2]. nums[1] + nums[2] = 2 + 4 = 6. Index 3 is never visited because the answer is already proven.',
        ],
        code: `function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>()

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i]
    const earlierIndex = seen.get(complement)
    if (earlierIndex !== undefined) return [earlierIndex, i]
    seen.set(nums[i], i)
  }
  return []
}`,
        complexity: 'O(n) expected time because each element causes one lookup and one insertion; O(n) additional space in the worst case.',
      },
      {
        title: 'Count subarrays with prefix sums', label: 'Remember cumulative history',
        summary: 'Let prefix be the sum through the current index. A subarray sums to k when currentPrefix - earlierPrefix = k, so the needed earlier value is currentPrefix - k. A frequency map is necessary because the same prefix sum can occur multiple times.',
        invariant: 'Before adding the current prefix to frequency, frequency stores every prefix strictly before it. answer counts every valid subarray ending at or before the current position.',
        useWhen: 'The question asks about sums of contiguous ranges, values may be negative, and a sliding window cannot move monotonically.',
        example: [
          'nums = [1, 2, 1, 2], k = 3. Seed frequency with 0 → 1 so a prefix equal to 3 counts.',
          'Read 1: prefix = 1, need = -2. None found; answer = 0. Add prefix 1.',
          'Read 2: prefix = 3, need = 0. frequency[0] = 1; answer = 1 for subarray [1, 2]. Add prefix 3.',
          'Read 1: prefix = 4, need = 1. frequency[1] = 1; answer = 2 for subarray [2, 1]. Add prefix 4.',
          'Read 2: prefix = 6, need = 3. frequency[3] = 1; answer = 3 for subarray [1, 2] at the end.',
          'Return 3. The map counted start positions without enumerating every range.',
        ],
        code: `function subarraySum(nums: number[], k: number): number {
  const frequency = new Map<number, number>([[0, 1]])
  let prefix = 0, answer = 0

  for (const value of nums) {
    prefix += value
    answer += frequency.get(prefix - k) ?? 0
    frequency.set(prefix, (frequency.get(prefix) ?? 0) + 1)
  }
  return answer
}`,
        complexity: 'O(n) expected time and O(n) space. Unlike a positive-only sliding window, this remains correct when values are negative or zero.',
      },
    ],
  },

  'linked-lists': {
    title: 'Linked lists from first principles',
    introduction: [
      'A linked list is a sequence of nodes connected by references. Each node stores a value and a link to another node. The first node is the head; following next references eventually reaches null. Nodes do not need to occupy adjacent memory, so position i cannot be calculated directly—you must walk through the preceding i nodes.',
      'A singly linked node stores next. A doubly linked node stores next and previous, making removal and backward movement easier at the cost of another reference. A circular list connects the tail back to an earlier node instead of null. LeetCode usually supplies the head of a singly linked list.',
      'Linked lists are valuable when the input is already node-based or when you can modify a sequence by reconnecting known nodes. Inserting after a node is O(1), but finding that node is still O(n). This distinction prevents the misleading claim that arbitrary linked-list insertion is always constant time.',
    ],
    facts: [
      { value: 'O(n)', label: 'access by index' }, { value: 'O(1)', label: 'rewire known node' },
      { value: 'head', label: 'entry reference' }, { value: 'null', label: 'ordinary list terminator' },
    ],
    models: [
      {
        title: 'Singly linked list', description: 'Each node owns a value and one next reference.',
        items: [{ label: 'head', value: '7 →', tone: 'primary' }, { label: 'node', value: '4 →' }, { label: 'tail', value: '9 → null', tone: 'accent' }],
        note: 'The variable head points to node 7. The list order is defined by arrows, not by physical memory addresses.',
      },
      {
        title: 'Doubly linked list', description: 'Every node can move in either direction.',
        items: [{ label: 'head', value: '7 ⇄', tone: 'primary' }, { label: 'node', value: '4 ⇄' }, { label: 'tail', value: '9', tone: 'accent' }],
        note: 'With a direct node reference, both neighboring links can be repaired in O(1).',
      },
    ],
    vocabulary: [
      { term: 'Node', definition: 'An object containing a value and one or more references to other nodes.' },
      { term: 'Head', definition: 'Reference to the first node. An empty list has head === null.' },
      { term: 'Tail', definition: 'The final node in a non-circular list; its next reference is null.' },
      { term: 'Next', definition: 'Reference that defines the following node in a singly linked list.' },
      { term: 'Previous', definition: 'Backward reference used by a doubly linked list.' },
      { term: 'Dummy node', definition: 'A temporary node before the real head that removes special cases when the head may change.' },
      { term: 'Rewiring', definition: 'Changing references to reorder, insert, or remove nodes without copying their values.' },
      { term: 'Cycle', definition: 'A chain of next references that revisits a node, so traversal never reaches null.' },
      { term: 'Pointer', definition: 'Common interview shorthand for a variable holding a node reference.' },
      { term: 'In-place', definition: 'Reuses the existing nodes and only a constant number of extra references.' },
      { term: 'Sentinel', definition: 'Another name for a dummy node used to simplify boundary logic.' },
      { term: 'Identity', definition: 'Two node variables are equal only when they reference the same node object, not merely equal values.' },
    ],
    representations: [
      {
        title: 'Singly linked node', bestFor: 'Forward traversal and LeetCode list inputs',
        description: 'The runtime passes a TreeNode-like object graph, not an array. Reassigning a local variable does not change a link; assigning node.next does.',
        code: `class ListNode {
  constructor(
    public val: number,
    public next: ListNode | null = null,
  ) {}
}`,
      },
      {
        title: 'Doubly linked node', bestFor: 'Deques, LRU caches, and O(1) removal by node',
        description: 'Two links allow local removal without searching for the predecessor. Both sides must be updated to preserve the invariant.',
        code: `class DoublyNode {
  constructor(
    public val: number,
    public prev: DoublyNode | null = null,
    public next: DoublyNode | null = null,
  ) {}
}`,
      },
      {
        title: 'Dummy-head pattern', bestFor: 'Merging, deletion, and head-changing operations',
        description: 'A sentinel gives the first real node a predecessor, so every append or removal follows the same code path.',
        code: `const dummy = new ListNode(0)
let tail = dummy

// Attach real nodes to tail.next...

return dummy.next // actual head`,
      },
    ],
    algorithms: [
      {
        title: 'Reverse a singly linked list', label: 'Preserve, redirect, advance',
        summary: 'Every next link initially points forward. To reverse safely, preserve the old next node before overwriting current.next. Then move previous and current one node forward. Losing next before preserving it disconnects the unprocessed suffix.',
        invariant: 'previous is the head of a fully reversed prefix; current is the first untouched node; every node from current onward still has its original forward links.',
        useWhen: 'Reversing all or part of a list, reordering nodes, palindrome checks, or any transformation based on changing direction.',
        example: [
          'Input 1 → 2 → 3 → null. Initialize previous = null, current = node 1.',
          'Iteration 1: save next = node 2. Set 1.next = null. Move previous = 1 and current = 2. Reversed prefix: 1 → null.',
          'Iteration 2: save next = node 3. Set 2.next = 1. Move previous = 2 and current = 3. Reversed prefix: 2 → 1 → null.',
          'Iteration 3: save next = null. Set 3.next = 2. Move previous = 3 and current = null.',
          'The loop stops because no untouched node remains. Return previous, which is head of 3 → 2 → 1 → null.',
        ],
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
        complexity: 'O(n) time and O(1) auxiliary space. The nodes are reused; only three references are maintained.',
      },
      {
        title: 'Find the middle with slow and fast pointers', label: 'Convert distance into relative speed',
        summary: 'Move slow one edge and fast two edges per iteration. When fast reaches the end, slow has covered half the distance. With the loop condition shown, even-length lists return the second middle.',
        invariant: 'After k completed iterations, slow has moved k nodes and fast has moved 2k nodes from the head.',
        useWhen: 'Finding a middle, splitting a list for merge sort, locating kth-from-end variants, or building cycle-detection reasoning.',
        example: [
          'Input 1 → 2 → 3 → 4 → 5 → 6. Start slow = 1, fast = 1.',
          'Iteration 1: slow = 2; fast = 3.',
          'Iteration 2: slow = 3; fast = 5.',
          'Iteration 3: slow = 4; fast advances from 5 to null through node 6.',
          'fast is null, so stop. slow = 4, the second of the two middle nodes (3 and 4).',
        ],
        code: `function middleNode(head: ListNode | null): ListNode | null {
  let slow = head, fast = head
  while (fast && fast.next) {
    slow = slow!.next
    fast = fast.next.next
  }
  return slow
}`,
        complexity: 'O(n) time and O(1) space. fast performs at most n link traversals and slow at most n / 2.',
      },
      {
        title: 'Merge two sorted lists', label: 'Choose the smaller front node',
        summary: 'The smallest remaining output must be at the head of one input list. Attach that node to the result and advance only its source list. A dummy head keeps the first attachment identical to every later attachment.',
        invariant: 'tail ends a correctly sorted merged prefix, and a and b point to the first not-yet-used nodes of their original lists.',
        useWhen: 'Combining sorted node chains, merge sort, or problems where nodes—not copied values—must be reused.',
        example: [
          'a = 1 → 4 → 7 and b = 2 → 3 → 8. Result is initially empty after dummy.',
          'Compare 1 and 2: attach node 1; advance a to 4. Result: 1.',
          'Compare 4 and 2: attach node 2; advance b to 3. Result: 1 → 2.',
          'Compare 4 and 3: attach node 3; advance b to 8. Result: 1 → 2 → 3.',
          'Compare 4 and 8: attach 4. Then compare 7 and 8: attach 7. a becomes null.',
          'Attach the entire remainder b = 8 in one operation. Return dummy.next: 1 → 2 → 3 → 4 → 7 → 8.',
        ],
        code: `function merge(a: ListNode | null, b: ListNode | null) {
  const dummy = new ListNode(0)
  let tail = dummy

  while (a && b) {
    if (a.val <= b.val) {
      tail.next = a
      a = a.next
    } else {
      tail.next = b
      b = b.next
    }
    tail = tail.next
  }
  tail.next = a ?? b
  return dummy.next
}`,
        complexity: 'O(n + m) time because each node is attached once; O(1) auxiliary space because links are reused.',
      },
    ],
  },

  'stacks-queues': {
    title: 'Stacks, queues, and controlled processing order',
    introduction: [
      'A stack and a queue are abstract data types: they define which element may be removed next, not one mandatory memory layout. A stack is last in, first out (LIFO). push adds to the top and pop removes the newest item. A queue is first in, first out (FIFO). enqueue adds at the back and dequeue removes the oldest item at the front.',
      'The restricted removal order is the feature. A stack remembers unfinished work in reverse order, which matches nested scopes, recursion, undo, and “nearest previous” problems. A queue preserves arrival or discovery order, which matches scheduling, buffering, and breadth-first exploration.',
      'Both can be implemented with arrays or linked nodes. In JavaScript, push/pop at an array’s end are amortized O(1), but shift() moves every remaining element and is O(n). An array plus a front index implements an efficient queue; a deque or linked list is better when memory must be reclaimed continuously.',
    ],
    facts: [
      { value: 'LIFO', label: 'stack removal order' }, { value: 'FIFO', label: 'queue removal order' },
      { value: 'O(1)', label: 'ideal add/remove' }, { value: 'frontier', label: 'pending work' },
    ],
    models: [
      {
        title: 'Stack', description: 'New work enters and leaves at the same end.',
        items: [{ label: 'bottom', value: 'A' }, { label: 'middle', value: 'B' }, { label: 'top / next', value: 'C', tone: 'secondary' }],
        note: 'push(D) makes D the next item popped. Existing items wait underneath it.',
      },
      {
        title: 'Queue', description: 'New work enters at the back and leaves from the front.',
        items: [{ label: 'front / next', value: 'A', tone: 'primary' }, { label: 'waiting', value: 'B' }, { label: 'back', value: 'C', tone: 'accent' }],
        note: 'enqueue(D) places D behind C; dequeue still returns A.',
      },
    ],
    vocabulary: [
      { term: 'LIFO', definition: 'Last in, first out: the newest item is removed first.' },
      { term: 'FIFO', definition: 'First in, first out: the oldest item is removed first.' },
      { term: 'Push / pop', definition: 'Add to and remove from the top of a stack.' },
      { term: 'Peek', definition: 'Read the next removable item without removing it.' },
      { term: 'Enqueue / dequeue', definition: 'Add at the queue back and remove from its front.' },
      { term: 'Front / back', definition: 'The removal and insertion ends of a queue.' },
      { term: 'Deque', definition: 'Double-ended queue supporting insertion and removal at both ends.' },
      { term: 'Monotonic stack', definition: 'A stack kept entirely increasing or decreasing by removing elements that violate the order.' },
      { term: 'Frontier', definition: 'Discovered work waiting to be processed; a stack or queue chooses its order.' },
      { term: 'Call stack', definition: 'Runtime stack holding active function calls; recursion uses it implicitly.' },
      { term: 'Underflow', definition: 'Attempting to remove from an empty stack or queue.' },
      { term: 'Amortized O(1)', definition: 'Most operations are constant time; occasional array resizing is averaged across many operations.' },
    ],
    representations: [
      {
        title: 'Array-backed stack', bestFor: 'Most stack problems in TypeScript',
        description: 'The array end is the top. push and pop avoid shifting other elements.',
        code: `const stack: number[] = []
stack.push(10)
stack.push(20)
const top = stack.at(-1) // 20, still present
const next = stack.pop() // 20, removed`,
      },
      {
        title: 'Array plus front index', bestFor: 'Efficient one-pass queues',
        description: 'Append at the end and advance front instead of calling shift(). Compaction is optional for long-lived queues.',
        code: `const queue: number[] = []
let front = 0
queue.push(10)
queue.push(20)
const next = queue[front++] // 10
const empty = front === queue.length`,
      },
      {
        title: 'Linked deque', bestFor: 'Long-lived queues and operations at both ends',
        description: 'Head and tail references give true O(1) removal without retained array slots, but require more implementation and node memory.',
        code: `interface Deque<T> {
  pushFront(value: T): void
  pushBack(value: T): void
  popFront(): T | undefined
  popBack(): T | undefined
}`,
      },
    ],
    algorithms: [
      {
        title: 'Validate nested brackets with a stack', label: 'Match the most recent opener',
        summary: 'A closing bracket must match the unmatched opening bracket nearest to it. That is exactly the top of a stack. Push openers; for a closer, pop and compare. A mismatch or empty stack fails immediately, and leftover openers fail at the end.',
        invariant: 'After processing the first i characters, the stack contains exactly the unmatched opening brackets in their nesting order; the top is the only legal match for the next closer.',
        useWhen: 'Parsing nested delimiters, evaluating expressions, canonical paths, or any rule where the newest unfinished scope must finish first.',
        example: [
          'Input “([{}])”. Start stack = [].',
          'Read (: opener, push. stack = [(].',
          'Read [: opener, push. stack = [(, [].',
          'Read {: opener, push. stack = [(, [, {].',
          'Read }: expected opener is {. pop returns {, so continue. stack = [(, [].',
          'Read ]: pop returns [, which matches. stack = [(].',
          'Read ): pop returns (, which matches. stack = []. End with an empty stack, so return true.',
        ],
        code: `function isValid(text: string): boolean {
  const openerFor = new Map([[')', '('], [']', '['], ['}', '{']])
  const stack: string[] = []

  for (const char of text) {
    if (!openerFor.has(char)) stack.push(char)
    else if (stack.pop() !== openerFor.get(char)) return false
  }
  return stack.length === 0
}`,
        complexity: 'O(n) time and O(n) space in the worst case when every character is an opener.',
      },
      {
        title: 'Next greater element with a monotonic stack', label: 'Resolve waiting indexes once',
        summary: 'Store indexes whose next greater value has not been found, keeping their values in decreasing order. A new larger value resolves and pops every smaller value on top. Each index enters and leaves the stack at most once.',
        invariant: 'Stack indexes are unresolved and their values are monotonically non-increasing from bottom to top. No processed value to their right was greater.',
        useWhen: 'Nearest greater/smaller values, daily temperatures, histogram boundaries, stock span, or removing dominated candidates.',
        example: [
          'nums = [2, 1, 2, 4, 3]. answers start [-1, -1, -1, -1, -1], stack = [].',
          'i = 0, value 2: nothing waits. Push index 0. stack values = [2].',
          'i = 1, value 1: 1 is not greater than top 2. Push 1. stack values = [2, 1].',
          'i = 2, value 2: 2 > 1, so pop index 1 and set answer[1] = 2. Equal 2 does not resolve index 0. Push 2. stack values = [2, 2].',
          'i = 3, value 4: pop index 2 → answer[2] = 4; pop index 0 → answer[0] = 4. Push 3. stack values = [4].',
          'i = 4, value 3: it cannot resolve 4. Push 4. End. Indexes 3 and 4 keep -1 because no greater value appears to their right.',
          'Final answer = [4, 2, 4, -1, -1].',
        ],
        code: `function nextGreater(nums: number[]): number[] {
  const answer = Array(nums.length).fill(-1)
  const stack: number[] = []

  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[stack.at(-1)!] < nums[i]) {
      answer[stack.pop()!] = nums[i]
    }
    stack.push(i)
  }
  return answer
}`,
        complexity: 'O(n) time, not O(n²): every index is pushed once and popped at most once. Space is O(n).',
      },
      {
        title: 'Fixed-size moving average with a queue', label: 'Expire the oldest item',
        summary: 'Keep only the latest k values and a running sum. Add each new value; if the window exceeds k, remove the oldest queue value and subtract it. The sum is updated incrementally instead of recomputed.',
        invariant: 'After processing a stream value, the active queue contains exactly the most recent min(k, count) values and sum equals their total.',
        useWhen: 'Streaming windows, rate limiting, buffering, task order, or any process where the oldest item expires first.',
        example: [
          'k = 3, stream = [1, 10, 3, 5]. Start queue = [], sum = 0.',
          'Read 1: enqueue; queue = [1], sum = 1, average = 1 / 1 = 1.',
          'Read 10: queue = [1, 10], sum = 11, average = 11 / 2 = 5.5.',
          'Read 3: queue = [1, 10, 3], sum = 14, average = 14 / 3 ≈ 4.67.',
          'Read 5: enqueue gives four values, so expire oldest 1. Active queue = [10, 3, 5], sum = 18, average = 6.',
        ],
        code: `function movingAverages(values: number[], k: number): number[] {
  const queue: number[] = [], answer: number[] = []
  let front = 0, sum = 0

  for (const value of values) {
    queue.push(value)
    sum += value
    if (queue.length - front > k) sum -= queue[front++]
    answer.push(sum / (queue.length - front))
  }
  return answer
}`,
        complexity: 'O(n) time and O(k) active-window space. The backing array may retain processed slots; a deque avoids that for long streams.',
      },
    ],
  },

  'heaps': {
    title: 'Heaps and priority queues from first principles',
    introduction: [
      'A heap is a complete binary tree with a local ordering rule. Complete means every level is full except possibly the last, and the last level fills from left to right. In a min-heap, every parent is less than or equal to its children; in a max-heap, every parent is greater than or equal to its children.',
      'Heap order is weaker than sorted order. In a min-heap only the root is guaranteed to be globally smallest. The left child need not be smaller than the right child, and searching for an arbitrary value is still O(n). This is why a heap is not a binary search tree.',
      'A priority queue is the behavior exposed to callers: insert an item and remove the item with highest priority. A binary heap is the most common implementation. Completeness keeps height O(log n), and an array stores the tree compactly using index formulas rather than node references.',
      'Use a heap when the next minimum or maximum changes as data arrives: top-k elements, scheduling, merging sorted streams, shortest paths, and repeated “best remaining candidate” problems. If data is sorted once and never updated, sorting may be simpler.',
    ],
    facts: [
      { value: 'O(1)', label: 'peek root' }, { value: 'O(log n)', label: 'push or pop' },
      { value: 'O(n)', label: 'bottom-up heapify' }, { value: 'complete', label: 'binary-tree shape' },
    ],
    models: [
      {
        title: 'Min-heap as a tree', description: 'Every parent is no larger than either child; siblings have no required order.',
        items: [{ label: 'root', value: '2', tone: 'primary' }, { label: 'children', value: '5 · 3' }, { label: 'next level', value: '10 · 7 · 9 · 8' }],
        note: '2 is guaranteed minimum. The sequence 5, 3, 10, 7, 9, 8 is not globally sorted.',
      },
      {
        title: 'The same heap in an array', description: 'Level order removes the need for explicit child references.',
        items: [{ label: 'i 0', value: '2', tone: 'primary' }, { label: 'i 1', value: '5' }, { label: 'i 2', value: '3' }, { label: 'i 3', value: '10' }, { label: 'i 4', value: '7' }, { label: 'i 5', value: '9' }, { label: 'i 6', value: '8' }],
        note: 'For index i: parent = floor((i - 1) / 2), left = 2i + 1, right = 2i + 2.',
      },
    ],
    vocabulary: [
      { term: 'Complete binary tree', definition: 'All levels except possibly the last are full; the last fills left to right.' },
      { term: 'Heap property', definition: 'Each parent is ordered relative to its children. It says nothing about cousins or siblings.' },
      { term: 'Min-heap', definition: 'Parent ≤ children, making the root the global minimum.' },
      { term: 'Max-heap', definition: 'Parent ≥ children, making the root the global maximum.' },
      { term: 'Priority queue', definition: 'An interface that removes the highest-priority item rather than the oldest item.' },
      { term: 'Peek', definition: 'Read the root priority without removing it, normally O(1).' },
      { term: 'Sift up', definition: 'Swap a newly appended value with parents until heap order is restored.' },
      { term: 'Sift down', definition: 'Swap a displaced root with its better child until heap order is restored.' },
      { term: 'Heapify', definition: 'Transform an arbitrary array into a heap, optimally in O(n) bottom-up time.' },
      { term: 'Comparator', definition: 'Function defining which item has higher priority, especially for objects or tuples.' },
      { term: 'Top k', definition: 'Maintain only the k most relevant elements, often using a heap whose root is the eviction candidate.' },
      { term: 'Lazy deletion', definition: 'Leave stale entries in a heap and discard them when they reach the root.' },
    ],
    representations: [
      {
        title: 'Implicit array tree', bestFor: 'Compact binary-heap storage',
        description: 'Completeness guarantees there are no interior gaps, so arithmetic finds relatives without pointers.',
        code: `const parent = (i: number) => Math.floor((i - 1) / 2)
const left = (i: number) => 2 * i + 1
const right = (i: number) => 2 * i + 2

// heap = [2, 5, 3, 10, 7, 9, 8]`,
      },
      {
        title: 'Priority queue entries', bestFor: 'Scheduling and graph algorithms',
        description: 'Store both priority and payload. The comparator must use priority; a stable tie-breaker is added only when the problem requires one.',
        code: `interface Entry<T> {
  priority: number
  value: T
}

// { priority: 3, value: 'download report' }`,
      },
      {
        title: 'Bounded heap', bestFor: 'Top-k streaming problems',
        description: 'A size-k min-heap retains the k largest items. The root is the smallest retained item and therefore the next one to evict.',
        code: `for (const value of stream) {
  pushMin(heap, value)
  if (heap.length > k) popMin(heap)
}
// heap[0] is the kth largest`,
      },
    ],
    algorithms: [
      {
        title: 'Insert with sift up', label: 'Repair one ancestor path',
        summary: 'Append at the next open array slot to preserve completeness. Only the new node can violate heap order. Compare it with its parent and swap while it has higher priority. No other branch can have changed.',
        invariant: 'Before each comparison, every heap edge except possibly the edge between index i and its parent satisfies min-heap order.',
        useWhen: 'Implementing priority-queue insertion or understanding why heap insertion is logarithmic.',
        example: [
          'Start min-heap [3, 5, 8, 10, 7, 9]. Insert value 2.',
          'Append 2 at index 6 to preserve complete shape: [3, 5, 8, 10, 7, 9, 2].',
          'i = 6; parent = floor((6 - 1) / 2) = 2, value 8. Since 2 < 8, swap indexes 6 and 2.',
          'Heap is [3, 5, 2, 10, 7, 9, 8]. Set i = 2; parent = 0, value 3.',
          'Since 2 < 3, swap indexes 2 and 0: [2, 5, 3, 10, 7, 9, 8].',
          'i = 0 has no parent. The heap property is restored everywhere.',
        ],
        code: `function pushMin(heap: number[], value: number): void {
  heap.push(value)
  let i = heap.length - 1

  while (i > 0) {
    const p = Math.floor((i - 1) / 2)
    if (heap[p] <= heap[i]) break
    ;[heap[p], heap[i]] = [heap[i], heap[p]]
    i = p
  }
}`,
        complexity: 'O(log n) worst-case time because the node moves through at most the heap height; O(1) auxiliary space.',
      },
      {
        title: 'Remove the minimum with sift down', label: 'Replace root, then repair downward',
        summary: 'Save the root answer. Move the last element to the root and remove the last slot, preserving completeness. The replacement may violate order with its children, so repeatedly swap with the smaller child.',
        invariant: 'Before each swap, both child subtrees are valid heaps and only the current node may violate order with one of its children.',
        useWhen: 'Taking the next priority item, heap sort, or understanding the core operation behind Dijkstra and k-way merge.',
        example: [
          'Start [2, 5, 3, 10, 7, 9, 8]. Save minimum = 2.',
          'Remove last value 8 and place it at root: [8, 5, 3, 10, 7, 9]. Shape remains complete.',
          'At index 0, children are 5 (index 1) and 3 (index 2). Choose smaller child 3.',
          '8 > 3, so swap: [3, 5, 8, 10, 7, 9]. Current index becomes 2.',
          'Index 2 has child 9 at index 5. Since 8 ≤ 9, stop. Return saved value 2.',
        ],
        code: `function popMin(heap: number[]): number | undefined {
  if (!heap.length) return undefined
  const minimum = heap[0]
  const last = heap.pop()!
  if (!heap.length) return minimum
  heap[0] = last

  let i = 0
  while (true) {
    const left = 2 * i + 1, right = left + 1
    let smallest = i
    if (left < heap.length && heap[left] < heap[smallest]) smallest = left
    if (right < heap.length && heap[right] < heap[smallest]) smallest = right
    if (smallest === i) break
    ;[heap[i], heap[smallest]] = [heap[smallest], heap[i]]
    i = smallest
  }
  return minimum
}`,
        complexity: 'O(log n) worst-case time and O(1) auxiliary space. Reading without removing the root would be O(1).',
      },
      {
        title: 'Find the kth largest with a bounded min-heap', label: 'Keep only candidates that can still win',
        summary: 'Maintain the k largest values seen so far in a min-heap. If size exceeds k, remove its minimum—the least useful retained candidate. At the end, exactly k values remain and the smallest among them is kth largest overall.',
        invariant: 'After processing i values, heap contains the min(k, i) largest values from that prefix; heap[0] is the smallest retained value.',
        useWhen: 'Top-k or kth-order statistics on a stream, especially when n is large and k is much smaller than n.',
        example: [
          'nums = [3, 2, 1, 5, 6, 4], k = 2. Start heap = [].',
          'Read 3 → heap [3]. Read 2 → heap [2, 3]. Both are retained because size = k.',
          'Read 1 → push gives [1, 3, 2]; size 3, so pop minimum 1. Retained values are {2, 3}.',
          'Read 5 → retain then evict 2. Retained values are {3, 5}.',
          'Read 6 → evict 3. Retained values are {5, 6}.',
          'Read 4 → temporary {4, 5, 6}; evict 4. Final retained {5, 6}; heap minimum 5 is the 2nd largest.',
        ],
        code: `function findKthLargest(nums: number[], k: number): number {
  const heap: number[] = []
  for (const value of nums) {
    pushMin(heap, value)
    if (heap.length > k) popMin(heap)
  }
  return heap[0]
}`,
        complexity: 'O(n log k) time and O(k) space. Sorting all values would take O(n log n) time and O(n) or implementation-dependent space.',
      },
    ],
  },

  'graphs': {
    title: 'Graphs from first principles',
    introduction: [
      'A graph models entities and arbitrary relationships. Entities are vertices (nodes); relationships are edges. Unlike a tree, a graph may have cycles, multiple paths between two vertices, disconnected regions, and many-to-many relationships. A tree is the special case of a connected, undirected, acyclic graph.',
      'Edges may be directed or undirected. A directed edge u → v permits movement from u to v but not necessarily back. An undirected edge {u, v} permits both directions. Weighted graphs attach a cost, distance, or time to an edge; unweighted graphs treat every edge as one step.',
      'Graph algorithms are usually described with V vertices and E edges. In sparse graphs E is much smaller than V², so adjacency lists are compact and let traversal inspect only real edges. An adjacency matrix uses V² space but answers “is u connected directly to v?” in O(1).',
      'Before choosing an algorithm, identify direction, weights, possible cycles, connectivity, and what “best path” means. BFS finds fewest-edge paths in unweighted graphs; Dijkstra handles nonnegative weights; topological order only exists for directed acyclic graphs.',
    ],
    facts: [
      { value: 'V', label: 'vertices / entities' }, { value: 'E', label: 'edges / relationships' },
      { value: 'O(V + E)', label: 'full list traversal' }, { value: 'V²', label: 'matrix storage' },
    ],
    models: [
      {
        title: 'Undirected graph', description: 'Friendship-like edges work in both directions.',
        items: [{ label: 'A', value: 'B · C', tone: 'primary' }, { label: 'B', value: 'A · D' }, { label: 'C', value: 'A · D' }, { label: 'D', value: 'B · C', tone: 'accent' }],
        note: 'Every undirected edge is stored twice in an adjacency list: once at each endpoint.',
      },
      {
        title: 'Directed weighted graph', description: 'Each arrow has one direction and may carry a cost.',
        items: [{ label: 'A', value: 'B(4) · C(1)', tone: 'primary' }, { label: 'C', value: 'B(2) · D(5)' }, { label: 'B', value: 'D(1)' }, { label: 'D', value: '—', tone: 'accent' }],
        note: 'A → B with cost 4 does not imply B → A exists or has the same cost.',
      },
    ],
    vocabulary: [
      { term: 'Vertex', definition: 'An entity in a graph; also called a node.' },
      { term: 'Edge', definition: 'A relationship connecting two vertices, optionally directed or weighted.' },
      { term: 'Directed', definition: 'Edges have an orientation u → v; reverse movement needs a separate edge.' },
      { term: 'Undirected', definition: 'An edge connects both ways and is normally stored in both adjacency lists.' },
      { term: 'Weighted', definition: 'Every edge carries a numeric cost such as distance, price, or time.' },
      { term: 'Degree', definition: 'Number of incident edges; directed graphs distinguish in-degree and out-degree.' },
      { term: 'Path', definition: 'A sequence of adjacent vertices. Path cost is the sum of edge weights.' },
      { term: 'Cycle', definition: 'A path that returns to an already visited vertex.' },
      { term: 'Connected component', definition: 'A maximal group where vertices are mutually reachable in an undirected graph.' },
      { term: 'DAG', definition: 'Directed acyclic graph; prerequisite and dependency graphs often have this form.' },
      { term: 'Adjacency', definition: 'Direct neighborhood relationship between vertices.' },
      { term: 'Relaxation', definition: 'Improve a best-known path to v using a path through u.' },
    ],
    representations: [
      {
        title: 'Edge list', bestFor: 'Raw input and algorithms that sort edges',
        description: 'Each record names endpoints and optional weight. It is compact but finding all neighbors of one vertex requires scanning every edge.',
        code: `type Edge = [from: number, to: number, weight: number]
const edges: Edge[] = [
  [0, 1, 4],
  [0, 2, 1],
  [2, 1, 2],
]`,
      },
      {
        title: 'Adjacency list', bestFor: 'Sparse graphs and traversal',
        description: 'Each vertex stores only outgoing neighbors. Space is O(V + E), and processing u inspects exactly its edges.',
        code: `type Neighbor = { to: number; weight: number }
const graph: Neighbor[][] = [
  [{ to: 1, weight: 4 }, { to: 2, weight: 1 }],
  [{ to: 3, weight: 1 }],
  [{ to: 1, weight: 2 }, { to: 3, weight: 5 }],
  [],
]`,
      },
      {
        title: 'Adjacency matrix', bestFor: 'Dense graphs and constant-time edge queries',
        description: 'matrix[u][v] stores whether or with what weight u connects to v. Iterating neighbors costs O(V), even when few edges exist.',
        code: `const matrix = [
  [0, 1, 1, 0],
  [1, 0, 0, 1],
  [1, 0, 0, 1],
  [0, 1, 1, 0],
]`,
      },
    ],
    algorithms: [
      {
        title: 'Build an undirected adjacency list', label: 'Normalize edge input',
        summary: 'Create an empty neighbor list for every vertex. For each undirected edge [u, v], append v to u and u to v. Forgetting the second insertion silently changes the graph into a directed one.',
        invariant: 'After processing the first i edges, the adjacency list represents exactly those i edges in both directions and no others.',
        useWhen: 'Input arrives as edges but later work needs repeated neighbor traversal.',
        example: [
          'vertices = 4, edges = [[0,1], [0,2], [1,3], [2,3]]. Start [[], [], [], []].',
          'Read [0,1]: add 1 to graph[0] and 0 to graph[1] → [[1], [0], [], []].',
          'Read [0,2] → [[1,2], [0], [0], []].',
          'Read [1,3] → [[1,2], [0,3], [0], [1]].',
          'Read [2,3] → [[1,2], [0,3], [0,3], [1,2]]. Every edge appears exactly twice.',
        ],
        code: `function buildUndirected(n: number, edges: number[][]): number[][] {
  const graph = Array.from({ length: n }, () => [] as number[])
  for (const [u, v] of edges) {
    graph[u].push(v)
    graph[v].push(u)
  }
  return graph
}`,
        complexity: 'O(V + E) time including allocation and O(V + E) space; the 2E neighbor entries are still O(E).',
      },
      {
        title: 'Count connected components', label: 'Start one traversal per unseen region',
        summary: 'Scan all vertices. When a vertex is unvisited, it cannot belong to an earlier component, so start DFS and mark everything reachable from it. Increment the component count once per traversal start—not once per vertex.',
        invariant: 'Before checking vertex start, every visited vertex belongs to one of count fully explored components; no edge can connect those components to an unvisited vertex.',
        useWhen: 'Counting islands, friend groups, network clusters, or determining whether an undirected graph is connected.',
        example: [
          'Graph has edges 0—1, 1—2, and 3—4. Start visited = {}, count = 0.',
          'start = 0 is unseen: count = 1. DFS visits 0, then 1, then 2. visited = {0,1,2}.',
          'start = 1 and 2 are already visited, so neither starts a new component.',
          'start = 3 is unseen: count = 2. DFS visits 3 and 4. visited = {0,1,2,3,4}.',
          'start = 4 is visited. Scan ends; return 2 components.',
        ],
        code: `function countComponents(graph: number[][]): number {
  const visited = new Set<number>()
  let count = 0

  function dfs(node: number) {
    if (visited.has(node)) return
    visited.add(node)
    for (const neighbor of graph[node]) dfs(neighbor)
  }

  for (let node = 0; node < graph.length; node++) {
    if (!visited.has(node)) {
      count++
      dfs(node)
    }
  }
  return count
}`,
        complexity: 'O(V + E) time and O(V) visited/call-stack space. Every vertex is marked once and each adjacency entry is inspected once.',
      },
      {
        title: 'Topological sort with in-degrees', label: 'Release prerequisites in dependency order',
        summary: 'In a directed graph, in-degree counts unfinished prerequisites. Queue every zero-in-degree vertex. Removing one from the graph decrements its outgoing neighbors; a neighbor enters the queue exactly when all prerequisites are gone. If fewer than V vertices are emitted, a cycle blocks the rest.',
        invariant: 'The queue contains exactly currently unprocessed vertices with zero remaining in-degree; output order never places a vertex before an incoming prerequisite.',
        useWhen: 'Course scheduling, build order, dependency resolution, and ordering constraints on a directed acyclic graph.',
        example: [
          'Edges 0→1, 0→2, 1→3, 2→3. Initial in-degree = [0,1,1,2], queue = [0].',
          'Remove 0 → output [0]. Decrement 1 and 2 to zero; enqueue both. queue = [1,2].',
          'Remove 1 → output [0,1]. Decrement in-degree[3] from 2 to 1; it is not ready.',
          'Remove 2 → output [0,1,2]. Decrement in-degree[3] from 1 to 0; enqueue 3.',
          'Remove 3 → output [0,1,2,3]. Output length equals V, so no cycle exists.',
        ],
        code: `function topologicalOrder(graph: number[][]): number[] {
  const indegree = Array(graph.length).fill(0)
  for (const neighbors of graph) for (const v of neighbors) indegree[v]++

  const queue: number[] = [], order: number[] = []
  let front = 0
  for (let v = 0; v < graph.length; v++) if (indegree[v] === 0) queue.push(v)

  while (front < queue.length) {
    const u = queue[front++]
    order.push(u)
    for (const v of graph[u]) if (--indegree[v] === 0) queue.push(v)
  }
  return order.length === graph.length ? order : []
}`,
        complexity: 'O(V + E) time and O(V) additional space. Each vertex queues once and each directed edge decrements once.',
      },
      {
        title: 'Dijkstra shortest paths', label: 'Finalize the nearest unsettled vertex',
        summary: 'Maintain best-known distances from the source and a min-priority queue of candidates. Pop the smallest candidate; stale larger entries are skipped. Relax each outgoing edge by asking whether reaching v through u is cheaper. Nonnegative weights guarantee a popped best distance cannot later improve.',
        invariant: 'Every settled vertex has its true shortest distance. The queue contains candidate paths to unsettled vertices, ordered by total distance from the source.',
        useWhen: 'Single-source shortest paths with nonnegative edge weights. Use BFS instead when all edges have equal weight; do not use Dijkstra with negative edges.',
        example: [
          'Edges: A→B 4, A→C 1, C→B 2, B→D 1, C→D 5. Start dist(A)=0; all others infinity.',
          'Pop A at 0. Relax A→B: dist(B)=4. Relax A→C: dist(C)=1. Queue candidates C:1, B:4.',
          'Pop C at 1. Through C, B costs 1+2=3, improving 4→3. D costs 1+5=6. Queue B:3, B:4(stale), D:6.',
          'Pop B at 3. Through B, D costs 3+1=4, improving 6→4. Queue B:4(stale), D:4, D:6(stale).',
          'Skip stale B:4 because current dist(B)=3. Pop D:4; it is final. Skip stale D:6.',
          'Final distances: A=0, C=1, B=3, D=4. Shortest A→D path is A→C→B→D.',
        ],
        code: `type WeightedEdge = { to: number; weight: number }
type MinQueue = {
  push(item: [distance: number, node: number]): void
  pop(): [number, number] | undefined
}

function dijkstra(graph: WeightedEdge[][], start: number, queue: MinQueue) {
  const distance = Array(graph.length).fill(Infinity)
  distance[start] = 0
  queue.push([0, start])

  while (true) {
    const item = queue.pop()
    if (!item) break
    const [cost, node] = item
    if (cost !== distance[node]) continue

    for (const edge of graph[node]) {
      const candidate = cost + edge.weight
      if (candidate < distance[edge.to]) {
        distance[edge.to] = candidate
        queue.push([candidate, edge.to])
      }
    }
  }
  return distance
}`,
        complexity: 'With adjacency lists and a binary min-heap: O((V + E) log V) time and O(V + E) graph/queue space. Requires nonnegative weights.',
      },
    ],
  },
}
