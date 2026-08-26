# Lesson review: Graphs

## Executive recommendation

Refocus this lesson on graph modeling, representation, and algorithm selection; move detailed BFS/DFS derivation to the adjacent BFS & DFS lesson. The current page repeats traversal content that appears again later, while its own most valuable material—direction, weights, components, adjacency forms, topological ordering, and Dijkstra prerequisites—deserves the center. Correct the glossary definition of a cycle and clarify build versus storage complexity.

## Curriculum position

- Recommended catalog position: **9 of 13**, after Heaps and immediately before BFS & DFS.
- Preserve Trees as the authored prerequisite. Learners can generalize from a connected acyclic structure to arbitrary cycles, multiple paths, and disconnected components.
- Keep BFS & DFS as the second lesson in the same Graphs track and remove the current three-lesson gap between them.

## Accuracy audit

- **Required:** replace “Cycle: A path that returns to an already visited vertex.” A cycle is a closed path with appropriate vertex/edge repetition conditions; merely reaching a visited vertex is not itself a definition and, in an undirected traversal, the parent edge is expected. Use: “A cycle is a closed route that starts and ends at the same vertex without repeating other vertices in the simple-cycle definition.”
- **Required:** rename the complexity operation “Adjacency list storage” to “Build adjacency list from vertices and edges.” Storage has a space bound, not a time bound by itself. Building the shown representation is `O(V + E)` time and space; in an undirected list, `2E` neighbor entries remain `O(E)`.
- The adjacency-list/matrix tradeoff, component algorithm, Kahn topological ordering, and nonnegative-weight requirement for Dijkstra are correct. Princeton’s graph materials cover DFS, BFS, topological structure, and shortest paths as distinct graph problems, supporting the proposed separation of modeling from traversal. [Princeton Algorithms graph chapter](https://algs4.cs.princeton.edu/home/#4_Graphs).
- Dijkstra’s stated binary-heap bound `O((V + E) log V)` is valid for the lazy-entry implementation shown. Keep the stale-entry check and state that graph storage is included separately from auxiliary queue/distance storage.
- **Recommended:** state that “tree is a special case” refers to a connected, undirected, acyclic graph. Directed arborescences need their own definition.

## Proposed hierarchy

1. **Make it intuitive** — entities, relationships, and the questions edges encode.
2. **Foundations** — directed/undirected, weighted/unweighted, sparse/dense, paths/cycles/components/DAGs.
3. **Represent the graph** — edge list, adjacency list, matrix, and implicit graph.
4. **Know when to reach for it** — model the vertex, edge, direction, weight, and objective before choosing an algorithm.
5. **Derive the representation** — build an undirected adjacency list with its exact prefix invariant.
6. **Algorithm selection map** — unweighted reachability → BFS/DFS lesson; dependencies → topological sort; nonnegative weighted shortest path → Dijkstra; negative weights → another method.
7. **Worked illustration** — replace the detailed BFS walkthrough with adjacency-list construction or graph classification to avoid duplicating the next lesson.
8. **Interactive execution** — keep the reviewed representative trace only if its framing explicitly says it previews traversal; otherwise remap to a representation-focused reviewed trace in a future implementation.
9. **Why it is correct** — adjacency construction invariant and, for retained advanced cards, their own proofs.
10. **Complexity & tradeoffs** — representation build/storage, traversal preview, matrix edge query, Dijkstra assumptions.
11. **Reference implementation** — prefer adjacency construction here; detailed BFS implementation belongs in BFS & DFS.
12. **Boundaries & common mistakes** — direction, duplicate edges, disconnected vertices, weights, mutation, then practice.

## Change list

| Priority | Recommendation | Implementation guidance |
| --- | --- | --- |
| Required | Correct the cycle definition. | Update glossary and any diagnostics or repair links that reuse the term. |
| Required | Put Graphs directly before BFS & DFS in catalog order. | Keep track order `['graphs', 'graph-traversal']`; update catalog navigation only. |
| Required | Remove or demote duplicate BFS derivation from Graphs. | Keep a short algorithm-selection preview; make BFS & DFS authoritative for frontier invariants and shortest unweighted paths. |
| Required | Rename the adjacency-list complexity operation. | Separate build time, representation space, and traversal cost. |
| Required | Replace tree-specific shared labels with graph-neutral labels. | Preserve old section IDs or aliases. |
| Recommended | Rename “A repeatable recipe” to “Model the graph before choosing the algorithm.” | Order questions as vertex, edge, direction, weight, objective, then representation. |

## Retain

Keep the direction/weight checklist, sparse-versus-dense comparison, both-direction insertion warning, component invariant, Kahn cycle detection by output count, Dijkstra stale-entry handling, and nonnegative-edge requirement.

## Acceptance criteria

- A cycle is defined independently of a particular visited-set implementation.
- Representation costs and traversal costs use different rows and parameters.
- Graphs and BFS & DFS are adjacent and have nonduplicative learning objectives.
- Each shortest-path claim states its edge-weight assumptions.
- Shared headings are neutral and existing section links are preserved.
