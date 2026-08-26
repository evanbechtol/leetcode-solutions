# Lesson review: Binary Search

## Executive recommendation

Keep this as the final array-oriented pattern before hierarchical structures. The lesson already emphasizes invariants and monotone predicates; reorganize it so exact search, boundary search, and answer-space search are visibly separate contracts. The main correction is to stop presenting one `O(log n)` row as if it covers answer-space searches whose feasibility check is not constant time.

## Curriculum position

- Recommended catalog position: **6 of 13**, after Sliding Window and before Trees.
- This completes the array-pattern progression: linear scan with state, coordinated boundaries, maintained range, then logarithmic elimination.
- Placing it before Trees also prepares learners to compare array binary search with BST search, where runtime depends on height rather than array length alone.

## Accuracy audit

- Exact array search is correctly `O(log n)` time and `O(1)` auxiliary space for the iterative implementation. Stanford’s derivation confirms that sorted order justifies discarding half and that the interval shrinks logarithmically. [Stanford CS106B binary-search notes](https://web.stanford.edu/class/archive/cs/cs106b/cs106b.1244/lectures/09-recursion2/#binary-search).
- **Required:** split the complexity analysis. Exact and lower-bound searches use `O(log n)` constant-time midpoint checks; answer-space search uses `O(C log R)`, where `R` is the candidate range and `C` is the cost of `feasible`. The minimum-eating-speed example is `O(n log M)`, as its deep dive correctly states.
- **Required:** state the minimum-eating-speed contract: nonempty positive piles and enough allowed hours for a feasible speed (normally `h >= piles.length`). Without it, `high = max(piles)` may not be feasible, violating the closed answer-interval invariant.
- **Recommended:** qualify “overflow-safe midpoint” for TypeScript. `left + floor((right-left)/2)` is an important transferable pattern and avoids fixed-width integer addition overflow, but JavaScript numbers have different precision semantics. Keep the formula and explain that it also makes the interval arithmetic explicit.
- Lower bound’s half-open invariant and return of `values.length` when no value qualifies are correct and should remain prominent.

## Proposed hierarchy

1. **Make it intuitive** — ordered candidates plus a comparison that disproves a whole region.
2. **Foundations** — closed and half-open intervals, monotone predicates, exact/lower-bound/answer-space representations.
3. **Know when to reach for it** — ordered input or monotone feasibility; random-access and boundary requirements.
4. **Derive the method** — candidate interval, invariant, midpoint, retained/discarded region, strict decrease in interval length.
5. **Find 9 walkthrough** — retain exact search but label it as only the first variant.
6. **Interactive execution** — retain the reviewed Search in Sorted Array trace.
7. **Why it is correct** — prove preservation and termination for one boundary convention; link variants to their own invariants.
8. **Complexity & tradeoffs** — exact `O(log n)` versus answer-space `O(C log R)`.
9. **Reference implementation** — retain exact search; keep lower bound and answer-space examples in Core techniques.
10. **Boundaries & common mistakes** — mixed conventions, duplicate boundaries, infeasible ranges, nonmonotone predicates, then practice.

## Change list

| Priority | Recommendation | Implementation guidance |
| --- | --- | --- |
| Required | Split complexity by binary-search variant. | Mirror the distinction in the trust disclosure so it does not summarize all variants as `O(log n)`. |
| Required | Add explicit feasibility-range contracts to answer-space examples. | Require `low` and `high` to bracket a valid transition or explain no-solution handling. |
| Required | Replace tree-specific deep-dive labels with neutral shared labels. | Preserve legacy section IDs or aliases. |
| Recommended | Rename “A repeatable recipe” to “Define the interval invariant” and move it before the walkthrough. | Include a termination measure for each boundary form. |
| Recommended | Label the walkthrough and reference code “Exact-value variant.” | Prevent learners from generalizing early return to first/last-boundary tasks. |

## Retain

Keep the closed versus half-open distinction, lower/upper-bound vocabulary, monotone-predicate requirement, `right = mid` versus `mid - 1` reasoning, safe midpoint formula, and lower-bound return convention.

## Acceptance criteria

- Complexity includes feasibility-check cost and candidate-range size where applicable.
- Every answer-space example begins with a proven feasible search range or defined failure behavior.
- Exact, boundary, and answer-space variants each have an explicit invariant.
- The walkthrough is clearly labeled as exact search rather than the universal template.
- Shared headings are topic-neutral without breaking existing section links.
