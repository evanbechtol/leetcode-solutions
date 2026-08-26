# Lesson review: Two Pointers

## Executive recommendation

Move this lesson earlier, immediately after the three foundation data-structure lessons, and organize it around proof of elimination rather than the superficial presence of two indexes. The content is technically strong; the main improvement is to state the contract for each pointer family and separate opposite-end, read/write, and fast/slow invariants before presenting examples.

## Curriculum position

- Recommended catalog position: **4 of 13**, after Stacks & Queues and before Sliding Window.
- Arrays & Hash Maps supplies indexed sequences; Linked Lists supplies node references; this lesson can now compare both pointer forms without introducing either representation midstream.
- Keep Sliding Window after this lesson and explicitly describe it as the specialized case that maintains state for one contiguous interval.

## Accuracy audit

- The lesson correctly says two pointers is a technique, not a data structure, and correctly requires a monotonic elimination argument rather than pointer movement by intuition.
- The sorted Two Sum proof and `O(n)`/`O(1)` analysis are correct. State the exact contract: nondecreasing random-access input, two distinct positions, and either a promised solution or a documented empty result.
- The read/write compaction invariant is correct, but “in place” should consistently mean `O(1)` auxiliary space while acknowledging that the returned logical length may leave unspecified values in the physical suffix.
- The fast/slow representation needs its own precondition: a nullable linked chain and a guarded fast reference before taking two links. Its space is `O(1)`, but cycle problems and middle problems have different termination arguments.
- Container With Most Water correctly moves the shorter side; on equal heights, moving either side is safe. Keep the dominance proof rather than presenting the rule as a mnemonic.
- The standard binary-search material later in the curriculum provides a useful comparison: both techniques discard candidates using order, but binary search halves a monotone search space while two pointers move a boundary one step at a time. Stanford’s binary-search notes show why sorted order is what permits half-space elimination; the same kind of explicit order argument should remain visible here. [Stanford CS106B binary-search derivation](https://web.stanford.edu/class/archive/cs/cs106b/cs106b.1244/lectures/09-recursion2/#binary-search).

## Proposed hierarchy

1. **Make it intuitive** — two coordinated positions plus a proof that movement discards no answer.
2. **Foundations** — opposite ends, read/write, fast/slow; vocabulary and representations grouped by family.
3. **Know when to reach for it** — sorted/symmetric inputs, compaction, linked-list distance, and counter-signals.
4. **Derive the method** — state interval/prefix/path, invariant, comparison, eliminated candidates, convergence measure.
5. **Sorted pair sum walkthrough** — show the unresolved interval shrinking and name the discarded boundary at each step.
6. **Interactive execution** — retain the reviewed representative trace.
7. **Why it is correct** — formalize the too-small/too-large elimination and distinct-index termination.
8. **Complexity & tradeoffs** — pointer movement plus any preprocessing such as sorting; separate input mutation from auxiliary space.
9. **Reference implementation** — retain the sorted pair-sum implementation.
10. **Boundaries & common mistakes** — unsorted input, same-element reuse, nonmonotone movement, then practice.

## Change list

| Priority | Recommendation | Implementation guidance |
| --- | --- | --- |
| Required | Replace tree-specific shared labels with “Core vocabulary,” “Core techniques,” and “Trace the example.” | Preserve legacy section IDs until aliases are supported. |
| Required | Put each technique’s prerequisite beside its heading. | Opposite ends: ordered/symmetric elimination; read/write: processed-prefix contract; fast/slow: guarded references and termination condition. |
| Recommended | Rename “A repeatable recipe” to “Prove the pointer move” and place it before the walkthrough. | Require the authored steps to name what becomes impossible after each move. |
| Recommended | Add preprocessing to the complexity discussion. | If sorting is proposed for an unsorted input, report `O(n log n)` and whether original indexes must be preserved. |
| Optional | Add a short comparison card for “two pointers versus sliding window.” | Keep it after Boundaries so it does not reveal the next lesson before the technique is derived. |

## Retain

Keep the three-family taxonomy, unresolved-region vocabulary, sorted Two Sum invariant, read/write prefix, fast-pointer guard, and Container With Most Water dominance argument.

## Acceptance criteria

- A learner must be able to state why a pointer movement eliminates candidates.
- Every example names its ordering, identity, and output contract.
- Sorting and mutation costs are included when applicable.
- Sliding Window is distinguished by maintained interval state, not merely by using two indexes.
- Shared visible headings are neutral and existing links remain valid.
