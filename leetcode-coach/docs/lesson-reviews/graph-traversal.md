# Lesson review: BFS & DFS

## Executive recommendation

Move this lesson immediately after Graphs and make it the single authoritative lesson for BFS/DFS frontier order, visited timing, shortest unweighted paths, iterative/recursive DFS, and grid traversal. The content is accurate; improvements should clarify where visited state is optional, distinguish reachability from exhaustive path enumeration, and eliminate duplication with Graphs.

## Curriculum position

- Recommended catalog position: **10 of 13**, directly after Graphs.
- Keep it as the second lesson in the Graphs track and preserve Trees as the transitive prerequisite through Graphs.
- Follow it with Backtracking, which can then build on DFS while explaining when visited state belongs to the current path rather than being permanent.

## Accuracy audit

- BFS first discovery gives a minimum-edge path in an unweighted/equal-weight graph; DFS does not generally do so. MIT’s BFS notes explicitly tie BFS levels and parent pointers to fewest-edge paths and give linear adjacency-list traversal bounds. [MIT 6.006 BFS lecture notes](https://www.ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/1208e162775f6f5cedfbb9f2b694ede0_MIT6_006F11_lec13.pdf).
- `O(V + E)` time and `O(V)` auxiliary state are correct for adjacency-list traversal, excluding the input graph. For a recursive DFS, stack depth may be `O(V)`; for a grid flood fill, it may be `O(rows * cols)`.
- **Required:** qualify “both ... track visited state.” General graphs need a discovered/visited rule, but a rooted tree can rely on child direction, and an undirected tree can track only the parent. The deep dive already states this nuance; move it into the top-level mental model.
- **Required:** replace “DFS for exhaustive paths” with “DFS is a traversal order used by exhaustive path search.” Ordinary DFS with a permanent visited set visits each vertex once and does not enumerate every simple path. Exhaustive paths require path-local state/backtracking.
- The recommendation to mark on enqueue/push is correct for the shown one-visit traversals and prevents duplicate frontier entries. Backtracking will later teach deliberate unmarking under a different contract.
- The island code mutates the grid. Keep the mutation warning visible before the implementation rather than only implied by the code.

## Proposed hierarchy

1. **Make it intuitive** — same discovered work, different frontier order.
2. **Foundations** — queue/stack/recursion, discovery versus processing, visited/parent/path-local state.
3. **Know when to reach for it** — reachability/components, layers/shortest steps, subtree/path state, and weighted-path counter-signals.
4. **Derive BFS** — state, queue invariant, mark-on-enqueue transition, shortest-path correctness.
5. **Derive DFS** — recursive/explicit frontier, entry/exit invariant, neighbor-order effect, stack-depth risk.
6. **Choose the frontier walkthrough** — use the same graph and adjacency order for both, showing complete queue/stack contents.
7. **Interactive execution** — retain the reviewed representative trace.
8. **Why it is correct** — separate BFS layer proof and DFS reachable-set proof.
9. **Complexity & tradeoffs** — adjacency-list, grid, recursion depth, frontier width, mutation.
10. **Reference implementation** — keep BFS shortest steps as the primary code; core cards retain iterative DFS and island fill.
11. **Boundaries & common mistakes** — weights, late marking, parent-only trees, path enumeration, input mutation, then practice.

## Change list

| Priority | Recommendation | Implementation guidance |
| --- | --- | --- |
| Required | Move this lesson directly after Graphs. | Update catalog order, previous/next navigation, and any numbering tests without changing slugs or track order. |
| Required | Make this lesson authoritative for traversal derivation. | Reduce Graphs to modeling/representation plus an algorithm-selection preview. |
| Required | Correct the “exhaustive paths” and universal-visited wording. | Align mental model, signals, recipe, and boundaries with path-local backtracking semantics. |
| Required | Replace tree-specific shared headings with neutral labels. | Keep legacy section IDs or aliases. |
| Recommended | Split the method into “Derive BFS” and “Derive DFS.” | Do not force two different correctness arguments into one generic recipe. |
| Recommended | State mutation beside grid DFS. | Offer a visited set as the nonmutating alternative without changing the representative code unless required. |

## Retain

Keep frontier terminology, mark-on-discovery timing, BFS parent reconstruction, reverse neighbor pushing for recursive-order parity, grid-as-implicit-graph framing, and recursion-depth warning.

## Acceptance criteria

- Graphs teaches modeling; this lesson teaches traversal, with no full duplicate walkthrough.
- BFS shortest-path claims always say unweighted/equal-weight.
- DFS is not described as enumerating all paths under a permanent visited set.
- Tree parent tracking, general visited state, and backtracking path state are distinguished.
- Shared headings are neutral and existing deep links remain valid.
