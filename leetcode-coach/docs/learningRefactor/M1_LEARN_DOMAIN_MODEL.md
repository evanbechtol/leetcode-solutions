# LeetCode Coach Learn Redesign
## Milestone 1 — Learn Domain Model

**Status:** Proposed  
**Date:** August 26, 2026  
**Product:** Pathfinder / LeetCode Coach  
**Area:** Learn — Data Structures & Algorithms curriculum  
**Program source:** `LEARN_CURRICULUM_REDESIGN_IMPLEMENTATION_PLAN.md`  
**Milestone:** M1

---

# 1. Objective

Introduce a scalable Learn content model that can support:

- modules;
- prerequisites;
- search aliases;
- canonical concepts;
- content tiers;
- typed relationships;
- future lesson assessments.

The existing UI should remain substantially unchanged.

---

# 2. Why This Milestone Comes First

The current lesson schema is pedagogically strong but structurally too narrow.

Current classification is primarily:

```ts
'Data Structure' | 'Algorithmic Pattern'
```

That cannot accurately represent:

- foundations;
- classical algorithms;
- design paradigms;
- problem-solving patterns;
- advanced topics.

The current `lessons` array also implicitly acts as curriculum ordering.

This milestone makes those concerns explicit.

---

# 3. Required Types

Create:

```text
src/data/learn/types.ts
```

Add:

```ts
export type LearnContentKind =
  | 'Foundation'
  | 'Data Structure'
  | 'Algorithm'
  | 'Design Paradigm'
  | 'Problem-Solving Pattern'
  | 'Advanced Topic'

export type LearnTier =
  | 'DSA Core'
  | 'Interview Core'
  | 'Advanced'

export type LearnContentStatus =
  | 'complete'
  | 'draft'
  | 'planned'

export type LessonRelationshipType =
  | 'prerequisite'
  | 'next'
  | 'application'
  | 'alternative'
  | 'related'
```

Add a typed `LessonRelationship`.

---

# 4. Required Lesson Metadata

Migrate existing lessons to support:

```ts
kind: LearnContentKind
tier: LearnTier
status: LearnContentStatus

moduleIds: string[]
curriculumOrder?: number

prerequisites: string[]
learningObjectives: string[]
aliases: string[]
conceptKeys: string[]

relationships: LessonRelationship[]

search: {
  keywords: string[]
  problemSignals: string[]
}
```

Preserve current instructional fields including:

- summary;
- mental model;
- signals;
- problem types;
- avoid-when;
- complexity;
- steps;
- walkthrough;
- code;
- pitfalls;
- deep dives.

---

# 5. Module Model

Add:

```ts
export interface LearnModule {
  id: string
  slug: string
  title: string
  shortTitle: string
  description: string

  tier: LearnTier
  order: number

  prerequisiteModuleIds: string[]
  lessonSlugs: string[]

  learningObjectives: string[]
  assessmentId?: string

  icon: string
}
```

Modules may initially be provisional.

---

# 6. Selector Layer

Create:

```text
src/data/learn/selectors.ts
```

Required selectors:

```ts
lessonBySlug(slug)
moduleBySlug(slug)
lessonsForModule(moduleId)
curriculumLessons()
libraryLessons()
interviewPatternLessons()
advancedLessons()
prerequisitesForLesson(slug)
relatedLessons(slug)
```

Vue views should not directly reimplement curriculum graph logic.

---

# 7. Initial Metadata Mapping

Use the current 13 lessons without splitting them yet.

Suggested provisional grouping:

## Foundations / Structures
- Arrays & Hash Maps
- Linked Lists
- Stacks & Queues

## Trees & Graph Structures
- Trees & Binary Search Trees
- Heaps & Priority Queues
- Graphs
- BFS & DFS

## Array / Search Patterns
- Two Pointers
- Sliding Window
- Binary Search

## Algorithm Design
- Greedy
- Backtracking
- Dynamic Programming

These groups are transitional and will be replaced by the final curriculum in later milestones.

---

# 8. Validation Requirements

Add build-failing validation for:

## Identity
- duplicate lesson slug;
- duplicate module ID;
- duplicate module slug.

## Graph
- missing prerequisite target;
- self-prerequisite;
- prerequisite cycle;
- missing relationship target.

## Content
For `status: 'complete'`:
- title required;
- summary required;
- learning objectives required;
- aliases must normalize to non-empty values.

---

# 9. Compatibility Requirements

Existing imports should continue working while migration is underway.

Prefer a barrel such as:

```text
src/data/learn/index.ts
```

Existing callers may temporarily import compatibility exports.

Do not require all repository code to migrate in one PR.

---

# 10. Likely Files

```text
src/data/learn/types.ts
src/data/learn/modules.ts
src/data/learn/selectors.ts
src/data/learn/validators.ts
src/data/learn/index.ts
src/data/lessons.ts
src/data/learn/learnContent.test.ts
```

---

# 11. Acceptance Criteria

- [ ] All existing lessons compile through the new Learn content types.
- [ ] Each existing lesson has kind, tier, status, objectives, aliases, concept keys, and relationships.
- [ ] A module type exists.
- [ ] Curriculum ordering is explicit metadata.
- [ ] Selector layer exists.
- [ ] Prerequisite-cycle validation exists.
- [ ] Relationship validation exists.
- [ ] Existing Learn UI still renders current content.
- [ ] Existing lesson URLs still work.
- [ ] Invalid curriculum metadata fails tests/build.

---

# 12. Out of Scope

- new Learn home;
- route redesign;
- user-visible module UI;
- search ranking;
- new lesson content;
- Progress V3;
- assessments.

---

# 13. Completion Result

M1 is complete when Learn content is represented as a **curriculum-aware domain model** rather than a flat array of cards, while current behavior remains stable.
