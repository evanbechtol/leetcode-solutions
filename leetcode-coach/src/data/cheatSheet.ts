export type CheatCategory =
  | 'Foundations'
  | 'Sequence patterns'
  | 'Traversal & graphs'
  | 'Dynamic programming'
  | 'Specialized structures'
  | 'Advanced techniques'

export interface CheatPattern {
  number: number
  title: string
  category: CheatCategory
  coreIdea: string
  signals: string[]
  complexity: string
  question: string
  reasoning: string[]
  mistakes: string[]
  examples: string[]
  template?: string
}

export interface ReferenceRow {
  signal: string
  pattern: string
}

export const cheatCategories: Array<'All' | CheatCategory> = [
  'All',
  'Foundations',
  'Sequence patterns',
  'Traversal & graphs',
  'Dynamic programming',
  'Specialized structures',
  'Advanced techniques',
]

export const triageSignals: ReferenceRow[] = [
  { signal: 'Sorted input or monotonic answer space', pattern: 'Binary search' },
  { signal: 'Pair search or comparison from both ends', pattern: 'Opposite-direction two pointers' },
  { signal: 'Compact, filter, subsequence, or linked-list gap', pattern: 'Same-direction two pointers' },
  { signal: 'Contiguous subarray or substring', pattern: 'Sliding window or prefix sum' },
  { signal: 'Repeated range sums', pattern: 'Prefix sum' },
  { signal: 'Cycle, middle, or kth item from the end', pattern: 'Fast and slow pointers' },
  { signal: 'Tree subtree result or recursive hierarchy', pattern: 'Depth-first search' },
  { signal: 'All combinations, permutations, or choose/skip decisions', pattern: 'Backtracking' },
  { signal: 'Fewest unweighted steps or level order', pattern: 'Breadth-first search' },
  { signal: 'Dependencies or prerequisite ordering', pattern: 'Topological sort' },
  { signal: 'Weighted shortest path with non-negative weights', pattern: 'Dijkstra with a min-heap' },
  { signal: 'Connect everything for the lowest total cost', pattern: 'Minimum spanning tree' },
  { signal: 'Repeated minimum/maximum, top-k, or streaming best', pattern: 'Heap or priority queue' },
  { signal: 'Overlapping subproblems and a recurrence', pattern: 'Dynamic programming' },
  { signal: 'Dynamic connectivity or merging groups', pattern: 'Union-Find / DSU' },
  { signal: 'Prefix lookup or autocomplete', pattern: 'Trie' },
  { signal: 'Range query with point updates', pattern: 'Segment tree' },
  { signal: 'Overlapping times or ranges', pattern: 'Sort and scan intervals' },
  { signal: 'Nested, undo, expression, or matching behavior', pattern: 'Stack' },
  { signal: 'Next greater or next smaller element', pattern: 'Monotonic stack' },
  { signal: 'Repeatedly split into independent subproblems', pattern: 'Divide and conquer' },
  { signal: 'Events along an axis or active intervals', pattern: 'Line sweep' },
  { signal: 'A locally optimal choice can be proven safe', pattern: 'Greedy' },
]

export const cheatPatterns: CheatPattern[] = [
  {
    number: 1,
    title: 'Sorting, Hashing & Simulation',
    category: 'Foundations',
    coreIdea: 'These are the baseline tools. Sorting creates order that unlocks binary search, greedy scans, interval processing, and two pointers. Hashing trades memory for fast membership or count lookup. Simulation directly models the rules when no deeper optimization is required.',
    signals: ['Need ordering before scanning', 'Frequency, duplicate, or membership checks', 'Direct state transitions', 'Custom ordering or comparator'],
    complexity: 'Sorting is typically O(n log n). Hash lookups are O(1) on average. Simulation is usually O(number of simulated steps).',
    question: 'Can I create useful structure by sorting, or eliminate repeated search with a hash table?',
    reasoning: [
      'Sort when relative order makes later decisions easier; prefer the language’s built-in sort unless implementation is explicitly required.',
      'Use a set for membership and uniqueness. Use a map for counts, indexes, grouping, or memoized values.',
      'For simulation, define the complete state clearly and update it exactly once per step.',
    ],
    mistakes: ['Sorting may destroy original indexes unless you preserve them.', 'Hash-map iteration order is not automatically meaningful.', 'Simulation becomes fragile when related state is scattered across many variables.'],
    examples: ['Sorting fundamentals', 'Merge sort and quicksort', 'Custom comparators', 'State-machine simulations'],
    template: `Arrays.sort(nums);

Map<Integer, Integer> frequency = new HashMap<>();
for (int value : nums) {
    frequency.merge(value, 1, Integer::sum);
}

Set<Integer> seen = new HashSet<>();
for (int value : nums) {
    if (!seen.add(value)) {
        // value is a duplicate
    }
}`,
  },
  {
    number: 2,
    title: 'Binary Search',
    category: 'Foundations',
    coreIdea: 'Repeatedly discard half of a search space using a monotonic property. The input does not have to be a literally sorted array; the essential requirement is an answer space that separates into false/true or smaller/larger regions.',
    signals: ['Sorted input', 'First or last occurrence', 'Minimum feasible or maximum feasible value', 'Rotated sorted array', 'Peak', 'Numeric answer space'],
    complexity: 'O(log n) search time and O(1) extra space for the iterative form.',
    question: 'If I test a candidate, can I prove which half of the remaining possibilities cannot contain the answer?',
    reasoning: [
      'Define exactly what the left and right boundaries mean before writing the loop.',
      'For boundary problems, use “first true” thinking: find the smallest index or value satisfying a monotonic predicate.',
      'Compute the midpoint from the distance between boundaries to avoid overflow in fixed-width integer languages.',
    ],
    mistakes: ['Mixing inclusive and exclusive boundary conventions.', 'Using < when <= is required and skipping a one-element range.', 'Searching a predicate that is not monotonic.'],
    examples: ['First true', 'First element not smaller than target', 'First occurrence', 'Integer square root', 'Minimum in a rotated array', 'Peak finding'],
    template: `int left = 0;
int right = nums.length - 1;

while (left <= right) {
    int mid = left + (right - left) / 2;
    if (nums[mid] == target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
}

return -1;`,
  },
  {
    number: 3,
    title: 'Two Pointers — Same Direction',
    category: 'Sequence patterns',
    coreIdea: 'Move two positions forward through a sequence. One pointer usually scans while the other represents a write position, a matched position, or a fixed gap.',
    signals: ['Remove or compact in place', 'Subsequence matching', 'Move zeros', 'Linked-list middle', 'Nth node from the end'],
    complexity: 'Usually O(n) time and O(1) extra space.',
    question: 'What does each pointer represent, and what remains true after every pointer move?',
    reasoning: ['A common invariant is that everything before the write pointer is already valid or compacted.', 'For linked lists, create a fixed gap between fast and slow when a position is relative to the end.'],
    mistakes: ['Moving the write pointer when no valid element was written.', 'Losing nodes while rewiring linked-list pointers.', 'Introducing an off-by-one error in the pointer gap.'],
    examples: ['Remove duplicates', 'Middle of a linked list', 'Move zeros', 'Remove nth node from end'],
    template: `int write = 0;
for (int read = 0; read < nums.length; read++) {
    if (shouldKeep(nums[read])) {
        nums[write++] = nums[read];
    }
}`,
  },
  {
    number: 4,
    title: 'Two Pointers — Opposite Directions',
    category: 'Sequence patterns',
    coreIdea: 'Start at opposite ends of an ordered or pairwise search space and move inward. Each comparison identifies a side that can be discarded.',
    signals: ['Pair sum in sorted data', 'Palindrome', 'Maximize area between boundaries', 'Symmetric comparison'],
    complexity: 'O(n) time and O(1) extra space.',
    question: 'After evaluating the current left/right pair, can one side be proven incapable of producing a valid or better answer?',
    reasoning: ['For a sorted pair sum, move left when the sum is too small and right when it is too large.', 'For a palindrome, a mismatch fails immediately; a match moves both pointers inward.'],
    mistakes: ['Using the technique on unsorted pair-sum data without sorting or changing strategies.', 'Moving both pointers when only one side has been eliminated.'],
    examples: ['Two sum in a sorted array', 'Valid palindrome', 'Container with most water'],
    template: `int left = 0;
int right = nums.length - 1;

while (left < right) {
    int value = evaluate(nums[left], nums[right]);
    if (isAnswer(value)) break;
    if (needLarger(value)) left++;
    else right--;
}`,
  },
  {
    number: 5,
    title: 'Sliding Window — Fixed Size',
    category: 'Sequence patterns',
    coreIdea: 'Maintain an aggregate for exactly k consecutive elements. Add the element entering the window and remove the one leaving instead of recomputing the complete window.',
    signals: ['Contiguous values', 'Exactly k items', 'Every window of length k', 'Max, min, average, or frequency over a fixed window'],
    complexity: 'O(n) time with O(1), O(alphabet), or O(distinct values) space depending on the tracked state.',
    question: 'What information can be updated in O(1) when the window shifts by one position?',
    reasoning: ['Build the first complete window, record its result, then slide one position at a time.', 'For frequency-based windows, update counts for both the outgoing and incoming elements.'],
    mistakes: ['Recomputing every window from scratch, producing O(nk) work.', 'Removing the wrong outgoing index; it is usually right - k.'],
    examples: ['Maximum fixed-window sum', 'Find all anagrams in a string'],
    template: `int sum = 0;
for (int right = 0; right < nums.length; right++) {
    sum += nums[right];
    if (right >= k) sum -= nums[right - k];
    if (right >= k - 1) {
        // Window is [right - k + 1, right]
    }
}`,
  },
  {
    number: 6,
    title: 'Sliding Window — Variable Size',
    category: 'Sequence patterns',
    coreIdea: 'Expand a right boundary to gain elements and move the left boundary only when required by the invariant. This turns many contiguous O(n²) searches into O(n) scans.',
    signals: ['Longest valid substring or subarray', 'Shortest segment meeting a threshold', 'No repeated values', 'At most or at least k', 'Minimum covering window'],
    complexity: 'Usually O(n) time because each element enters and leaves the window at most once.',
    question: 'What makes the current window valid, and does validity change monotonically as I expand or shrink it?',
    reasoning: ['Longest-valid form: expand right, shrink left while invalid, then update the answer after validity is restored.', 'Shortest-valid form: expand until valid, then record and shrink as much as possible.'],
    mistakes: ['Updating the answer while the window is invalid.', 'Assuming arbitrary negative values preserve a monotonic sum condition.', 'Confusing “at most” with “exactly.”'],
    examples: ['Longest substring without repeating characters', 'Minimum-size subarray', 'Minimum window substring'],
    template: `int left = 0;
for (int right = 0; right < nums.length; right++) {
    addToWindow(nums[right]);

    while (windowIsInvalid()) {
        removeFromWindow(nums[left]);
        left++;
    }

    updateAnswer(right - left + 1);
}`,
  },
  {
    number: 7,
    title: 'Prefix Sum',
    category: 'Sequence patterns',
    coreIdea: 'Precompute cumulative information so a contiguous range can be answered from two prefix values. Combine prefix sums with a hash map when the desired range may begin anywhere.',
    signals: ['Many range-sum queries', 'Subarray sum equals a target', 'Running balance', 'Need the sum of [l, r] quickly'],
    complexity: 'O(n) preprocessing and O(1) per range query. Prefix-map problems are O(n) expected time.',
    question: 'Can the quantity for [l, r] be expressed as prefix[r + 1] - prefix[l]?',
    reasoning: ['Store prefix[0] = 0 so ranges beginning at index 0 need no special case.', 'For subarray sum = target, a prior prefix equal to currentPrefix - target identifies a valid earlier boundary.'],
    mistakes: ['Forgetting the initial zero prefix.', 'Using a simple sliding window when the array may contain negative values.', 'Overwriting counts when multiple equal prefixes matter.'],
    examples: ['Subarray sum equals target', 'Immutable range-sum query', 'Product of array except self'],
    template: `int[] prefix = new int[nums.length + 1];
for (int i = 0; i < nums.length; i++) {
    prefix[i + 1] = prefix[i] + nums[i];
}

int rangeSum = prefix[right + 1] - prefix[left];`,
  },
  {
    number: 8,
    title: 'Fast & Slow Pointers',
    category: 'Sequence patterns',
    coreIdea: 'Move two pointers at different speeds through a linked structure or implicit next-state function. Their relative motion exposes cycles, midpoints, and distance relationships.',
    signals: ['Cycle detection', 'Linked-list middle', 'Functional graph or repeated next state', 'Find a cycle entrance'],
    complexity: 'O(n) time and O(1) extra space.',
    question: 'Does every state have a deterministic next state that two walkers can traverse?',
    reasoning: ['For cycle detection, advance slow by one and fast by two; a meeting proves a cycle exists.', 'For a midpoint, slow reaches the middle when fast reaches the end.'],
    mistakes: ['Dereferencing fast.next before checking fast and fast.next.', 'Assuming the first meeting point is automatically the cycle entrance.'],
    examples: ['Linked-list cycle', 'Teleporter arrays', 'Middle of a linked list'],
    template: `ListNode slow = head;
ListNode fast = head;

while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow == fast) return true;
}

return false;`,
  },
  {
    number: 9,
    title: 'DFS — Trees & Binary Search Trees',
    category: 'Traversal & graphs',
    coreIdea: 'Explore one branch fully before returning. Tree DFS is naturally recursive because each subtree is a smaller instance of the same problem; each return value should summarize exactly what the parent needs.',
    signals: ['Tree depth or height', 'Subtree property', 'Validate a tree', 'Path or ancestor', 'Serialize or reconstruct', 'Recursive hierarchy'],
    complexity: 'Tree DFS is O(n) time and O(h) call-stack space, where h is tree height. Graph DFS is O(V + E).',
    question: 'What should dfs(node) return so that the parent can compute its own result?',
    reasoning: ['Write the base case, recursively obtain child results, then combine those results.', 'For a BST, carry valid lower and upper bounds when global ordering must be validated.'],
    mistakes: ['Checking a BST node only against immediate children instead of global bounds.', 'Forgetting a visited set on graphs or cyclic structures.', 'Using global mutable state when a return value would be safer.'],
    examples: ['Maximum tree depth', 'Balanced binary tree', 'Subtree matching', 'Validate BST', 'Lowest common ancestor', 'Serialize a binary tree'],
    template: `int dfs(TreeNode node) {
    if (node == null) return 0;

    int left = dfs(node.left);
    int right = dfs(node.right);

    return 1 + Math.max(left, right);
}`,
  },
  {
    number: 10,
    title: 'Backtracking / Combinatorial Search',
    category: 'Traversal & graphs',
    coreIdea: 'Run DFS over a decision tree. Build a partial candidate, recursively explore a choice, and then undo that choice. Pruning stops a branch as soon as it cannot produce a valid result.',
    signals: ['Generate every result', 'Permutations, subsets, or combinations', 'Choose-or-skip decisions', 'Construct strings', 'Constraint satisfaction'],
    complexity: 'Often exponential—approximately O(branching factor ^ depth)—plus the size of the produced output.',
    question: 'What is the state, which choices are available, and what condition means a solution is complete?',
    reasoning: ['Follow the choose → recurse → undo sequence.', 'Prune immediately when the partial state cannot lead to a valid result.', 'When values repeat, define an explicit same-depth deduplication rule.'],
    mistakes: ['Forgetting to undo mutable state.', 'Recording the same mutable list reference instead of a copy.', 'Generating duplicate results from equal choices at one decision depth.'],
    examples: ['Phone-number combinations', 'Palindrome partitioning', 'Valid parentheses', 'Permutations', 'Combination sum', 'Subsets'],
    template: `void backtrack(State state) {
    if (isComplete(state)) {
        answers.add(copyOf(state));
        return;
    }

    for (Choice choice : choices(state)) {
        apply(choice, state);
        backtrack(state);
        undo(choice, state);
    }
}`,
  },
  {
    number: 11,
    title: 'BFS — Level Order & Unweighted Shortest Path',
    category: 'Traversal & graphs',
    coreIdea: 'Explore every node at distance d before any node at distance d + 1. A queue preserves this order, allowing BFS to find the minimum number of edges in an unweighted graph.',
    signals: ['Level order', 'Minimum number of moves or steps', 'Nearest item in an unweighted graph', 'Multi-source spreading', 'Minimum tree depth'],
    complexity: 'O(V + E) for a graph and O(n) for a tree. Space may reach O(V), or the maximum tree width.',
    question: 'Am I minimizing the number of edges or steps when every move has equal cost?',
    reasoning: ['Enqueue the start and mark it visited immediately, then repeatedly dequeue a node and enqueue unseen neighbors.', 'For level-specific logic, process exactly the queue size captured at the start of each layer.'],
    mistakes: ['Marking a node visited when dequeued, allowing duplicate enqueues.', 'Using ordinary BFS for unequal edge weights.'],
    examples: ['Binary-tree level order', 'Right-side view', 'Minimum tree depth', 'Shortest path in an unweighted graph'],
    template: `Queue<Node> queue = new ArrayDeque<>();
Set<Node> seen = new HashSet<>();
queue.offer(start);
seen.add(start);

int steps = 0;
while (!queue.isEmpty()) {
    for (int size = queue.size(); size > 0; size--) {
        Node current = queue.poll();
        for (Node neighbor : current.neighbors) {
            if (seen.add(neighbor)) queue.offer(neighbor);
        }
    }
    steps++;
}`,
  },
  {
    number: 12,
    title: 'Graph Traversal — Explicit, Matrix & Implicit',
    category: 'Traversal & graphs',
    coreIdea: 'Model states as vertices and allowed transitions as edges. The graph may be given directly, encoded in a matrix, or generated on demand through a neighbor function.',
    signals: ['Connected components', 'Islands or regions', 'Reachability', 'Clone a network', 'State transitions', 'Grid movement', 'Words, locks, or puzzles'],
    complexity: 'DFS and BFS take O(V + E). A grid traversal is O(rows × columns).',
    question: 'What are the nodes, and exactly what rule creates an edge between two nodes?',
    reasoning: ['Use an adjacency list for an explicit sparse graph.', 'For matrices, treat each cell as a node and valid movement rules as edges.', 'For implicit graphs, generate neighbors on demand instead of constructing every edge.'],
    mistakes: ['Forgetting whether edges are directed.', 'Omitting visited tracking and creating repeated or infinite traversal.', 'Confusing a grid’s geometry with its actual movement rules.'],
    examples: ['Clone graph', 'Flood fill', 'Number of islands', 'Knight moves', 'Pacific Atlantic water flow', 'Word ladder', 'Open the lock'],
  },
  {
    number: 13,
    title: 'Topological Sort',
    category: 'Traversal & graphs',
    coreIdea: 'Order a directed acyclic graph so every prerequisite appears before each item that depends on it. Kahn’s algorithm repeatedly removes vertices whose indegree is zero.',
    signals: ['Prerequisites', 'Dependencies', 'Task scheduling', 'Course ordering', 'Alien alphabet', 'Need a valid ordering', 'Detect a directed cycle'],
    complexity: 'O(V + E) time and O(V + E) space.',
    question: 'Does an edge A → B mean that A must happen before B?',
    reasoning: ['Build adjacency lists and indegree counts.', 'Begin with every zero-indegree node; removing one decrements the indegree of its outgoing neighbors.', 'If fewer than V nodes are processed, a cycle prevents a complete ordering.'],
    mistakes: ['Reversing the edge direction and therefore the meaning of indegree.', 'Returning a partial order when a cycle exists.'],
    examples: ['Task scheduling', 'Sequence reconstruction', 'Alien dictionary', 'Course schedule'],
    template: `Queue<Integer> queue = new ArrayDeque<>();
for (int node = 0; node < n; node++) {
    if (indegree[node] == 0) queue.offer(node);
}

List<Integer> order = new ArrayList<>();
while (!queue.isEmpty()) {
    int node = queue.poll();
    order.add(node);
    for (int neighbor : graph.get(node)) {
        if (--indegree[neighbor] == 0) queue.offer(neighbor);
    }
}

// order.size() == n if and only if the graph has no cycle`,
  },
  {
    number: 14,
    title: 'Dijkstra — Weighted Shortest Path',
    category: 'Traversal & graphs',
    coreIdea: 'For non-negative edge weights, repeatedly finalize the cheapest reachable vertex using a min-heap. Relaxing an edge improves a neighbor when a shorter route is discovered.',
    signals: ['Shortest weighted path', 'Costs, distances, or travel time', 'Every edge weight is non-negative', 'Minimum distance from one source'],
    complexity: 'O((V + E) log V) with an adjacency list and binary heap.',
    question: 'Are weights non-negative, and do I need the cheapest path rather than the fewest edges?',
    reasoning: ['Set dist[start] to zero and every other distance to infinity.', 'Pop the smallest tentative distance and skip stale heap entries.', 'Relax each outgoing edge: when d + weight is smaller, update the distance and push a new heap entry.'],
    mistakes: ['Applying Dijkstra to negative edge weights.', 'Failing to skip stale heap entries.', 'Treating a node as final before it is popped at its minimum distance.'],
    examples: ['Shortest path in a non-negatively weighted graph', 'Network delay time', 'Cheapest grid traversal'],
    template: `PriorityQueue<int[]> queue = new PriorityQueue<>(
    Comparator.comparingInt(entry -> entry[0])
);
int[] distance = new int[n];
Arrays.fill(distance, Integer.MAX_VALUE);
distance[start] = 0;
queue.offer(new int[] {0, start});

while (!queue.isEmpty()) {
    int[] current = queue.poll();
    int d = current[0];
    int node = current[1];
    if (d != distance[node]) continue;

    for (Edge edge : graph.get(node)) {
        if (d + edge.weight < distance[edge.to]) {
            distance[edge.to] = d + edge.weight;
            queue.offer(new int[] {distance[edge.to], edge.to});
        }
    }
}`,
  },
  {
    number: 15,
    title: 'Minimum Spanning Tree',
    category: 'Traversal & graphs',
    coreIdea: 'Connect every vertex with minimum total edge cost and no cycles. Kruskal sorts edges and adds one only when it joins separate components; Prim grows a single connected tree using a min-heap.',
    signals: ['Connect all points or cities cheaply', 'Minimum total wiring or network cost', 'Undirected weighted graph', 'Need a spanning connection rather than one route'],
    complexity: 'Kruskal takes O(E log E), with near-constant amortized Union-Find operations.',
    question: 'Is the objective the minimum total cost to connect everything, rather than a shortest path from one source?',
    reasoning: ['Kruskal: sort edges by weight and union endpoints only when they are currently disconnected.', 'Stop after selecting V - 1 edges when the graph has become connected.'],
    mistakes: ['Confusing a minimum spanning tree with a shortest-path tree.', 'Applying an ordinary MST algorithm to a directed graph.'],
    examples: ['Minimum-cost network connection', 'Connect points with minimum total cost', 'Minimum spanning forest'],
  },
  {
    number: 16,
    title: 'Heap / Priority Queue',
    category: 'Specialized structures',
    coreIdea: 'Maintain fast access to the current minimum or maximum while values are inserted and removed. A heap is the standard concrete implementation of a priority queue.',
    signals: ['Top k', 'Kth largest or smallest', 'Repeated minimum or maximum', 'Merge sorted streams', 'Priority scheduling', 'Streaming median'],
    complexity: 'Peek O(1), insert and pop O(log n), heapify O(n), and a typical top-k scan O(n log k).',
    question: 'Do I repeatedly need only the best remaining item instead of a completely sorted collection?',
    reasoning: ['For the k largest items, a min-heap of size k retains only the k best values seen so far.', 'To merge k sorted sources, keep the next candidate from each source in the heap.', 'Two heaps can maintain lower and upper halves for a streaming median.'],
    mistakes: ['Choosing min-heap versus max-heap backwards.', 'Sorting the entire input when only k items are needed.', 'Writing a subtraction comparator that can overflow.'],
    examples: ['K closest points', 'Merge k sorted lists', 'Kth largest element', 'Reorganize string', 'Median from a data stream'],
    template: `PriorityQueue<Integer> minHeap = new PriorityQueue<>();

for (int value : nums) {
    minHeap.offer(value);
    if (minHeap.size() > k) minHeap.poll();
}

// The root is the kth-largest value after the complete scan.
return minHeap.peek();`,
  },
  {
    number: 17,
    title: 'Dynamic Programming — Core Framework',
    category: 'Dynamic programming',
    coreIdea: 'Dynamic programming solves overlapping subproblems by storing results. The central task is defining a state containing exactly the information needed by future transitions, then deriving a recurrence and base cases.',
    signals: ['Count ways', 'Minimum or maximum cost', 'Best value under constraints', 'Overlapping recursive choices', 'Sequence alignment', 'Can partition or can reach'],
    complexity: 'Pattern-dependent. Estimate time as number of states × work per transition and space as the number of stored states.',
    question: 'What does dp[state] mean, what transitions enter it, what are its base cases, and in what order can states be computed?',
    reasoning: ['Top-down means recursion plus memoization; bottom-up means filling states in dependency order.', 'Estimate runtime from states × transition work.', 'Optimize memory only after the recurrence is correct.'],
    mistakes: ['Starting with a table before defining the state’s meaning.', 'Forgetting impossible-state initialization such as infinity or false.', 'Using a greedy decision when future choices interact.'],
    examples: ['Climbing stairs', 'House robber', 'Unique paths', 'Longest common subsequence', 'Longest increasing subsequence', 'Coin change'],
    template: `Map<State, Integer> memo = new HashMap<>();

int solve(State state) {
    if (isBaseCase(state)) return baseValue(state);
    if (memo.containsKey(state)) return memo.get(state);

    int answer = combineSubproblems(state);
    memo.put(state, answer);
    return answer;
}`,
  },
  {
    number: 18,
    title: 'DP — Constant Transition / 1D',
    category: 'Dynamic programming',
    coreIdea: 'Each state depends on a constant number of nearby earlier states. Once the recurrence is correct, these problems often collapse from a full array to O(1) memory.',
    signals: ['Ways to reach index i', 'Cost to reach i', 'Take or skip the previous item', 'Depends on fixed offsets such as i - 1 and i - 2'],
    complexity: 'Usually O(n) time, with either O(n) table space or O(1) rolling space.',
    question: 'Can dp[i] be computed from only a fixed-size set of earlier dp values?',
    reasoning: ['Write the recurrence first, then identify the smallest complete set of base cases.', 'If only the last k states are required, replace the table with k rolling variables.'],
    mistakes: ['Incorrect base cases for n = 0 or n = 1.', 'An in-place update order that overwrites a value before its final use.'],
    examples: ['Climbing stairs', 'Tribonacci', 'House robber', 'Min cost climbing stairs', 'Minimum cost for tickets'],
  },
  {
    number: 19,
    title: 'DP — Grid',
    category: 'Dynamic programming',
    coreIdea: 'Each cell stores the best, count, or feasibility result for paths reaching or leaving that position. Transitions come from neighboring cells that may precede it under the movement rules.',
    signals: ['Two-dimensional board', 'Path counting', 'Minimum or maximum path sum', 'Obstacles', 'Square or rectangle substructure'],
    complexity: 'Usually O(rows × columns) time and O(rows × columns) or O(columns) space.',
    question: 'What does dp[row][column] mean, and which neighboring cells may transition into it?',
    reasoning: ['Choose an iteration order that guarantees dependencies are already computed.', 'Initialize the first row and column carefully when obstacles or accumulated costs are present.'],
    mistakes: ['Using DFS without memoization and recomputing paths exponentially.', 'Incorrect boundary initialization.'],
    examples: ['Unique paths', 'Unique paths with obstacles', 'Minimum path sum', 'Maximal square', 'Triangle', 'Dungeon game'],
  },
  {
    number: 20,
    title: 'DP — Dual Sequence',
    category: 'Dynamic programming',
    coreIdea: 'Use a two-dimensional state over prefixes or positions of two sequences. Transitions depend on whether current elements match and on allowed operations such as skip, insert, delete, or replace.',
    signals: ['Two strings or arrays', 'Subsequence similarity', 'Edit operations', 'Align two sequences', 'Count transformations'],
    complexity: 'Commonly O(mn) time and O(mn) space, often reducible to O(min(m, n)) space.',
    question: 'What does dp[i][j] mean for the first i elements of A and the first j elements of B?',
    reasoning: ['When current elements match, the transition often moves diagonally.', 'When they differ, consider skipping or altering one or both sequences according to the allowed operations.'],
    mistakes: ['Confusing a contiguous substring with a non-contiguous subsequence.', 'Incorrect base cases for empty prefixes.'],
    examples: ['Longest common subsequence', 'Edit distance', 'Distinct subsequences', 'Shortest common supersequence'],
  },
  {
    number: 21,
    title: 'DP — Non-Constant Transition',
    category: 'Dynamic programming',
    coreIdea: 'A state may examine many earlier states rather than a fixed neighborhood. A direct transition often takes O(n) per state, producing O(n²) total time.',
    signals: ['Best subsequence ending at i', 'Partition a previous prefix at every j', 'Compare with many prior positions'],
    complexity: 'Often O(n²), depending on the number and cost of transitions.',
    question: 'Does computing dp[i] require considering every earlier j?',
    reasoning: ['Define the precise condition that permits a transition from state j into state i.', 'After proving a correct O(n²) recurrence, consider sorting, binary search, heaps, or prefix optimization only if constraints demand it.'],
    mistakes: ['Chasing an advanced optimization before defining and validating the DP state.'],
    examples: ['Longest increasing subsequence', 'Partition array for maximum sum', 'Largest divisible subset'],
  },
  {
    number: 22,
    title: 'DP — Knapsack Family',
    category: 'Dynamic programming',
    coreIdea: 'Track what can be achieved for each capacity, weight, or target. The critical distinction is whether an item may be used once, an unlimited number of times, or a bounded number of times.',
    signals: ['Subset sum', 'Can reach a target', 'Count ways to make an amount', 'Minimum coins', 'Maximum value under capacity', 'Choose items under weight'],
    complexity: 'Typically O(items × capacity) time and O(capacity) optimized space.',
    question: 'May each item be used once, unlimited times, or a limited number of times?',
    reasoning: ['A 0/1 one-dimensional optimization iterates capacity backward so the current item cannot be reused during its own round.', 'Unbounded knapsack iterates capacity forward so the current item may contribute repeatedly.'],
    mistakes: ['Using the wrong capacity-loop direction and silently changing 0/1 into unbounded behavior.', 'Failing to distinguish initialization for count-ways, minimum-items, and maximum-value objectives.'],
    examples: ['0/1 knapsack', 'Partition equal subset sum', 'Target sum', 'Coin change', 'Perfect squares', 'Bounded knapsack'],
    template: `boolean[] dp = new boolean[target + 1];
dp[0] = true;

for (int value : nums) {
    for (int sum = target; sum >= value; sum--) {
        // Backward iteration means each value is used at most once.
        dp[sum] |= dp[sum - value];
    }
}`,
  },
  {
    number: 23,
    title: 'DP — Interval, DAG, Tree & Bitmask',
    category: 'Dynamic programming',
    coreIdea: 'Recognize advanced DP by the shape of its state: a range [left, right], a node in an acyclic dependency graph, a subtree, or a (mask, last) state representing a selected subset.',
    signals: ['Choose a split point inside a range', 'Best path in a DAG', 'A tree decision depends on children', 'Visit every node or subset', 'Small n around 15–20 with subset choices'],
    complexity: 'Interval DP is often O(n³); DAG DP follows O(V + E) times transition work; tree DP is often O(n); bitmask DP is commonly O(2ⁿ × n²).',
    question: 'Which structural dimension defines the subproblem: interval, node, subtree, or subset?',
    reasoning: ['Interval DP often grows by interval length and tests split points.', 'DAG DP computes states in topological order.', 'Tree DP returns multiple values when a parent decision changes what is allowed below.', 'Bitmask DP encodes visited or selected sets as bits.'],
    mistakes: ['Using bitmask DP when n is too large.', 'Omitting multiple return states in tree DP, such as take versus skip.'],
    examples: ['Longest palindromic subsequence', 'Longest increasing path in a matrix', 'Longest string chain', 'House robber III', 'Traveling over every node'],
  },
  {
    number: 24,
    title: 'Union-Find / Disjoint Set Union',
    category: 'Traversal & graphs',
    coreIdea: 'Maintain a partition of elements into connected components under repeated merge and connectivity queries. find(x) returns a representative; union(a, b) merges two representatives.',
    signals: ['Dynamic connectivity', 'Merge groups or accounts', 'Count connected components', 'Kruskal MST', 'Edges arrive over time'],
    complexity: 'Amortized near O(1) per operation—O(α(n))—with O(n) space.',
    question: 'Do I repeatedly need to know whether two items are connected while their components are being merged?',
    reasoning: ['Use path compression in find and union by rank or component size.', 'Track the number or sizes of components when the problem asks for them.'],
    mistakes: ['Unioning raw nodes instead of their representatives.', 'Omitting path compression or rank on large inputs.'],
    examples: ['Connected-component sizes', 'Merge user accounts', 'Number of components', 'Reverse Union-Find'],
    template: `int find(int node) {
    if (parent[node] != node) {
        parent[node] = find(parent[node]);
    }
    return parent[node];
}

boolean union(int a, int b) {
    int rootA = find(a);
    int rootB = find(b);
    if (rootA == rootB) return false;

    if (size[rootA] < size[rootB]) {
        int temp = rootA;
        rootA = rootB;
        rootB = temp;
    }
    parent[rootB] = rootA;
    size[rootA] += size[rootB];
    return true;
}`,
  },
  {
    number: 25,
    title: 'Trie / Prefix Tree',
    category: 'Specialized structures',
    coreIdea: 'Store strings character by character so shared prefixes share nodes. Lookup time depends on the query length rather than the number of stored words.',
    signals: ['Prefix search', 'Autocomplete', 'Dictionary with many strings', 'startsWith queries', 'Word search with prefix pruning'],
    complexity: 'Insert, search, and prefix lookup take O(L), where L is the input length. Memory is proportional to stored characters after prefix sharing.',
    question: 'Do many operations repeatedly search a collection of words by prefix?',
    reasoning: ['Each node maps characters to children and typically stores an end-of-word flag.', 'Traverse one character at a time; a prefix query stops after the prefix and does not require an end flag.'],
    mistakes: ['Treating prefix existence as full-word existence.', 'Allocating a large alphabet array per node when a sparse map would use much less memory.'],
    examples: ['Autocomplete', 'Prefix count', 'Add and search words', 'Word search II'],
    template: `class TrieNode {
    Map<Character, TrieNode> children = new HashMap<>();
    boolean isWord;
}

void insert(String word) {
    TrieNode current = root;
    for (char character : word.toCharArray()) {
        current = current.children.computeIfAbsent(
            character,
            key -> new TrieNode()
        );
    }
    current.isWord = true;
}`,
  },
  {
    number: 26,
    title: 'Data Structure Design — LRU Cache',
    category: 'Specialized structures',
    coreIdea: 'Combine complementary structures so every required operation meets its target. An LRU cache uses a hash map for O(1) lookup and a doubly linked list for O(1) recency updates and eviction.',
    signals: ['Design a class or API', 'O(1) get and put', 'Evict the least recently used item', 'Fast lookup plus recency order'],
    complexity: 'get O(1), put O(1), and O(capacity) space.',
    question: 'Which operations must be constant time, and which structure supplies each capability?',
    reasoning: ['Map each key to its linked-list node.', 'Place the most recently used node near the head and the least recent near the tail.', 'Every get or put moves the touched node to the most-recent position.'],
    mistakes: ['Using a singly linked list, which makes arbitrary removal O(n).', 'Updating the map without updating list order, or vice versa.'],
    examples: ['LRU cache'],
  },
  {
    number: 27,
    title: 'Segment Tree',
    category: 'Specialized structures',
    coreIdea: 'A balanced tree stores an aggregate for intervals of an array. Queries combine only nodes overlapping the requested range; a point update changes one root-to-leaf path and recomputes its ancestors.',
    signals: ['Many range queries', 'Values change between queries', 'Range minimum, maximum, or sum', 'Both query and update must beat O(n)'],
    complexity: 'O(n) build, O(log n) range query, O(log n) point update, and O(n) space.',
    question: 'Do I need repeated range aggregates and updates to the underlying values?',
    reasoning: ['Each node summarizes an interval and its children partition that interval.', 'A query has three cases: no overlap, full overlap, and partial overlap.', 'Update one leaf, then recompute aggregates on the path to the root.'],
    mistakes: ['Using static prefix sums when updates are frequent.', 'Returning the wrong identity for no overlap—0 for sum, +∞ for min, and −∞ for max.'],
    examples: ['Range sum with updates', 'Range maximum', 'Mutable array queries'],
  },
  {
    number: 28,
    title: 'Intervals',
    category: 'Sequence patterns',
    coreIdea: 'Sort intervals by a useful endpoint, then scan while maintaining the active or merged range. Sorting converts overlap relationships into local comparisons.',
    signals: ['Start/end pairs', 'Meetings', 'Merge overlapping ranges', 'Insert a range', 'Remove overlaps', 'Minimum rooms or arrows'],
    complexity: 'Usually O(n log n) for sorting followed by an O(n) scan.',
    question: 'After sorting, which endpoint lets me make a correct one-pass local decision?',
    reasoning: ['To merge, sort by start; if next.start ≤ current.end, extend the current interval.', 'Scheduling and greedy variants often sort by end time.', 'Meeting rooms can use a min-heap of active end times or a line sweep.'],
    mistakes: ['Sorting by an endpoint that does not support the intended proof.', 'Handling touching intervals inconsistently by mixing < and ≤.'],
    examples: ['Merge intervals', 'Insert interval', 'Meeting rooms', 'Non-overlapping intervals', 'Minimum arrows', 'Partition labels'],
  },
  {
    number: 29,
    title: 'Stack',
    category: 'Specialized structures',
    coreIdea: 'Use last-in, first-out order when the most recently opened or observed item must be resolved first. Stacks model nested structure, undo behavior, parsing, and expression evaluation.',
    signals: ['Matching brackets', 'Nested structures', 'Undo or backtrack history', 'Expression parser', 'Previous unresolved item'],
    complexity: 'Usually O(n) time and O(n) space.',
    question: 'Does the newest unresolved item need to be handled before older ones?',
    reasoning: ['Push when opening or deferring work; pop when a matching close or resolution arrives.', 'For expressions, separate operands, operators, precedence, and parentheses explicitly.'],
    mistakes: ['Popping from an empty stack.', 'Failing to verify the stack is empty after a matching problem ends.'],
    examples: ['Valid parentheses', 'Minimum stack', 'Basic calculator'],
    template: `Deque<Character> stack = new ArrayDeque<>();

for (char character : text.toCharArray()) {
    if (isOpening(character)) {
        stack.push(character);
    } else {
        if (stack.isEmpty()) return false;
        char opening = stack.pop();
        if (!matches(opening, character)) return false;
    }
}

return stack.isEmpty();`,
  },
  {
    number: 30,
    title: 'Monotonic Stack / Deque',
    category: 'Specialized structures',
    coreIdea: 'Maintain values or indexes in increasing or decreasing order. When a new item violates that order, pop dominated items. Every element is pushed and popped at most once.',
    signals: ['Next greater or smaller', 'Previous greater or smaller', 'Daily temperatures', 'Histogram', 'Sliding-window maximum or minimum'],
    complexity: 'O(n) time and O(n) space; the nested while loop is linear in aggregate because each item is popped once.',
    question: 'For each element, do I need the nearest future or past element that is greater or smaller?',
    reasoning: ['Store indexes when distances, original positions, duplicates, or expiration matter.', 'For sliding-window maximum, keep a decreasing deque: remove smaller values from the back and expired indexes from the front.'],
    mistakes: ['Assuming the inner while loop makes the algorithm O(n²).', 'Storing values when indexes are required.', 'Choosing increasing versus decreasing order backwards.'],
    examples: ['Sliding-window maximum', 'Daily temperatures', 'Next greater element', 'Largest rectangle in histogram'],
    template: `Deque<Integer> stack = new ArrayDeque<>();

for (int index = 0; index < nums.length; index++) {
    while (!stack.isEmpty()
            && nums[stack.peek()] < nums[index]) {
        int previous = stack.pop();
        // nums[index] is the next greater value for nums[previous].
    }
    stack.push(index);
}`,
  },
  {
    number: 31,
    title: 'Divide and Conquer',
    category: 'Advanced techniques',
    coreIdea: 'Split a problem into independent subproblems of the same type, solve them recursively, and combine the results. Unlike dynamic programming, these subproblems usually do not overlap.',
    signals: ['Split an array or range', 'Merge results', 'Recursive halves', 'Count cross-boundary relationships', 'Geometric partitions'],
    complexity: 'A common recurrence T(n) = 2T(n/2) + O(n) gives O(n log n), but the result depends on the combine cost.',
    question: 'Can I solve independent parts and combine their answers efficiently?',
    reasoning: ['Use the sequence divide → solve left/right → combine.', 'Merge sort is the canonical example; advanced counting problems collect extra information during the merge.'],
    mistakes: ['Confusing divide and conquer with DP when subproblems overlap.', 'Doing so much combine work that the intended complexity is lost.'],
    examples: ['Merge sort', 'Skyline problem', 'Count smaller elements after self'],
  },
  {
    number: 32,
    title: 'Line Sweep',
    category: 'Advanced techniques',
    coreIdea: 'Convert geometric or time intervals into sorted events along one axis. Move through events in order while maintaining the state that is currently active.',
    signals: ['Overlapping events', 'Maximum simultaneous activity', 'Rectangle union area', 'Calendar timeline', 'Start and end events'],
    complexity: 'Typically O(n log n) from sorting, with possible additional costs for advanced active-set structures.',
    question: 'Can I reduce the problem to what changes at each sorted coordinate or time?',
    reasoning: ['Create start and end events, sort them, and update active state between adjacent event positions.', 'For two-dimensional geometry, sweeping one axis often requires another structure to summarize coverage on the second axis.'],
    mistakes: ['Using the wrong order for events sharing the same coordinate.', 'Inconsistently counting before versus after an event is applied.'],
    examples: ['Maximum concurrent events', 'Union area of rectangles', 'Calendar overlap'],
  },
  {
    number: 33,
    title: 'Greedy',
    category: 'Advanced techniques',
    coreIdea: 'Commit to the best local choice only when it can be proven that this choice never prevents an optimal global result. The proof—not the short implementation—is the essential part.',
    signals: ['One-pass optimization after sorting', 'Earliest finish or farthest reach', 'A worse choice can be exchanged for the current choice', 'Need feasibility without enumerating combinations'],
    complexity: 'Often O(n), or O(n log n) when sorting is required.',
    question: 'Why is it safe to commit to this choice without reconsidering it later?',
    reasoning: ['Look for an exchange argument, dominance argument, or invariant proving the greedy choice leaves a remaining problem at least as favorable.', 'Sorting often reveals the correct choice order.'],
    mistakes: ['Calling an intuitive heuristic “greedy” without proving it.', 'Using greedy when decisions interact through future state, which is often a DP signal.'],
    examples: ['Gas station', 'Non-overlapping intervals', 'Minimum arrows to burst balloons'],
  },
  {
    number: 34,
    title: 'Math — Prime Sieve & Number Techniques',
    category: 'Advanced techniques',
    coreIdea: 'Use mathematical structure to avoid checking every candidate independently. The Sieve of Eratosthenes marks multiples to precompute primality efficiently.',
    signals: ['Prime queries', 'Nth prime', 'Divisibility', 'GCD or LCM', 'Modular arithmetic', 'Large numeric constraints'],
    complexity: 'The sieve takes O(n log log n) time and O(n) space.',
    question: 'Can a number property eliminate many candidates at once?',
    reasoning: ['For the sieve, begin with prime candidates and mark multiples of each discovered prime starting at p × p.', 'Account explicitly for overflow and modulo behavior in the implementation language.'],
    mistakes: ['Starting multiple marking at the wrong value.', 'Allowing integer overflow before applying modulo.'],
    examples: ['Prime sieve', 'Nth prime', 'Repeated primality queries'],
    template: `boolean[] isPrime = new boolean[n + 1];
Arrays.fill(isPrime, true);
if (n >= 0) isPrime[0] = false;
if (n >= 1) isPrime[1] = false;

for (int prime = 2; prime * prime <= n; prime++) {
    if (!isPrime[prime]) continue;
    for (int multiple = prime * prime;
            multiple <= n;
            multiple += prime) {
        isPrime[multiple] = false;
    }
}`,
  },
  {
    number: 35,
    title: 'Matrix / Sparse Matrix Techniques',
    category: 'Advanced techniques',
    coreIdea: 'Treat matrix operations according to their structure rather than automatically iterating every possible triple. Sparse matrices are dominated by zeros, so process only non-zero entries whenever possible.',
    signals: ['Two-dimensional arrays', 'Sparse data', 'Matrix multiplication', 'Row or column transformations'],
    complexity: 'Dense multiplication is O(mnk); sparse approaches depend on the number and arrangement of non-zero entries.',
    question: 'Which entries can actually affect the result?',
    reasoning: ['For sparse multiplication, skip work whenever a contributing value is zero.', 'For grid traversal, remember that “matrix as graph” usually calls for BFS or DFS rather than a matrix-specific operation.'],
    mistakes: ['Treating a graph traversal and a matrix operation as interchangeable without examining the required computation.'],
    examples: ['Sparse matrix multiplication', 'Structured row and column transforms'],
  },
]

export const complexityTargets: ReferenceRow[] = [
  { signal: 'n ≤ about 20', pattern: 'Exponential, bitmask, or backtracking may be viable.' },
  { signal: 'n ≤ about 100', pattern: 'O(n³) may be viable, depending on constants.' },
  { signal: 'n ≤ about 1,000', pattern: 'O(n²) may be viable.' },
  { signal: 'n ≤ about 100,000', pattern: 'Usually target O(n log n) or O(n).' },
  { signal: 'n ≥ about 1,000,000', pattern: 'Usually target near O(n), or O(log n) per operation; memory also matters.' },
]

export const keywordMap: ReferenceRow[] = [
  { signal: 'frequency or count occurrences', pattern: 'Hash map or counting array' },
  { signal: 'duplicate or seen before', pattern: 'Hash set' },
  { signal: 'sorted, first occurrence, or minimum feasible', pattern: 'Binary search' },
  { signal: 'pair sum in a sorted array', pattern: 'Opposite-direction two pointers' },
  { signal: 'longest substring or subarray', pattern: 'Sliding window when the range is contiguous and its condition is maintainable' },
  { signal: 'subarray sum with negative values', pattern: 'Prefix sum with a hash map' },
  { signal: 'kth, top k, or repeatedly smallest', pattern: 'Heap' },
  { signal: 'next greater or next smaller', pattern: 'Monotonic stack' },
  { signal: 'all combinations or permutations', pattern: 'Backtracking' },
  { signal: 'tree depth or subtree property', pattern: 'Depth-first search' },
  { signal: 'fewest moves or shortest unweighted path', pattern: 'Breadth-first search' },
  { signal: 'dependencies or prerequisites', pattern: 'Topological sort' },
  { signal: 'weighted shortest path', pattern: 'Dijkstra' },
  { signal: 'connect all with minimum total cost', pattern: 'Minimum spanning tree' },
  { signal: 'connected components with many unions', pattern: 'Union-Find / DSU' },
  { signal: 'prefix or autocomplete', pattern: 'Trie' },
  { signal: 'range query with updates', pattern: 'Segment tree' },
  { signal: 'overlapping intervals', pattern: 'Sorted interval scan or line sweep' },
  { signal: 'ways, minimum cost, or maximum value with repeated subproblems', pattern: 'Dynamic programming' },
  { signal: 'subset capacity or coin change', pattern: 'Knapsack DP' },
  { signal: 'two strings, edit operations, or subsequences', pattern: 'Dual-sequence DP' },
  { signal: 'small n and visit a subset', pattern: 'Bitmask DP' },
  { signal: 'local choice with a safety proof', pattern: 'Greedy' },
]

export const reasoningChecklist = [
  'Restate the input, output, and constraints.',
  'Identify whether order, contiguity, connectivity, or repeated state is the key structure.',
  'State a brute-force approach and its complexity.',
  'Name the pattern that removes the repeated work.',
  'Define the invariant or state before writing code.',
  'Walk a small example through that invariant.',
  'Derive time and space complexity from operations and states—not simply from how nested the code looks.',
  'Check empty and single-element input, duplicates, boundaries, overflow, disconnected graphs, and impossible answers as applicable.',
]
