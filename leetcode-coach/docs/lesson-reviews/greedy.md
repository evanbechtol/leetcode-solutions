# Lesson review: Greedy Algorithms

## Executive recommendation

Keep the title but place Greedy last in the catalog, after learners have seen exhaustive search and DP. Correct the summary so exchange arguments are presented as one proof technique rather than a mandatory form for every greedy algorithm. Make proof obligation—not a locally attractive rule—the page’s organizing hierarchy.

## Curriculum position

- Recommended catalog position: **13 of 13**, after Dynamic Programming.
- The final advanced progression becomes: Backtracking explores alternatives, Dynamic Programming merges equivalent alternatives, and Greedy proves alternatives can be discarded.
- This placement supports the lesson’s own warnings about DP and backtracking without requiring it to preview unfamiliar methods.

## Accuracy audit

- **Required correction:** replace the summary “Commit to a locally best choice only when an exchange argument proves no optimal solution is lost” with “Commit to a locally chosen action only when a safety proof—such as exchange, staying ahead, or a cut property—shows that an optimal completion is preserved.” The current summary contradicts the mental model, which correctly names multiple proof forms.
- Earliest-finish interval scheduling is correct. MIT’s interval-scheduling notes compare failed rules and identify earliest finish as the valid greedy choice, then prove it by exchanging the first interval of an optimal schedule. [MIT 6.046J interval-scheduling notes](https://live.ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015/009c51db8900141fb181971f2bb826f3_MIT6_046JS15_writtenlec1.pdf).
- **Required:** state interval endpoint semantics. The code treats `[start, finish]` as compatible when `start >= lastEnd`, meaning touching endpoints do not overlap (equivalent to half-open scheduling semantics or an explicit “finish at t, next may start at t” contract).
- **Required:** split the top complexity row. A linear greedy scan is `O(n)` only when ordering is already suitable; the representative interval algorithm mutates its input with sorting and is `O(n log n)` overall. Report sort implementation storage separately.
- Jump Game’s farthest-frontier invariant and Gas Station’s reset argument are correct under their standard nonnegative gas/cost contracts. Keep the proof that a failed prefix invalidates every start inside it.
- The arbitrary coin-denomination counterexample correctly shows why local largest-first selection is not universally optimal.

## Proposed hierarchy

1. **Make it intuitive** — compact state plus an irreversible local choice.
2. **Foundations** — feasibility, greedy-choice property, optimal substructure, dominance, exchange/staying-ahead/cut proofs.
3. **Know when to reach for it** — candidate rule, compact sufficient state, and small counterexamples.
4. **Derive and challenge the choice** — define rule; preserve feasibility; search for counterexample; prove safety; reduce to same-shaped remainder; prove termination.
5. **Maximum non-overlapping intervals walkthrough** — state endpoint convention and show the exchange step explicitly.
6. **Interactive execution** — retain the reviewed Best Time to Buy and Sell Stock trace, but explain which best-so-far invariant makes its one-pass choice safe.
7. **Why it is correct** — provide the full exchange proof for interval scheduling and identify different proof forms for other cards.
8. **Complexity & tradeoffs** — sorting, scan, mutation, proof-specific state, and comparison with DP/backtracking.
9. **Reference implementation** — retain interval scheduling after documenting mutation and endpoint semantics.
10. **Boundaries & common mistakes** — heuristic versus proof, weighted interval counterexample, arbitrary coin systems, then practice.

## Change list

| Priority | Recommendation | Implementation guidance |
| --- | --- | --- |
| Required | Replace the exchange-only summary with proof-neutral wording. | Keep exchange as the representative proof, not the definition of greedy correctness. |
| Required | State interval endpoint semantics. | Align walkthrough, code condition, and correctness proof. |
| Required | Report sorting in headline complexity and note input mutation. | Do not summarize the representative algorithm as only `O(n)`/`O(1)`. |
| Required | Replace tree-specific shared labels with neutral labels. | Preserve old section IDs or aliases. |
| Recommended | Rename “A repeatable recipe” to “Prove the choice is safe” and place it before the walkthrough. | Require a counterexample attempt before accepting a rule. |
| Recommended | Explain the greedy invariant of the interactive stock example. | Keep it deterministic and sourced from reviewed problem facts/traces. |

## Retain

Keep the counterexample-first discipline, exchange/staying-ahead/cut taxonomy, earliest-finish proof, farthest-reach dominance statistic, Gas Station reset invariant, and warning that one-pass code is not automatically greedy.

## Acceptance criteria

- Greedy correctness is not defined solely by exchange arguments.
- Every representative algorithm states its feasibility contract and proof form.
- Interval compatibility semantics match `start >= lastEnd`.
- Complexity includes sorting and mutation where present.
- Shared headings are neutral, and the lesson closes the advanced progression without broken deep links.
