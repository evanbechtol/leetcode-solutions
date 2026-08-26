# LeetCode Coach Learn Redesign
## Milestone 3 — Searchable Topic Library

**Status:** Proposed  
**Date:** August 26, 2026  
**Product:** Pathfinder / LeetCode Coach  
**Area:** Learn — Data Structures & Algorithms curriculum  
**Program source:** `LEARN_CURRICULUM_REDESIGN_IMPLEMENTATION_PLAN.md`  
**Milestone:** M3

---

# 1. Objective

Make Learn content discoverable with minimal effort.

A user should not need to know Pathfinder's exact lesson title to find the concept they need.

---

# 2. User Outcome

Queries such as:

```text
dictionary
priority queue
memoization
longest substring
breadth first
```

should lead directly to the correct canonical lesson.

Search must remain:

- deterministic;
- local;
- fast;
- testable;
- dependency-light.

No embeddings or AI search are required.

---

# 3. Search Module

Create:

```text
src/data/learn/search.ts
```

Recommended API:

```ts
export interface LearnSearchResult {
  lesson: LearnLesson
  score: number
  matchedBy: LearnSearchMatch[]
}

export interface LearnSearchMatch {
  field:
    | 'title'
    | 'alias'
    | 'concept'
    | 'keyword'
    | 'vocabulary'
    | 'objective'
    | 'signal'
    | 'problem-family'
    | 'relationship'
  value: string
}

export function searchLearn(
  query: string,
  filters?: LearnSearchFilters,
): LearnSearchResult[]
```

---

# 4. Indexed Fields

Index:

- title;
- aliases;
- concept keys;
- search keywords;
- learning objectives;
- deep-dive vocabulary;
- prompt/problem signals;
- problem families;
- relationship labels.

Do not index large code blocks.

Full body-text search should not outrank canonical metadata.

---

# 5. Query Normalization

Normalize:

- lowercase;
- punctuation;
- hyphens;
- repeated whitespace.

Aliases should intentionally cover important terminology differences.

Examples:

```text
union-find
union find
disjoint set
disjoint-set
```

These should map to the same canonical concept when that lesson exists.

---

# 6. Ranking

Use deterministic weighted scoring.

Recommended baseline:

```text
exact normalized title        100
exact alias                    90
title prefix                   80
alias prefix                   75
concept key                    70
keyword                        60
vocabulary                     55
learning objective             40
problem signal                 35
problem family                 30
relationship/application       20
```

Substring fallback may add a small score.

The exact numeric implementation may vary, but rank ordering must preserve these priorities.

---

# 7. Match Explanation

Return/display why a result matched when useful.

Examples:

> Matched alias: “dictionary”

> Problem signal: “minimum possible maximum”

> Related application: “Dijkstra”

This is especially important when the query does not appear in the title.

---

# 8. Topic Library Filters

`/learn/library`

Required filters:

## Content kind
- Foundation
- Data Structure
- Algorithm
- Design Paradigm
- Problem-Solving Pattern
- Advanced Topic

## Tier
- DSA Core
- Interview Core
- Advanced

## Level
- Foundation
- Intermediate
- Advanced

## Module
- dynamic from module definitions.

Search and filters must compose.

---

# 9. Learn Search UI

Recommended placeholder:

> Search a concept, clue, or problem type…

Helpful examples:

> Try “priority queue”, “memoization”, or “longest substring”.

No-results state:

> No exact topic matched. Try a broader term or browse the Topic Library.

Do not generate guessed results using AI.

---

# 10. Initial Search Fixtures

Before later content additions, required examples include:

```text
dictionary            -> Arrays & Hash Maps
priority queue        -> Heaps & Priority Queues
memoization           -> Dynamic Programming
tabulation            -> Dynamic Programming
longest substring     -> Sliding Window
minimum possible max  -> Binary Search
breadth first         -> BFS & DFS
depth first           -> BFS & DFS
```

Targets will be updated when lessons split in later milestones.

---

# 11. Test Requirements

Create deterministic fixture tests.

Example:

```ts
const fixtures = [
  { query: 'priority queue', expected: 'heaps' },
  { query: 'memoization', expected: 'dynamic-programming' },
]
```

For canonical aliases, expected result should rank first.

Tests should verify:

- ranking;
- filters;
- no results;
- stable ordering for ties;
- alias normalization.

---

# 12. Performance Requirement

At 40–60 lessons, search should remain instantaneous without a third-party search engine.

A precomputed normalized index is acceptable.

Avoid introducing a server or search service.

---

# 13. Likely Files

```text
src/data/learn/search.ts
src/data/learn/search.test.ts
src/views/learn/LearnLibraryView.vue
src/components/learn/LearnSearch.vue
src/components/learn/LearnSearchResult.vue
src/components/learn/LearnFilterPanel.vue
```

---

# 14. Acceptance Criteria

- [ ] search logic is outside Vue components.
- [ ] title and alias matches outrank incidental mentions.
- [ ] result match reasons are available.
- [ ] search works offline/local-only.
- [ ] filters compose with search.
- [ ] no-result state is implemented.
- [ ] canonical search fixtures pass.
- [ ] no third-party search dependency is required.
- [ ] search remains performant with the expected future catalog size.

---

# 15. Out of Scope

- typo-tolerant fuzzy engine;
- server-side search;
- embeddings;
- AI semantic search;
- new lesson content.

---

# 16. Completion Result

M3 is complete when a user can locate known DSA concepts by common terminology without knowing Pathfinder's internal lesson names.
