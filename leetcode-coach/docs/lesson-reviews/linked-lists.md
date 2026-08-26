# Lesson review: Linked Lists

## Executive recommendation

Keep the lesson near the beginning of the curriculum, but make pointer meaning and the acyclic-input contract explicit before reversal. The main factual defect is a representation description that calls the list a “TreeNode-like object graph”; it must say `ListNode`-like. The rest of the authored algorithms and complexity analysis are accurate.

## Curriculum position

- Recommended catalog position: **2 of 13**, after Arrays & Hash Maps and before Stacks & Queues.
- This position introduces reference identity and local mutation before Two Pointers uses slow/fast node references.
- No authored prerequisite needs changing: Linked Lists remains independently approachable, while later lessons may refer back to its identity and rewiring invariants.

## Accuracy audit

- **Required correction:** replace “The runtime passes a TreeNode-like object graph” with “The runtime passes a `ListNode`-like object graph.” The current term names the wrong node type.
- **Required qualification:** reversal and ordinary tail-terminated traversal assume an acyclic list. On a cyclic input, `while (current)` does not terminate. State the contract before the walkthrough and code.
- The statement “insert/remove after a known node is O(1)” is accurate because it also explains that locating the node or predecessor can be O(n). This nuance should remain. Open Data Structures treats lists, queues, and linked implementations as separate interfaces and implementations, supporting the lesson’s interface-versus-cost distinction. [Open Data Structures overview](https://opendatastructures.org/).
- The even-length middle example correctly returns the second middle for the shown loop condition. Keep that convention beside the algorithm rather than leaving it only in the deep dive.
- The reverse, middle, and merge implementations have correct invariants and `O(n)`, `O(n)`, and `O(n + m)` time respectively. Merge assumes both input lists are sorted and do not share a suffix that would be attached twice; state the sorted-input contract and avoid broadening into aliasing behavior unless a representative problem requires it.

## Proposed hierarchy

1. **Make it intuitive** — order lives in references, not indexes.
2. **Foundations** — singly/doubly/circular distinctions, vocabulary, `ListNode`, dummy-head representation.
3. **Know when to reach for it** — node identity, local rewiring, random-access tradeoff, acyclic versus cyclic contracts.
4. **Derive the method** — pointer roles, reversed-prefix invariant, preserve/redirect/advance transitions.
5. **Reverse 1 → 2 → 3** — keep the walkthrough, adding the acyclic contract and explicit untouched suffix.
6. **Interactive execution** — retain the reviewed reverse-list trace.
7. **Why it is correct** — prove that the reversed prefix is complete, the untouched suffix remains reachable, and the loop terminates when that suffix is empty.
8. **Complexity & tradeoffs** — distinguish traversal cost from constant-time rewiring after a node is known.
9. **Reference implementation** — retain the iterative reversal.
10. **Boundaries & common mistakes** — empty/singleton/two-node cases, cycles, identity versus value, then practice.

## Change list

| Priority | Recommendation | Implementation guidance |
| --- | --- | --- |
| Required | Correct “TreeNode-like” to “`ListNode`-like.” | Change the authored representation description in the linked-list deep dive. |
| Required | State the acyclic-list contract for reversal and null-terminated traversal. | Add deterministic contract copy before derivation and mirror it in correctness/complexity assumptions. |
| Required | Replace tree-specific shared deep-dive labels with neutral labels. | Keep legacy section IDs for link compatibility. |
| Recommended | Rename “A repeatable recipe” to “Preserve, redirect, advance” and move it before the walkthrough. | Make the pointer-role invariant the center of the derivation. |
| Recommended | Put the second-middle convention beside the slow/fast technique heading. | Do not make learners infer it only from a trace. |

## Retain

Keep the distinction between node identity and equal values, the dummy-head explanation, the explicit preservation of `next`, the second-middle trace, the merge invariant, and the warning that arbitrary insertion is not automatically O(1).

## Acceptance criteria

- No linked-list section refers to a `TreeNode`.
- Every null-terminated loop states or inherits an acyclic-input assumption.
- Pointer roles and the reversed-prefix invariant appear before code.
- The walkthrough, code, correctness argument, and execution trace use the same reversal order.
- Visible headings are generic while existing section links continue to resolve.
