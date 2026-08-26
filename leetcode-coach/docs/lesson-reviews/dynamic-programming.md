# Lesson review: Dynamic Programming

## Executive recommendation

Keep the title and place the lesson after Backtracking. Reorganize it around five explicit artifacts—state meaning, recurrence, base cases, evaluation order, and answer extraction—before the Climbing Stairs trace. The content is accurate, but the generic complexity row should use defined parameters and the representative code needs an explicit input contract.

## Curriculum position

- Recommended catalog position: **12 of 13**, after Backtracking and before Greedy.
- Backtracking exposes repeated decision-tree states; this lesson then shows how memoization or tabulation merges equivalent futures.
- Greedy follows as the stronger claim that alternatives may be discarded entirely after a proof of safety.
- Preserve Arrays as the authored prerequisite; no track mutation is required for this documentation deliverable.

## Accuracy audit

- The state/transition/base/evaluation-order model is accurate. MIT materials identify optimal substructure and overlapping subproblems as the properties that make memoization useful. [MIT OpenCourseWare dynamic-programming lecture](https://ocw.mit.edu/courses/6-00sc-introduction-to-computer-science-and-programming-spring-2011/a3e3b5e65f30dc7048cda4ae9f584612_lFngfmE9RCc.pdf).
- **Required:** format generic complexity as `O(S * T)` time and `O(S)` stored-state space, where `S` is the number of reachable states and `T` is the maximum transitions examined per state. “states × transitions” is useful prose but not a complete complexity contract without definitions.
- **Required:** state the Climbing Stairs domain. The shown code returns `1` for `n <= 1`, including negative inputs. If the representative contract is positive `n`, say `n >= 1`; if `n = 0` is intentionally supported as one empty construction, say `n >= 0` and reject negatives.
- **Recommended:** qualify the applicability language. Overlap is what lets caching improve repeated work; compositional substructure can support a DP even when all states are tabulated once. Avoid turning “overlap” into a syntactic gate when an iterative state formulation is still valid and useful.
- The Climbing Stairs recurrence, House Robber transition, coin-change counterexample to greedy, and their detailed complexity bounds are correct. Space compression should remain after the full state dependency is established.

## Proposed hierarchy

1. **Make it intuitive** — many decision paths ask the same smaller question.
2. **Foundations** — state, state variables, transition, bases, dependencies, memoization/tabulation, reconstruction.
3. **Know when to reach for it** — repeated equivalent futures, count/optimum/feasibility, and greedy counter-signals.
4. **Derive the method** — define one state in a sentence; enumerate legal final choices; write recurrence; set bases/impossible values; choose evaluation order; extract answer.
5. **Climbing Stairs walkthrough** — show the uncompressed `dp` meaning first, then compress only after dependencies are visible.
6. **Interactive execution** — retain the reviewed Maximum Subarray representative trace, but explicitly explain its relation to the broader DP state model if it differs from Climbing Stairs.
7. **Why it is correct** — induction over the evaluation order, proving exhaustive transitions and correct bases.
8. **Complexity & tradeoffs** — `S`, `T`, reachable versus dense states, memo stack, table, output reconstruction, compression.
9. **Reference implementation** — retain compressed Climbing Stairs after the full recurrence is established.
10. **Boundaries & common mistakes** — incomplete state, wrong order, unreachable sentinels, premature compression, then practice.

## Change list

| Priority | Recommendation | Implementation guidance |
| --- | --- | --- |
| Required | Define complexity parameters `S` and `T`. | Update the table, trust disclosure, and method together. |
| Required | State the Climbing Stairs input domain and negative-input behavior. | Align base states, walkthrough, deep-dive implementation, and top-level code. |
| Required | Replace tree-specific shared labels with neutral labels. | Preserve old section IDs or compatible aliases. |
| Recommended | Rename “A repeatable recipe” to “Define the state before the table” and move it before the walkthrough. | Keep compression as the final optimization step. |
| Recommended | Add an explicit induction-based correctness section. | Reuse the authored state meaning and recurrence; do not add runtime-generated explanation. |
| Recommended | Explain why the representative interactive problem is an instance of the same state framework. | Avoid an unexplained jump from Climbing Stairs to Maximum Subarray. |

## Retain

Keep the plain-language state requirement, final-choice recurrence derivation, memoization/tabulation contrast, impossible-state sentinel, reconstruction note, House Robber choice partition, coin-change greedy counterexample, and compression warning.

## Acceptance criteria

- Every DP example defines the meaning and domain of one state before showing storage.
- Generic complexity parameters are named and each detailed example specializes them.
- Base-case behavior includes the full accepted input domain.
- Correctness uses exhaustive choices plus induction/dependency order.
- Shared headings are neutral and existing deep links remain valid.
