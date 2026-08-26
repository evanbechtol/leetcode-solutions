# LeetCode Coach Learn Redesign
## Milestone 6 — University-Core Algorithm Coverage

**Status:** Proposed  
**Date:** August 26, 2026  
**Product:** Pathfinder / LeetCode Coach  
**Area:** Learn — Data Structures & Algorithms curriculum  
**Program source:** `LEARN_CURRICULUM_REDESIGN_IMPLEMENTATION_PLAN.md`  
**Milestone:** M6

---

# 1. Objective

Fill the major classical DSA gaps required for a comprehensive undergraduate-style core.

This milestone is intentionally content-heavy and should be delivered through several PRs.

---

# 2. Scope Overview

M6 contains four sub-milestones:

- M6A — Sorting & Selection
- M6B — Trees & Priority Structures
- M6C — Graph Algorithms
- M6D — Design Paradigm Alignment

---

# 3. M6A — Sorting & Selection

Add:

1. Sorting Fundamentals
2. Merge Sort
3. Quicksort & Partitioning
4. Selection & Quickselect

Keep:
- Binary Search

Create:

## Module 2 — Sorting, Searching & Selection

Order:

1. Sorting Fundamentals
2. Merge Sort
3. Quicksort & Partitioning
4. Binary Search
5. Selection & Quickselect

---

# 4. Sorting Fundamentals Requirements

Must cover:

- why sorting is useful preprocessing;
- comparison sorting;
- stability;
- in-place vs auxiliary space;
- insertion sort;
- selection sort;
- why elementary sorts remain pedagogically useful;
- comparison-sort lower-bound intuition.

Do not over-invest in Bubble Sort.

---

# 5. Merge Sort Requirements

Must cover:

- split;
- recursively solve;
- merge;
- merge invariant;
- O(n log n) time;
- O(n) array auxiliary space;
- stable behavior;
- relation to divide-and-conquer.

Visualization:
- merge two sorted halves.

---

# 6. Quicksort & Partitioning Requirements

Must cover:

- pivot;
- partition invariant;
- two-way partition;
- conceptual three-way partition;
- average O(n log n);
- worst O(n²);
- randomized pivot intuition;
- in-place tradeoff;
- relationship to Quickselect.

Visualization:
- pivot and moving partition boundaries.

---

# 7. Selection & Quickselect Requirements

Must cover:

- kth smallest/largest;
- full sort vs heap vs Quickselect;
- partition reuse;
- average linear behavior;
- worst-case caveat.

Relationships:
- Quicksort;
- Heaps.

---

# 8. M6B — Trees & Priority Structures

Add:

1. Balanced Search Trees
2. Tries / Prefix Trees

Keep:

- Trees & Tree Traversal
- Binary Search Trees
- Heaps & Priority Queues

Create:

## Module 3 — Trees & Priority Structures

Order:

1. Trees & Tree Traversal
2. Binary Search Trees
3. Balanced Search Trees
4. Heaps & Priority Queues
5. Tries / Prefix Trees

---

# 9. Balanced Search Trees Requirements

Must cover:

- BST height problem;
- why balance matters;
- conceptual rotation/restructure;
- O(log n) search/insert/delete guarantee;
- conceptual relationship among:
  - 2–3 trees;
  - red-black trees.

Non-goal:
- production-quality red-black-tree implementation.

---

# 10. Tries Requirements

Must cover:

- prefix sharing;
- node-per-character transitions;
- insertion;
- whole-key search;
- prefix search;
- complexity relative to key length;
- memory tradeoff;
- autocomplete/prefix applications;
- contrast with hash tables.

---

# 11. M6C — Graph Algorithms

Add:

1. Connectivity & Union-Find
2. DAGs & Topological Sort
3. Shortest Paths
4. Minimum Spanning Trees

Keep/refine:

- Graph Foundations & Representations
- BFS & DFS

Create:

## Module 4 — Graph Algorithms

Order:

1. Graph Foundations & Representations
2. BFS & DFS
3. Connectivity & Union-Find
4. DAGs & Topological Sort
5. Shortest Paths
6. Minimum Spanning Trees

---

# 12. Union-Find Requirements

Must cover:

- connected components;
- parent representation;
- `find`;
- `union`;
- path compression;
- union by rank/size;
- near-constant amortized intuition;
- when traversal is preferable;
- connection to Kruskal.

---

# 13. Topological Sort Requirements

Must cover:

- DAG;
- dependency/prerequisite modeling;
- indegree;
- Kahn's algorithm;
- DFS finishing-order alternative;
- cycle detection;
- non-uniqueness of valid order;
- O(V + E).

Canonical LeetCode family:
- Course Schedule.

---

# 14. Shortest Paths Requirements

Teach algorithm **selection**, not Dijkstra memorization.

Required decision table:

| Graph property | Preferred algorithm |
| --- | --- |
| Unweighted / equal edge cost | BFS |
| DAG | Topological-order relaxation |
| Nonnegative weighted edges | Dijkstra |
| Negative edges possible | Bellman-Ford |

Must cover:

- distance;
- relaxation;
- predecessor;
- frontier;
- unreachable nodes;
- negative-weight caveat;
- complexity dependence on representation/priority queue.

Floyd-Warshall is optional/advanced.

---

# 15. Minimum Spanning Trees Requirements

Must cover:

- spanning tree;
- weighted undirected graph;
- cut intuition;
- Kruskal;
- Prim;
- Union-Find connection;
- greedy correctness intuition;
- distinction from shortest-path tree.

Required retrieval concept:

> Why is an MST not the same as shortest paths from one source?

---

# 16. M6D — Design Paradigm Alignment

Create:

## Module 5 — Algorithm Design Paradigms

Order:

1. Greedy Algorithms
2. Backtracking
3. Dynamic Programming

Refine existing content rather than rewrite unnecessarily.

Required prerequisites:

### Greedy
- Complexity
- Correctness/Invariants

### Backtracking
- Recursion
- Trees/DFS mental model

### Dynamic Programming
- Recursion
- Complexity
- state reasoning

DP progression should explicitly teach:

```text
recursive brute force
→ repeated states
→ memoization
→ state definition
→ recurrence
→ tabulation
→ reconstruction
→ space compression
```

---

# 17. Required Search Fixtures

Add:

```text
mergesort          -> Merge Sort
partition          -> Quicksort & Partitioning
kth largest        -> Selection & Quickselect / Heaps
balanced tree      -> Balanced Search Trees
red black          -> Balanced Search Trees
prefix tree        -> Tries
disjoint set       -> Connectivity & Union-Find
union find         -> Connectivity & Union-Find
course schedule    -> DAGs & Topological Sort
dependencies       -> DAGs & Topological Sort
dijkstra           -> Shortest Paths
negative weights   -> Shortest Paths
bellman ford       -> Shortest Paths
spanning tree      -> Minimum Spanning Trees
kruskal            -> Minimum Spanning Trees
prim               -> Minimum Spanning Trees
```

Canonical aliases should rank first.

---

# 18. Visualization Requirements

Recommended:

- Merge Sort — split/merge trace
- Quicksort — partition
- Quickselect — shrinking selected partition
- Balanced BST — height/rebalance concept
- Trie — prefix path
- Union-Find — parent forest
- Topological Sort — indegree/queue
- Shortest Paths — relaxation/frontier
- MST — selected edges/cut

---

# 19. Acceptance Criteria

- [ ] Module 2 is complete.
- [ ] Module 3 is complete.
- [ ] Module 4 is complete.
- [ ] Module 5 is structurally aligned.
- [ ] every P0 classical-core gap has a canonical lesson.
- [ ] shortest-path lesson teaches algorithm selection by graph properties.
- [ ] MST is explicitly distinguished from shortest paths.
- [ ] balanced BST explains height guarantees.
- [ ] graph terminology is consistent across lessons.
- [ ] search fixtures pass.
- [ ] validators pass.
- [ ] prerequisites remain acyclic.
- [ ] all core lessons follow concrete-before-formal sequencing.

---

# 20. Release Checkpoint

Completion of M6 establishes **Checkpoint B: Core DSA Content Complete**.

At this point Learn can reasonably claim broad core DSA content coverage.

Assessment/progress integration is completed in M7.

---

# 21. Completion Result

M6 is complete when the curriculum covers the recurring core data structures and algorithms represented across MIT 6.006, Stanford CS161, Princeton COS226, and Berkeley CS61B while preserving Pathfinder's applied teaching style.
