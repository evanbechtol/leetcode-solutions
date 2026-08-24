import type { PatternId, PatternProfile } from './patterns'

export interface ProblemTeachingFact {
  pattern: PatternId
  verified: true
  time?: { value: string; reason: string }
  space?: { value: string; reason: string }
  teaching?: Partial<Pick<PatternProfile, 'recognition' | 'state' | 'invariant' | 'transition' | 'correctness' | 'bottleneck' | 'edgeCase' | 'tradeoff'>>
}

export const DEEP_PROBLEM_IDS = new Set([
  1, 3, 19, 20, 23, 28, 37, 42, 53, 62, 72, 76, 94, 102, 121, 124, 127, 139, 141,
  149, 207, 215, 218, 239, 253, 332, 347, 684, 704, 743,
])

// Each id is deliberately assigned to the solution strategy taught by the static coach.
// Groups reduce duplication while keeping coverage reviewable as a single authoritative registry.
const assignments: Array<[PatternId, number[]]> = [
  ['hashing', [1, 36, 41, 49, 128, 149]],
  ['binary-search', [4, 33, 34, 35, 378, 658, 704]],
  ['two-pointers-opposite', [11, 15, 16, 18, 42]],
  ['two-pointers-same', [26, 27]],
  ['simulation', [6, 8, 12, 13, 31, 38, 43, 65]],
  ['backtracking', [17, 22, 37, 39, 40, 46, 140]],
  ['sliding-window-variable', [3, 76]],
  ['sliding-window-fixed', [30]],
  ['string-matching', [28]],
  ['string-processing', [14, 58]],
  ['stack', [20, 32]],
  ['matrix', [73]],
  ['linked-list', [2, 19, 21, 24, 25, 61, 82, 83, 86, 92, 143, 147, 160, 203, 206]],
  ['fast-slow', [141]],
  ['heap', [23, 264, 358, 373, 407, 480]],
  ['sorting', [148, 506]],
  ['tree-dfs', [94, 98, 99, 100, 101, 104, 105, 106, 108, 109, 110, 112, 113, 114, 124, 272]],
  ['bfs', [102, 103, 107, 111, 127, 310]],
  ['dp-1d', [53, 70, 91, 96, 139]],
  ['dp-grid', [62, 63, 64, 329]],
  ['dp-dual', [10, 44, 72, 97, 115]],
  ['dp-general', [5, 87]],
  ['greedy', [45, 55, 121, 420, 621]],
  ['graph-dfs', [323, 399, 547, 785, 797, 841]],
  ['topological-sort', [207, 210, 269, 444, 802]],
  ['eulerian-circuit', [332]],
  ['dijkstra', [499, 505, 743]],
  ['limited-shortest-path', [787]],
  ['union-find', [261, 684]],
  ['quickselect', [215]],
  ['line-sweep', [218, 253]],
  ['monotonic-deque', [239]],
  ['monotonic-stack', [85]],
  ['counting', [347, 451]],
]

const overrides: Record<number, Partial<ProblemTeachingFact>> = {
  4: { time: { value: 'O(log(min(m, n)))', reason: 'Binary search runs on the partition index of the shorter array.' }, space: { value: 'O(1)', reason: 'Only partition boundaries and neighboring values are stored.' } },
  5: { time: { value: 'O(n²)', reason: 'The interval dynamic program evaluates each possible start and end pair once.' }, space: { value: 'O(n²)', reason: 'The table records whether each substring interval is a palindrome.' } },
  15: { time: { value: 'O(n²)', reason: 'After sorting, each fixed first value is followed by one linear two-pointer scan.' } },
  16: { time: { value: 'O(n²)', reason: 'After sorting, each fixed first value is followed by one linear two-pointer scan.' } },
  18: { time: { value: 'O(n³)', reason: 'Two fixed indices are combined with a linear two-pointer scan.' } },
  23: { time: { value: 'O(N log k)', reason: 'Each of N total nodes is inserted into or removed from a heap containing at most k list heads.' }, space: { value: 'O(k)', reason: 'The heap stores at most one active node from each input list.' } },
  30: { time: { value: 'O(n * wordLength)', reason: 'Each offset scan advances by one word and maintains window frequencies.' }, space: { value: 'O(wordCount)', reason: 'Target and current-window frequency maps store distinct words.' } },
  41: {
    time: { value: 'O(n)', reason: 'Each value is placed or inspected a constant number of times.' },
    space: { value: 'O(1)', reason: 'The input array itself is used as the presence index.' },
    teaching: {
      recognition: 'Only values 1 through n can affect the first missing positive, so array indices can represent their required positions in place.',
      state: 'The input array, rearranged so value x is placed at index x - 1 whenever x lies in the range 1 through n.',
      invariant: 'After placement work for an index settles, every movable in-range value encountered there has been sent to its unique target index.',
      transition: 'While nums[i] is in range and not already at nums[nums[i] - 1], swap it into that target position.',
      correctness: 'After placement, index i contains i + 1 exactly when that positive value is present; the first mismatch therefore names the first missing positive.',
      bottleneck: 'A separate hash set uses linear auxiliary space even though the n relevant values already have n representable array positions.',
      edgeCase: 'Duplicates must stop swapping when the target position already contains the same value, or the loop will not progress.',
      tradeoff: 'In-place index placement achieves linear time and constant auxiliary space but deliberately mutates the input array.',
    },
  },
  42: { time: { value: 'O(n)', reason: 'The two boundaries move inward once and never retreat.' }, space: { value: 'O(1)', reason: 'Only two indices, two maxima, and the accumulated water are stored.' } },
  53: { space: { value: 'O(1)', reason: 'Kadane’s algorithm retains only the best ending-here and global-best values.' } },
  70: { space: { value: 'O(1)', reason: 'The optimized recurrence retains only the previous two counts.' } },
  85: { time: { value: 'O(rows * columns)', reason: 'Each row updates column heights and each height enters and leaves its monotonic stack once.' }, space: { value: 'O(columns)', reason: 'The height array and monotonic stack contain at most one entry per column.' } },
  94: { space: { value: 'O(h)', reason: 'The explicit stack or recursion contains at most one root-to-leaf path.' } },
  96: { time: { value: 'O(n²)', reason: 'Each tree size evaluates every possible root and combines its left and right subtree counts.' }, space: { value: 'O(n)', reason: 'The dynamic-programming array stores one count for each size from zero through n.' } },
  102: { time: { value: 'O(n)', reason: 'Every tree node enters and leaves the queue once.' }, space: { value: 'O(w)', reason: 'The queue holds at most the maximum tree width w.' } },
  121: { pattern: 'greedy', time: { value: 'O(n)', reason: 'One scan updates the minimum price and best profit.' }, space: { value: 'O(1)', reason: 'Only the minimum-so-far and best profit are retained.' } },
  124: { time: { value: 'O(n)', reason: 'Postorder DFS computes one downward gain per node.' }, space: { value: 'O(h)', reason: 'The recursion stack follows at most the tree height h.' } },
  127: { time: { value: 'O(N * L²)', reason: 'For N words of length L, neighbor generation tries L positions and up to 26 substitutions.' }, space: { value: 'O(N * L)', reason: 'The dictionary, visited set, and queue retain up to N words.' } },
  139: { time: { value: 'O(n²)', reason: 'Each end position may test every earlier split; substring handling is bounded by the implementation.' }, space: { value: 'O(n)', reason: 'One reachability value is stored per string prefix.' } },
  141: { space: { value: 'O(1)', reason: 'Floyd’s algorithm uses only slow and fast pointers.' } },
  149: { pattern: 'hashing', time: { value: 'O(n²)', reason: 'Each point is an anchor for a linear scan that counts normalized slopes.' }, space: { value: 'O(n)', reason: 'The slope-frequency map for one anchor can contain n entries.' } },
  215: { time: { value: 'O(n) expected', reason: 'Randomized partitioning discards part of the active range at each step in expectation.' }, space: { value: 'O(1)', reason: 'Iterative quickselect partitions the array in place.' } },
  218: { time: { value: 'O(n log n)', reason: 'Sorted building events each cause logarithmic active-height updates.' }, space: { value: 'O(n)', reason: 'Events and active heights can both grow linearly.' } },
  253: { time: { value: 'O(n log n)', reason: 'Sorting start and end events dominates the linear chronological sweep.' }, space: { value: 'O(n)', reason: 'The event or separated-boundary arrays store O(n) timestamps.' } },
  264: { time: { value: 'O(n log n)', reason: 'The heap produces n values and each insertion or removal costs O(log n).' }, space: { value: 'O(n)', reason: 'The heap and deduplication set can retain a linear number of generated values.' } },
  332: { time: { value: 'O(E log E)', reason: 'Outgoing tickets are ordered, then every ticket edge is consumed once.' } },
  272: {
    time: { value: 'O(h + k)', reason: 'The predecessor and successor stacks are initialized along tree height h, then advance k times.' },
    space: { value: 'O(h + k)', reason: 'The two traversal stacks use O(h); the returned k values use O(k).' },
    teaching: {
      recognition: 'BST order allows values immediately below and above the target to be generated lazily without traversing every node.',
      state: 'A predecessor stack and successor stack representing the two ordered BST iterators surrounding the target.',
      invariant: 'The stack tops are the nearest not-yet-consumed predecessor and successor candidates around the target.',
      transition: 'Choose the closer stack top, emit it, then advance only that iterator through the appropriate subtree spine.',
      correctness: 'BST inorder order makes the two stack tops the closest remaining candidates on either side, so the nearer one is globally next.',
      bottleneck: 'Collecting and sorting every node costs O(n) work even when only k nearby values are requested.',
      edgeCase: 'When one iterator is exhausted, every remaining answer must come from the other side.',
      tradeoff: 'Two lazy iterators achieve O(h + k) work but require more careful stack updates than a full inorder list.',
    },
  },
  347: { time: { value: 'O(n)', reason: 'Frequency counting and scanning frequency buckets each take linear time.' }, space: { value: 'O(n)', reason: 'The frequency map and buckets can together contain every input value.' } },
  358: { time: { value: 'O(n log A)', reason: 'Each character is scheduled through a heap containing at most A distinct characters.' }, space: { value: 'O(A + k)', reason: 'The heap stores distinct characters and the cooldown queue retains at most k recent placements.' } },
  373: { time: { value: 'O(k log k)', reason: 'At most k result pairs are removed from and added to the candidate heap.' }, space: { value: 'O(k)', reason: 'The heap and returned candidate frontier contain at most O(k) pairs.' } },
  378: { time: { value: 'O(n log n * log(valueRange))', reason: 'Value-space binary search performs logarithmically many checks, each counting with n row searches.' }, space: { value: 'O(1)', reason: 'The count check and binary-search boundaries use constant auxiliary state.' } },
  407: { time: { value: 'O(rows * columns * log(rows * columns))', reason: 'Each cell is processed through a heap whose size is bounded by the grid.' }, space: { value: 'O(rows * columns)', reason: 'The visited matrix and heap can retain grid-sized state.' } },
  480: { time: { value: 'O(n log k)', reason: 'Each window update performs logarithmic insertion, removal, and heap balancing.' }, space: { value: 'O(k)', reason: 'The two heaps and delayed-deletion state retain O(k) window entries.' } },
  684: { time: { value: 'O(n alpha(n))', reason: 'Each edge performs two amortized disjoint-set finds and possibly one union.' }, space: { value: 'O(n)', reason: 'Parent and rank arrays store one entry per vertex.' } },
  704: { time: { value: 'O(log n)', reason: 'Each comparison discards half of the remaining sorted range.' }, space: { value: 'O(1)', reason: 'Iterative binary search stores only boundary indices.' } },
  743: { time: { value: 'O((V + E) log V)', reason: 'Adjacency-list Dijkstra performs heap operations while relaxing vertices and edges.' }, space: { value: 'O(V + E)', reason: 'The adjacency list, distance table, and heap store graph-sized state.' } },
  658: { time: { value: 'O(log(n - k) + k)', reason: 'Binary search finds the best length-k window start, then producing the result takes O(k).' }, space: { value: 'O(1)', reason: 'Excluding the returned slice, only binary-search indices are retained.' } },
}

export const problemTeachingFacts: Record<number, ProblemTeachingFact> = Object.fromEntries(
  assignments.flatMap(([pattern, ids]) => ids.map((id) => [id, { pattern, verified: true, ...overrides[id] }])),
) as Record<number, ProblemTeachingFact>
