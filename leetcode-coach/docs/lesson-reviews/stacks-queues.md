# Lesson review: Stacks & Queues

## Executive recommendation

Retain the combined lesson because both structures answer the same design question: which pending item is processed next? Reorganize it around frontier order, then derive the bracket-stack invariant before the example. Tighten the input contract of `isValid` and the definition of a monotonic stack.

## Curriculum position

- Recommended catalog position: **3 of 13**, after Linked Lists and before Two Pointers.
- This placement introduces the call stack and FIFO/LIFO frontiers before Trees, Graphs, BFS/DFS, and Backtracking.
- Keep Stacks & Queues combined; their contrast is pedagogically stronger than two short isolated lessons.

## Accuracy audit

- **Required:** the reference `isValid` pushes every character that is not a closing bracket. It is correct only under a bracket-only input contract. Either state “input contains only `()[]{}`” or explicitly recognize openers and reject/ignore other characters according to a stated contract. Do not leave the behavior implicit.
- **Required:** redefine “monotonic stack” as a stack maintained in nondecreasing, nonincreasing, strictly increasing, or strictly decreasing order according to the comparison rule. The current “entirely increasing or decreasing” wording conflicts with the next-greater example, whose stack values may be equal and are therefore non-increasing rather than strictly decreasing.
- **Recommended:** keep the warning against repeated `Array.shift()`, but explain it in JavaScript terms: `shift()` removes index 0 and shifts remaining values toward lower indexes. [MDN describes that shifting behavior](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift#description). An array plus head index gives constant work per dequeue in this authored model, while its backing array may retain processed slots until compacted.
- The amortized `O(n)` monotonic-stack proof is correct: each index is pushed once and popped at most once.
- The moving-average implementation is `O(n)` time and `O(k)` active-window state, but the backing array can grow to `O(n)` without compaction. The deep dive already notes this; the complexity row should say “O(k) logical active state; O(n) retained backing storage in this implementation.”

## Proposed hierarchy

1. **Make it intuitive** — stack and queue as policies for pending work.
2. **Foundations** — LIFO/FIFO, operations, array/head-index/deque representations, strictness-aware monotonic stacks.
3. **Know when to reach for it** — nested obligations, discovery order, nearest unresolved candidate, alternatives such as priority queues.
4. **Derive the method** — bracket-only contract, unmatched-opener stack state, invariant, push/pop transition, empty-stack termination condition.
5. **Validate “([])”** — retain the walkthrough and explicitly show the stack after every character.
6. **Interactive execution** — retain the reviewed Valid Parentheses trace.
7. **Why it is correct** — explain why only the most recent unmatched opener can match a closer.
8. **Complexity & tradeoffs** — stack, queue implementation choices, amortized monotonic passes, retained storage.
9. **Reference implementation** — retain after the contract is explicit.
10. **Boundaries & common mistakes** — invalid characters, underflow, late visited marking in future BFS use, then practice.

## Change list

| Priority | Recommendation | Implementation guidance |
| --- | --- | --- |
| Required | State or enforce the bracket-only input contract. | Align Mental model, walkthrough, code, trace assumptions, and pitfalls. |
| Required | Correct monotonic-stack terminology to include strictness. | Update vocabulary and the next-greater algorithm description together. |
| Required | Replace tree-specific shared labels with neutral deep-dive labels. | Preserve existing section IDs or aliases. |
| Recommended | Rename “A repeatable recipe” to “Choose and maintain the frontier” and move it before the walkthrough. | Use separate derivation bullets for stack and queue policies, then specialize to brackets. |
| Recommended | Make physical versus active queue storage explicit. | Do not claim `O(k)` total backing storage for the un-compacted array/head-index implementation. |

## Retain

Keep the unfinished-obligation mental model, the LIFO/FIFO contrast, the head-index queue guidance, the next-greater amortization proof, and the warning that a visible nested `while` loop is not by itself evidence of `O(n²)` behavior.

## Acceptance criteria

- The Valid Parentheses implementation has an explicit character-domain contract.
- Monotonic order states its strictness and matches the comparison in code.
- Queue complexity distinguishes active state from retained backing storage.
- The stack invariant is taught before the walkthrough and reference code.
- Shared headings are topic-neutral and no deep links are broken.
