# Lesson review: Heaps & Priority Queues

## Executive recommendation

Retain the title and place the lesson immediately after Trees. Organize it around the distinction between the priority-queue interface and the binary-heap implementation. The deep dive is accurate, but the top-level reference implementation is not self-contained because `MinPriorityQueue` is neither defined nor imported.

## Curriculum position

- Recommended catalog position: **8 of 13**, after Trees and before Graphs.
- Trees supplies complete-tree shape vocabulary; this lesson contrasts heap order with BST order and introduces the priority frontier used later by Dijkstra.
- Keep the Arrays prerequisite because the implementation is an implicit array tree.

## Accuracy audit

- **Required:** replace or complete the reference code. `MinPriorityQueue<number>` is not a browser/TypeScript built-in and has no definition or import in the lesson. Use the authored `pushMin`/`popMin` helpers in a self-contained example, or name and import an actual project dependency. Do not present pseudocode as runnable TypeScript.
- The min/max heap property, complete-tree shape, `O(1)` peek, `O(log n)` insertion/removal, and `O(n)` bottom-up heapify statements are correct. Open Data Structures includes implicit binary heaps and priority queues among its rigorously analyzed structures. [Open Data Structures](https://opendatastructures.org/).
- **Required:** change the “Build heap” row’s space from unconditional `O(n)` to distinguish representation from auxiliary space. Building a new heap array uses `O(n)` storage; in-place bottom-up heapify uses `O(1)` auxiliary space. The existing row currently mixes total structure storage with operation workspace.
- The bounded min-heap invariant and `O(n log k)`/`O(k)` analysis are correct, assuming `1 <= k <= n`. Add that contract before returning `heap[0]`.
- Dijkstra should remain an application preview only. Full correctness belongs in Graphs, after direction/weight prerequisites are introduced.

## Proposed hierarchy

1. **Make it intuitive** — expose one extreme without globally sorting.
2. **Foundations** — priority-queue interface, heap implementation, complete shape, local order, array indexes.
3. **Know when to reach for it** — repeated extreme, dynamic arrivals, top-k, and arbitrary-search counter-signals.
4. **Derive the method** — shape invariant plus order invariant; identify the only path that can be broken by push/pop.
5. **Keep the 3 largest values** — state `k` contract and show the eviction root.
6. **Interactive execution** — retain the reviewed Kth Largest trace.
7. **Why it is correct** — prove the bounded heap retains the largest `min(k, i)` values after each prefix.
8. **Complexity & tradeoffs** — peek, push/pop, bottom-up heapify, bounded heap, representation versus auxiliary storage.
9. **Reference implementation** — make the TypeScript self-contained.
10. **Boundaries & common mistakes** — wrong heap orientation, arbitrary search, unstable ties, library API differences, then practice.

## Change list

| Priority | Recommendation | Implementation guidance |
| --- | --- | --- |
| Required | Replace the undefined `MinPriorityQueue` reference implementation. | Reuse reviewed heap helpers or add an explicit, real import; keep deterministic code in authored data. |
| Required | Separate heap storage from heapify auxiliary space. | Report both in the complexity note instead of one unexplained `O(n)` space cell. |
| Required | State `1 <= k <= nums.length` for kth-largest examples. | Define invalid-input behavior if broader use is intended. |
| Required | Replace tree-specific shared headings on this non-tree lesson. | Use neutral visible copy and retain old section IDs/aliases. |
| Recommended | Rename “A repeatable recipe” to “Restore shape and order” and place it before the walkthrough. | Derive push/pop from the one-path violation. |

## Retain

Keep the interface-versus-implementation distinction, complete-tree index formulas, warning that heap order is not sorted order, bottom-up heapify bound, bounded min-heap choice for top-k, and lazy-deletion vocabulary.

## Acceptance criteria

- Every displayed TypeScript identifier is defined or explicitly imported.
- Heapify complexity distinguishes total representation space from auxiliary workspace.
- Top-k code states a valid `k` contract.
- Learners can explain why repair touches only one ancestor or descendant path.
- Shared visible headings are neutral and old links remain functional.
