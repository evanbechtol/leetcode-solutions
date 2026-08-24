import type { LessonDeepDive } from './lessons'

export const patternDeepDives: Record<string, LessonDeepDive> = {
  'two-pointers': {
    title: 'Two pointers from first principles',
    introduction: [
      'Two pointers is a traversal technique, not a data structure. Two indexes or node references describe the portion of the input still under consideration. A rule moves one or both pointers while preserving an invariant that proves discarded positions cannot be needed later.',
      'Opposite-end pointers usually require sorted data or a symmetric comparison: one starts at each boundary and the pair moves inward. Same-direction pointers separate a read position from a write position, or a slow state from a faster probe. Fast/slow pointers use different speeds to reveal distance, middles, or cycles.',
      'The technique is only valid when pointer movement has a monotonic justification. In sorted Two Sum, a sum that is too small can only increase by moving left rightward. On an unsorted array that reasoning is false; a hash map or sorting step is needed instead.',
    ],
    facts: [
      { value: 'O(n)', label: 'typical single pass' }, { value: 'O(1)', label: 'extra pointer space' },
      { value: '2', label: 'coordinated positions' }, { value: 'invariant', label: 'movement proof' },
    ],
    models: [
      {
        title: 'Opposite ends', description: 'Pointers bound the unresolved region and move inward.',
        items: [{ label: 'left', value: '1', tone: 'primary' }, { label: 'inside', value: '3' }, { label: 'inside', value: '6' }, { label: 'right', value: '10', tone: 'secondary' }],
        note: 'Sorted order lets one comparison prove which boundary cannot participate in an answer.',
      },
      {
        title: 'Read and write', description: 'read inspects every item; write marks where the next retained item belongs.',
        items: [{ label: 'kept 0', value: '1', tone: 'primary' }, { label: 'write', value: '?' , tone: 'accent' }, { label: 'read', value: '2', tone: 'secondary' }, { label: 'unread', value: '2' }],
        note: 'The prefix before write is finalized and never needs revisiting.',
      },
    ],
    vocabulary: [
      { term: 'Pointer', definition: 'An index or node reference identifying a current position.' },
      { term: 'Invariant', definition: 'A statement true before and after every iteration that proves progress and correctness.' },
      { term: 'Unresolved region', definition: 'Input positions between or ahead of the pointers that may still affect the answer.' },
      { term: 'Opposite-direction', definition: 'Pointers begin at different ends and move toward each other.' },
      { term: 'Same-direction', definition: 'Pointers move forward, often with different roles or speeds.' },
      { term: 'Read pointer', definition: 'Examines each input item and decides whether or how it should be retained.' },
      { term: 'Write pointer', definition: 'Marks the destination for the next accepted item in an in-place transformation.' },
      { term: 'Fast / slow', definition: 'Pointers advance at different rates to encode relative distance.' },
      { term: 'Sorted prerequisite', definition: 'Ordering that makes pointer movement eliminate candidates safely.' },
      { term: 'In place', definition: 'Produces the result by overwriting input slots using O(1) auxiliary space.' },
      { term: 'Convergence', definition: 'A measure such as right - left strictly shrinks, guaranteeing termination.' },
      { term: 'Dominated choice', definition: 'A boundary that cannot beat or satisfy the current result and can be discarded.' },
    ],
    representations: [
      {
        title: 'Closed interval [left, right]', bestFor: 'Opposite-end search',
        description: 'Both boundary positions remain candidates. Continue while left < right for pairs or left ≤ right when one position can answer.',
        code: `let left = 0
let right = values.length - 1
while (left < right) {
  // inspect values[left] and values[right]
}`,
      },
      {
        title: 'Read/write prefix', bestFor: 'In-place compaction',
        description: 'Indexes below write hold the finalized output. read scans the remaining input exactly once.',
        code: `let write = 0
for (let read = 0; read < values.length; read++) {
  if (keep(values[read])) values[write++] = values[read]
}`,
      },
      {
        title: 'Fast/slow references', bestFor: 'Linked lists and cycle structure',
        description: 'References move without indexing. Always guard the fast pointer before taking two next steps.',
        code: `let slow = head, fast = head
while (fast && fast.next) {
  slow = slow!.next
  fast = fast.next.next
}`,
      },
    ],
    algorithms: [
      {
        title: 'Two Sum in a sorted array', label: 'Move the boundary that can fix the sum',
        summary: 'Use the smallest and largest remaining values. If their sum is too small, the left value cannot pair with anything remaining—the current right value was already the largest—so increment left. If too large, decrement right by symmetric reasoning.',
        invariant: 'If a valid pair exists, at least one valid pair remains inside the inclusive interval [left, right]. Every discarded boundary has been proven unable to participate.',
        useWhen: 'The input is sorted and the question asks for a pair satisfying a target or comparison.',
        example: [
          'values = [1, 2, 4, 6, 10], target = 8. left = 0 (1), right = 4 (10).',
          'Iteration 1: sum = 1 + 10 = 11, which is too large. Pairing 10 with any value to the right of 1 is also at least 11, so 10 cannot work. right becomes 3.',
          'Iteration 2: left value 1, right value 6, sum = 7, too small. Pairing 1 with any remaining value no larger than 6 is at most 7, so 1 cannot work. left becomes 1.',
          'Iteration 3: values[1] + values[3] = 2 + 6 = 8. Return indexes [1, 3].',
        ],
        code: `function twoSumSorted(values: number[], target: number) {
  let left = 0, right = values.length - 1
  while (left < right) {
    const sum = values[left] + values[right]
    if (sum === target) return [left, right]
    if (sum < target) left++
    else right--
  }
  return []
}`,
        complexity: 'O(n) time because each pointer moves at most n positions; O(1) auxiliary space.',
      },
      {
        title: 'Remove duplicates from a sorted array', label: 'Read every value, write each new value once',
        summary: 'Sorted order groups duplicates together. The write prefix contains one copy of every distinct value seen. When read finds a value different from the last retained value, copy it into the write position and advance write.',
        invariant: 'Before each read iteration, values[0..write-1] contains exactly one copy of every distinct value in the processed prefix, in sorted order.',
        useWhen: 'Compacting sorted arrays in place, filtering values, or partitioning while preserving order.',
        example: [
          'values = [1, 1, 2, 2, 2, 3]. Keep index 0 by default; write = 1.',
          'read = 1, value 1 equals last retained values[0] = 1. Skip it; write stays 1.',
          'read = 2, value 2 differs from values[0]. Write values[1] = 2; increment write to 2. Finalized prefix is [1, 2].',
          'read = 3 and 4 both hold 2, equal to values[write - 1] = values[1]. Skip both.',
          'read = 5 holds 3, which is new. Write values[2] = 3; write becomes 3.',
          'Return length 3. Only values[0..2] matter: [1, 2, 3]. Slots after index 2 are unspecified.',
        ],
        code: `function removeDuplicates(values: number[]): number {
  if (!values.length) return 0
  let write = 1

  for (let read = 1; read < values.length; read++) {
    if (values[read] !== values[write - 1]) {
      values[write] = values[read]
      write++
    }
  }
  return write
}`,
        complexity: 'O(n) time and O(1) space. Each element is read once and each distinct value is written at most once.',
      },
      {
        title: 'Container With Most Water', label: 'Discard the limiting wall',
        summary: 'Area equals width × min(leftHeight, rightHeight). Moving the taller wall inward always reduces width while the shorter wall still limits height, so it cannot improve area. Only moving the shorter wall might find a taller limiting boundary.',
        invariant: 'best is the largest area among every discarded boundary pair. Moving the shorter side cannot discard an unseen better pair using that same boundary.',
        useWhen: 'A score combines distance between two positions with a value limited by the weaker boundary.',
        example: [
          'heights = [1,8,6,2,5,4,8,3,7]. left = 0, right = 8. Area = 8 × min(1,7) = 8; best = 8. Move left because height 1 limits.',
          'left = 1 (8), right = 8 (7). Area = 7 × 7 = 49; best = 49. Move right because 7 is shorter.',
          'right = 7 (3). Area = 6 × 3 = 18. Move right.',
          'right = 6 (8). Area = 5 × 8 = 40. Heights tie; moving either side is safe. Move left.',
          'left = 2 (6), right = 6 (8). Area = 4 × 6 = 24. Move left.',
          'Remaining areas are 6, 10, and 4, none exceeding 49. Pointers meet; return 49.',
        ],
        code: `function maxArea(height: number[]): number {
  let left = 0, right = height.length - 1, best = 0
  while (left < right) {
    best = Math.max(best, (right - left) * Math.min(height[left], height[right]))
    if (height[left] <= height[right]) left++
    else right--
  }
  return best
}`,
        complexity: 'O(n) time and O(1) space. The proof depends on area being limited by the shorter boundary.',
      },
    ],
  },

  'sliding-window': {
    title: 'Sliding windows from first principles',
    introduction: [
      'A sliding window represents one contiguous range [left, right] of an array or string. Instead of recomputing information for every possible range, update state when the right boundary admits an element and when the left boundary removes one.',
      'A fixed-size window has a prescribed length k: grow to k, evaluate, then add one and remove one per step. A variable-size window expands right and shrinks left until a validity condition is restored. Variable windows require a monotone condition—moving left forward must be able to repair invalidity.',
      'The window state might be a sum, distinct count, frequency map, or monotonic deque. State must describe exactly the current range. If removed values are not subtracted or decremented, the state silently describes the entire prefix instead.',
      'Sliding window is for contiguous subarrays or substrings. It does not enumerate non-contiguous subsequences. With negative values, sum-based validity may stop being monotone, so prefix sums or another method may be required.',
    ],
    facts: [
      { value: '[L, R]', label: 'current contiguous range' }, { value: 'O(n)', label: 'typical traversal' },
      { value: 'add/remove', label: 'incremental state' }, { value: 'monotone', label: 'shrink condition' },
    ],
    models: [
      {
        title: 'Fixed window of length 3', description: 'Exactly three adjacent values contribute at a time.',
        items: [{ label: 'outside', value: '2' }, { label: 'L', value: '1', tone: 'primary' }, { label: 'inside', value: '5', tone: 'primary' }, { label: 'R', value: '1', tone: 'primary' }, { label: 'next', value: '3', tone: 'accent' }],
        note: 'Sliding right removes 1 at L and adds 3 at the new R; the middle values stay.',
      },
      {
        title: 'Variable valid window', description: 'right explores; left repairs the constraint when necessary.',
        items: [{ label: 'discarded', value: 'a' }, { label: 'L', value: 'b', tone: 'primary' }, { label: 'inside', value: 'c', tone: 'primary' }, { label: 'R', value: 'a', tone: 'secondary' }],
        note: 'Every boundary moves only forward, which is the source of linear time.',
      },
    ],
    vocabulary: [
      { term: 'Window', definition: 'The contiguous range currently summarized by algorithm state.' },
      { term: 'Left / right', definition: 'Inclusive boundaries of the active range in this lesson’s convention.' },
      { term: 'Fixed-size', definition: 'Window length is prescribed, so every evaluation uses exactly k elements.' },
      { term: 'Variable-size', definition: 'Window length changes to maintain or seek a validity condition.' },
      { term: 'Expand', definition: 'Move right forward and add its value to window state.' },
      { term: 'Shrink', definition: 'Remove the left value from state, then increment left.' },
      { term: 'Validity', definition: 'Condition the active window must satisfy, such as at most k distinct values.' },
      { term: 'Frequency state', definition: 'Counts of values inside the window only; zero-count keys should be removed when distinct count matters.' },
      { term: 'Monotone condition', definition: 'A violation that can be repaired predictably by moving left forward.' },
      { term: 'Contiguous', definition: 'Every index between left and right is included—no gaps.' },
      { term: 'Best-so-far', definition: 'Answer updated only when the current window is eligible for the requested objective.' },
      { term: 'Amortized linear', definition: 'Nested while loops remain O(n) because each boundary advances at most n times.' },
    ],
    representations: [
      {
        title: 'Running aggregate', bestFor: 'Sums and counts over fixed windows',
        description: 'Add the entering value and subtract the leaving value. Recomputing the whole window would add a factor of k.',
        code: `sum += values[right]
if (right >= k) sum -= values[right - k]
if (right >= k - 1) best = Math.max(best, sum)`,
      },
      {
        title: 'Frequency map', bestFor: 'Distinctness and occurrence constraints',
        description: 'Counts must mirror the current range. Delete keys at zero when map.size represents the number of distinct values.',
        code: `frequency.set(char, (frequency.get(char) ?? 0) + 1)
// when removing left:
frequency.set(leftChar, frequency.get(leftChar)! - 1)
if (frequency.get(leftChar) === 0) frequency.delete(leftChar)`,
      },
      {
        title: 'Last-seen jump', bestFor: 'No-duplicate substring windows',
        description: 'A map of latest indexes can jump left past a duplicate. Math.max prevents left from moving backward for an old occurrence.',
        code: `const previous = lastSeen.get(char)
if (previous !== undefined) left = Math.max(left, previous + 1)
lastSeen.set(char, right)`,
      },
    ],
    algorithms: [
      {
        title: 'Maximum sum of a fixed-size subarray', label: 'Add one, remove one',
        summary: 'Build a running sum. Once the range would exceed k, subtract the value that just fell out. Evaluate only after the window reaches exactly k elements.',
        invariant: 'After the optional removal at index right, sum equals the total of values[max(0, right-k+1)..right].',
        useWhen: 'The problem asks for an aggregate over every contiguous range of an exact length.',
        example: [
          'values = [2,1,5,1,3,2], k = 3. sum = 0, best = -∞.',
          'right = 0: add 2 → sum 2. Window length 1, so do not evaluate.',
          'right = 1: add 1 → sum 3. Length 2, still not ready.',
          'right = 2: add 5 → sum 8 for [2,1,5]. First full window; best = 8.',
          'right = 3: add 1 → 9, remove values[0] = 2 → sum 7 for [1,5,1]. best remains 8.',
          'right = 4: add 3 → 10, remove values[1] = 1 → sum 9 for [5,1,3]. best = 9.',
          'right = 5: add 2 → 11, remove values[2] = 5 → sum 6. Return best 9.',
        ],
        code: `function maxWindowSum(values: number[], k: number): number {
  if (k <= 0 || k > values.length) throw new Error('invalid k')
  let sum = 0, best = -Infinity
  for (let right = 0; right < values.length; right++) {
    sum += values[right]
    if (right >= k) sum -= values[right - k]
    if (right >= k - 1) best = Math.max(best, sum)
  }
  return best
}`,
        complexity: 'O(n) time and O(1) extra space. Each value is added once and subtracted at most once.',
      },
      {
        title: 'Longest substring without repeating characters', label: 'Jump past the conflicting occurrence',
        summary: 'Track each character’s latest index. If the current character already occurs inside the active window, move left to one position after that occurrence. Never move left backward because an older duplicate outside the window is harmless.',
        invariant: 'Before and after every iteration, text[left..right] contains no duplicate characters, and best is the longest valid window ending at or before right.',
        useWhen: 'Finding a longest contiguous range with uniqueness or another “at most” occurrence rule.',
        example: [
          'text = “abba”. Start left = 0, lastSeen = {}, best = 0.',
          'right = 0, a unseen. Record a→0. Window “a”, length 1; best = 1.',
          'right = 1, b unseen. Record b→1. Window “ab”, length 2; best = 2.',
          'right = 2, b last seen at 1 inside [0,1]. Set left = max(0, 2) = 2. Record b→2. Window “b”; best stays 2.',
          'right = 3, a was seen at 0, but 0 < left. Set left = max(2, 1) = 2, not backward to 1. Record a→3.',
          'Window is “ba”, length 2. Return best 2.',
        ],
        code: `function longestUnique(text: string): number {
  const lastSeen = new Map<string, number>()
  let left = 0, best = 0

  for (let right = 0; right < text.length; right++) {
    const previous = lastSeen.get(text[right])
    if (previous !== undefined) left = Math.max(left, previous + 1)
    lastSeen.set(text[right], right)
    best = Math.max(best, right - left + 1)
  }
  return best
}`,
        complexity: 'O(n) expected time and O(min(n, alphabet)) space for the last-seen map.',
      },
      {
        title: 'Minimum-length subarray with sum at least target', label: 'Shrink while the answer remains feasible',
        summary: 'For positive values, expanding right never decreases sum and shrinking left never increases it. Whenever sum reaches target, record the length and keep shrinking to find the shortest valid window ending at this right boundary.',
        invariant: 'Before advancing right, every shorter window ending at the previous right that could satisfy target has been evaluated; sum exactly matches [left, right].',
        useWhen: 'All values are positive and the goal is a shortest contiguous range reaching a sum threshold.',
        example: [
          'values = [2,3,1,2,4,3], target = 7. left = 0, sum = 0, best = ∞.',
          'right 0→2: add 2, 3, 1. Sums are 2, 5, 6; none are valid.',
          'right = 3: add 2 → sum 8 for [2,3,1,2], length 4; best = 4. Shrink: subtract 2, left = 1, sum = 6; stop.',
          'right = 4: add 4 → sum 10 for [3,1,2,4], length 4. Shrink 3 → sum 7, left 2; length 3 [1,2,4], best = 3. Shrink 1 → sum 6; stop.',
          'right = 5: add 3 → sum 9 for [2,4,3], length 3. Shrink 2 → sum 7, left 4; window [4,3], length 2; best = 2.',
          'Shrink 4 → sum 3, then stop. Return 2. This method would not be valid with arbitrary negative values.',
        ],
        code: `function minSubarrayLength(values: number[], target: number): number {
  let left = 0, sum = 0, best = Infinity
  for (let right = 0; right < values.length; right++) {
    sum += values[right]
    while (sum >= target) {
      best = Math.min(best, right - left + 1)
      sum -= values[left++]
    }
  }
  return best === Infinity ? 0 : best
}`,
        complexity: 'O(n) time despite the nested while loop: right advances n times and left advances at most n times. Space is O(1).',
      },
    ],
  },

  'binary-search': {
    title: 'Binary search from first principles',
    introduction: [
      'Binary search repeatedly halves an ordered search space. It is not limited to finding a value in a sorted array: it applies whenever candidates are ordered by a monotone predicate—once the answer becomes feasible, every later candidate remains feasible, or the reverse.',
      'Correctness comes from an interval invariant. Decide whether boundaries are inclusive [left, right] or half-open [left, right), define exactly what has been discarded, and update bounds without leaving mid eligible twice. Most binary-search bugs are boundary-definition bugs rather than midpoint bugs.',
      'Exact search compares values[mid] with target. Boundary search asks a yes/no question such as values[mid] >= target and finds the first true position. Answer-space search binary-searches a numeric decision such as minimum capacity, using a separate feasibility function.',
    ],
    facts: [
      { value: 'O(log n)', label: 'halving iterations' }, { value: 'sorted', label: 'value-search prerequisite' },
      { value: 'monotone', label: 'predicate prerequisite' }, { value: '[L, R)', label: 'safe boundary form' },
    ],
    models: [
      {
        title: 'One halving step', description: 'A comparison discards an entire side, not just the midpoint.',
        items: [{ label: 'left', value: '1' }, { label: 'candidate', value: '3' }, { label: 'mid', value: '7', tone: 'accent' }, { label: 'candidate', value: '9' }, { label: 'right', value: '12' }],
        note: 'If target is larger than 7, every position through mid is impossible because the values are sorted.',
      },
      {
        title: 'Monotone predicate', description: 'Boundary search locates where false changes permanently to true.',
        items: [{ label: '0', value: 'F' }, { label: '1', value: 'F' }, { label: 'boundary', value: 'T', tone: 'primary' }, { label: '3', value: 'T' }, { label: '4', value: 'T' }],
        note: 'If the predicate can switch back to false, binary search cannot safely discard half.',
      },
    ],
    vocabulary: [
      { term: 'Search space', definition: 'Ordered set of candidates that may contain the answer.' },
      { term: 'Midpoint', definition: 'Candidate used to decide which half can be discarded.' },
      { term: 'Monotone predicate', definition: 'Boolean condition whose results change direction at most once.' },
      { term: 'Closed interval', definition: '[left, right], where both boundaries remain possible candidates.' },
      { term: 'Half-open interval', definition: '[left, right), where left is included and right is excluded.' },
      { term: 'Lower bound', definition: 'First position whose value is greater than or equal to target.' },
      { term: 'Upper bound', definition: 'First position whose value is strictly greater than target.' },
      { term: 'First true', definition: 'Generic boundary between false and true predicate results.' },
      { term: 'Feasibility function', definition: 'Tests whether one answer-space candidate satisfies the constraints.' },
      { term: 'Insertion point', definition: 'Index where a target can be inserted without violating sorted order.' },
      { term: 'Overflow-safe mid', definition: 'left + floor((right-left)/2), used where left + right might overflow.' },
      { term: 'Termination measure', definition: 'Interval length strictly decreases each iteration, proving the loop ends.' },
    ],
    representations: [
      {
        title: 'Closed exact search', bestFor: 'Finding one exact value',
        description: 'Both ends are candidates. On a mismatch, exclude mid with mid ± 1. Loop while left ≤ right.',
        code: `let left = 0, right = values.length - 1
while (left <= right) {
  const mid = left + Math.floor((right - left) / 2)
  if (values[mid] < target) left = mid + 1
  else if (values[mid] > target) right = mid - 1
  else return mid
}`,
      },
      {
        title: 'Half-open lower bound', bestFor: 'First true or insertion position',
        description: 'right may equal length. A true mid remains a candidate, so right = mid; a false mid is excluded with left = mid + 1.',
        code: `let left = 0, right = values.length
while (left < right) {
  const mid = left + Math.floor((right - left) / 2)
  if (values[mid] >= target) right = mid
  else left = mid + 1
}
return left`,
      },
      {
        title: 'Binary search on an answer', bestFor: 'Minimum feasible or maximum valid quantity',
        description: 'Candidates are numeric answers rather than indexes. The feasibility test must be monotone and usually performs a linear simulation.',
        code: `while (low < high) {
  const candidate = low + Math.floor((high - low) / 2)
  if (feasible(candidate)) high = candidate
  else low = candidate + 1
}
return low`,
      },
    ],
    algorithms: [
      {
        title: 'Find an exact value', label: 'Closed interval elimination',
        summary: 'Compare target with the middle value. Sorted order proves all values on one side are also too small or too large. Exclude mid after a mismatch because equality was already tested.',
        invariant: 'If target exists, its index lies in the inclusive interval [left, right]. Every index outside has been disproven.',
        useWhen: 'A sorted collection supports random access and any matching position is acceptable.',
        example: [
          'values = [1,3,4,7,9,12,15], target = 9. left = 0, right = 6.',
          'mid = 0 + floor(6/2) = 3; values[3] = 7. Since 7 < 9, indexes 0..3 are too small. Set left = 4.',
          'Interval is [4,6]. mid = 5; values[5] = 12. Since 12 > 9, indexes 5..6 are too large. Set right = 4.',
          'Interval is [4,4]. mid = 4; values[4] = 9. Equality holds; return index 4.',
        ],
        code: `function binarySearch(values: number[], target: number): number {
  let left = 0, right = values.length - 1
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)
    if (values[mid] === target) return mid
    if (values[mid] < target) left = mid + 1
    else right = mid - 1
  }
  return -1
}`,
        complexity: 'O(log n) time and O(1) space. Each unsuccessful comparison cuts the candidate count approximately in half.',
      },
      {
        title: 'Find the first value at least target', label: 'Lower-bound boundary search',
        summary: 'Search [0, n). If values[mid] is large enough, mid might be the first valid index, so retain it by setting right = mid. If too small, mid and everything before it are invalid, so left = mid + 1.',
        invariant: 'Every index below left is known to have value < target; every index at or above right is known to have value ≥ target. Unknown candidates are [left, right).',
        useWhen: 'Finding first/last occurrences, insertion indexes, threshold crossings, or counting values in sorted ranges.',
        example: [
          'values = [1,2,2,2,5], target = 2. Start [left,right) = [0,5).',
          'mid = 2; values[2] = 2 is valid. It may be the first, so retain it: right = 2. Unknown range [0,2).',
          'mid = 1; values[1] = 2 is valid. Retain it: right = 1. Unknown range [0,1).',
          'mid = 0; values[0] = 1 is too small. Exclude it: left = 1.',
          'left equals right at 1. Index 1 is the first value ≥ 2. It is also the insertion point.',
        ],
        code: `function lowerBound(values: number[], target: number): number {
  let left = 0, right = values.length
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2)
    if (values[mid] >= target) right = mid
    else left = mid + 1
  }
  return left
}`,
        complexity: 'O(log n) time and O(1) space. It returns values.length when no value is large enough.',
      },
      {
        title: 'Minimum feasible eating speed', label: 'Binary search the numeric answer',
        summary: 'For a proposed speed, sum ceil(pile / speed) hours. Higher speeds never require more time, so feasibility changes monotonically from false to true. Search for the first feasible speed.',
        invariant: 'All speeds below low are proven infeasible; all speeds at or above high are proven feasible. The minimum feasible speed remains in [low, high].',
        useWhen: 'The prompt asks to minimize a capacity, rate, or maximum load and a candidate can be checked by simulation.',
        example: [
          'piles = [3,6,7,11], h = 8. Speeds range 1..11; low = 1, high = 11.',
          'mid = 6. Hours = ceil(3/6)+ceil(6/6)+ceil(7/6)+ceil(11/6) = 1+1+2+2 = 6. Feasible, so high = 6.',
          'Range [1,6], mid = 3. Hours = 1+2+3+4 = 10. Too slow, so low = 4.',
          'Range [4,6], mid = 5. Hours = 1+2+2+3 = 8. Feasible, so high = 5.',
          'Range [4,5], mid = 4. Hours = 1+2+2+3 = 8. Feasible, so high = 4.',
          'low = high = 4. Return the minimum feasible speed 4.',
        ],
        code: `function minEatingSpeed(piles: number[], h: number): number {
  let low = 1, high = Math.max(...piles)
  const feasible = (speed: number) =>
    piles.reduce((hours, pile) => hours + Math.ceil(pile / speed), 0) <= h

  while (low < high) {
    const mid = low + Math.floor((high - low) / 2)
    if (feasible(mid)) high = mid
    else low = mid + 1
  }
  return low
}`,
        complexity: 'O(n log M) time where M is the largest pile, and O(1) extra space. Each of log M candidates scans n piles.',
      },
    ],
  },

  'graph-traversal': {
    title: 'BFS and DFS from first principles',
    introduction: [
      'Breadth-first search (BFS) and depth-first search (DFS) are systematic ways to visit every reachable state. Both need a frontier of discovered work and a visited rule that prevents cycles. Their difference is frontier order: BFS uses a FIFO queue; DFS uses a LIFO stack or recursion.',
      'BFS explores in nondecreasing number of edges from the start. That makes first discovery a shortest unweighted distance. DFS follows one branch until it ends, then backtracks, which naturally supports path state, subtree answers, component marking, and entry/exit processing.',
      'Mark a node visited when it enters the frontier, not when it leaves. Marking late allows multiple neighbors to enqueue the same node, inflating work and complicating parents. On a tree, a parent parameter can replace visited; on a general graph, cycles require visited state.',
      'Traversal cost is O(V + E) with an adjacency list because each vertex is processed once and each edge entry is inspected once. A grid is an implicit graph: each cell is a vertex and valid neighboring coordinates define edges without building a separate list.',
    ],
    facts: [
      { value: 'queue', label: 'BFS frontier' }, { value: 'stack', label: 'DFS frontier' },
      { value: 'O(V + E)', label: 'full traversal' }, { value: 'visited', label: 'cycle protection' },
    ],
    models: [
      {
        title: 'BFS wavefront', description: 'Oldest discovered nodes leave first, producing layers.',
        items: [{ label: 'distance 0', value: 'A', tone: 'primary' }, { label: 'distance 1', value: 'B · C' }, { label: 'distance 2', value: 'D · E' }, { label: 'distance 3', value: 'F', tone: 'accent' }],
        note: 'The first time F is discovered is through a minimum-edge path.',
      },
      {
        title: 'DFS branch', description: 'Newest discovered node leaves first, so one path grows deeply.',
        items: [{ label: 'start', value: 'A', tone: 'primary' }, { label: 'deeper', value: 'B' }, { label: 'deeper', value: 'D' }, { label: 'dead end', value: 'F', tone: 'secondary' }],
        note: 'After F finishes, DFS backtracks to the most recent node with an unexplored neighbor.',
      },
    ],
    vocabulary: [
      { term: 'Frontier', definition: 'Discovered vertices waiting to be processed.' },
      { term: 'Visited', definition: 'Set or state proving a vertex has already been discovered.' },
      { term: 'Discovery', definition: 'First time a vertex is encountered and marked.' },
      { term: 'Processing', definition: 'Removing a vertex from the frontier and inspecting its outgoing edges.' },
      { term: 'Level', definition: 'Vertices at the same unweighted distance from a BFS source.' },
      { term: 'Parent', definition: 'Vertex from which another was first discovered; parent links reconstruct a path.' },
      { term: 'Backtracking', definition: 'Returning from a completed DFS branch to resume an earlier branch.' },
      { term: 'Recursive DFS', definition: 'Uses the language call stack as the frontier.' },
      { term: 'Iterative DFS', definition: 'Uses an explicit stack and must choose neighbor push order deliberately.' },
      { term: 'Multi-source BFS', definition: 'Seeds the queue with every distance-zero source before traversal.' },
      { term: 'Implicit graph', definition: 'Neighbors are generated from state, as with grid coordinates or word transformations.' },
      { term: 'Shortest unweighted path', definition: 'Path containing the fewest edges; BFS finds it, DFS does not generally.' },
    ],
    representations: [
      {
        title: 'BFS queue records', bestFor: 'Levels, distances, and shortest unweighted paths',
        description: 'Queue a vertex and optionally its distance. A parent array avoids copying whole paths into each queue item.',
        code: `const queue = [start]
let front = 0
visited.add(start)
while (front < queue.length) {
  const node = queue[front++]
  // enqueue each unseen neighbor
}`,
      },
      {
        title: 'Recursive DFS', bestFor: 'Subtree results and entry/exit logic',
        description: 'The active call chain is the current path. Guard recursion depth when the graph can contain a long chain.',
        code: `function dfs(node: number) {
  visited.add(node)
  for (const next of graph[node]) {
    if (!visited.has(next)) dfs(next)
  }
}`,
      },
      {
        title: 'Grid neighbors', bestFor: 'Islands, flood fill, and matrix paths',
        description: 'Generate up/down/left/right coordinates and reject out-of-bounds or blocked cells.',
        code: `const directions = [[1,0], [-1,0], [0,1], [0,-1]]
for (const [dr, dc] of directions) {
  const nextRow = row + dr
  const nextCol = col + dc
}`,
      },
    ],
    algorithms: [
      {
        title: 'BFS shortest path', label: 'Process nodes in distance order',
        summary: 'Seed the queue with the start at distance 0. When processing a node, undiscovered neighbors receive distance + 1 and a parent. Because the queue finishes earlier levels first, no later path can reach that neighbor with fewer edges.',
        invariant: 'Every dequeued node has its final shortest distance; every queued node has been discovered by a shortest path and is ordered no earlier than smaller distances.',
        useWhen: 'Fewest moves, nearest target, minimum transformations, or unweighted graph distance.',
        example: [
          'Edges: A—B, A—C, B—D, C—E, D—F, E—F. Start queue [A], distance(A)=0, visited {A}.',
          'Dequeue A. Discover B and C at distance 1; set both parent = A. queue [B,C].',
          'Dequeue B. A is visited; discover D at distance 2 with parent B. queue [C,D].',
          'Dequeue C. A is visited; discover E at distance 2 with parent C. queue [D,E].',
          'Dequeue D. Discover F at distance 3 with parent D. Mark immediately; queue [E,F].',
          'When E sees F, F is already visited, so it is not enqueued twice. Parent chain F←D←B←A reconstructs a shortest path A→B→D→F.',
        ],
        code: `function bfs(graph: number[][], start: number) {
  const distance = Array(graph.length).fill(-1)
  const parent = Array(graph.length).fill(-1)
  const queue = [start]
  let front = 0
  distance[start] = 0

  while (front < queue.length) {
    const node = queue[front++]
    for (const next of graph[node]) {
      if (distance[next] !== -1) continue
      distance[next] = distance[node] + 1
      parent[next] = node
      queue.push(next)
    }
  }
  return { distance, parent }
}`,
        complexity: 'O(V + E) time and O(V) auxiliary space with an adjacency list. Shortest-path correctness assumes equal edge cost.',
      },
      {
        title: 'Iterative DFS with an explicit stack', label: 'Control depth and visit order',
        summary: 'Pop the newest pending node, then push unseen neighbors. To match a recursive left-to-right traversal, push neighbors in reverse order because the last pushed is processed first. Mark on push to avoid duplicates.',
        invariant: 'Every stack entry is discovered but unprocessed; every visited vertex is either processed or appears exactly once on the stack.',
        useWhen: 'Graphs may be too deep for recursion, or the algorithm needs direct control of pending states.',
        example: [
          'Using the same graph, start stack [A], visited {A}. Neighbor order is B then C.',
          'Pop A → output A. Push neighbors in reverse: C then B. stack [C,B], so B is next.',
          'Pop B → output A,B. Skip visited A; push D. stack [C,D].',
          'Pop D → output A,B,D. Push F. stack [C,F].',
          'Pop F → output A,B,D,F. Push unseen E. stack [C,E].',
          'Pop E, then C. Both remaining connections are already visited. One valid DFS order is A,B,D,F,E,C.',
        ],
        code: `function iterativeDfs(graph: number[][], start: number): number[] {
  const order: number[] = [], stack = [start]
  const visited = new Set([start])

  while (stack.length) {
    const node = stack.pop()!
    order.push(node)
    for (let i = graph[node].length - 1; i >= 0; i--) {
      const next = graph[node][i]
      if (!visited.has(next)) {
        visited.add(next)
        stack.push(next)
      }
    }
  }
  return order
}`,
        complexity: 'O(V + E) time and O(V) space. DFS order can vary with adjacency order while remaining correct.',
      },
      {
        title: 'Count islands with grid DFS', label: 'Treat cells as implicit vertices',
        summary: 'Scan every cell. Each unvisited land cell begins one new island; flood-fill all connected land so no cell in that island starts another count. Mutating land to water can serve as visited state when input mutation is allowed.',
        invariant: 'Before scanning each cell, every earlier land cell has been erased as part of exactly one counted island.',
        useWhen: 'Connected regions, flood fill, perimeter, or components in a matrix.',
        example: [
          'Grid rows are [1100], [1001], [0011]. Start count = 0.',
          'At (0,0), find land. count = 1. DFS erases connected cells (0,0), (0,1), and (1,0).',
          'The scan skips those erased positions. At (1,3), find unvisited land. count = 2.',
          'DFS from (1,3) erases (1,3), (2,3), and (2,2). Diagonal gaps do not connect under four-direction movement.',
          'No land remains. Return 2 islands.',
        ],
        code: `function countIslands(grid: string[][]): number {
  const rows = grid.length, cols = grid[0]?.length ?? 0
  function erase(row: number, col: number) {
    if (row < 0 || row >= rows || col < 0 || col >= cols || grid[row][col] !== '1') return
    grid[row][col] = '0'
    erase(row + 1, col); erase(row - 1, col)
    erase(row, col + 1); erase(row, col - 1)
  }

  let islands = 0
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    if (grid[row][col] === '1') { islands++; erase(row, col) }
  }
  return islands
}`,
        complexity: 'O(rows × cols) time and O(rows × cols) worst-case recursion depth. An explicit queue or stack avoids call-stack limits.',
      },
    ],
  },

  'greedy': {
    title: 'Greedy algorithms from first principles',
    introduction: [
      'A greedy algorithm builds an answer through locally best choices that it never revisits. “Take the largest” is not a definition; the choice rule depends on the structure. Earliest finishing interval, farthest reachable boundary, or cheapest available edge can each be greedy rules in different problems.',
      'Greedy is correct only when a local choice can be proven safe. Common proofs use an exchange argument (replace the first choice of an optimal solution with the greedy choice without making it worse), a staying-ahead argument (the greedy partial solution is never behind any competitor), or a cut property.',
      'Sorting often reveals the safe choice but also contributes O(n log n) time. Greedy state is usually compact because earlier choices are summarized rather than reconsidered. If two different histories with the same apparent state can have different futures, dynamic programming may be required.',
      'Always test the choice rule against small counterexamples. For coin values [1,3,4] and amount 6, taking the largest coin first produces 4+1+1 (three coins), while 3+3 uses two. The familiar greedy coin rule is not valid for arbitrary denominations.',
    ],
    facts: [
      { value: 'local', label: 'choice at each step' }, { value: 'irrevocable', label: 'no backtracking' },
      { value: 'proof', label: 'safety requirement' }, { value: 'O(n log n)', label: 'common sorting cost' },
    ],
    models: [
      {
        title: 'Interval choice', description: 'Finishing earliest leaves the most room for every future interval.',
        items: [{ label: '[1,4]', value: 'end 4' }, { label: '[2,3]', value: 'end 3', tone: 'primary' }, { label: '[3,5]', value: 'end 5' }],
        note: 'Choosing [2,3] cannot reduce the number of later compatible intervals compared with another first choice.',
      },
      {
        title: 'Reachable frontier', description: 'Many starting paths are summarized by the farthest index any can reach.',
        items: [{ label: 'processed', value: '0 · 1' }, { label: 'farthest', value: '4', tone: 'accent' }, { label: 'unneeded detail', value: 'paths' }],
        note: 'The exact path does not matter when all future options depend only on the maximum reachable boundary.',
      },
    ],
    vocabulary: [
      { term: 'Local choice', definition: 'Decision made using current state without enumerating all future completions.' },
      { term: 'Choice property', definition: 'Existence of an optimal solution beginning with the greedy choice.' },
      { term: 'Optimal substructure', definition: 'After a safe choice, the remaining task is an optimal solution to a smaller instance.' },
      { term: 'Exchange argument', definition: 'Transforms an optimal solution to use the greedy choice without worsening it.' },
      { term: 'Staying ahead', definition: 'Shows the greedy partial solution is at least as favorable after every step.' },
      { term: 'Cut property', definition: 'A locally best edge crossing a partition is safe, as in minimum spanning trees.' },
      { term: 'Irrevocable', definition: 'A choice is not undone or reconsidered later.' },
      { term: 'Dominance', definition: 'One partial choice leaves options at least as good as another and can replace it.' },
      { term: 'Canonical ordering', definition: 'Sorting that exposes the next safe choice, such as increasing finish time.' },
      { term: 'Feasible', definition: 'A partial or complete solution satisfying all constraints.' },
      { term: 'Counterexample', definition: 'Small input showing a proposed local rule can block the global optimum.' },
      { term: 'State summary', definition: 'Compact information, such as farthest reach, that makes earlier path details irrelevant.' },
    ],
    representations: [
      {
        title: 'Sort then scan', bestFor: 'Intervals and scheduling',
        description: 'Sorting imposes the order in which safe choices become visible. The scan retains only the last relevant boundary.',
        code: `intervals.sort((a, b) => a[1] - b[1])
let lastEnd = -Infinity
for (const [start, end] of intervals) {
  if (start >= lastEnd) lastEnd = end
}`,
      },
      {
        title: 'Farthest frontier', bestFor: 'Reachability and coverage',
        description: 'Combine all processed possibilities into one maximum boundary; fail only when the next position lies beyond it.',
        code: `let farthest = 0
for (let i = 0; i <= farthest; i++) {
  farthest = Math.max(farthest, i + jump[i])
}`,
      },
      {
        title: 'Greedy proof checklist', bestFor: 'Deciding whether greedy is justified',
        description: 'State the choice, show it preserves feasibility, prove an optimal solution can include it, then reduce to the remaining instance.',
        code: `1. Define the local choice precisely.
2. Prove the choice is safe.
3. Show the remainder has the same structure.
4. Establish base case and termination.
5. Include sorting in complexity.`,
      },
    ],
    algorithms: [
      {
        title: 'Maximum non-overlapping intervals', label: 'Choose the earliest finish',
        summary: 'Sort by finish time and take the first interval compatible with the last choice. An earlier finish leaves at least as much time for every future interval as any later-finishing alternative.',
        invariant: 'chosen is the maximum number of compatible intervals possible among the processed prefix, and lastEnd is no later than the end of an equally large alternative solution.',
        useWhen: 'Selecting the largest compatible schedule or, equivalently, removing the fewest overlaps.',
        example: [
          'Intervals: [1,4], [2,3], [3,5], [0,7], [5,7], [6,9]. Sort by end: [2,3], [1,4], [3,5], [0,7], [5,7], [6,9].',
          'Choose [2,3]. chosen = 1, lastEnd = 3. Any solution’s first interval can be exchanged for this one without ending later.',
          'Inspect [1,4]: start 1 < lastEnd 3, so it overlaps and is rejected.',
          'Inspect [3,5]: start 3 ≥ 3, choose it. chosen = 2, lastEnd = 5.',
          'Reject [0,7] because 0 < 5. Choose [5,7] because 5 ≥ 5. chosen = 3, lastEnd = 7.',
          'Reject [6,9] because 6 < 7. Return 3. The chosen schedule is [2,3], [3,5], [5,7].',
        ],
        code: `function maxNonOverlapping(intervals: number[][]): number {
  intervals.sort((a, b) => a[1] - b[1])
  let chosen = 0, lastEnd = -Infinity

  for (const [start, end] of intervals) {
    if (start >= lastEnd) {
      chosen++
      lastEnd = end
    }
  }
  return chosen
}`,
        complexity: 'O(n log n) time for sorting plus O(n) scanning; O(1) scan state beyond sort implementation storage.',
      },
      {
        title: 'Jump Game reachability', label: 'Keep the farthest reachable boundary',
        summary: 'Every reachable index can extend a shared frontier. If the scan reaches an index beyond farthest, no earlier reachable position could jump there, so failure is final. Otherwise update farthest with i + nums[i].',
        invariant: 'Before processing i, every index through farthest is reachable from 0, and no processed index can reach beyond the current farthest.',
        useWhen: 'Each position grants forward reach and the question asks whether some path exists, not which path.',
        example: [
          'nums = [2,3,1,1,4]. Start farthest = 0.',
          'i = 0 is reachable. Its jump reaches index 0 + 2 = 2; farthest becomes 2.',
          'i = 1 ≤ 2, so it is reachable. It reaches 1 + 3 = 4; farthest becomes 4.',
          'farthest = 4 reaches the final index already, so return true. The algorithm does not need to select an exact jump path.',
          'Counterexample [3,2,1,0,4]: frontier reaches 3 but index 3 adds no reach. When i = 4, i > farthest, proving false.',
        ],
        code: `function canJump(nums: number[]): boolean {
  let farthest = 0
  for (let i = 0; i < nums.length; i++) {
    if (i > farthest) return false
    farthest = Math.max(farthest, i + nums[i])
    if (farthest >= nums.length - 1) return true
  }
  return true
}`,
        complexity: 'O(n) time and O(1) space. Many concrete paths collapse into one dominance statistic: maximum reach.',
      },
      {
        title: 'Gas station circuit', label: 'Reset after an impossible prefix',
        summary: 'Track total net fuel to determine whether any solution exists and current tank for one candidate start. If tank becomes negative at i, no station from the current start through i can be a valid start; all encountered the same deficit with no more initial surplus, so reset to i + 1.',
        invariant: 'tank is net fuel from candidate start through i and has never been negative before i; every index before candidate has been proven invalid.',
        useWhen: 'A circular sequence has local gains and costs, and failure of a prefix rules out every start inside that prefix.',
        example: [
          'gas = [1,2,3,4,5], cost = [3,4,5,1,2]. Net = [-2,-2,-2,+3,+3]. total = 0, tank = 0, start = 0.',
          'i = 0: tank = -2, so start 0 fails. Reset start = 1, tank = 0. total = -2.',
          'i = 1: tank = -2; reset start = 2. total = -4.',
          'i = 2: tank = -2; reset start = 3. total = -6.',
          'i = 3: tank = +3. Keep start 3. total = -3.',
          'i = 4: tank = +6. total = 0, so enough fuel exists globally. Return start 3; wrapping through stations 0,1,2 consumes the stored surplus exactly.',
        ],
        code: `function canCompleteCircuit(gas: number[], cost: number[]): number {
  let total = 0, tank = 0, start = 0
  for (let i = 0; i < gas.length; i++) {
    const net = gas[i] - cost[i]
    total += net
    tank += net
    if (tank < 0) {
      start = i + 1
      tank = 0
    }
  }
  return total >= 0 ? start : -1
}`,
        complexity: 'O(n) time and O(1) space. total ≥ 0 proves existence; prefix resets identify the only remaining candidate.',
      },
    ],
  },

  'dynamic-programming': {
    title: 'Dynamic programming from first principles',
    introduction: [
      'Dynamic programming (DP) solves a problem by defining smaller states, expressing each state from already solved states, and storing results so the same subproblem is never recomputed. It is useful when subproblems overlap and the global answer has optimal substructure or countable composition.',
      'A state definition is a complete sentence, such as “dp[i] is the maximum money obtainable from houses 0 through i.” The recurrence is only meaningful after that sentence exists. Base cases anchor the smallest inputs; evaluation order guarantees every dependency is ready before use.',
      'Top-down memoization begins with the original question and caches recursive states on demand. Bottom-up tabulation explicitly fills states in dependency order. Space compression is safe only after identifying which earlier states the recurrence reads and preserving their values before overwriting.',
      'DP is not synonymous with recursion. Uncached recursion may repeat the same state exponentially. DP also differs from greedy: DP compares multiple ways to reach a state, while greedy proves one local choice makes alternatives unnecessary.',
    ],
    facts: [
      { value: 'state', label: 'one subproblem' }, { value: 'transition', label: 'state relationship' },
      { value: 'base case', label: 'recurrence anchor' }, { value: 'memo/table', label: 'no recomputation' },
    ],
    models: [
      {
        title: 'State table', description: 'Each cell answers one precisely defined smaller question.',
        items: [{ label: 'dp[0]', value: '1', tone: 'primary' }, { label: 'dp[1]', value: '1' }, { label: 'dp[2]', value: '2' }, { label: 'dp[3]', value: '3' }, { label: 'dp[4]', value: '5', tone: 'accent' }],
        note: 'Dependencies point from solved cells to later cells; the table is a cached proof, not merely storage.',
      },
      {
        title: 'Choice transition', description: 'A state compares all legal final decisions.',
        items: [{ label: 'skip i', value: 'dp[i-1]' }, { label: 'take i', value: 'value[i]+dp[i-2]', tone: 'secondary' }, { label: 'dp[i]', value: 'max', tone: 'primary' }],
        note: 'The cases must be exhaustive and mutually consistent with the state definition.',
      },
    ],
    vocabulary: [
      { term: 'State', definition: 'Minimal information needed to identify one reusable subproblem.' },
      { term: 'State variable', definition: 'Input dimensions such as index, remaining capacity, mask, or previous choice that distinguish states.' },
      { term: 'Transition', definition: 'Equation combining smaller states to solve the current state.' },
      { term: 'Base case', definition: 'Smallest state answered directly without another transition.' },
      { term: 'Overlapping subproblems', definition: 'Different decision paths ask for the same state repeatedly.' },
      { term: 'Optimal substructure', definition: 'An optimal answer can be assembled from optimal answers to compatible smaller states.' },
      { term: 'Memoization', definition: 'Top-down cache storing results of recursive states on demand.' },
      { term: 'Tabulation', definition: 'Bottom-up table filled in an order that satisfies dependencies.' },
      { term: 'Evaluation order', definition: 'Sequence ensuring every state used by a transition has already been solved.' },
      { term: 'Space compression', definition: 'Retain only prior layers actually needed by future transitions.' },
      { term: 'Reconstruction', definition: 'Store choices or parents to recover an actual solution, not only its value.' },
      { term: 'Sentinel infinity', definition: 'Marks unreachable minimization states so they never win accidentally.' },
    ],
    representations: [
      {
        title: 'Top-down memoization', bestFor: 'Natural recursive state graphs and sparse reachable states',
        description: 'Check the cache before branching. Store the completed answer before returning. The recursion stack still consumes depth space.',
        code: `const memo = new Map<string, number>()
function solve(state: State): number {
  const key = encode(state)
  if (memo.has(key)) return memo.get(key)!
  const answer = combineTransitions(state)
  memo.set(key, answer)
  return answer
}`,
      },
      {
        title: 'Bottom-up tabulation', bestFor: 'Dense states with a clear dependency order',
        description: 'Initialize bases, then fill every state in an order where its dependencies already exist.',
        code: `const dp = Array(n + 1).fill(0)
dp[0] = base
for (let state = 1; state <= n; state++) {
  dp[state] = transition(dp, state)
}`,
      },
      {
        title: 'Compressed rolling state', bestFor: 'Transitions using only a fixed number of previous cells',
        description: 'Name old values by meaning, compute the new value, then shift. Update order matters because overwritten dependencies are lost.',
        code: `let twoBack = base0, oneBack = base1
for (let i = 2; i <= n; i++) {
  const current = combine(twoBack, oneBack)
  twoBack = oneBack
  oneBack = current
}`,
      },
    ],
    algorithms: [
      {
        title: 'Climbing stairs', label: 'Count ways by the final step',
        summary: 'To arrive at stair i, the final move came from i - 1 with a one-step move or i - 2 with a two-step move. These sets of paths are disjoint, so add their counts. Define dp[i] as the number of sequences that land exactly on i.',
        invariant: 'Before computing i, twoBack = dp[i-2] and oneBack = dp[i-1], both exact counts for those stairs.',
        useWhen: 'Counting sequences where each state can be reached from a fixed set of earlier positions.',
        example: [
          'n = 5. Define dp[0] = 1 (one empty way to stand before climbing) and dp[1] = 1 ([1]).',
          'i = 2: dp[2] = dp[1] + dp[0] = 1 + 1 = 2: [1,1], [2].',
          'i = 3: dp[3] = dp[2] + dp[1] = 2 + 1 = 3.',
          'i = 4: dp[4] = dp[3] + dp[2] = 3 + 2 = 5.',
          'i = 5: dp[5] = dp[4] + dp[3] = 5 + 3 = 8. Return 8.',
          'Only the previous two counts are used, so the full table can be compressed to two variables.',
        ],
        code: `function climbStairs(n: number): number {
  if (n <= 1) return 1
  let twoBack = 1, oneBack = 1
  for (let stair = 2; stair <= n; stair++) {
    const current = oneBack + twoBack
    twoBack = oneBack
    oneBack = current
  }
  return oneBack
}`,
        complexity: 'O(n) time and O(1) space. Naive recursion would make the same stair calls repeatedly and take exponential time.',
      },
      {
        title: 'House Robber', label: 'Compare taking and skipping the current item',
        summary: 'Adjacent houses cannot both be chosen. For each value, either skip it and keep the previous optimum, or take it and add its value to the optimum from two positions back. Those choices cover every valid solution.',
        invariant: 'twoBack is the optimum through i - 2 and oneBack is the optimum through i - 1 before processing house i.',
        useWhen: 'Selecting non-adjacent values for maximum weight, including many path-graph independent-set variants.',
        example: [
          'houses = [2,7,9,3,1]. Before processing, twoBack = 0 and oneBack = 0.',
          'House 0 value 2: take = 2 + 0 = 2; skip = 0. current = 2. Shift → twoBack 0, oneBack 2.',
          'House 1 value 7: take = 7 + 0 = 7; skip = 2. current = 7. Shift → 2, 7.',
          'House 2 value 9: take = 9 + 2 = 11; skip = 7. current = 11. Shift → 7, 11.',
          'House 3 value 3: take = 3 + 7 = 10; skip = 11. Skip wins; current = 11. Shift → 11, 11.',
          'House 4 value 1: take = 1 + 11 = 12; skip = 11. current = 12. Return 12 from houses 0, 2, and 4.',
        ],
        code: `function rob(houses: number[]): number {
  let twoBack = 0, oneBack = 0
  for (const value of houses) {
    const current = Math.max(oneBack, twoBack + value)
    twoBack = oneBack
    oneBack = current
  }
  return oneBack
}`,
        complexity: 'O(n) time and O(1) space. To reconstruct chosen houses, retain a decision table or backtrack through full dp values.',
      },
      {
        title: 'Minimum coins for an amount', label: 'Minimize over every possible final coin',
        summary: 'Define dp[a] as the minimum coins needed to make exact amount a. If coin c is the final coin, the preceding amount is a - c, so candidate = dp[a-c] + 1. Take the minimum across usable coins. Infinity means unreachable.',
        invariant: 'Before computing amount a, dp[0..a-1] contains exact minimum counts. During the inner loop, dp[a] is the best candidate among coins examined so far.',
        useWhen: 'Unbounded choices combine to an exact total and greedy denomination selection is not guaranteed correct.',
        example: [
          'coins = [1,3,4], amount = 6. Initialize dp[0]=0; dp[1..6]=∞.',
          'a = 1: coin 1 gives dp[0]+1 = 1. dp[1]=1.',
          'a = 2: coin 1 gives dp[1]+1 = 2. dp[2]=2.',
          'a = 3: coin 1 gives 3; coin 3 gives dp[0]+1 = 1. dp[3]=1.',
          'a = 4: candidates are dp[3]+1=2, dp[1]+1=2, dp[0]+1=1. dp[4]=1.',
          'a = 5: best is 2 using 4+1. dp[5]=2.',
          'a = 6: candidates using 1,3,4 are 3,2,3. dp[6]=2 using 3+3. This beats greedy 4+1+1.',
        ],
        code: `function coinChange(coins: number[], amount: number): number {
  const dp = Array(amount + 1).fill(Infinity)
  dp[0] = 0

  for (let current = 1; current <= amount; current++) {
    for (const coin of coins) {
      if (coin <= current) dp[current] = Math.min(dp[current], dp[current - coin] + 1)
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount]
}`,
        complexity: 'O(amount × numberOfCoins) time and O(amount) space. State meaning and loop order differ for 0/1 versus unlimited-use variants.',
      },
    ],
  },

  'backtracking': {
    title: 'Backtracking from first principles',
    introduction: [
      'Backtracking is depth-first search over a decision tree. A node in that conceptual tree is a partial candidate; each outgoing edge makes one legal choice. The algorithm makes a choice, explores everything beneath it, and then undoes that exact choice before trying a sibling branch.',
      'The mutable path represents decisions on the current recursion stack only. When recording a solution, copy the path; storing the same array reference would let later pops and pushes change every recorded answer. Each call must own a precise meaning such as “choose values beginning at index start.”',
      'Pruning stops a branch as soon as no completion can be valid or improve the result. Good pruning can transform practical performance, but the worst-case search space is usually exponential or factorial. Constraints are not a nuisance—they are the information that makes pruning possible.',
      'Backtracking differs from dynamic programming even though both explore choices. Backtracking usually enumerates distinct candidates and preserves path history; DP merges paths that reach an equivalent state. If only a count or optimum is required and many branches share states, memoization may be better.',
    ],
    facts: [
      { value: 'choose', label: 'mutate path' }, { value: 'explore', label: 'recursive descent' },
      { value: 'unchoose', label: 'restore state' }, { value: 'exponential', label: 'typical search space' },
    ],
    models: [
      {
        title: 'Binary decision tree', description: 'Each value can be excluded or included.',
        items: [{ label: 'root', value: '[]', tone: 'primary' }, { label: 'skip 1', value: '[]' }, { label: 'take 1', value: '[1]', tone: 'secondary' }, { label: 'leaf', value: '[1,2]', tone: 'accent' }],
        note: 'The call stack is one root-to-leaf path, not the entire decision tree at once.',
      },
      {
        title: 'Mutable path lifecycle', description: 'One push must be paired with one pop in the same loop iteration.',
        items: [{ label: 'before', value: '[1]' }, { label: 'choose 2', value: '[1,2]', tone: 'primary' }, { label: 'recurse', value: 'record' }, { label: 'undo', value: '[1]', tone: 'accent' }],
        note: 'Restoring the path guarantees the next sibling begins from the parent’s exact state.',
      },
    ],
    vocabulary: [
      { term: 'Decision tree', definition: 'Conceptual tree whose nodes are partial candidates and edges are choices.' },
      { term: 'Path', definition: 'Choices currently active on the recursion stack.' },
      { term: 'Candidate', definition: 'Partial or complete construction being tested.' },
      { term: 'Choice set', definition: 'Legal decisions available from the current partial candidate.' },
      { term: 'Choose', definition: 'Apply one decision by mutating path and any constraint state.' },
      { term: 'Unchoose', definition: 'Undo the exact mutation after recursive exploration.' },
      { term: 'Base case', definition: 'Condition identifying a complete answer or a terminal branch.' },
      { term: 'Pruning', definition: 'Stop exploring when the partial candidate cannot lead to an eligible answer.' },
      { term: 'Constraint state', definition: 'Fast bookkeeping such as used columns, remaining sum, or visited cells.' },
      { term: 'Branching factor', definition: 'Number of choices available per decision level.' },
      { term: 'Depth', definition: 'Number of decisions needed to complete one candidate.' },
      { term: 'Duplicate skipping', definition: 'After sorting, ignore equivalent sibling choices at the same recursion depth.' },
    ],
    representations: [
      {
        title: 'Start-index combination search', bestFor: 'Subsets and combinations where order does not matter',
        description: 'Only choose indexes at or after start, so [1,2] can be generated but the duplicate ordering [2,1] cannot.',
        code: `function search(start: number) {
  record(path)
  for (let i = start; i < values.length; i++) {
    path.push(values[i])
    search(i + 1)
    path.pop()
  }
}`,
      },
      {
        title: 'Used-set permutation search', bestFor: 'Arrangements where position matters',
        description: 'At every depth, choose any value not already in the path. A boolean array provides O(1) membership by index.',
        code: `for (let i = 0; i < values.length; i++) {
  if (used[i]) continue
  used[i] = true; path.push(values[i])
  search()
  path.pop(); used[i] = false
}`,
      },
      {
        title: 'Constraint sets', bestFor: 'Boards and placement problems',
        description: 'Maintain only conflicts caused by the current path. Add before recursion and remove afterward alongside the choice.',
        code: `columns.add(col)
diagonals.add(row - col)
path.push(col)
search(row + 1)
path.pop()
diagonals.delete(row - col)
columns.delete(col)`,
      },
    ],
    algorithms: [
      {
        title: 'Generate all subsets', label: 'Record every decision-tree node',
        summary: 'At recursion state start, path is one valid subset formed from earlier indexes. Record it immediately, then extend it with each later value. Increasing start prevents reordered duplicates.',
        invariant: 'On entry to search(start), path contains values chosen in increasing index order, all before start; every subset already recorded belongs to a completed earlier branch.',
        useWhen: 'Enumerating a power set or all combinations where every partial path is itself an answer.',
        example: [
          'values = [1,2]. Enter search(0) with path []. Copy [] into results.',
          'Loop i = 0: choose 1 → path [1]. Enter search(1); copy [1].',
          'Inside search(1), i = 1: choose 2 → path [1,2]. Enter search(2); copy [1,2]. No choices remain.',
          'Return and unchoose 2 → path [1]. search(1) ends. Return and unchoose 1 → path [].',
          'Back in search(0), loop i = 1: choose 2 → path [2]. Enter search(2); copy [2].',
          'Undo 2. Final results in DFS order: [], [1], [1,2], [2]. Four results equal 2².',
        ],
        code: `function subsets(values: number[]): number[][] {
  const result: number[][] = [], path: number[] = []
  function search(start: number) {
    result.push([...path])
    for (let i = start; i < values.length; i++) {
      path.push(values[i])
      search(i + 1)
      path.pop()
    }
  }
  search(0)
  return result
}`,
        complexity: 'O(n × 2ⁿ) time including copying each subset, O(n) recursion/path space excluding the O(n × 2ⁿ) output.',
      },
      {
        title: 'Generate permutations', label: 'Fill one output position at each depth',
        summary: 'At depth d, path already fixes the first d positions. Try every unused input index in position d. After exploring all completions for a choice, clear used and pop so the next value can occupy the same position.',
        invariant: 'path contains distinct input indexes and has length depth; used[i] is true exactly when values[i] occurs in the current path.',
        useWhen: 'Enumerating orderings, assignments, arrangements, or schedules where position changes the result.',
        example: [
          'values = [1,2,3]. At depth 0 choose 1. path [1], used {1}.',
          'Depth 1: choose 2. path [1,2]. Depth 2: choose 3 → [1,2,3] is complete; record a copy.',
          'Undo 3, then undo 2. At depth 1 under prefix [1], choose 3, then choose 2 → record [1,3,2].',
          'Undo back to empty. Choose 2 for the first position; branches record [2,1,3] and [2,3,1].',
          'Choose 3 first; branches record [3,1,2] and [3,2,1]. Exactly 3 × 2 × 1 = 6 leaves are produced.',
        ],
        code: `function permutations(values: number[]): number[][] {
  const result: number[][] = [], path: number[] = []
  const used = Array(values.length).fill(false)
  function search() {
    if (path.length === values.length) {
      result.push([...path]); return
    }
    for (let i = 0; i < values.length; i++) {
      if (used[i]) continue
      used[i] = true; path.push(values[i])
      search()
      path.pop(); used[i] = false
    }
  }
  search()
  return result
}`,
        complexity: 'O(n × n!) time including copying n values per permutation; O(n) active path/used/recursion space excluding output.',
      },
      {
        title: 'Combination Sum with pruning', label: 'Reuse candidates while remaining target shrinks',
        summary: 'Sort positive candidates. At state (start, remaining), try candidates from start onward; recurse with the same i because reuse is allowed. If candidate exceeds remaining, every later sorted candidate also exceeds it, so break the loop.',
        invariant: 'path is nondecreasing, sums to target - remaining, and contains only choices at or after each call’s start index; no reordered duplicate path can be generated.',
        useWhen: 'Enumerating combinations that meet a target under positive additive constraints, with optional reuse.',
        example: [
          'candidates = [2,3,6,7], target = 7. Start path [], remaining 7.',
          'Choose 2 → remaining 5, path [2]. Choose 2 again → remaining 3, path [2,2].',
          'Choose 2 again → remaining 1. Candidate 2 > 1, so prune. Undo to [2,2].',
          'Next candidate 3 fits remaining 3. Choose it → remaining 0; record [2,2,3]. Undo back through this branch.',
          'Branches beginning [2,3] cannot add 3 to remaining 2, so prune. Branch starting 3 explores [3,3] with remaining 1 and prunes.',
          'Candidate 6 leaves remaining 1 and prunes. Candidate 7 leaves 0; record [7]. Final answers: [[2,2,3], [7]].',
        ],
        code: `function combinationSum(candidates: number[], target: number): number[][] {
  candidates.sort((a, b) => a - b)
  const result: number[][] = [], path: number[] = []
  function search(start: number, remaining: number) {
    if (remaining === 0) { result.push([...path]); return }
    for (let i = start; i < candidates.length; i++) {
      const value = candidates[i]
      if (value > remaining) break
      path.push(value)
      search(i, remaining - value)
      path.pop()
    }
  }
  search(0, target)
  return result
}`,
        complexity: 'Exponential in target/candidate branching in the worst case; O(target / minCandidate) active depth, excluding output. Sorting adds O(n log n).',
      },
    ],
  },
}
