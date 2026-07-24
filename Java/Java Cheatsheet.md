# Java Coding Interview Spark Notes

## Basic Structure

```java
import java.util.*;

class Solution {
    public int solve(int[] nums) {
        return 0;
    }
}
```

## Variables

```java
int x = 10;
long big = 1_000_000L;
double price = 10.5;
boolean valid = true;
char letter = 'A';
String text = "hello";
```

## Arrays and Strings

```java
int[] nums = {1, 2, 3};
int[] empty = new int[5];

nums.length
text.length()
text.charAt(i)
text.substring(start, end)
text.equals("hello")
```

String comparison:

```java
text.equals(other)   // compares content
text == other        // compares references; usually avoid
```

## Collections

```java
List<Integer> list = new ArrayList<>();
Map<Integer, Integer> map = new HashMap<>();
Set<Integer> set = new HashSet<>();
Queue<Integer> queue = new ArrayDeque<>();
Deque<Integer> stack = new ArrayDeque<>();
```

### List

```java
list.add(value);
list.get(index);
list.set(index, value);
list.size();
list.contains(value);
list.remove(index);
```

### Map

```java
map.put(key, value);
map.get(key);
map.getOrDefault(key, 0);
map.containsKey(key);
map.remove(key);
```

Frequency count:

```java
map.put(num, map.getOrDefault(num, 0) + 1);
```

### Set

```java
set.add(value);
set.contains(value);
set.remove(value);
```

Duplicate detection:

```java
if (!set.add(value)) {
    return true;
}
```

### Queue

```java
queue.offer(value);
queue.peek();
queue.poll();
queue.isEmpty();
```

### Stack

```java
stack.push(value);
stack.peek();
stack.pop();
```

## Sorting

```java
Arrays.sort(nums);
Collections.sort(list);
list.sort(Collections.reverseOrder());
```

Custom sorting:

```java
items.sort((a, b) -> Integer.compare(a.value, b.value));
```

## Useful Helpers

```java
Math.min(a, b);
Math.max(a, b);
Math.abs(x);

Integer.MIN_VALUE;
Integer.MAX_VALUE;

Integer.parseInt("123");
String.valueOf(123);

Arrays.toString(nums);
```

## Problem Keywords → Likely Approach

| Problem wording                        | Likely tool or pattern              |
| -------------------------------------- | ----------------------------------- |
| frequency, count, occurrences          | `HashMap`                           |
| duplicate, unique, already seen        | `HashSet`                           |
| pair sums to target                    | `HashMap` or two pointers           |
| longest/shortest contiguous substring  | Sliding window                      |
| longest/shortest contiguous subarray   | Sliding window or prefix sum        |
| maximum/minimum over a moving range    | Sliding window, deque               |
| sorted array                           | Binary search or two pointers       |
| find target in sorted data             | Binary search                       |
| two values from opposite ends          | Two pointers                        |
| palindrome                             | Two pointers                        |
| merge sorted arrays/lists              | Two pointers                        |
| overlapping intervals                  | Sort, then merge                    |
| top `k`, largest `k`, smallest `k`     | Heap / `PriorityQueue`              |
| next greater/smaller element           | Monotonic stack                     |
| matching brackets or nested structure  | Stack                               |
| level-by-level tree traversal          | BFS / queue                         |
| shortest path in unweighted graph      | BFS                                 |
| explore all paths or connected regions | DFS or BFS                          |
| number of islands/components           | DFS, BFS, or Union-Find             |
| dependencies or prerequisites          | Graph + topological sort            |
| all combinations/permutations          | Backtracking                        |
| choose/not choose decisions            | Backtracking or dynamic programming |
| repeated overlapping subproblems       | Dynamic programming                 |
| maximum/minimum possible result        | Dynamic programming or greedy       |
| running sum, range sum                 | Prefix sum                          |
| subarray sum equals `k`                | Prefix sum + `HashMap`              |
| stream of values, repeated min/max     | Heap                                |
| cache with recent usage                | HashMap + doubly linked list        |
| common prefix, dictionary words        | Trie                                |
| connectivity changing over time        | Union-Find                          |

### Fast Recognition Rules

**Frequency / occurrence counting**

```java
Map<Integer, Integer> frequency = new HashMap<>();

for (int num : nums) {
    frequency.put(num, frequency.getOrDefault(num, 0) + 1);
}
```

**“Have I seen this before?”**

```java
Set<Integer> seen = new HashSet<>();

for (int num : nums) {
    if (!seen.add(num)) {
        return true;
    }
}
```

**Longest or shortest valid contiguous range**

Think sliding window:

```java
int left = 0;

for (int right = 0; right < nums.length; right++) {
    // Add nums[right] to window

    while (windowIsInvalid) {
        // Remove nums[left] from window
        left++;
    }

    int length = right - left + 1;
}
```

**Sorted input**

First consider:

```text
Binary search
Two pointers
```

**Tree or graph traversal**

```text
DFS: explore deeply, recursion, all paths
BFS: level order, shortest unweighted path
```

**All possible choices**

Think backtracking:

```java
void backtrack(List<Integer> current) {
    if (baseCase) {
        return;
    }

    for (int choice : choices) {
        current.add(choice);
        backtrack(current);
        current.remove(current.size() - 1);
    }
}
```

## Common Patterns

### Two Pointers

```java
int left = 0;
int right = nums.length - 1;

while (left < right) {
    if (condition) {
        left++;
    } else {
        right--;
    }
}
```

### Two Sum with HashMap

```java
public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> indices = new HashMap<>();

    for (int i = 0; i < nums.length; i++) {
        int needed = target - nums[i];

        if (indices.containsKey(needed)) {
            return new int[] {indices.get(needed), i};
        }

        indices.put(nums[i], i);
    }

    return new int[] {-1, -1};
}
```

Time: `O(n)`
Space: `O(n)`

### Binary Search

```java
int left = 0;
int right = nums.length - 1;

while (left <= right) {
    int mid = left + (right - left) / 2;

    if (nums[mid] == target) {
        return mid;
    } else if (nums[mid] < target) {
        left = mid + 1;
    } else {
        right = mid - 1;
    }
}

return -1;
```

Time: `O(log n)`

### DFS

```java
void dfs(TreeNode node) {
    if (node == null) {
        return;
    }

    dfs(node.left);
    dfs(node.right);
}
```

### BFS

```java
Queue<TreeNode> queue = new ArrayDeque<>();
queue.offer(root);

while (!queue.isEmpty()) {
    TreeNode node = queue.poll();

    if (node.left != null) {
        queue.offer(node.left);
    }

    if (node.right != null) {
        queue.offer(node.right);
    }
}
```

## Complexity Quick Reference

```text
Array access                 O(1)
HashMap get/put              O(1) average
HashSet add/contains         O(1) average
Single traversal             O(n)
Two independent traversals   O(n)
Nested full traversals       O(n²)
Sorting                      O(n log n)
Binary search                O(log n)
```

Two consecutive loops:

```java
for (...) { }
for (...) { }
```

Runtime:

```text
O(n + n) = O(n)
```

Nested loops that examine every pair:

```text
(n - 1) + (n - 2) + ... + 1
= n(n - 1) / 2
= O(n²)
```

Nested loops are not automatically `O(n²)`. Ask how many total times the inner work executes.

## Common Java Gotchas

```java
array.length
string.length()
list.size()
```

Generics require wrapper types:

```java
List<Integer> values;   // valid
List<int> values;       // invalid
```

Integer division:

```java
5 / 2       // 2
5.0 / 2     // 2.5
```

Remove from `List<Integer>`:

```java
list.remove(1);                   // removes index 1
list.remove(Integer.valueOf(1));  // removes value 1
```

Null check:

```java
if (node == null) {
    return;
}
```

Return immediately when the answer is found:

```java
if (condition) {
    return result;
}
```

## Interview Workflow

1. Clarify the input, output, and edge cases.
2. Identify keywords and likely patterns.
3. Explain the brute-force solution.
4. State its time and space complexity.
5. Explain the optimized approach.
6. Code clearly.
7. Test normal, empty, duplicate, and boundary cases.
8. Restate final complexity.
