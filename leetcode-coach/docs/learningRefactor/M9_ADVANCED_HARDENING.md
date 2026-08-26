# LeetCode Coach Learn Redesign
## Milestone 9 — Advanced Curriculum & Hardening

**Status:** Proposed  
**Date:** August 26, 2026  
**Product:** Pathfinder / LeetCode Coach  
**Area:** Learn — Data Structures & Algorithms curriculum  
**Program source:** `LEARN_CURRICULUM_REDESIGN_IMPLEMENTATION_PLAN.md`  
**Milestone:** M9

---

# 1. Objective

Add optional advanced depth and harden the Learn system after the core curriculum, assessment model, and interview-pattern layer are stable.

Advanced content must never delay or block Core completion.

---

# 2. Candidate Advanced Topics

Recommended:

1. Segment Trees & Fenwick Trees
2. Strongly Connected Components
3. String Searching
4. Network Flow
5. Randomized Algorithms
6. Intractability / NP-Completeness Overview

These are optional extensions, not prerequisites for core curriculum completion.

---

# 3. Segment Trees & Fenwick Trees

Focus on:

- range queries;
- point/range updates;
- tree-based aggregation;
- Fenwick tree prefix structure;
- when prefix sums are insufficient;
- complexity tradeoffs.

Avoid competitive-programming trick density.

---

# 4. Strongly Connected Components

Cover:

- directed connectivity;
- SCC definition;
- condensation DAG;
- Kosaraju or Tarjan;
- applications.

Keep connection to:
- DFS;
- DAGs.

---

# 5. String Searching

Cover at least:

- naive substring search;
- rolling hash / Rabin–Karp;
- KMP prefix-function/failure idea.

The goal is to teach algorithmic structure, not memorize string formulas.

---

# 6. Network Flow

Cover:

- capacity;
- flow conservation;
- residual graph;
- augmenting path;
- max-flow/min-cut intuition.

Treat as advanced.

---

# 7. Randomization & Intractability

Recommended scope:

## Randomization
- randomized pivot;
- expected vs worst case;
- randomized algorithm intuition.

## Intractability
- tractable vs exponential growth;
- P/NP conceptual overview;
- reduction intuition.

Do not turn this into a theory course.

---

# 8. Search Hardening

Evaluate:

- zero-result queries;
- alias collisions;
- common misspellings;
- ranking conflicts;
- query reformulation.

Potential enhancement:
- lightweight typo tolerance.

Do not introduce AI unless deterministic search demonstrably cannot satisfy product needs.

---

# 9. Content Hardening

Perform:

- technical review;
- terminology consistency review;
- duplicate-content review;
- prerequisite graph review;
- search-alias review;
- practice-problem coverage review;
- content difficulty calibration.

Standardize terms such as:

- invariant;
- frontier;
- relaxation;
- state;
- component;
- indegree;
- auxiliary space.

---

# 10. Accessibility Hardening

Perform:

- keyboard-only pass;
- screen-reader pass;
- focus management review;
- heading hierarchy review;
- search announcement review;
- mobile touch-target review;
- color-independent state review.

---

# 11. Performance Hardening

Validate performance with 40+ lessons.

Potential improvements if measured:

- precompute normalized search index;
- lazy-load heavy lesson/deep-dive content;
- split visualization payloads;
- reduce oversized initial imports.

Do not optimize without measurement.

---

# 12. Metrics Review

Recommended local/product metrics:

## Search
- zero-result rate;
- result click rank;
- query reformulation.

## Curriculum
- module starts;
- lesson completion;
- lesson pass;
- module completion.

## Learning
- first-attempt correctness;
- transfer correctness;
- later repair/retrieval correctness.

Do not optimize primarily for time-on-page.

---

# 13. Advanced Route Requirements

`/learn/advanced`

Advanced content should:

- be visually separated from Core;
- clearly state that it is optional;
- not appear as required prerequisite for Core modules;
- remain searchable in Topic Library.

---

# 14. Acceptance Criteria

- [ ] advanced topics do not block Core completion.
- [ ] Advanced route clearly distinguishes optional content.
- [ ] search remains responsive with 40+ topics.
- [ ] final accessibility review passes.
- [ ] final content validation passes.
- [ ] prerequisite graph remains valid.
- [ ] GitHub Pages deployment remains stable.
- [ ] build/test pipeline remains green.
- [ ] no advanced topic is added solely for breadth without a clear learning objective.

---

# 15. Completion Result

M9 is complete when Learn has optional advanced depth and the overall curriculum/search/navigation/assessment system has been hardened for long-term scale.
