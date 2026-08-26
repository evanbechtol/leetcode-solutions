# Lesson review: Backtracking

## Executive recommendation

Place Backtracking immediately after BFS & DFS and before Dynamic Programming. Its conceptual role should be “DFS over a decision tree with path-local state.” Align the top-level walkthrough, reference implementation, deep-dive subset algorithm, and interactive trace: they currently teach two different subset enumeration orders without saying so.

## Curriculum position

- Recommended catalog position: **11 of 13**, after BFS & DFS and before Dynamic Programming.
- This sequence derives advanced choice methods progressively: explore a decision tree with Backtracking, merge equivalent states with Dynamic Programming, then discard alternatives only after a Greedy safety proof.
- Stacks & Queues supplies call-stack vocabulary, and BFS & DFS supplies traversal order; no new authored track prerequisite is required unless an advanced-pattern track is added later.

## Accuracy audit

- The choose/explore/unchoose model, path-copy warning, duplicate-skipping definition, and output-sensitive deep-dive bounds are correct.
- **Required consistency fix:** the top-level reference uses binary exclude/include recursion and records only at leaves, with exclusion visited first. For `[1,2]`, its result order is `[]`, `[2]`, `[1]`, `[1,2]`. The top-level walkthrough instead says “record the current path” and follows choose-first behavior, while the deep-dive loop implementation records every node in order `[]`, `[1]`, `[1,2]`, `[2]`. Choose one canonical subset generator and use it in the walkthrough, reference code, deep-dive card, and representative trace. The loop/start-index version is recommended because its invariant and duplicate prevention are clearer.
- **Required:** replace the generic headline `O(branching^depth)` / `O(depth)` row for the representative subset lesson with `O(n * 2^n)` time including result copying, `O(n)` active recursion/path space, and `O(n * 2^n)` output space. Keep branching/depth only as a general search-tree model.
- **Required:** state whether inputs contain distinct values. The subset and permutation examples do not skip duplicates. If duplicate values are allowed but unique outputs are required, sorting and same-depth duplicate skipping are necessary.
- Stanford’s recursion material explicitly models recursive sequence/permutation generation as a decision tree and shows that subset-like enumeration has exponential output. [Stanford CS106B recursive generation notes](https://web.stanford.edu/class/archive/cs/cs106b/cs106b.1244/lectures/09-recursion2/#recursive-sequence-generation-coin-flips).

## Proposed hierarchy

1. **Make it intuitive** — DFS over choices; the active call stack is one candidate path.
2. **Foundations** — decision tree, path, choice set, base case, constraint state, copy, pruning, duplicate policy.
3. **Know when to reach for it** — enumerate candidates, modest constraints, path-local validity; contrast permanent graph visited state.
4. **Derive the method** — call meaning, legal choices, choose, recurse, exact undo, complete-candidate condition, pruning proof.
5. **Subsets of [1, 2] walkthrough** — trace the same start-index loop used by the canonical implementation.
6. **Interactive execution** — ensure the reviewed representative trace follows the same variant or explicitly label a different representative problem.
7. **Why it is correct** — prove every valid subset is generated once and no reordered duplicate is generated.
8. **Complexity & tradeoffs** — search nodes, per-output copying, active space, output space, pruning versus worst case.
9. **Reference implementation** — use the start-index subset generator from the deep dive.
10. **Boundaries & common mistakes** — shared path references, incomplete undo, duplicate inputs, DP-overlap alternative, then practice.

## Change list

| Priority | Recommendation | Implementation guidance |
| --- | --- | --- |
| Required | Select one canonical subset generator across all lesson surfaces. | Recommend the start-index loop that records `path` at each call; update walkthrough order, code, and any trace-specific teaching facts together. |
| Required | Use output-sensitive subset complexity. | Separate active auxiliary space from returned output storage. |
| Required | State the distinct-input or unique-output contract. | Add deterministic duplicate-skipping content only if the intended problem contract requires it. |
| Required | Replace tree-specific shared labels with neutral labels. | “Decision tree” remains valid lesson content; the renderer must not call every example a literal tree input. |
| Recommended | Rename “A repeatable recipe” to “Choose, explore, restore” and place it before the walkthrough. | Include call meaning and exact restoration, not just the three-word mnemonic. |

## Retain

Keep the path-copy warning, exact undo pairing, start-index combinations, used-array permutations, constraint sets, pruning caveat, and distinction from DP state merging.

## Acceptance criteria

- Walkthrough, code, deep dive, and reviewed trace do not silently use different enumeration orders.
- Complexity counts result copying and output storage.
- Duplicate-value behavior is explicit.
- Learners can distinguish permanent graph visited state from path-local constraint state.
- Shared headings are neutral and deep links remain stable.
