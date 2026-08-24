import type { CodeLanguage } from '../composables/useCodeLanguagePreference'

type SupplementalLanguage = Exclude<CodeLanguage, 'Java' | 'JavaScript'>

export const cheatSheetCodeSamples: Record<number, Partial<Record<SupplementalLanguage, string>>> = {
  1: {
    TypeScript: `nums.sort((a, b) => a - b)

const frequency = new Map<number, number>()
for (const value of nums) {
  frequency.set(value, (frequency.get(value) ?? 0) + 1)
}

const seen = new Set<number>()
for (const value of nums) {
  if (seen.has(value)) {
    // value is a duplicate
  }
  seen.add(value)
}`,
    Python: `nums.sort()

frequency: dict[int, int] = {}
for value in nums:
    frequency[value] = frequency.get(value, 0) + 1

seen: set[int] = set()
for value in nums:
    if value in seen:
        # value is a duplicate
        pass
    seen.add(value)`,
    'C++': `sort(nums.begin(), nums.end());

unordered_map<int, int> frequency;
for (int value : nums) {
    ++frequency[value];
}

unordered_set<int> seen;
for (int value : nums) {
    if (seen.count(value)) {
        // value is a duplicate
    }
    seen.insert(value);
}`,
    Rust: `nums.sort();

use std::collections::{HashMap, HashSet};
let mut frequency: HashMap<i32, usize> = HashMap::new();
for &value in &nums {
    *frequency.entry(value).or_insert(0) += 1;
}

let mut seen = HashSet::new();
for &value in &nums {
    if !seen.insert(value) {
        // value is a duplicate
    }
}`,
  },
  2: {
    TypeScript: `let left = 0
let right = nums.length - 1

while (left <= right) {
  const mid = left + Math.floor((right - left) / 2)
  if (nums[mid] === target) return mid
  if (nums[mid] < target) left = mid + 1
  else right = mid - 1
}

return -1`,
    Python: `left, right = 0, len(nums) - 1

while left <= right:
    mid = left + (right - left) // 2
    if nums[mid] == target:
        return mid
    if nums[mid] < target:
        left = mid + 1
    else:
        right = mid - 1

return -1`,
    'C++': `int left = 0;
int right = static_cast<int>(nums.size()) - 1;

while (left <= right) {
    int mid = left + (right - left) / 2;
    if (nums[mid] == target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
}

return -1;`,
    Rust: `let mut left = 0usize;
let mut right = nums.len(); // Search [left, right).

while left < right {
    let mid = left + (right - left) / 2;
    if nums[mid] < target {
        left = mid + 1;
    } else {
        right = mid;
    }
}

if left < nums.len() && nums[left] == target {
    Some(left)
} else {
    None
}`,
  },
  3: {
    TypeScript: `let write = 0

for (let read = 0; read < nums.length; read++) {
  if (shouldKeep(nums[read])) {
    nums[write] = nums[read]
    write++
  }
}`,
    Python: `write = 0

for read in range(len(nums)):
    if should_keep(nums[read]):
        nums[write] = nums[read]
        write += 1`,
    'C++': `int write = 0;

for (int read = 0; read < nums.size(); ++read) {
    if (shouldKeep(nums[read])) {
        nums[write++] = nums[read];
    }
}`,
    Rust: `let mut write = 0;

for read in 0..nums.len() {
    if should_keep(nums[read]) {
        nums[write] = nums[read];
        write += 1;
    }
}`,
  },
  4: {
    TypeScript: `let left = 0
let right = nums.length - 1

while (left < right) {
  const value = evaluate(nums[left], nums[right])
  if (isAnswer(value)) break
  if (needLarger(value)) left++
  else right--
}`,
    Python: `left, right = 0, len(nums) - 1

while left < right:
    value = evaluate(nums[left], nums[right])
    if is_answer(value):
        break
    if need_larger(value):
        left += 1
    else:
        right -= 1`,
    'C++': `int left = 0;
int right = nums.size() - 1;

while (left < right) {
    int value = evaluate(nums[left], nums[right]);
    if (isAnswer(value)) break;
    if (needLarger(value)) ++left;
    else --right;
}`,
    Rust: `let mut left = 0;
let mut right = nums.len() - 1;

while left < right {
    let value = evaluate(nums[left], nums[right]);
    if is_answer(value) { break; }
    if need_larger(value) {
        left += 1;
    } else {
        right -= 1;
    }
}`,
  },
  5: {
    TypeScript: `let sum = 0

for (let right = 0; right < nums.length; right++) {
  sum += nums[right]
  if (right >= k) sum -= nums[right - k]
  if (right >= k - 1) {
    // Window is [right - k + 1, right].
  }
}`,
    Python: `window_sum = 0

for right, value in enumerate(nums):
    window_sum += value
    if right >= k:
        window_sum -= nums[right - k]
    if right >= k - 1:
        # Window is [right - k + 1, right].
        pass`,
    'C++': `int sum = 0;

for (int right = 0; right < nums.size(); ++right) {
    sum += nums[right];
    if (right >= k) sum -= nums[right - k];
    if (right >= k - 1) {
        // Window is [right - k + 1, right].
    }
}`,
    Rust: `let mut sum = 0;

for right in 0..nums.len() {
    sum += nums[right];
    if right >= k { sum -= nums[right - k]; }
    if right + 1 >= k {
        // Window is [right + 1 - k, right].
    }
}`,
  },
  6: {
    TypeScript: `let left = 0

for (let right = 0; right < nums.length; right++) {
  addToWindow(nums[right])

  while (windowIsInvalid()) {
    removeFromWindow(nums[left])
    left++
  }

  updateAnswer(right - left + 1)
}`,
    Python: `left = 0

for right, value in enumerate(nums):
    add_to_window(value)

    while window_is_invalid():
        remove_from_window(nums[left])
        left += 1

    update_answer(right - left + 1)`,
    'C++': `int left = 0;

for (int right = 0; right < nums.size(); ++right) {
    addToWindow(nums[right]);

    while (windowIsInvalid()) {
        removeFromWindow(nums[left++]);
    }

    updateAnswer(right - left + 1);
}`,
    Rust: `let mut left = 0;

for right in 0..nums.len() {
    add_to_window(nums[right]);

    while window_is_invalid() {
        remove_from_window(nums[left]);
        left += 1;
    }

    update_answer(right - left + 1);
}`,
  },
  7: {
    TypeScript: `const prefix = new Array(nums.length + 1).fill(0)

for (let index = 0; index < nums.length; index++) {
  prefix[index + 1] = prefix[index] + nums[index]
}

const rangeSum = prefix[right + 1] - prefix[left]`,
    Python: `prefix = [0] * (len(nums) + 1)

for index, value in enumerate(nums):
    prefix[index + 1] = prefix[index] + value

range_sum = prefix[right + 1] - prefix[left]`,
    'C++': `vector<long long> prefix(nums.size() + 1, 0);

for (int i = 0; i < nums.size(); ++i) {
    prefix[i + 1] = prefix[i] + nums[i];
}

long long rangeSum = prefix[right + 1] - prefix[left];`,
    Rust: `let mut prefix = vec![0_i64; nums.len() + 1];

for (index, &value) in nums.iter().enumerate() {
    prefix[index + 1] = prefix[index] + value as i64;
}

let range_sum = prefix[right + 1] - prefix[left];`,
  },
  8: {
    TypeScript: `let slow: ListNode | null = head
let fast: ListNode | null = head

while (fast !== null && fast.next !== null) {
  slow = slow!.next
  fast = fast.next.next
  if (slow === fast) return true
}

return false`,
    Python: `slow = fast = head

while fast is not None and fast.next is not None:
    slow = slow.next
    fast = fast.next.next
    if slow is fast:
        return True

return False`,
    'C++': `ListNode* slow = head;
ListNode* fast = head;

while (fast != nullptr && fast->next != nullptr) {
    slow = slow->next;
    fast = fast->next->next;
    if (slow == fast) return true;
}

return false;`,
    Rust: `let mut slow = head.as_deref();
let mut fast = head.as_deref();

while let Some(fast_node) = fast {
    let Some(next_fast) = fast_node.next.as_deref() else {
        break;
    };
    slow = slow.and_then(|node| node.next.as_deref());
    fast = next_fast.next.as_deref();

    if slow.map(|n| n as *const _) == fast.map(|n| n as *const _) {
        return true;
    }
}

false`,
  },
  9: {
    TypeScript: `function dfs(node: TreeNode | null): number {
  if (node === null) return 0

  const left = dfs(node.left)
  const right = dfs(node.right)

  return 1 + Math.max(left, right)
}`,
    Python: `def dfs(node: TreeNode | None) -> int:
    if node is None:
        return 0

    left = dfs(node.left)
    right = dfs(node.right)

    return 1 + max(left, right)`,
    'C++': `int dfs(TreeNode* node) {
    if (node == nullptr) return 0;

    int left = dfs(node->left);
    int right = dfs(node->right);

    return 1 + max(left, right);
}`,
    Rust: `fn dfs(node: Option<&TreeNode>) -> i32 {
    let Some(node) = node else { return 0 };

    let left = dfs(node.left.as_deref());
    let right = dfs(node.right.as_deref());

    1 + left.max(right)
}`,
  },
  10: {
    TypeScript: `function backtrack(state: State): void {
  if (isComplete(state)) {
    answers.push(copyOf(state))
    return
  }

  for (const choice of choices(state)) {
    apply(choice, state)
    backtrack(state)
    undo(choice, state)
  }
}`,
    Python: `def backtrack(state: State) -> None:
    if is_complete(state):
        answers.append(state.copy())
        return

    for choice in choices(state):
        apply(choice, state)
        backtrack(state)
        undo(choice, state)`,
    'C++': `void backtrack(State& state) {
    if (isComplete(state)) {
        answers.push_back(state);
        return;
    }

    for (const Choice& choice : choices(state)) {
        apply(choice, state);
        backtrack(state);
        undo(choice, state);
    }
}`,
    Rust: `fn backtrack(state: &mut State, answers: &mut Vec<State>) {
    if is_complete(state) {
        answers.push(state.clone());
        return;
    }

    for choice in choices(state) {
        apply(&choice, state);
        backtrack(state, answers);
        undo(&choice, state);
    }
}`,
  },
  11: {
    TypeScript: `const queue: Node[] = [start]
const seen = new Set<Node>([start])
let head = 0
let steps = 0

while (head < queue.length) {
  const levelEnd = queue.length
  while (head < levelEnd) {
    const current = queue[head++]
    for (const neighbor of current.neighbors) {
      if (!seen.has(neighbor)) {
        seen.add(neighbor)
        queue.push(neighbor)
      }
    }
  }
  steps++
}`,
    Python: `from collections import deque

queue = deque([start])
seen = {start}
steps = 0

while queue:
    for _ in range(len(queue)):
        current = queue.popleft()
        for neighbor in current.neighbors:
            if neighbor not in seen:
                seen.add(neighbor)
                queue.append(neighbor)
    steps += 1`,
    'C++': `queue<Node*> frontier;
unordered_set<Node*> seen;
frontier.push(start);
seen.insert(start);
int steps = 0;

while (!frontier.empty()) {
    int levelSize = frontier.size();
    while (levelSize-- > 0) {
        Node* current = frontier.front();
        frontier.pop();
        for (Node* neighbor : current->neighbors) {
            if (seen.insert(neighbor).second) {
                frontier.push(neighbor);
            }
        }
    }
    ++steps;
}`,
    Rust: `use std::collections::{HashSet, VecDeque};

let mut queue = VecDeque::from([start]);
let mut seen = HashSet::from([start]);
let mut steps = 0;

while !queue.is_empty() {
    let level_size = queue.len();
    for _ in 0..level_size {
        let current = queue.pop_front().unwrap();
        for neighbor in graph.neighbors(current) {
            if seen.insert(neighbor) {
                queue.push_back(neighbor);
            }
        }
    }
    steps += 1;
}`,
  },
  13: {
    TypeScript: `const queue: number[] = []
for (let node = 0; node < n; node++) {
  if (indegree[node] === 0) queue.push(node)
}

const order: number[] = []
let head = 0
while (head < queue.length) {
  const node = queue[head++]
  order.push(node)
  for (const neighbor of graph[node]) {
    indegree[neighbor]--
    if (indegree[neighbor] === 0) queue.push(neighbor)
  }
}

// order.length === n if and only if the graph has no cycle.`,
    Python: `from collections import deque

queue = deque(node for node in range(n) if indegree[node] == 0)
order: list[int] = []

while queue:
    node = queue.popleft()
    order.append(node)
    for neighbor in graph[node]:
        indegree[neighbor] -= 1
        if indegree[neighbor] == 0:
            queue.append(neighbor)

# len(order) == n if and only if the graph has no cycle.`,
    'C++': `queue<int> frontier;
for (int node = 0; node < n; ++node) {
    if (indegree[node] == 0) frontier.push(node);
}

vector<int> order;
while (!frontier.empty()) {
    int node = frontier.front();
    frontier.pop();
    order.push_back(node);
    for (int neighbor : graph[node]) {
        if (--indegree[neighbor] == 0) frontier.push(neighbor);
    }
}

// order.size() == n if and only if the graph has no cycle.`,
    Rust: `use std::collections::VecDeque;

let mut queue: VecDeque<usize> = (0..n)
    .filter(|&node| indegree[node] == 0)
    .collect();
let mut order = Vec::new();

while let Some(node) = queue.pop_front() {
    order.push(node);
    for &neighbor in &graph[node] {
        indegree[neighbor] -= 1;
        if indegree[neighbor] == 0 {
            queue.push_back(neighbor);
        }
    }
}

// order.len() == n if and only if the graph has no cycle.`,
  },
  14: {
    TypeScript: `const distance = new Array(n).fill(Infinity)
distance[start] = 0
const heap = new MinPriorityQueue<[number, number]>(
  ([cost]) => cost
)
heap.push([0, start])

while (!heap.isEmpty()) {
  const [cost, node] = heap.pop()
  if (cost !== distance[node]) continue

  for (const edge of graph[node]) {
    const nextCost = cost + edge.weight
    if (nextCost < distance[edge.to]) {
      distance[edge.to] = nextCost
      heap.push([nextCost, edge.to])
    }
  }
}`,
    Python: `import heapq

distance = [float("inf")] * n
distance[start] = 0
heap = [(0, start)]

while heap:
    cost, node = heapq.heappop(heap)
    if cost != distance[node]:
        continue

    for neighbor, weight in graph[node]:
        next_cost = cost + weight
        if next_cost < distance[neighbor]:
            distance[neighbor] = next_cost
            heapq.heappush(heap, (next_cost, neighbor))`,
    'C++': `using Entry = pair<long long, int>;
priority_queue<Entry, vector<Entry>, greater<Entry>> heap;
vector<long long> distance(n, LLONG_MAX);
distance[start] = 0;
heap.push({0, start});

while (!heap.empty()) {
    auto [cost, node] = heap.top();
    heap.pop();
    if (cost != distance[node]) continue;

    for (auto [neighbor, weight] : graph[node]) {
        long long nextCost = cost + weight;
        if (nextCost < distance[neighbor]) {
            distance[neighbor] = nextCost;
            heap.push({nextCost, neighbor});
        }
    }
}`,
    Rust: `use std::cmp::Reverse;
use std::collections::BinaryHeap;

let mut distance = vec![i64::MAX; n];
let mut heap = BinaryHeap::new();
distance[start] = 0;
heap.push(Reverse((0_i64, start)));

while let Some(Reverse((cost, node))) = heap.pop() {
    if cost != distance[node] { continue; }

    for &(neighbor, weight) in &graph[node] {
        let next_cost = cost + weight;
        if next_cost < distance[neighbor] {
            distance[neighbor] = next_cost;
            heap.push(Reverse((next_cost, neighbor)));
        }
    }
}`,
  },
  16: {
    TypeScript: `const minHeap = new MinPriorityQueue<number>()

for (const value of nums) {
  minHeap.push(value)
  if (minHeap.size() > k) minHeap.pop()
}

// The root is the kth-largest value after the complete scan.
return minHeap.peek()`,
    Python: `import heapq

min_heap: list[int] = []
for value in nums:
    heapq.heappush(min_heap, value)
    if len(min_heap) > k:
        heapq.heappop(min_heap)

# The root is the kth-largest value after the complete scan.
return min_heap[0]`,
    'C++': `priority_queue<int, vector<int>, greater<int>> minHeap;

for (int value : nums) {
    minHeap.push(value);
    if (minHeap.size() > k) minHeap.pop();
}

// The root is the kth-largest value after the complete scan.
return minHeap.top();`,
    Rust: `use std::cmp::Reverse;
use std::collections::BinaryHeap;

let mut min_heap = BinaryHeap::new();
for &value in &nums {
    min_heap.push(Reverse(value));
    if min_heap.len() > k {
        min_heap.pop();
    }
}

// The root is the kth-largest value after the complete scan.
min_heap.peek().unwrap().0`,
  },
  17: {
    TypeScript: `const memo = new Map<string, number>()

function solve(state: State): number {
  if (isBaseCase(state)) return baseValue(state)

  const key = serialize(state)
  const cached = memo.get(key)
  if (cached !== undefined) return cached

  const answer = combineSubproblems(state)
  memo.set(key, answer)
  return answer
}`,
    Python: `from functools import cache

@cache
def solve(state: State) -> int:
    if is_base_case(state):
        return base_value(state)

    return combine_subproblems(state)`,
    'C++': `unordered_map<State, int, StateHash> memo;

int solve(const State& state) {
    if (isBaseCase(state)) return baseValue(state);
    if (memo.count(state)) return memo[state];

    int answer = combineSubproblems(state);
    memo[state] = answer;
    return answer;
}`,
    Rust: `use std::collections::HashMap;

fn solve(state: State, memo: &mut HashMap<State, i32>) -> i32 {
    if is_base_case(&state) {
        return base_value(&state);
    }
    if let Some(&answer) = memo.get(&state) {
        return answer;
    }

    let answer = combine_subproblems(&state, memo);
    memo.insert(state, answer);
    answer
}`,
  },
  22: {
    TypeScript: `const dp = new Array(target + 1).fill(false)
dp[0] = true

for (const value of nums) {
  for (let sum = target; sum >= value; sum--) {
    // Backward iteration uses each value at most once.
    dp[sum] ||= dp[sum - value]
  }
}`,
    Python: `dp = [False] * (target + 1)
dp[0] = True

for value in nums:
    for total in range(target, value - 1, -1):
        # Backward iteration uses each value at most once.
        dp[total] = dp[total] or dp[total - value]`,
    'C++': `vector<bool> dp(target + 1, false);
dp[0] = true;

for (int value : nums) {
    for (int sum = target; sum >= value; --sum) {
        // Backward iteration uses each value at most once.
        dp[sum] = dp[sum] || dp[sum - value];
    }
}`,
    Rust: `let mut dp = vec![false; target + 1];
dp[0] = true;

for &value in &nums {
    for sum in (value..=target).rev() {
        // Backward iteration uses each value at most once.
        dp[sum] = dp[sum] || dp[sum - value];
    }
}`,
  },
  24: {
    TypeScript: `function find(node: number): number {
  if (parent[node] !== node) {
    parent[node] = find(parent[node])
  }
  return parent[node]
}

function union(a: number, b: number): boolean {
  let rootA = find(a)
  let rootB = find(b)
  if (rootA === rootB) return false

  if (size[rootA] < size[rootB]) [rootA, rootB] = [rootB, rootA]
  parent[rootB] = rootA
  size[rootA] += size[rootB]
  return true
}`,
    Python: `def find(node: int) -> int:
    if parent[node] != node:
        parent[node] = find(parent[node])
    return parent[node]

def union(a: int, b: int) -> bool:
    root_a, root_b = find(a), find(b)
    if root_a == root_b:
        return False

    if size[root_a] < size[root_b]:
        root_a, root_b = root_b, root_a
    parent[root_b] = root_a
    size[root_a] += size[root_b]
    return True`,
    'C++': `int find(int node) {
    if (parent[node] != node) {
        parent[node] = find(parent[node]);
    }
    return parent[node];
}

bool unite(int a, int b) {
    int rootA = find(a), rootB = find(b);
    if (rootA == rootB) return false;

    if (size[rootA] < size[rootB]) swap(rootA, rootB);
    parent[rootB] = rootA;
    size[rootA] += size[rootB];
    return true;
}`,
    Rust: `fn find(node: usize, parent: &mut [usize]) -> usize {
    if parent[node] != node {
        parent[node] = find(parent[node], parent);
    }
    parent[node]
}

fn union(a: usize, b: usize, parent: &mut [usize], size: &mut [usize]) -> bool {
    let mut root_a = find(a, parent);
    let mut root_b = find(b, parent);
    if root_a == root_b { return false; }

    if size[root_a] < size[root_b] {
        std::mem::swap(&mut root_a, &mut root_b);
    }
    parent[root_b] = root_a;
    size[root_a] += size[root_b];
    true
}`,
  },
  25: {
    TypeScript: `class TrieNode {
  children = new Map<string, TrieNode>()
  isWord = false
}

function insert(word: string): void {
  let current = root
  for (const character of word) {
    if (!current.children.has(character)) {
      current.children.set(character, new TrieNode())
    }
    current = current.children.get(character)!
  }
  current.isWord = true
}`,
    Python: `class TrieNode:
    def __init__(self) -> None:
        self.children: dict[str, TrieNode] = {}
        self.is_word = False

def insert(word: str) -> None:
    current = root
    for character in word:
        current = current.children.setdefault(character, TrieNode())
    current.is_word = True`,
    'C++': `struct TrieNode {
    unordered_map<char, unique_ptr<TrieNode>> children;
    bool isWord = false;
};

void insert(const string& word) {
    TrieNode* current = root.get();
    for (char character : word) {
        auto& child = current->children[character];
        if (!child) child = make_unique<TrieNode>();
        current = child.get();
    }
    current->isWord = true;
}`,
    Rust: `use std::collections::HashMap;

#[derive(Default)]
struct TrieNode {
    children: HashMap<char, TrieNode>,
    is_word: bool,
}

fn insert(root: &mut TrieNode, word: &str) {
    let mut current = root;
    for character in word.chars() {
        current = current.children.entry(character).or_default();
    }
    current.is_word = true;
}`,
  },
  29: {
    TypeScript: `const stack: string[] = []

for (const character of text) {
  if (isOpening(character)) {
    stack.push(character)
  } else {
    const opening = stack.pop()
    if (opening === undefined || !matches(opening, character)) {
      return false
    }
  }
}

return stack.length === 0`,
    Python: `stack: list[str] = []

for character in text:
    if is_opening(character):
        stack.append(character)
    else:
        if not stack:
            return False
        opening = stack.pop()
        if not matches(opening, character):
            return False

return not stack`,
    'C++': `stack<char> openings;

for (char character : text) {
    if (isOpening(character)) {
        openings.push(character);
    } else {
        if (openings.empty()) return false;
        char opening = openings.top();
        openings.pop();
        if (!matches(opening, character)) return false;
    }
}

return openings.empty();`,
    Rust: `let mut stack = Vec::new();

for character in text.chars() {
    if is_opening(character) {
        stack.push(character);
    } else {
        let Some(opening) = stack.pop() else {
            return false;
        };
        if !matches(opening, character) { return false; }
    }
}

stack.is_empty()`,
  },
  30: {
    TypeScript: `const stack: number[] = []

for (let index = 0; index < nums.length; index++) {
  while (
    stack.length > 0
    && nums[stack[stack.length - 1]] < nums[index]
  ) {
    const previous = stack.pop()!
    // nums[index] is next greater for nums[previous].
  }
  stack.push(index)
}`,
    Python: `stack: list[int] = []

for index, value in enumerate(nums):
    while stack and nums[stack[-1]] < value:
        previous = stack.pop()
        # value is next greater for nums[previous].
    stack.append(index)`,
    'C++': `vector<int> stack;

for (int index = 0; index < nums.size(); ++index) {
    while (!stack.empty() && nums[stack.back()] < nums[index]) {
        int previous = stack.back();
        stack.pop_back();
        // nums[index] is next greater for nums[previous].
    }
    stack.push_back(index);
}`,
    Rust: `let mut stack: Vec<usize> = Vec::new();

for index in 0..nums.len() {
    while stack.last().is_some_and(|&previous| nums[previous] < nums[index]) {
        let previous = stack.pop().unwrap();
        // nums[index] is next greater for nums[previous].
    }
    stack.push(index);
}`,
  },
  34: {
    TypeScript: `const isPrime = new Array(n + 1).fill(true)
if (n >= 0) isPrime[0] = false
if (n >= 1) isPrime[1] = false

for (let prime = 2; prime * prime <= n; prime++) {
  if (!isPrime[prime]) continue
  for (let multiple = prime * prime; multiple <= n; multiple += prime) {
    isPrime[multiple] = false
  }
}`,
    Python: `is_prime = [True] * (n + 1)
if n >= 0:
    is_prime[0] = False
if n >= 1:
    is_prime[1] = False

for prime in range(2, int(n**0.5) + 1):
    if not is_prime[prime]:
        continue
    for multiple in range(prime * prime, n + 1, prime):
        is_prime[multiple] = False`,
    'C++': `vector<bool> isPrime(n + 1, true);
if (n >= 0) isPrime[0] = false;
if (n >= 1) isPrime[1] = false;

for (int prime = 2; prime * prime <= n; ++prime) {
    if (!isPrime[prime]) continue;
    for (int multiple = prime * prime;
         multiple <= n;
         multiple += prime) {
        isPrime[multiple] = false;
    }
}`,
    Rust: `let mut is_prime = vec![true; n + 1];
is_prime[0] = false;
if n >= 1 { is_prime[1] = false; }

let mut prime = 2;
while prime * prime <= n {
    if is_prime[prime] {
        let mut multiple = prime * prime;
        while multiple <= n {
            is_prime[multiple] = false;
            multiple += prime;
        }
    }
    prime += 1;
}`,
  },
}
