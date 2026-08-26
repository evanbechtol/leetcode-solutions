# Lesson review: Arrays & Hash Maps

## Executive recommendation

Retain this as the curriculum opener and retain the combined topic: scanning an ordered input while a keyed structure summarizes prior elements is a valuable first synthesis. Reorganize the page so arrays and maps are introduced separately before the Two Sum synthesis, then derive the one-pass invariant before showing the trace or code. The current content is strong, but it conflates the abstract hash-map model with the guarantees of JavaScript's `Map`.

## Curriculum position

- Recommended catalog position: **1 of 13**, followed by Linked Lists and Stacks & Queues before the first traversal patterns.
- Keep this lesson as the prerequisite for Two Pointers, Sliding Window, Binary Search, Trees, Heaps, and Dynamic Programming.
- Do not split it unless the curriculum later gains enough material for two complete lessons. The current array-to-map comparison is useful and the authored tracks already reuse this lesson for both Arrays and Hash Maps.

## Accuracy audit

- **Required:** distinguish an abstract hash table from ECMAScript `Map`. The lesson may teach expected `O(1)` hash-table operations under a healthy distribution, but should not imply that JavaScript `Map` must be a hash table. ECMAScript requires average access to be sublinear, and permits hash tables, search trees, or another representation. Use: “In the hash-table model used for this analysis, lookup and insertion are expected O(1). JavaScript `Map` provides keyed lookup but does not standardize a particular internal representation or O(1) bound.” [MDN documents the `Map` requirement and permitted implementations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#description).
- **Required:** label the fixed counting-array example “lowercase ASCII English letters.” `charCodeAt(0) - 97` is not a general Unicode or even general alphabet mapping.
- **Recommended:** qualify “contiguous” as the conceptual low-level array model. JavaScript `Array` is an ordered, integer-indexed collection; its specification does not promise a contiguous backing buffer. If actual contiguous typed storage is intended, point to typed arrays. [MDN distinguishes ordinary arrays from typed array views over binary buffers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures#indexed_collections_arrays_and_typed_arrays).
- The Two Sum invariant, check-before-insert rule, expected `O(n)` time, and `O(n)` additional space are correct under the stated hash-table assumption.

## Proposed hierarchy

1. **Make it intuitive** — array as ordered positions; map as keyed associations; why they combine.
2. **Foundations** — “Arrays,” “Hash maps and JavaScript `Map`,” then vocabulary and representations.
3. **Know when to reach for it** — prompt signals, constraints, and alternatives such as fixed counting arrays or ordered maps.
4. **Derive the method** — contract, sufficient state (`value -> earlier index`), prefix invariant, check-before-insert transition, termination.
5. **Two Sum walkthrough** — keep the two-frame illustration, but state the distinct-index and existence/no-solution contract.
6. **Interactive execution** — retain the reviewed representative trace.
7. **Why it is correct** — explicitly connect the prefix invariant to finding every valid earlier complement and preventing self-pairing.
8. **Complexity & tradeoffs** — separate abstract expected hash-table bounds from ECMAScript implementation guarantees.
9. **Reference implementation** — retain the TypeScript implementation.
10. **Boundaries & common mistakes** — retain object-key coercion, extra-space, and self-match warnings; then related topics and practice.

## Change list

| Priority | Recommendation | Implementation guidance |
| --- | --- | --- |
| Required | Replace the visible deep-dive labels “Language of trees,” “How to explore a tree,” and “Trace on the example tree.” | Use the shared neutral labels “Core vocabulary,” “Core techniques,” and “Trace the example.” Preserve existing query-section IDs until compatible aliases exist. |
| Required | Add the abstract-hash-table versus JavaScript-`Map` qualification. | Update the introduction, complexity note, and trust-disclosure assumptions together. |
| Required | Add an explicit correctness block for one-pass Two Sum. | Reuse the authored invariant; do not generate runtime prose. |
| Recommended | Remove duplicated definitions between Mental model and the deep-dive introduction. | Keep the concise comparison in Mental model; put mechanics, collision/load-factor detail, and representations in Foundations. |
| Recommended | Move “A repeatable recipe” before the worked example and rename it “Derive the one-pass lookup.” | Its steps should state contract, state, invariant, transition, and expected-cost assumption. |

## Retain

Keep the complement mental model, check-before-insert ordering, frequency-map and prefix-sum extensions, distinction between ordered position and keyed identity, and the warnings about `Object` key coercion and map space.

## Acceptance criteria

- A learner can state why the map contains only the processed prefix before seeing code.
- Abstract hash-table complexity is not presented as a normative JavaScript `Map` guarantee.
- ASCII-only counting code is labeled with its input domain.
- The visible hierarchy uses topic-neutral shared headings and old deep links remain usable.
- Summary, deep dive, walkthrough, reference code, complexity, and reviewed trace agree on the same one-pass contract.
