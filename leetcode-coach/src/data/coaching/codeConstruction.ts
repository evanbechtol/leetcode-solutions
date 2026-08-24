import type { CodeConstructionChoice, CodeConstructionConfig, HintLevel } from '../../types'

const hints = (cue: string, concept: string, workedStep: string): HintLevel[] => [
  { id: 'cue', label: 'Look here', text: cue },
  { id: 'concept', label: 'What to track', text: concept },
  { id: 'worked-step', label: 'Try one step', text: workedStep },
]

const choice = (id: string, codeByLanguage: Record<string, string>, feedback: string): CodeConstructionChoice => ({
  id,
  codeByLanguage,
  feedback,
})

const fourLanguages = ['Python', 'Java', 'C++', 'Rust']

const twoSum: CodeConstructionConfig = {
  languages: fourLanguages,
  exampleInput: 'nums = [2, 7, 11, 15], target = 9',
  openingByLanguage: {
    Python: 'def two_sum(nums: list[int], target: int) -> list[int]:',
    Java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {',
    'C++': 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {',
    Rust: 'impl Solution {\n    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {\n        use std::collections::HashMap;',
  },
  closingByLanguage: { Python: '', Java: '    }\n}', 'C++': '    }\n};', Rust: '    }\n}' },
  steps: [
    {
      id: 'remember-seen', concept: 'Create the lookup state', prerequisites: [], correctChoiceId: 'seen-map',
      choices: [
        choice('seen-map', { Python: '    seen = {}', Java: '        Map<Integer, Integer> seen = new HashMap<>();', 'C++': '        unordered_map<int, int> seen;', Rust: '        let mut seen = HashMap::new();' }, 'Yes. The map connects each earlier value to its index.'),
        choice('seen-list', { Python: '    seen = []', Java: '        List<Integer> seen = new ArrayList<>();', 'C++': '        vector<int> seen;', Rust: '        let mut seen = Vec::new();' }, 'A list remembers values, but it cannot find a complement by value in constant expected time.'),
        choice('sort-input', { Python: '    nums.sort()', Java: '        Arrays.sort(nums);', 'C++': '        sort(nums.begin(), nums.end());', Rust: '        nums.sort();' }, 'Sorting changes the original index order, but this function must return original indices.'),
      ],
      stateEffect: 'seen starts empty; after each miss it will map an earlier value to its original index.',
      exampleState: 'seen = {}',
      explanation: 'A hash map supports the exact question each iteration asks: have we already seen the required partner?',
      hints: hints('The result needs indices, not only values.', 'Store both identity and position.', 'Before reading any value, create an empty value-to-index lookup.'),
    },
    {
      id: 'scan-once', concept: 'Visit each value with its index', prerequisites: ['remember-seen'], correctChoiceId: 'enumerate',
      choices: [
        choice('enumerate', { Python: '    for i, value in enumerate(nums):', Java: '        for (int i = 0; i < nums.length; i++) {', 'C++': '        for (int i = 0; i < nums.size(); ++i) {', Rust: '        for (i, &value) in nums.iter().enumerate() {' }, 'Yes. A single left-to-right scan supplies both the current value and its index.'),
        choice('pairs', { Python: '    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):', Java: '        for (int i = 0; i < nums.length; i++) {\n            for (int j = i + 1; j < nums.length; j++) {', 'C++': '        for (int i = 0; i < nums.size(); ++i) {\n            for (int j = i + 1; j < nums.size(); ++j) {', Rust: '        for i in 0..nums.len() {\n            for j in (i + 1)..nums.len() {' }, 'Nested loops revisit many pairs and return to quadratic time; the map makes the second loop unnecessary.'),
        choice('values-only', { Python: '    for value in nums:', Java: '        for (int value : nums) {', 'C++': '        for (int value : nums) {', Rust: '        for value in nums {' }, 'The scan also needs the current original index so it can build the required answer.'),
      ],
      stateEffect: 'i and value now describe exactly one current element while seen contains only earlier elements.',
      exampleState: 'i = 0, value = 2, seen = {}',
      explanation: 'Scanning once makes the running time linear when each map lookup and insertion is expected constant time.',
      hints: hints('The function must return two positions.', 'Keep the current index available during the scan.', 'For [2, 7], the first iteration should expose index 0 and value 2.'),
    },
    {
      id: 'compute-complement', concept: 'Compute the value still needed', prerequisites: ['scan-once'], correctChoiceId: 'subtract',
      choices: [
        choice('subtract', { Python: '        complement = target - value', Java: '            int complement = target - nums[i];', 'C++': '            int complement = target - nums[i];', Rust: '            let complement = target - value;' }, 'Yes. If value + complement equals target, complement must be target minus value.'),
        choice('add', { Python: '        complement = target + value', Java: '            int complement = target + nums[i];', 'C++': '            int complement = target + nums[i];', Rust: '            let complement = target + value;' }, 'Adding the current value does not solve value + complement = target. Isolate complement algebraically.'),
        choice('difference', { Python: '        complement = value - target', Java: '            int complement = nums[i] - target;', 'C++': '            int complement = nums[i] - target;', Rust: '            let complement = value - target;' }, 'The subtraction order is reversed. Check which number added to the current value reaches target.'),
      ],
      stateEffect: 'complement is the one earlier value that would complete a valid pair with value.',
      exampleState: 'complement = 7',
      explanation: 'Rearranging value + partner = target gives partner = target - value.',
      hints: hints('Write the pair equation first.', 'Solve value + partner = target for partner.', 'At value 2 with target 9, the needed partner is 7.'),
    },
    {
      id: 'return-match', concept: 'Use an earlier matching value', prerequisites: ['compute-complement'], correctChoiceId: 'lookup-first',
      choices: [
        choice('lookup-first', { Python: '        if complement in seen:\n            return [seen[complement], i]', Java: '            if (seen.containsKey(complement)) {\n                return new int[] { seen.get(complement), i };\n            }', 'C++': '            if (seen.count(complement)) return {seen[complement], i};', Rust: '            if let Some(&j) = seen.get(&complement) {\n                return vec![j as i32, i as i32];\n            }' }, 'Yes. The stored index belongs to an earlier element, so it cannot reuse the current element.'),
        choice('current-twice', { Python: '        if value * 2 == target:\n            return [i, i]', Java: '            if (nums[i] * 2 == target) return new int[] { i, i };', 'C++': '            if (nums[i] * 2 == target) return {i, i};', Rust: '            if value * 2 == target { return vec![i as i32, i as i32]; }' }, 'A valid pair must use two distinct input positions; returning the current index twice violates that contract.'),
        choice('return-values', { Python: '        if complement in seen:\n            return [complement, value]', Java: '            if (seen.containsKey(complement)) return new int[] { complement, nums[i] };', 'C++': '            if (seen.count(complement)) return {complement, nums[i]};', Rust: '            if seen.contains_key(&complement) { return vec![complement, value]; }' }, 'Those are the pair values, but the problem requires their indices.'),
      ],
      stateEffect: 'On a hit, the algorithm immediately returns the earlier index and the current index.',
      exampleState: 'at i = 1: complement = 2, seen[2] = 0, return [0, 1]',
      explanation: 'Looking up before insertion prevents one element from pairing with itself and preserves original indices.',
      hints: hints('The lookup contains only earlier elements.', 'Return the stored position and current position.', 'For [2, 7], seen[2] is 0 when i is 1.'),
    },
    {
      id: 'store-miss', concept: 'Remember the current value after a miss', prerequisites: ['return-match'], correctChoiceId: 'insert-current',
      choices: [
        choice('insert-current', { Python: '        seen[value] = i', Java: '            seen.put(nums[i], i);\n        }', 'C++': '            seen[nums[i]] = i;\n        }', Rust: '            seen.insert(value, i);\n        }' }, 'Yes. Future iterations can now use this value as their earlier partner.'),
        choice('insert-complement', { Python: '        seen[complement] = i', Java: '            seen.put(complement, i);\n        }', 'C++': '            seen[complement] = i;\n        }', Rust: '            seen.insert(complement, i);\n        }' }, 'The index belongs to the current value, not its missing complement. This would make the map dishonest.'),
        choice('clear-map', { Python: '        seen.clear()', Java: '            seen.clear();\n        }', 'C++': '            seen.clear();\n        }', Rust: '            seen.clear();\n        }' }, 'Clearing the map discards earlier candidates that later values may need.'),
      ],
      stateEffect: 'After a miss, seen[value] equals i and every stored entry still refers to a processed element.',
      exampleState: 'after i = 0: seen = {2: 0}',
      explanation: 'Insertion happens after the lookup so duplicate values at different positions are handled without self-pairing.',
      hints: hints('A future value may need this one.', 'Store what was actually observed and where.', 'After processing nums[0] = 2, store 2 → 0.'),
    },
    {
      id: 'no-match', concept: 'Handle the no-solution path', prerequisites: ['store-miss'], correctChoiceId: 'empty-result',
      choices: [
        choice('empty-result', { Python: '    return []', Java: '        return new int[0];', 'C++': '        return {};', Rust: '        vec![]' }, 'Yes. This fallback keeps the function total even though LeetCode guarantees one answer.'),
        choice('first-pair', { Python: '    return [0, 1]', Java: '        return new int[] { 0, 1 };', 'C++': '        return {0, 1};', Rust: '        vec![0, 1]' }, 'Those indices were never verified and can describe a pair whose values do not reach target.'),
        choice('current-index', { Python: '    return [i]', Java: '        return new int[] { nums.length - 1 };', 'C++': '        return {(int)nums.size() - 1};', Rust: '        vec![nums.len() as i32 - 1]' }, 'The required result contains two indices, and no valid pair was established here.'),
      ],
      stateEffect: 'If the scan ends without a hit, the function returns an empty index list.',
      exampleState: 'not reached for this guaranteed-match example',
      explanation: 'The stated problem guarantees a match, but an explicit fallback makes every control-flow path return the declared type.',
      hints: hints('This line runs only after the entire scan.', 'Do not invent an unverified pair.', 'Use the result shape that represents no indices.'),
    },
  ],
}

const longestSubstring: CodeConstructionConfig = {
  languages: fourLanguages,
  exampleInput: 's = "abcabcbb"',
  openingByLanguage: {
    Python: 'def length_of_longest_substring(s: str) -> int:',
    Java: 'class Solution {\n    public int lengthOfLongestSubstring(String s) {',
    'C++': 'class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {',
    Rust: 'impl Solution {\n    pub fn length_of_longest_substring(s: String) -> i32 {\n        use std::collections::HashMap;',
  },
  closingByLanguage: { Python: '', Java: '    }\n}', 'C++': '    }\n};', Rust: '    }\n}' },
  steps: [
    {
      id: 'window-state', concept: 'Track the window and last positions', prerequisites: [], correctChoiceId: 'state',
      choices: [
        choice('state', { Python: '    last = {}\n    left = best = 0', Java: '        Map<Character, Integer> last = new HashMap<>();\n        int left = 0, best = 0;', 'C++': '        vector<int> last(256, -1);\n        int left = 0, best = 0;', Rust: '        let mut last = HashMap::new();\n        let (mut left, mut best) = (0, 0);' }, 'Yes. These values describe the valid window, the best length, and where each character last appeared.'),
        choice('set-only', { Python: '    characters = set()', Java: '        Set<Character> characters = new HashSet<>();', 'C++': '        unordered_set<char> characters;', Rust: '        let mut characters = std::collections::HashSet::new();' }, 'A set can support a valid solution, but it cannot jump directly past a duplicate’s last position as this path intends.'),
        choice('count-only', { Python: '    best = 0', Java: '        int best = 0;', 'C++': '        int best = 0;', Rust: '        let mut best = 0;' }, 'The best length alone cannot tell where the current valid substring begins or where a duplicate appeared.'),
      ],
      stateEffect: 'last is empty, left is the start of the current window, and best is the largest valid length found.',
      exampleState: 'last = {}, left = 0, best = 0',
      explanation: 'A last-position map lets the left boundary jump forward without rescanning characters.',
      hints: hints('A duplicate must tell us where to restart.', 'Track both a boundary and each character’s latest index.', 'Before scanning, the window begins at 0 and no positions are stored.'),
    },
    {
      id: 'expand-right', concept: 'Expand the right edge once per character', prerequisites: ['window-state'], correctChoiceId: 'enumerate',
      choices: [
        choice('enumerate', { Python: '    for right, char in enumerate(s):', Java: '        for (int right = 0; right < s.length(); right++) {\n            char c = s.charAt(right);', 'C++': '        for (int right = 0; right < s.size(); ++right) {', Rust: '        for (right, ch) in s.chars().enumerate() {' }, 'Yes. The right boundary advances exactly once for each character.'),
        choice('restart', { Python: '    for left in range(len(s)):\n        for right in range(left, len(s)):', Java: '        for (int left = 0; left < s.length(); left++) {\n            for (int right = left; right < s.length(); right++) {', 'C++': '        for (int left = 0; left < s.size(); ++left) {\n            for (int right = left; right < s.size(); ++right) {', Rust: '        for left in 0..s.len() {\n            for right in left..s.len() {' }, 'Restarting from every left boundary repeats work and loses the linear sliding-window benefit.'),
        choice('reverse', { Python: '    for right in range(len(s) - 1, -1, -1):\n        char = s[right]', Java: '        for (int right = s.length() - 1; right >= 0; right--) {\n            char c = s.charAt(right);', 'C++': '        for (int right = s.size() - 1; right >= 0; --right) {', Rust: '        for (right, ch) in s.chars().rev().enumerate() {' }, 'The boundary-update rules below are defined for left-to-right original indices, not reversed positions.'),
      ],
      stateEffect: 'right and the current character now identify the new element entering the window.',
      exampleState: 'first iteration: right = 0, char = "a"',
      explanation: 'Each character enters the window once, while left moves only forward.',
      hints: hints('One boundary should advance automatically.', 'Read each character with its original index.', 'On "abc", right should take values 0, 1, then 2.'),
    },
    {
      id: 'move-left', concept: 'Exclude a duplicate without moving backward', prerequisites: ['expand-right'], correctChoiceId: 'jump',
      choices: [
        choice('jump', { Python: '        if char in last:\n            left = max(left, last[char] + 1)', Java: '            if (last.containsKey(c)) left = Math.max(left, last.get(c) + 1);', 'C++': '            left = max(left, last[(unsigned char)s[right]] + 1);', Rust: '            if let Some(&index) = last.get(&ch) {\n                left = left.max(index + 1);\n            }' }, 'Yes. The max prevents an old duplicate outside the current window from moving left backward.'),
        choice('raw-jump', { Python: '        if char in last:\n            left = last[char] + 1', Java: '            if (last.containsKey(c)) left = last.get(c) + 1;', 'C++': '            left = last[(unsigned char)s[right]] + 1;', Rust: '            if let Some(&index) = last.get(&ch) { left = index + 1; }' }, 'An occurrence before the current window can make that assignment move left backward. Boundaries must never retreat.'),
        choice('reset-zero', { Python: '        if char in last:\n            left = 0', Java: '            if (last.containsKey(c)) left = 0;', 'C++': '            if (last[(unsigned char)s[right]] >= 0) left = 0;', Rust: '            if last.contains_key(&ch) { left = 0; }' }, 'Resetting to zero can re-include the duplicate and destroys the valid-window invariant.'),
      ],
      stateEffect: 'left becomes the earliest valid start after the duplicate, but it never decreases.',
      exampleState: 'at the second "a": left = max(0, 0 + 1) = 1',
      explanation: 'Moving just past the latest duplicate restores uniqueness while preserving the longest possible window ending at right.',
      hints: hints('An old occurrence may already be outside the window.', 'The left boundary may move forward, never backward.', 'Use the larger of current left and last position plus one.'),
    },
    {
      id: 'record-position', concept: 'Record the newest position', prerequisites: ['move-left'], correctChoiceId: 'store',
      choices: [
        choice('store', { Python: '        last[char] = right', Java: '            last.put(c, right);', 'C++': '            last[(unsigned char)s[right]] = right;', Rust: '            last.insert(ch, right);' }, 'Yes. Future duplicates must react to the most recent occurrence.'),
        choice('store-left', { Python: '        last[char] = left', Java: '            last.put(c, left);', 'C++': '            last[(unsigned char)s[right]] = left;', Rust: '            last.insert(ch, left);' }, 'left is the window boundary, not necessarily the position where this character appeared.'),
        choice('delete', { Python: '        last.pop(char, None)', Java: '            last.remove(c);', 'C++': '            last[(unsigned char)s[right]] = -1;', Rust: '            last.remove(&ch);' }, 'Deleting the newest occurrence removes exactly the information a later duplicate needs.'),
      ],
      stateEffect: 'last[current character] now equals right, its latest processed position.',
      exampleState: 'after right = 3: last["a"] = 3',
      explanation: 'Overwriting an older index is safe because only the most recent duplicate can impose the strongest future boundary.',
      hints: hints('Later iterations need the newest occurrence.', 'Associate the current character with the current right boundary.', 'At right 2 for c, record c → 2.'),
    },
    {
      id: 'measure-window', concept: 'Measure the valid inclusive window', prerequisites: ['record-position'], correctChoiceId: 'inclusive-length',
      choices: [
        choice('inclusive-length', { Python: '        best = max(best, right - left + 1)', Java: '            best = Math.max(best, right - left + 1);\n        }', 'C++': '            best = max(best, right - left + 1);\n        }', Rust: '            best = best.max(right - left + 1);\n        }' }, 'Yes. Both endpoints belong to the substring, so its length includes one extra position.'),
        choice('exclusive-length', { Python: '        best = max(best, right - left)', Java: '            best = Math.max(best, right - left);\n        }', 'C++': '            best = max(best, right - left);\n        }', Rust: '            best = best.max(right - left);\n        }' }, 'right - left is one too small because the valid substring includes both endpoints.'),
        choice('total-prefix', { Python: '        best = max(best, right + 1)', Java: '            best = Math.max(best, right + 1);\n        }', 'C++': '            best = max(best, right + 1);\n        }', Rust: '            best = best.max(right + 1);\n        }' }, 'This counts from index zero and ignores that duplicates may have moved left forward.'),
      ],
      stateEffect: 'best is the largest unique-window length among every right endpoint processed so far.',
      exampleState: 'for window "abc": left = 0, right = 2, best = 3',
      explanation: 'The current window is valid before measuring it, so comparing its inclusive length updates the global best safely.',
      hints: hints('Both boundary characters are included.', 'An inclusive interval [left, right] has one more item than their difference.', 'For [0, 0], the window length is 1.'),
    },
    {
      id: 'return-best', concept: 'Return the best completed length', prerequisites: ['measure-window'], correctChoiceId: 'best',
      choices: [
        choice('best', { Python: '    return best', Java: '        return best;', 'C++': '        return best;', Rust: '        best as i32' }, 'Yes. best summarizes every valid window considered during the scan.'),
        choice('current', { Python: '    return right - left + 1', Java: '        return s.length() - left;', 'C++': '        return s.size() - left;', Rust: '        (s.len() - left) as i32' }, 'The final window need not be the longest window seen earlier.'),
        choice('distinct-total', { Python: '    return len(last)', Java: '        return last.size();', 'C++': '        return 0;', Rust: '        last.len() as i32' }, 'The number of distinct characters in the entire string can combine characters that never formed one valid substring.'),
      ],
      stateEffect: 'The function returns the maximum length recorded across the complete scan.',
      exampleState: 'best = 3',
      explanation: 'Because best was updated for every valid ending position, it is the required global maximum.',
      hints: hints('The answer may occur before the final character.', 'Return the variable that preserved the largest window.', 'For "abba", the final window and earlier best must be compared.'),
    },
  ],
}

const binarySearch: CodeConstructionConfig = {
  languages: fourLanguages,
  exampleInput: 'nums = [-1, 0, 3, 5, 9, 12], target = 9',
  openingByLanguage: {
    Python: 'def search(nums: list[int], target: int) -> int:',
    Java: 'class Solution {\n    public int search(int[] nums, int target) {',
    'C++': 'class Solution {\npublic:\n    int search(vector<int>& nums, int target) {',
    Rust: 'impl Solution {\n    pub fn search(nums: Vec<i32>, target: i32) -> i32 {',
  },
  closingByLanguage: { Python: '', Java: '    }\n}', 'C++': '    }\n};', Rust: '    }\n}' },
  steps: [
    {
      id: 'inclusive-bounds', concept: 'Represent the remaining search interval', prerequisites: [], correctChoiceId: 'full-range',
      choices: [
        choice('full-range', { Python: '    left, right = 0, len(nums) - 1', Java: '        int left = 0, right = nums.length - 1;', 'C++': '        int left = 0, right = nums.size() - 1;', Rust: '        let (mut left, mut right) = (0_i32, nums.len() as i32 - 1);' }, 'Yes. Both boundaries identify candidate indices, including the first and last element.'),
        choice('length-index', { Python: '    left, right = 0, len(nums)', Java: '        int left = 0, right = nums.length;', 'C++': '        int left = 0, right = nums.size();', Rust: '        let (mut left, mut right) = (0_i32, nums.len() as i32);' }, 'This path uses an inclusive right boundary, so length itself is outside the valid index range.'),
        choice('skip-ends', { Python: '    left, right = 1, len(nums) - 2', Java: '        int left = 1, right = nums.length - 2;', 'C++': '        int left = 1, right = nums.size() - 2;', Rust: '        let (mut left, mut right) = (1_i32, nums.len() as i32 - 2);' }, 'The target may be at either endpoint, so the initial interval must include the entire array.'),
      ],
      stateEffect: 'The candidate interval is every valid index from 0 through the last index.',
      exampleState: 'left = 0, right = 5',
      explanation: 'This implementation uses a closed interval [left, right], so both bounds are possible answers.',
      hints: hints('Start with every possible index.', 'The right boundary is inclusive.', 'For three elements, valid indices run from 0 through 2.'),
    },
    {
      id: 'loop-candidates', concept: 'Continue while a candidate remains', prerequisites: ['inclusive-bounds'], correctChoiceId: 'closed-guard',
      choices: [
        choice('closed-guard', { Python: '    while left <= right:', Java: '        while (left <= right) {', 'C++': '        while (left <= right) {', Rust: '        while left <= right {' }, 'Yes. When left equals right, one candidate still needs to be checked.'),
        choice('strict-guard', { Python: '    while left < right:', Java: '        while (left < right) {', 'C++': '        while (left < right) {', Rust: '        while left < right {' }, 'With inclusive bounds, left == right represents one unchecked candidate; this guard would skip it.'),
        choice('fixed-count', { Python: '    for _ in range(len(nums)):', Java: '        for (int step = 0; step < nums.length; step++) {', 'C++': '        for (int step = 0; step < nums.size(); ++step) {', Rust: '        for _ in 0..nums.len() {' }, 'Binary search stops when its candidate interval is empty, not after a linear number of iterations.'),
      ],
      stateEffect: 'Each iteration begins with at least one index that could still contain target.',
      exampleState: '0 <= 5, so the first candidate interval is nonempty',
      explanation: 'The closed interval is empty only when left has moved beyond right.',
      hints: hints('Ask whether equality leaves work.', 'A closed interval [k, k] contains one item.', 'For a one-element array, the loop must run once.'),
    },
    {
      id: 'choose-midpoint', concept: 'Inspect the middle candidate safely', prerequisites: ['loop-candidates'], correctChoiceId: 'safe-mid',
      choices: [
        choice('safe-mid', { Python: '        mid = left + (right - left) // 2', Java: '            int mid = left + (right - left) / 2;', 'C++': '            int mid = left + (right - left) / 2;', Rust: '            let mid = left + (right - left) / 2;' }, 'Yes. mid is inside the current interval and avoids adding two potentially large positive indices.'),
        choice('right-only', { Python: '        mid = right // 2', Java: '            int mid = right / 2;', 'C++': '            int mid = right / 2;', Rust: '            let mid = right / 2;' }, 'Once left moves above zero, halving right alone can choose an index outside the remaining interval.'),
        choice('outside', { Python: '        mid = right + 1', Java: '            int mid = right + 1;', 'C++': '            int mid = right + 1;', Rust: '            let mid = right + 1;' }, 'right + 1 is specifically outside this closed candidate interval.'),
      ],
      stateEffect: 'mid identifies a valid candidate near the center of [left, right].',
      exampleState: 'mid = 2, nums[mid] = 3',
      explanation: 'Choosing the midpoint allows one comparison to eliminate about half of the remaining interval.',
      hints: hints('Use both current boundaries.', 'Offset halfway from left toward right.', 'For [2, 6], the lower middle index is 4.'),
    },
    {
      id: 'return-hit', concept: 'Return immediately on equality', prerequisites: ['choose-midpoint'], correctChoiceId: 'equal',
      choices: [
        choice('equal', { Python: '        if nums[mid] == target:\n            return mid', Java: '            if (nums[mid] == target) return mid;', 'C++': '            if (nums[mid] == target) return mid;', Rust: '            match nums[mid as usize].cmp(&target) {\n                std::cmp::Ordering::Equal => return mid,' }, 'Yes. Equality proves that mid is the requested index.'),
        choice('return-value', { Python: '        if nums[mid] == target:\n            return nums[mid]', Java: '            if (nums[mid] == target) return nums[mid];', 'C++': '            if (nums[mid] == target) return nums[mid];', Rust: '            if nums[mid as usize] == target { return nums[mid as usize]; }' }, 'The contract asks for the index, not the value stored at that index.'),
        choice('return-left', { Python: '        if nums[mid] == target:\n            return left', Java: '            if (nums[mid] == target) return left;', 'C++': '            if (nums[mid] == target) return left;', Rust: '            if nums[mid as usize] == target { return left; }' }, 'left marks the interval boundary and may differ from the matching midpoint.'),
      ],
      stateEffect: 'If the middle value matches, the function terminates with its index.',
      exampleState: 'later: mid = 4, nums[mid] = 9, return 4',
      explanation: 'No additional search is necessary after equality establishes the exact requested position.',
      hints: hints('The inspected candidate has a known index.', 'Return position, not contents.', 'If nums[3] equals target, the answer is 3.'),
    },
    {
      id: 'discard-half', concept: 'Remove the half that cannot contain target', prerequisites: ['return-hit'], correctChoiceId: 'ordered-update',
      choices: [
        choice('ordered-update', { Python: '        if nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1', Java: '            if (nums[mid] < target) left = mid + 1;\n            else right = mid - 1;\n        }', 'C++': '            if (nums[mid] < target) left = mid + 1;\n            else right = mid - 1;\n        }', Rust: '                std::cmp::Ordering::Less => left = mid + 1,\n                std::cmp::Ordering::Greater => right = mid - 1,\n            }\n        }' }, 'Yes. Sorted order proves which entire half is impossible, and mid is excluded because equality already failed.'),
        choice('reversed-update', { Python: '        if nums[mid] < target:\n            right = mid - 1\n        else:\n            left = mid + 1', Java: '            if (nums[mid] < target) right = mid - 1;\n            else left = mid + 1;\n        }', 'C++': '            if (nums[mid] < target) right = mid - 1;\n            else left = mid + 1;\n        }', Rust: '                std::cmp::Ordering::Less => right = mid - 1,\n                std::cmp::Ordering::Greater => left = mid + 1,\n            }\n        }' }, 'If the middle value is too small, sorted order places a possible larger target to the right, not left.'),
        choice('keep-mid', { Python: '        if nums[mid] < target:\n            left = mid\n        else:\n            right = mid', Java: '            if (nums[mid] < target) left = mid;\n            else right = mid;\n        }', 'C++': '            if (nums[mid] < target) left = mid;\n            else right = mid;\n        }', Rust: '                std::cmp::Ordering::Less => left = mid,\n                std::cmp::Ordering::Greater => right = mid,\n            }\n        }' }, 'Keeping mid after equality failed can leave the interval unchanged and cause an infinite loop.'),
      ],
      stateEffect: 'The new interval excludes mid and every value ordered on the impossible side.',
      exampleState: '3 < 9, so left changes from 0 to 3',
      explanation: 'Sorted order justifies eliminating half, while ±1 guarantees strict progress.',
      hints: hints('Equality already failed, so mid can leave.', 'A too-small value requires searching larger indices.', 'If nums[mid] < target, the new left boundary is mid + 1.'),
    },
    {
      id: 'not-found', concept: 'Report an empty candidate interval', prerequisites: ['discard-half'], correctChoiceId: 'minus-one',
      choices: [
        choice('minus-one', { Python: '    return -1', Java: '        return -1;', 'C++': '        return -1;', Rust: '        -1' }, 'Yes. Reaching this line means every possible index was eliminated safely.'),
        choice('last-mid', { Python: '    return mid', Java: '        return left;', 'C++': '        return left;', Rust: '        left' }, 'The final boundary or midpoint is not a verified match after the interval becomes empty.'),
        choice('zero', { Python: '    return 0', Java: '        return 0;', 'C++': '        return 0;', Rust: '        0' }, 'Index zero may contain another value; it cannot represent “not found” for this contract.'),
      ],
      stateEffect: 'The function returns the specified sentinel after proving no candidate remains.',
      exampleState: 'not reached because target 9 is found at index 4',
      explanation: 'The loop removes only impossible indices, so an empty interval proves target is absent.',
      hints: hints('This line runs only after left passes right.', 'No remaining index has been verified.', 'Use the problem’s required not-found sentinel.'),
    },
  ],
}

const treeLevelOrder: CodeConstructionConfig = {
  languages: ['Python'],
  exampleInput: 'root = [3, 9, 20, null, null, 15, 7]',
  openingByLanguage: { Python: 'from collections import deque\n\nclass Solution:\n    def levelOrder(self, root: Optional[TreeNode]) -> list[list[int]]:' },
  closingByLanguage: { Python: '' },
  steps: [
    {
      id: 'empty-tree', concept: 'Create the output and handle an empty tree', prerequisites: [], correctChoiceId: 'empty',
      choices: [
        choice('empty', { Python: '        levels = []\n        if root is None:\n            return levels' }, 'Yes. An empty tree has no levels, and this guard prevents enqueuing a missing node.'),
        choice('root-level', { Python: '        levels = [[root.val]]' }, 'This reads root.val before checking whether root exists and also records the root before traversal.'),
        choice('none', { Python: '        if root is None:\n            return None' }, 'The return type is a list of levels; the empty tree should therefore produce an empty list.'),
      ],
      stateEffect: 'levels is empty, and the function has safely finished if there is no root.', exampleState: 'levels = []; root is node 3, so continue', explanation: 'The guard establishes that every node later placed in the queue is a real node.',
      hints: hints('Consider root = None first.', 'The result always has a list shape.', 'An empty tree contains zero level lists.'),
    },
    {
      id: 'seed-queue', concept: 'Start breadth-first work at the root', prerequisites: ['empty-tree'], correctChoiceId: 'queue',
      choices: [
        choice('queue', { Python: '        queue = deque([root])' }, 'Yes. The queue initially contains the only node on level zero.'),
        choice('stack', { Python: '        stack = [root]' }, 'A LIFO stack naturally goes deep first; this exercise needs FIFO order to group nodes by level.'),
        choice('children', { Python: '        queue = deque([root.left, root.right])' }, 'This skips the root level and may enqueue missing children.'),
      ],
      stateEffect: 'queue contains the root, which is all pending work for the first level.', exampleState: 'queue = [3]', explanation: 'FIFO processing visits nodes in increasing distance from the root.',
      hints: hints('Level zero has one node.', 'Breadth-first search uses first-in, first-out work.', 'Initialize a deque containing root.'),
    },
    {
      id: 'level-boundary', concept: 'Freeze the current level size', prerequisites: ['seed-queue'], correctChoiceId: 'size',
      choices: [
        choice('size', { Python: '        while queue:\n            level = []\n            level_size = len(queue)' }, 'Yes. level_size captures only the nodes already belonging to this level.'),
        choice('dynamic', { Python: '        while queue:\n            level = []\n            level_size = 1' }, 'Most levels can contain more than one node, so a fixed size would split one level across outputs.'),
        choice('all-time', { Python: '        level_size = len(queue)\n        while queue:\n            level = []' }, 'The queue size changes between levels; it must be measured again at the start of each level.'),
      ],
      stateEffect: 'level_size is the exact number of nodes to remove before the next level begins.', exampleState: 'first pass: level = [], level_size = 1', explanation: 'Freezing the size prevents newly enqueued children from leaking into their parent level.',
      hints: hints('Children will be added during processing.', 'Measure before adding any child.', 'At a two-node level, process exactly two nodes even as their children enter the queue.'),
    },
    {
      id: 'consume-level', concept: 'Remove exactly the current level’s nodes', prerequisites: ['level-boundary'], correctChoiceId: 'pop-left',
      choices: [
        choice('pop-left', { Python: '            for _ in range(level_size):\n                node = queue.popleft()\n                level.append(node.val)' }, 'Yes. FIFO removal preserves breadth-first order, and each value enters the current level once.'),
        choice('pop-right', { Python: '            for _ in range(level_size):\n                node = queue.pop()\n                level.append(node.val)' }, 'Removing from the right reverses sibling order and no longer follows FIFO traversal.'),
        choice('drain', { Python: '            while queue:\n                node = queue.popleft()\n                level.append(node.val)' }, 'Draining the changing queue also consumes children that belong to later levels.'),
      ],
      stateEffect: 'level contains the values removed from the frozen current-level prefix of the queue.', exampleState: 'node = 3, level = [3], queue = [] before children', explanation: 'Exactly level_size FIFO removals isolate one breadth layer.',
      hints: hints('Use the size captured before children arrive.', 'Remove from the same side that has waited longest.', 'Repeat popleft exactly level_size times.'),
    },
    {
      id: 'enqueue-children', concept: 'Schedule the next level', prerequisites: ['consume-level'], correctChoiceId: 'real-children',
      choices: [
        choice('real-children', { Python: '                if node.left is not None:\n                    queue.append(node.left)\n                if node.right is not None:\n                    queue.append(node.right)' }, 'Yes. Existing children enter at the back in left-to-right order for the next level.'),
        choice('include-none', { Python: '                queue.append(node.left)\n                queue.append(node.right)' }, 'Missing children would enter the queue and later cause node.val access on None.'),
        choice('front', { Python: '                if node.left is not None:\n                    queue.appendleft(node.left)\n                if node.right is not None:\n                    queue.appendleft(node.right)' }, 'Adding children at the front makes them jump ahead of nodes still waiting on the current level.'),
      ],
      stateEffect: 'The queue retains unprocessed current-level nodes first, followed by real children for the next level.', exampleState: 'after node 3: queue = [9, 20]', explanation: 'Appending only real children preserves FIFO order and keeps queue entries safe to dereference.',
      hints: hints('A leaf contributes no new work.', 'Children wait behind nodes already queued.', 'Append left, then right, only when each exists.'),
    },
    {
      id: 'finish-level', concept: 'Commit the completed level and return all levels', prerequisites: ['enqueue-children'], correctChoiceId: 'append-return',
      choices: [
        choice('append-return', { Python: '            levels.append(level)\n        return levels' }, 'Yes. One completed list is appended per outer iteration, then the complete result is returned.'),
        choice('flatten', { Python: '            levels.extend(level)\n        return levels' }, 'extend removes the level grouping and produces one flat list instead of a list of lists.'),
        choice('early-return', { Python: '            levels.append(level)\n            return levels' }, 'Returning inside the outer loop stops after the root level and leaves deeper levels unvisited.'),
      ],
      stateEffect: 'levels gains one complete breadth layer; after the queue empties it contains the entire traversal.', exampleState: 'levels = [[3], [9, 20], [15, 7]]', explanation: 'The outer loop corresponds one-to-one with output levels, so return occurs only after all scheduled nodes are processed.',
      hints: hints('Preserve each level as its own list.', 'Finish all outer iterations before returning.', 'Append level inside the while loop; return levels after it.'),
    },
  ],
}

const courseSchedule: CodeConstructionConfig = {
  languages: ['Python'],
  exampleInput: 'numCourses = 2, prerequisites = [[1, 0]]',
  openingByLanguage: { Python: 'from collections import deque\n\nclass Solution:\n    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> bool:' },
  closingByLanguage: { Python: '' },
  steps: [
    {
      id: 'graph-state', concept: 'Represent dependencies and incoming counts', prerequisites: [], correctChoiceId: 'graph',
      choices: [
        choice('graph', { Python: '        graph = [[] for _ in range(numCourses)]\n        indegree = [0] * numCourses' }, 'Yes. graph records what each completed course unlocks, while indegree counts unmet prerequisites.'),
        choice('matrix', { Python: '        graph = [[0] * numCourses for _ in range(numCourses)]' }, 'A matrix can represent edges but uses quadratic space and still lacks the incoming counts needed for efficient readiness checks.'),
        choice('single-count', { Python: '        indegree = 0' }, 'Each course can have a different number of unmet prerequisites, so one shared count loses essential state.'),
      ],
      stateEffect: 'Every course has an empty outgoing list and zero recorded incoming prerequisites.', exampleState: 'graph = [[], []], indegree = [0, 0]', explanation: 'Adjacency lists plus indegree counts are the standard state for Kahn’s topological-sort algorithm.',
      hints: hints('Track both what a course unlocks and when it becomes ready.', 'Use one outgoing list and one incoming count per course.', 'Create numCourses adjacency lists and numCourses zero counts.'),
    },
    {
      id: 'build-edges', concept: 'Orient every prerequisite edge', prerequisites: ['graph-state'], correctChoiceId: 'prereq-to-course',
      choices: [
        choice('prereq-to-course', { Python: '        for course, prerequisite in prerequisites:\n            graph[prerequisite].append(course)\n            indegree[course] += 1' }, 'Yes. Completing prerequisite unlocks course, and course has one more unmet incoming requirement.'),
        choice('reverse', { Python: '        for course, prerequisite in prerequisites:\n            graph[course].append(prerequisite)\n            indegree[prerequisite] += 1' }, 'This reverses what “unlock” means for the queue-processing rules used below.'),
        choice('count-prereq', { Python: '        for course, prerequisite in prerequisites:\n            graph[prerequisite].append(course)\n            indegree[prerequisite] += 1' }, 'The incoming edge ends at course, so incrementing prerequisite assigns the dependency to the wrong vertex.'),
      ],
      stateEffect: 'Each directed edge points prerequisite → course, and indegree[course] counts its unmet prerequisites.', exampleState: 'graph = [[1], []], indegree = [0, 1]', explanation: 'This orientation lets processing a ready prerequisite update exactly the courses it unlocks.',
      hints: hints('Ask which course becomes available after the other is completed.', 'An edge points from requirement to dependent course.', 'For [1, 0], add 0 → 1 and increment indegree[1].'),
    },
    {
      id: 'seed-ready', concept: 'Begin with courses requiring nothing', prerequisites: ['build-edges'], correctChoiceId: 'zeros',
      choices: [
        choice('zeros', { Python: '        queue = deque(course for course in range(numCourses) if indegree[course] == 0)\n        completed = 0' }, 'Yes. Only zero-indegree courses are immediately safe to complete.'),
        choice('all', { Python: '        queue = deque(range(numCourses))\n        completed = 0' }, 'Courses with unmet prerequisites cannot be processed safely at the start.'),
        choice('max-degree', { Python: '        queue = deque(course for course in range(numCourses) if indegree[course] > 0)\n        completed = 0' }, 'Positive indegree identifies blocked courses, not ready ones.'),
      ],
      stateEffect: 'queue contains every currently available course; completed is zero.', exampleState: 'queue = [0], completed = 0', explanation: 'Zero indegree means every prerequisite for that course has already been satisfied—initially, because there are none.',
      hints: hints('Ready means no unmet incoming requirement.', 'Inspect the indegree value for each course.', 'Seed the queue with every course whose count equals zero.'),
    },
    {
      id: 'process-ready', concept: 'Complete one ready course', prerequisites: ['seed-ready'], correctChoiceId: 'pop-count',
      choices: [
        choice('pop-count', { Python: '        while queue:\n            course = queue.popleft()\n            completed += 1' }, 'Yes. FIFO removal chooses a proven-ready course and records one more successful completion.'),
        choice('peek', { Python: '        while queue:\n            course = queue[0]\n            completed += 1' }, 'Peeking without removal leaves the same course forever and prevents progress.'),
        choice('decrement', { Python: '        while queue:\n            course = queue.popleft()\n            completed -= 1' }, 'completed should count processed courses upward from zero.'),
      ],
      stateEffect: 'One ready course leaves the queue, and completed counts it exactly once.', exampleState: 'course = 0, queue = [], completed = 1', explanation: 'Every queued course has zero unmet prerequisites, so processing it respects all dependencies.',
      hints: hints('Each loop must reduce pending ready work.', 'Remove one course and increase the processed count.', 'popleft chooses one ready course; completed then increases by one.'),
    },
    {
      id: 'unlock-neighbors', concept: 'Remove the satisfied dependency', prerequisites: ['process-ready'], correctChoiceId: 'decrement-enqueue',
      choices: [
        choice('decrement-enqueue', { Python: '            for next_course in graph[course]:\n                indegree[next_course] -= 1\n                if indegree[next_course] == 0:\n                    queue.append(next_course)' }, 'Yes. Each outgoing edge is satisfied once, and a dependent course becomes ready exactly when its last requirement disappears.'),
        choice('increment', { Python: '            for next_course in graph[course]:\n                indegree[next_course] += 1\n                if indegree[next_course] == 0:\n                    queue.append(next_course)' }, 'Completing a prerequisite removes an unmet requirement; it must decrease, not increase, the dependent count.'),
        choice('enqueue-early', { Python: '            for next_course in graph[course]:\n                queue.append(next_course)\n                indegree[next_course] -= 1' }, 'A dependent course may still have other unmet prerequisites, so it cannot always be enqueued immediately.'),
      ],
      stateEffect: 'Each unlocked neighbor loses one unmet prerequisite and enters the queue only when its count reaches zero.', exampleState: 'indegree[1] = 0, queue = [1]', explanation: 'This update maintains the invariant that the queue contains only courses whose prerequisites are all completed.',
      hints: hints('One completed edge removes one requirement.', 'Readiness occurs at exactly zero remaining requirements.', 'Decrement each outgoing neighbor, then enqueue it only if the new count is zero.'),
    },
    {
      id: 'detect-cycle', concept: 'Decide whether every course was reachable', prerequisites: ['unlock-neighbors'], correctChoiceId: 'all-completed',
      choices: [
        choice('all-completed', { Python: '        return completed == numCourses' }, 'Yes. A cycle leaves at least one course blocked, so fewer than numCourses are processed.'),
        choice('queue-empty', { Python: '        return not queue' }, 'The loop always ends with an empty queue, including when a cycle blocked unprocessed courses.'),
        choice('some-completed', { Python: '        return completed > 0' }, 'Completing some independent courses does not prove that every course can be completed.'),
      ],
      stateEffect: 'The result is true exactly when all vertices were removed in a valid dependency order.', exampleState: 'completed = 2, numCourses = 2, return true', explanation: 'If a directed cycle exists, none of its remaining vertices can reach indegree zero, so the processed count exposes it.',
      hints: hints('An empty queue alone does not distinguish success from a cycle.', 'Compare processed work with total required work.', 'Success requires completed to equal numCourses.'),
    },
  ],
}

export const CODE_CONSTRUCTION_PILOT_IDS = [1, 3, 704, 102, 207] as const

export const codeConstructionByProblemId: Partial<Record<number, CodeConstructionConfig>> = {
  1: twoSum,
  3: longestSubstring,
  704: binarySearch,
  102: treeLevelOrder,
  207: courseSchedule,
}

export const assembleConstructionCode = (config: CodeConstructionConfig, language: string, completedStepIds = config.steps.map(({ id }) => id)) => {
  const completed = new Set(completedStepIds)
  const lines = [config.openingByLanguage[language]]
  for (const step of config.steps) {
    if (!completed.has(step.id)) continue
    const correct = step.choices.find(({ id }) => id === step.correctChoiceId)
    if (correct) lines.push(correct.codeByLanguage[language])
  }
  if (completed.size === config.steps.length && config.closingByLanguage[language]) lines.push(config.closingByLanguage[language])
  return lines.filter((line) => line !== undefined && line !== '').join('\n')
}
