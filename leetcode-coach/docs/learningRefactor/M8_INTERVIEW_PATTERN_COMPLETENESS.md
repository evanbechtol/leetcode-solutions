# LeetCode Coach Learn Redesign
## Milestone 8 — Interview Pattern Completeness

**Status:** Proposed  
**Date:** August 26, 2026  
**Product:** Pathfinder / LeetCode Coach  
**Area:** Learn — Data Structures & Algorithms curriculum  
**Program source:** `LEARN_CURRICULUM_REDESIGN_IMPLEMENTATION_PLAN.md`  
**Milestone:** M8

---

# 1. Objective

Add the high-value LeetCode/interview patterns that differentiate Pathfinder from a traditional university DSA curriculum.

This milestone should emphasize:

- pattern recognition;
- maintained state;
- invariants;
- applicability boundaries;
- transfer to near-twin problems.

---

# 2. New Lessons

Add:

1. Prefix Sums & Difference Arrays
2. Monotonic Stack & Monotonic Deque
3. Intervals
4. Matrix & Grid Traversal
5. Bit Manipulation

Keep/refine:

- Two Pointers
- Sliding Window

Improve discoverability for:

- Fast/Slow Pointers
- Binary Search on Answer

These may be explicit sublessons or first-class indexed sections depending on content size.

---

# 3. Module 6 — Interview Pattern Toolkit

Recommended order:

1. Two Pointers
2. Sliding Window
3. Prefix Sums & Difference Arrays
4. Monotonic Stack & Monotonic Deque
5. Intervals
6. Matrix & Grid Traversal
7. Bit Manipulation

This module is also the source for:

```text
/learn/patterns
```

---

# 4. Pattern-Lesson Requirement

Every pattern lesson must explain:

1. recognition signals;
2. maintained state;
3. invariant;
4. why the optimization is valid;
5. when the pattern fails;
6. near-twin patterns that look similar.

Do not teach pattern keywords as deterministic triggers.

Bad:

> “Longest means Sliding Window.”

Better:

> “Sliding Window becomes useful when the candidate answer is contiguous and the validity condition can be repaired by moving the left boundary forward.”

---

# 5. Prefix Sums & Difference Arrays

Must cover:

- prefix aggregate;
- range queries;
- `sum(i..j)` as difference of prefixes;
- prefix-state frequency map;
- subarray-sum transformations;
- 1D prefix sums;
- difference arrays for range updates;
- optional 2D prefix extension.

Signals:

- repeated contiguous range sums;
- many range queries;
- repeated recomputation of a prefix;
- subarray sum/count.

---

# 6. Monotonic Stack & Deque

Must cover:

- monotonic invariant;
- amortized push/pop intuition;
- next greater/smaller;
- previous greater/smaller;
- histogram family;
- sliding-window maximum.

Explicitly distinguish:

- normal stack;
- monotonic stack;
- queue;
- monotonic deque.

---

# 7. Intervals

Must cover:

- normalize/sort;
- overlap;
- merge;
- scheduling;
- endpoint choices;
- active-set intuition;
- heap relationship for meeting-room style problems;
- sweep-line bridge as advanced note.

---

# 8. Matrix & Grid Traversal

Must cover:

- grid as implicit graph;
- coordinate neighbors;
- direction arrays;
- bounds;
- visited set vs in-place marking;
- BFS vs DFS;
- multi-source BFS;
- component counting.

Do not duplicate the full Graph Foundations lesson.

Use relationships.

---

# 9. Bit Manipulation

Must cover:

- binary representation;
- AND;
- OR;
- XOR;
- NOT;
- shifts;
- masks;
- set/clear/test bit;
- power-of-two tests;
- XOR cancellation;
- subset bitmask as extension.

Include JavaScript integer caveats where relevant.

---

# 10. Assessment Formats

Pattern lessons should heavily use:

- `constraint-signals`
- `near-twin`
- `constraint-mutation`
- `state-sufficiency`
- `structural-analogy`

These formats better measure pattern boundaries than recall-only multiple choice.

---

# 11. Practice Links

Each pattern lesson should define curated practice problems by role:

```ts
role:
  | 'foundation'
  | 'recognition'
  | 'transfer'
  | 'stretch'
```

Do not dump large tag lists.

Recommended minimum:
- foundation;
- transfer.

---

# 12. Search Fixtures

Add:

```text
prefix sum        -> Prefix Sums & Difference Arrays
range sum         -> Prefix Sums & Difference Arrays
next greater      -> Monotonic Stack & Deque
sliding max       -> Monotonic Stack & Deque
meeting rooms     -> Intervals
merge intervals   -> Intervals
island            -> Matrix & Grid Traversal
multi source bfs  -> Matrix & Grid Traversal
xor               -> Bit Manipulation
bit mask          -> Bit Manipulation
fast slow         -> Two Pointers / Fast-Slow indexed section
binary search answer -> Binary Search
```

---

# 13. Pattern View Requirements

`/learn/patterns` should not be identical to the Topic Library with a filter automatically applied.

It should emphasize:

- recognition cues;
- common problem families;
- comparison among patterns;
- pattern boundary exercises.

Possible organization:

```text
Contiguous ranges
- Sliding Window
- Prefix Sums

Ordered scans
- Two Pointers
- Binary Search

Maintained extrema/order
- Monotonic Structures
- Heaps

Structural traversal
- Matrix/Grid
```

Keep the design compact.

---

# 14. Acceptance Criteria

- [ ] all identified P1 interview-pattern gaps have canonical lessons or explicit indexed sublessons.
- [ ] every pattern teaches applicability boundaries.
- [ ] every pattern contains at least one boundary/near-twin assessment.
- [ ] practice problems are curated by role.
- [ ] Pattern view is meaningfully tailored to interview recognition.
- [ ] search fixtures pass.
- [ ] prerequisite relationships link back to core DSA lessons.
- [ ] no pattern is taught as keyword memorization.

---

# 15. Completion Result

M8 is complete when Pathfinder combines a strong university-style DSA core with a first-class interview-pattern layer focused on recognition and transfer.
