# LeetCode Coach Learn Redesign
## Milestone 5 — Foundations & Structural Content

**Status:** Proposed  
**Date:** August 26, 2026  
**Product:** Pathfinder / LeetCode Coach  
**Area:** Learn — Data Structures & Algorithms curriculum  
**Program source:** `LEARN_CURRICULUM_REDESIGN_IMPLEMENTATION_PLAN.md`  
**Milestone:** M5

---

# 1. Objective

Repair the prerequisite chain before adding broad algorithm coverage.

This milestone introduces the reasoning foundations needed to teach later algorithms coherently and splits several overly broad existing lessons.

---

# 2. New Lessons

Add:

1. Algorithmic Thinking & Correctness
2. Complexity Analysis
3. Recursion & Call Stack
4. Divide-and-Conquer & Recurrences
5. Strings & Character Data

---

# 3. Existing Lesson Splits

## Arrays & Hash Maps

Split into:

- Arrays & Dynamic Arrays
- Hash Tables, Maps & Sets

Legacy route:

```text
/learn/arrays-hash-maps
```

must continue to resolve.

Recommended redirect target:
- Arrays & Dynamic Arrays

Display a prominent link to:
- Hash Tables, Maps & Sets

---

## Stacks & Queues

Split into:

- Stacks
- Queues & Deques

Preserve old route:

```text
/learn/stacks-queues
```

Redirect to Stacks with a link to Queues & Deques.

---

## Trees & Binary Search Trees

Split into:

- Trees & Tree Traversal
- Binary Search Trees

Prefer retaining:

```text
trees
```

as the general Trees lesson slug if practical.

BST becomes the explicit follow-up.

---

# 4. Final Module 0

## Algorithmic Foundations

Order:

1. Algorithmic Thinking & Correctness
2. Complexity Analysis
3. Recursion & Call Stack
4. Divide-and-Conquer & Recurrences

---

# 5. Final Module 1

## Linear Structures & Hashing

Order:

1. Arrays & Dynamic Arrays
2. Strings & Character Data
3. Linked Lists
4. Stacks
5. Queues & Deques
6. Hash Tables, Maps & Sets

---

# 6. Content Requirements — Algorithmic Thinking & Correctness

Must cover:

- input/output contract;
- constraints;
- preconditions;
- postconditions;
- invariant;
- progress/termination;
- counterexample;
- difference between examples passing and correctness.

Use a simple linear scan as the concrete anchor.

Example invariant:

> After processing the first `i` values, the maintained best value is correct for that prefix.

Do not require formal proof notation.

---

# 7. Content Requirements — Complexity Analysis

Must cover:

- input-size variables;
- operation counting;
- asymptotic growth;
- Big-O;
- Big-Theta;
- Big-Omega;
- best/average/worst case;
- auxiliary space;
- amortized cost;
- output-sensitive caveat.

Required examples:

- single scan;
- triangular nested loop;
- binary search;
- monotonic two-pointer movement;
- recursive depth;
- expected hash lookup.

Explicitly counter the misconception:

> nested loops are always O(n²)

---

# 8. Content Requirements — Recursion & Call Stack

Must cover:

- base case;
- recursive case;
- shrinking subproblem;
- stack frames;
- return values;
- preorder/postorder timing;
- maximum recursion depth;
- recursion vs iteration;
- JavaScript stack-depth caveat.

Use factorial only as a tiny mechanics example.

Primary DSA examples should involve:
- trees;
- linked structures;
- recursive search.

---

# 9. Content Requirements — Divide-and-Conquer & Recurrences

Must cover:

- divide;
- recursively solve;
- combine;
- recurrence intuition;
- recursion-tree intuition;
- relationship to merge sort;
- relationship to binary search.

Required recurrence:

```text
T(n) = 2T(n/2) + O(n)
```

Do not require a full Master Theorem treatment in core.

---

# 10. Content Requirements — Strings

Must cover:

- strings as indexed sequences;
- character data;
- immutability concerns where language-relevant;
- scanning;
- frequency counting;
- substrings vs subsequences;
- common transformations;
- relation to arrays and hashing.

Avoid duplicating specialized string-search algorithms here.

---

# 11. Required Metadata

Every new/split lesson must have:

- kind;
- tier;
- status;
- module;
- curriculum order;
- prerequisites;
- 3+ learning objectives for core lessons;
- aliases;
- concept keys;
- relationships;
- search keywords/signals.

---

# 12. Visualization Requirements

Minimum custom/explicit visualizations:

## Complexity
- compare concrete operation growth.

## Recursion
- call-stack frames.

## Divide-and-Conquer
- split and combine tree.

Existing problem visualizations may be reused for:
- arrays;
- hashing;
- stacks;
- queues;
- trees;
- BST.

Every lesson must explicitly declare visualization or no-visualization rationale.

---

# 13. Search Fixtures

Add/update:

```text
dictionary       -> Hash Tables, Maps & Sets
frequency map    -> Hash Tables, Maps & Sets
set              -> Hash Tables, Maps & Sets
recursive        -> Recursion & Call Stack
call stack       -> Recursion & Call Stack
big o            -> Complexity Analysis
theta            -> Complexity Analysis
auxiliary space  -> Complexity Analysis
divide conquer   -> Divide-and-Conquer & Recurrences
string           -> Strings & Character Data
deque            -> Queues & Deques
```

---

# 14. Prerequisite Updates

Later existing lessons should now reference these foundations.

Examples:

## Binary Search
Prerequisite:
- Complexity Analysis
- Arrays

## BFS & DFS
Prerequisite:
- Graph Foundations
- Queues/Stacks concepts

## Backtracking
Prerequisite:
- Recursion

## Dynamic Programming
Prerequisite:
- Recursion
- Complexity Analysis

## Greedy
Prerequisite:
- Complexity Analysis
- Correctness/Invariants

---

# 15. Acceptance Criteria

- [ ] Module 0 is complete.
- [ ] Module 1 is complete.
- [ ] all new lessons have canonical destinations.
- [ ] old split lesson slugs continue to resolve.
- [ ] prerequisite graph remains acyclic.
- [ ] advanced/design lessons reference appropriate new prerequisites.
- [ ] search fixtures pass.
- [ ] lesson validators pass.
- [ ] new content follows concrete-before-formal sequencing.
- [ ] no core lesson is only a vocabulary/reference page.

---

# 16. Out of Scope

- full sorting curriculum;
- Union-Find;
- shortest paths;
- MST;
- Progress V3;
- module assessments.

---

# 17. Completion Result

M5 is complete when Pathfinder has a coherent instructional foundation for algorithm analysis, recursion, correctness, and core linear data structures.
