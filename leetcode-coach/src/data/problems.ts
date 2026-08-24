import type { Problem } from '../types'
import importedProblems from './catalog.generated.json'
import { curatedCodeSamples } from './solutions'

export const curatedProblems: Problem[] = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    set: ['Top Interview 150', 'NeetCode 150'],
    topics: ['Array', 'Hash Table'],
    algorithms: ['Hashing'],
    description: 'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target. You may assume exactly one solution exists, and you may not use the same element twice.',
    examples: [{ input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'nums[0] + nums[1] = 9.' }],
    constraints: ['2 ≤ nums.length ≤ 10⁴', '−10⁹ ≤ nums[i], target ≤ 10⁹', 'Exactly one valid answer exists.'],
    insight: 'As you scan, the only useful question is whether the complement has already appeared.',
    solution: `function twoSum(nums: number[], target: number): number[] {\n  const seen = new Map<number, number>()\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i]\n    if (seen.has(complement)) return [seen.get(complement)!, i]\n    seen.set(nums[i], i)\n  }\n  return []\n}`,
    questions: [
      { id: 'two-pattern', type: 'Pattern', prompt: 'What repeated lookup does the problem ask us to make?', options: ['Find whether target − current has been seen', 'Find the globally smallest value', 'Sort every prefix', 'Count every possible pair'], answer: 0, explanation: 'For each value x, a valid partner must be target − x. That turns pair search into membership lookup.', hint: 'Rewrite x + y = target to isolate y.' },
      { id: 'two-ds', type: 'Data Structure', prompt: 'Which structure gives fast lookup while preserving the index we must return?', options: ['Queue', 'Hash map: value → index', 'Min heap', 'Linked list'], answer: 1, explanation: 'A map checks for a complement in expected O(1) and stores its original index.', hint: 'The output needs indices, not merely a yes/no membership test.' },
      { id: 'two-order', type: 'Algorithm', prompt: 'When should the current number be inserted into the map?', options: ['Before checking its complement', 'After checking its complement', 'After the full loop', 'Only when it is negative'], answer: 1, explanation: 'Checking first prevents one element from pairing with itself when target is twice that element.', hint: 'Consider nums = [3, 3] and target = 6.' },
      { id: 'two-time', type: 'Time Complexity', prompt: 'What is the expected time complexity of the one-pass map solution?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], answer: 2, explanation: 'We scan n values once, with expected O(1) map operations for each.', hint: 'Count the passes and the average cost of a hash-map lookup.' },
      { id: 'two-space', type: 'Space Complexity', prompt: 'What is the worst-case auxiliary space?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], answer: 2, explanation: 'The map may hold nearly every array element before the pair is found.', hint: 'How large can the map grow?' },
    ],
  },
  {
    id: 121,
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    set: ['Top Interview 150', 'NeetCode 150'],
    topics: ['Array', 'Dynamic Programming'],
    algorithms: ['Greedy', 'One Pass'],
    description: 'Given prices where prices[i] is the price on day i, maximize profit by choosing one day to buy and a later day to sell. Return 0 if no profit is possible.',
    examples: [{ input: 'prices = [7, 1, 5, 3, 6, 4]', output: '5', explanation: 'Buy at 1 and sell later at 6.' }],
    constraints: ['1 ≤ prices.length ≤ 10⁵', '0 ≤ prices[i] ≤ 10⁴'],
    insight: 'At each sell day, only the cheapest earlier buy price matters.',
    solution: `function maxProfit(prices: number[]): number {\n  let minPrice = Infinity\n  let best = 0\n  for (const price of prices) {\n    minPrice = Math.min(minPrice, price)\n    best = Math.max(best, price - minPrice)\n  }\n  return best\n}`,
    questions: [
      { id: 'stock-pattern', type: 'Pattern', prompt: 'For each possible sell day, what prior information is sufficient?', options: ['Every earlier price', 'The minimum earlier price', 'The maximum later price only', 'The average price'], answer: 1, explanation: 'Profit is current price minus buy price, so the minimum valid earlier price gives the best profit for this sell day.', hint: 'To maximize current − previous, what should previous be?' },
      { id: 'stock-algo', type: 'Algorithm', prompt: 'Which approach reaches the optimum without exploring every pair?', options: ['Greedy one-pass tracking', 'Breadth-first search', 'Binary search', 'Backtracking'], answer: 0, explanation: 'A left-to-right pass maintains the cheapest price and best profit so far.', hint: 'The decision only depends on a compact summary of the prefix.' },
      { id: 'stock-order', type: 'Data Structure', prompt: 'How much historical state must be stored?', options: ['The full prefix', 'A stack', 'Two scalar values', 'A hash map'], answer: 2, explanation: 'Only minPrice and bestProfit are needed; the actual list of earlier prices is irrelevant.', hint: 'Name the two quantities updated each day.' },
      { id: 'stock-time', type: 'Time Complexity', prompt: 'What is the time complexity?', options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'], answer: 1, explanation: 'Every price is visited exactly once.', hint: 'There is one loop over prices.' },
      { id: 'stock-space', type: 'Space Complexity', prompt: 'What is the auxiliary space complexity?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], answer: 0, explanation: 'Two scalar variables are maintained regardless of input size.', hint: 'Does stored state grow with the array?' },
    ],
  },
  {
    id: 3,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    set: ['Top Interview 150', 'NeetCode 150'],
    topics: ['String', 'Hash Table', 'Sliding Window'],
    algorithms: ['Sliding Window'],
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    examples: [{ input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with length 3.' }],
    constraints: ['0 ≤ s.length ≤ 5 × 10⁴', 's consists of English letters, digits, symbols, and spaces.'],
    insight: 'Maintain the longest valid window ending at each right pointer, jumping the left edge past duplicates.',
    solution: `function lengthOfLongestSubstring(s: string): number {\n  const last = new Map<string, number>()\n  let left = 0, best = 0\n  for (let right = 0; right < s.length; right++) {\n    if (last.has(s[right])) left = Math.max(left, last.get(s[right])! + 1)\n    last.set(s[right], right)\n    best = Math.max(best, right - left + 1)\n  }\n  return best\n}`,
    questions: [
      { id: 'long-pattern', type: 'Pattern', prompt: 'What pattern fits a longest contiguous region under a validity rule?', options: ['Divide and conquer', 'Sliding window', 'Topological sort', 'Union-find'], answer: 1, explanation: 'A substring is contiguous, and a window can expand until a duplicate forces its left edge forward.', hint: 'The candidate answer always occupies one interval in the string.' },
      { id: 'long-ds', type: 'Data Structure', prompt: 'What should be stored to move the left edge efficiently?', options: ['Last seen index of each character', 'A sorted copy of the string', 'Only the character count', 'All generated substrings'], answer: 0, explanation: 'The last index lets left jump directly past a repeated character.', hint: 'A direct jump is better than removing characters one at a time.' },
      { id: 'long-edge', type: 'Algorithm', prompt: 'Why must left = max(left, lastSeen + 1)?', options: ['To sort the window', 'To prevent left from moving backward', 'To skip spaces', 'To count duplicates twice'], answer: 1, explanation: 'A character last seen before the current window must not pull the left boundary backward.', hint: 'Test the logic on "abba".' },
      { id: 'long-time', type: 'Time Complexity', prompt: 'What is the time complexity with last-seen indices?', options: ['O(1)', 'O(n)', 'O(n log n)', 'O(n²)'], answer: 1, explanation: 'The right pointer visits each character once, and map operations are expected O(1).', hint: 'How many times does right advance?' },
      { id: 'long-space', type: 'Space Complexity', prompt: 'What auxiliary space is needed for an arbitrary character set?', options: ['O(1) always', 'O(k), where k is distinct characters', 'O(n²)', 'O(log n)'], answer: 1, explanation: 'The map has one entry per distinct character, bounded by the alphabet or n.', hint: 'The map stores one item for each unique character encountered.' },
    ],
  },
  {
    id: 704,
    title: 'Binary Search',
    difficulty: 'Easy',
    set: ['NeetCode 150', 'LeetCode 75'],
    topics: ['Array', 'Binary Search'],
    algorithms: ['Binary Search'],
    description: 'Given a sorted array of integers nums and a target, return its index if it exists; otherwise return −1. Your algorithm must run in O(log n) time.',
    examples: [{ input: 'nums = [-1, 0, 3, 5, 9, 12], target = 9', output: '4' }],
    constraints: ['1 ≤ nums.length ≤ 10⁴', 'All integers in nums are unique.', 'nums is sorted in ascending order.'],
    insight: 'Sorted order lets one comparison discard half of the remaining candidates.',
    solution: `function search(nums: number[], target: number): number {\n  let left = 0, right = nums.length - 1\n  while (left <= right) {\n    const mid = left + Math.floor((right - left) / 2)\n    if (nums[mid] === target) return mid\n    if (nums[mid] < target) left = mid + 1\n    else right = mid - 1\n  }\n  return -1\n}`,
    questions: [
      { id: 'binary-pattern', type: 'Pattern', prompt: 'Which property allows half the candidates to be discarded?', options: ['Unique values', 'Sorted order', 'Positive values', 'Even array length'], answer: 1, explanation: 'Sorted order tells us which side could still contain the target after comparing the midpoint.', hint: 'What relationship exists between neighbors?' },
      { id: 'binary-bounds', type: 'Algorithm', prompt: 'With inclusive left and right bounds, which loop condition is correct?', options: ['left < right', 'left <= right', 'left !== right', 'right > 0'], answer: 1, explanation: 'When left equals right, one valid candidate remains and must be checked.', hint: 'Consider a one-element array.' },
      { id: 'binary-ds', type: 'Data Structure', prompt: 'Why is an array useful here?', options: ['O(1) indexed midpoint access', 'It automatically sorts values', 'It prevents duplicates', 'It uses no memory'], answer: 0, explanation: 'Binary search relies on jumping directly to the midpoint, which arrays support in O(1).', hint: 'How do we reach nums[mid]?' },
      { id: 'binary-time', type: 'Time Complexity', prompt: 'What recurrence describes the search?', options: ['T(n)=T(n−1)+O(1)', 'T(n)=2T(n/2)', 'T(n)=T(n/2)+O(1)', 'T(n)=O(n²)'], answer: 2, explanation: 'Each comparison keeps only one half, producing O(log n) time.', hint: 'Only one of the two halves is explored.' },
      { id: 'binary-space', type: 'Space Complexity', prompt: 'What is the iterative solution’s auxiliary space?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answer: 0, explanation: 'The iterative version stores only three indices.', hint: 'No recursion stack or growing collection is used.' },
    ],
  },
  {
    id: 42,
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    set: ['Top Interview 150', 'NeetCode 150'],
    topics: ['Array', 'Two Pointers', 'Stack'],
    algorithms: ['Two Pointers'],
    description: 'Given n non-negative integers representing an elevation map where each bar has width 1, compute how much water it can trap after raining.',
    examples: [{ input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' }],
    constraints: ['1 ≤ n ≤ 2 × 10⁴', '0 ≤ height[i] ≤ 10⁵'],
    insight: 'Water above a position is limited by the smaller boundary; process the side whose maximum is currently smaller.',
    solution: `function trap(height: number[]): number {\n  let left = 0, right = height.length - 1\n  let leftMax = 0, rightMax = 0, water = 0\n  while (left < right) {\n    if (height[left] <= height[right]) {\n      leftMax = Math.max(leftMax, height[left])\n      water += leftMax - height[left++]\n    } else {\n      rightMax = Math.max(rightMax, height[right])\n      water += rightMax - height[right--]\n    }\n  }\n  return water\n}`,
    questions: [
      { id: 'rain-model', type: 'Pattern', prompt: 'What determines the water above index i?', options: ['The taller boundary only', 'min(maxLeft, maxRight) − height[i]', 'The nearest bar', 'The global maximum − height[i]'], answer: 1, explanation: 'Water spills over the shorter of the tallest boundaries on each side.', hint: 'A container’s capacity is limited by its shorter wall.' },
      { id: 'rain-algo', type: 'Algorithm', prompt: 'How can we avoid storing left-max and right-max arrays?', options: ['Sort the heights', 'Use two pointers with running maxima', 'Use binary search', 'Use a hash set'], answer: 1, explanation: 'Moving inward from both ends lets the lower side be resolved using its known boundary.', hint: 'Can you process the side that is already the bottleneck?' },
      { id: 'rain-choice', type: 'Data Structure', prompt: 'When height[left] ≤ height[right], why is the left position safe to resolve?', options: ['The right side has some boundary at least that high', 'The heights are sorted', 'Left is always a maximum', 'Water flows only right'], answer: 0, explanation: 'The right bar guarantees a sufficient opposing boundary; leftMax determines any water at left.', hint: 'The smaller side is the limiting side.' },
      { id: 'rain-time', type: 'Time Complexity', prompt: 'What is the two-pointer time complexity?', options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'], answer: 1, explanation: 'Each pointer moves inward at most n positions in total.', hint: 'No pointer ever moves backward.' },
      { id: 'rain-space', type: 'Space Complexity', prompt: 'What is the auxiliary space complexity?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], answer: 0, explanation: 'Only pointers, two maxima, and the accumulated water are stored.', hint: 'Count the variables whose number depends on n.' },
    ],
  },
]

for (const problem of curatedProblems) {
  problem.codeSamples = { TypeScript: problem.solution, ...curatedCodeSamples[problem.id] }
}

const byId = new Map<number, Problem>()
for (const problem of importedProblems as Problem[]) byId.set(problem.id, problem)
for (const problem of curatedProblems) byId.set(problem.id, problem)
export const problems: Problem[] = [...byId.values()]
