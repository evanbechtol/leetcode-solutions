# Lesson review: Sliding Window

## Executive recommendation

Keep Sliding Window immediately after Two Pointers and make “state describes exactly the current contiguous interval” the organizing invariant. The authored content is accurate and unusually good about negative values and monotonic repair. Tighten the numeric and string-domain contracts, and replace the ambiguous headline `O(k)` space claim with a named state-size parameter.

## Curriculum position

- Recommended catalog position: **5 of 13**, after Two Pointers and before Binary Search.
- Arrays & Hash Maps provides frequency state; Two Pointers provides monotone boundary movement. This lesson combines them into an incrementally maintained interval.
- Preserve its track prerequisite on Arrays. No prerequisite change is needed.

## Accuracy audit

- The fixed-window and longest-unique implementations, traces, and invariants are correct for their stated model.
- **Required:** replace the generic complexity row’s `O(k)` space with `O(s)`, where `s` is the number of distinct keys or other maintained state, then give per-example bounds. Here `k` is already commonly used as a window length, so using it for “tracked state size” is ambiguous.
- **Required:** state that `minSubarrayLength` assumes `target > 0` and nonnegative values. The monotone sum argument also works with zeros; “positive values” is safe but unnecessarily narrow. Arbitrary negative values invalidate the simple shrink proof.
- **Required:** state the character model for `longestUnique`. JavaScript string indexing processes UTF-16 code units, not necessarily user-perceived Unicode characters. If the representative contract is lowercase/ASCII, state that domain. If arbitrary Unicode is intended, iterate code points and define indexes accordingly. [MDN explains that JavaScript string length counts UTF-16 code units](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length#description).
- The claim of amortized `O(n)` boundary movement is correct because each boundary only advances. Keep the proof beside the nested `while` loop rather than only in vocabulary.

## Proposed hierarchy

1. **Make it intuitive** — one contiguous range whose state changes at its edges.
2. **Foundations** — fixed versus variable windows, inclusive `[left, right]` convention, running aggregate/frequency/last-seen representations.
3. **Know when to reach for it** — contiguity, incremental updates, monotone repair, and negative-value counterexamples.
4. **Derive the method** — define window, state invariant, expand transition, repeated shrink transition, eligibility point.
5. **Longest unique substring walkthrough** — include the string-domain contract and explain why `left` never moves backward.
6. **Interactive execution** — retain the reviewed representative trace.
7. **Why it is correct** — prove window validity and why every candidate needed for the optimum is evaluated.
8. **Complexity & tradeoffs** — boundary movements, state size, Unicode representation, and fixed versus variable windows.
9. **Reference implementation** — retain the last-seen jump implementation after its character model is stated.
10. **Boundaries & common mistakes** — negative sums, stale zero counts, one-shrink versus while-shrink, subsequence confusion, then practice.

## Change list

| Priority | Recommendation | Implementation guidance |
| --- | --- | --- |
| Required | Replace ambiguous `O(k)` auxiliary space with a named state-size bound. | Use `O(s)` generically and `O(min(n, alphabet))` for the longest-unique map. |
| Required | State numeric and text input contracts. | Add `target > 0`, nonnegative values for the minimum-sum window, and an ASCII/code-unit/code-point choice for strings. |
| Required | Replace tree-specific shared labels with neutral topic labels. | Keep old section IDs or aliases for shared links. |
| Recommended | Rename “A repeatable recipe” to “Maintain the window invariant” and move it before the walkthrough. | Keep expand, repair, and record as distinct transitions. |
| Recommended | Group technique cards as fixed, variable, and last-seen-jump variants. | Avoid making the last-seen jump look identical to decrementing frequency state. |

## Retain

Keep the contiguity distinction, exact-current-range state requirement, `Math.max` guard against moving `left` backward, negative-value warning, zero-count key deletion guidance, and amortized movement proof.

## Acceptance criteria

- Every window example states its interval convention and input domain.
- The top-level space complexity uses a defined parameter.
- The longest-unique example states whether it counts UTF-16 code units or another character model.
- The correctness section proves both maintained validity and coverage of eligible candidates.
- Shared visible headings are neutral and deep links remain stable.
