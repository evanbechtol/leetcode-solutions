# Lesson review: Trees & Binary Search Trees

## Executive recommendation

Rename the visible lesson **“Trees: Traversal & BST Invariants”** so its unusually broad scope is explicit. Keep the rich foundations material, but separate universal tree properties, traversal choices, and BST-only ordering claims. The current deep dive is accurate; the main risks are definition conventions, duplicated traversal material, and a maximum-depth example that needs an explicit nodes-versus-edges contract.

## Curriculum position

- Recommended catalog position: **7 of 13**, after Binary Search and before Heaps.
- Stacks & Queues supplies recursion/frontier concepts, and Binary Search supplies ordered elimination; this lesson can then contrast full tree traversal with height-dependent BST search.
- Keep Trees as the prerequisite for Graphs. Keep Heaps immediately after Trees because a binary heap reuses tree vocabulary while imposing a different invariant.

## Accuracy audit

- **Required:** define the opening graph-theoretic statement as an **undirected** tree: connected and acyclic, with one simple path between each pair and `n - 1` edges. Rooted/directed terminology should follow as a separate orientation of that structure.
- The distinct-key BST invariant is correct because the duplicate policy is explicitly qualified. Keep that qualification; do not imply every BST library rejects duplicates.
- **Required:** state whether maximum depth counts nodes or edges. The reference `maxDepth` recurrence with `null -> 0` counts nodes on the longest root-to-leaf path. The vocabulary currently says height conventions vary, so the walkthrough must lock its own convention.
- **Recommended:** replace “LeetCode writes trees breadth-first” with “A common problem serialization lists nodes in breadth-first order and uses `null` for missing children.” This avoids a broad platform claim and respects the prohibition on importing platform prose.
- BST search is `O(h)`, becoming `O(log n)` only when height is logarithmic and `O(n)` when skewed. Stanford’s BST notes tie the ordering invariant to the entire left/right subtrees and separately discuss balanced depth. [Stanford CS106B BST notes](https://web.stanford.edu/class/archive/cs/cs106b/cs106b.1206/lectures/binary-search-trees/).
- DFS `O(h)` stack and BFS peak-width queue bounds are accurate. A full traversal is `O(n)`; do not summarize BST search as universally logarithmic.

## Proposed hierarchy

1. **Make it intuitive** — hierarchy, one parent path, recursive subtrees.
2. **Foundations** — undirected tree properties; rooted, binary, and BST distinctions; anatomy and vocabulary.
3. **Represent the tree** — linked nodes, adjacency list, and common level-order serialization.
4. **Know when to reach for it** — hierarchy, recursive subproblems, ordered search, and counter-signals.
5. **Derive the method** — choose DFS/BFS/BST search; state frontier, invariant, transition, and base case.
6. **Compute maximum depth** — state node-count convention and trace the recurrence.
7. **Interactive execution** — retain the reviewed Maximum Depth trace.
8. **Why it is correct** — structural-induction argument for max depth plus separate BST elimination argument.
9. **Complexity & tradeoffs** — `n`, height `h`, width `w`, balance assumption, output space.
10. **Reference implementation** — retain max depth; Core techniques retains leaf collection, DFS, BFS, and BST search.
11. **Boundaries & common mistakes** — binary tree versus BST, cycle handling for adjacency lists, height conventions, then practice.

## Change list

| Priority | Recommendation | Implementation guidance |
| --- | --- | --- |
| Required | Rename the lesson “Trees: Traversal & BST Invariants.” | Update catalog, rail, page title, search text, and any tests/snapshots together in a future implementation. Keep the slug stable. |
| Required | Qualify the graph-theoretic definition as undirected and lock the max-depth convention. | Align introduction, vocabulary, walkthrough, code explanation, and complexity assumptions. |
| Required | Add a visible correctness section. | Use structural induction for max depth and the authored subtree invariant for BST search. |
| Recommended | Move tree representations before recognition and core algorithms after recognition. | Learners should know the state shape before choosing a traversal. |
| Recommended | Move this embedded deep dive into the structure deep-dive module in a future content refactor. | This is maintainability-only; preserve authored data and runtime behavior. |
| Recommended | Generalize shared IDs/classes eventually, but preserve `tree-algorithms` as an alias. | The tree lesson may keep tree-specific visible copy; non-tree lessons must not inherit it. |

## Retain

Keep the anatomy diagram, unique-path and `n - 1` facts, duplicate-policy qualification, height warning, DFS/BFS frontier comparison, parent/visited nuance for undirected adjacency lists, and balanced-versus-skewed BST bounds.

## Acceptance criteria

- Universal tree claims are clearly separated from rooted, binary, and BST-specific claims.
- Maximum depth states and consistently uses one counting convention.
- BST complexity is parameterized by height before balance is discussed.
- Graphs and BFS & DFS may reference this lesson without duplicating its tree-specific derivations.
- The slug and existing section links remain stable despite visible renaming.
