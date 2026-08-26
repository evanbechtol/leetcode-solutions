# LeetCode Coach Learn Redesign
## Milestone 4 — Ordered Core Curriculum

**Status:** Proposed  
**Date:** August 26, 2026  
**Product:** Pathfinder / LeetCode Coach  
**Area:** Learn — Data Structures & Algorithms curriculum  
**Program source:** `LEARN_CURRICULUM_REDESIGN_IMPLEMENTATION_PLAN.md`  
**Milestone:** M4

---

# 1. Objective

Turn the existing lesson catalog into an explicit ordered curriculum before substantially expanding content.

This milestone establishes the product behavior for:

- modules;
- curriculum order;
- prerequisites;
- related concepts;
- next/previous learning navigation.

---

# 2. User Outcome

A learner can answer:

- Where should I start?
- What comes next?
- Which concepts belong together?
- What should I know before this lesson?
- Where can I go to apply this idea?

---

# 3. Interim Module Structure

Use the existing 13 lessons.

## Module A — Foundational Structures

- Arrays & Hash Maps
- Linked Lists
- Stacks & Queues

## Module B — Trees & Graph Structures

- Trees & Binary Search Trees
- Heaps & Priority Queues
- Graphs
- BFS & DFS

## Module C — Array & Search Patterns

- Two Pointers
- Sliding Window
- Binary Search

## Module D — Algorithm Design

- Greedy
- Backtracking
- Dynamic Programming

This grouping is transitional.

M5–M6 will replace it with the final university-style module sequence.

---

# 4. Curriculum Page

Route:

```text
/learn/curriculum
```

Each module card should show:

- module title;
- short purpose;
- lesson count;
- estimated total minutes;
- prerequisite modules, if any.

Progress can be absent or non-persistent until M7.

Do not render 30+ equal-weight lesson cards on this page.

---

# 5. Module Page

Route:

```text
/learn/curriculum/:moduleSlug
```

Show:

- title;
- description;
- learning outcomes;
- ordered lesson list;
- prerequisites;
- estimated duration.

Lesson rows should show:

- title;
- kind;
- level;
- duration.

---

# 6. Remove Semantic Dependency on Array Position

Current previous/next behavior must no longer depend on:

```ts
lessons[index - 1]
lessons[index + 1]
```

Use explicit selectors based on:

- module;
- curriculum order.

Required selectors:

```ts
nextCurriculumLesson(slug)
previousCurriculumLesson(slug)
```

The Topic Library may use a different sort order.

---

# 7. Prerequisite UX

Display declared prerequisites in a non-blocking notice.

Because lesson progress is not introduced until M7, M4 should show informational prerequisite relationships only.

Example:

> This lesson builds on Arrays & Hash Maps.

Actions should navigate to prerequisite content.

Do not hard-lock lessons.

---

# 8. Related Concepts

Replace passive related-topic chips where possible with typed navigation.

Recommended sections:

### Prerequisites
What should come first?

### Apply This Next
Where is this concept used?

### Compare With
What similar tool has different tradeoffs?

### Related
Other nearby concepts.

---

# 9. Curriculum vs Catalog Separation

This is a hard architecture requirement.

`curriculumOrder` controls instructional sequence.

Topic Library display order may instead use:

- alphabetic;
- relevance;
- filters;
- tier.

Changing library sort must not change curriculum next/previous behavior.

---

# 10. Likely Files

```text
src/data/learn/modules.ts
src/data/learn/selectors.ts
src/views/learn/LearnCurriculumView.vue
src/views/learn/LearnModuleView.vue
src/views/learn/LearnTopicView.vue
src/components/learn/CurriculumModuleCard.vue
src/components/learn/ModuleLessonRow.vue
src/components/learn/LessonPrerequisiteBanner.vue
src/components/learn/LessonRelationshipList.vue
```

---

# 11. Acceptance Criteria

- [ ] `/learn/curriculum` renders module cards.
- [ ] module detail pages render ordered lessons.
- [ ] curriculum order is explicit metadata.
- [ ] previous/next no longer uses raw lesson array position.
- [ ] Topic Library order is independent.
- [ ] prerequisites are navigable.
- [ ] related concepts are navigable.
- [ ] no lesson is hard-locked.
- [ ] direct `/learn/topic/:slug` access remains valid.
- [ ] mobile layout remains clear.

---

# 12. Out of Scope

- final university curriculum content;
- lesson splitting;
- progress tracking;
- module completion;
- lesson assessment.

---

# 13. Release Checkpoint

Completion of M4 establishes **Checkpoint A: Learn Information Architecture Complete**.

The product is now structurally ready for major curriculum expansion.

---

# 14. Completion Result

M4 is complete when the current Learn catalog behaves like an ordered curriculum **and** a separate reference library, with explicit prerequisite/relationship navigation.
