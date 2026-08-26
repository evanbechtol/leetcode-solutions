# LeetCode Coach Learn Redesign
## Milestone 7 — Retrieval Checks, Module Assessments & Progress V3

**Status:** Proposed  
**Date:** August 26, 2026  
**Product:** Pathfinder / LeetCode Coach  
**Area:** Learn — Data Structures & Algorithms curriculum  
**Program source:** `LEARN_CURRICULUM_REDESIGN_IMPLEMENTATION_PLAN.md`  
**Milestone:** M7

---

# 1. Objective

Transform Learn from a content-consumption feature into a measurable learning system.

Reading a page must no longer be treated as sufficient evidence of learning.

---

# 2. User Outcome

A learner can:

- start a lesson;
- answer retrieval questions;
- complete a lesson;
- pass a lesson;
- complete a module assessment;
- return later and see progress;
- continue from the next recommended lesson.

---

# 3. Progress Schema V3

Increment:

```ts
PROGRESS_SCHEMA_VERSION = 3
```

Add:

```ts
export interface LessonProgressRecord {
  lessonSlug: string
  status: 'started' | 'completed' | 'passed'
  startedAt: string
  lastViewedAt: string
  completedAt?: string
  passedAt?: string
  checkAttempts: LessonCheckAttempt[]
}
```

Add:

```ts
export interface LessonCheckAttempt {
  checkId: string
  occurredAt: string
  correct: boolean
  firstAttempt: boolean
  evidence?: Record<string, unknown>
}
```

Add:

```ts
export interface ModuleProgressRecord {
  moduleId: string
  status: 'not-started' | 'in-progress' | 'complete'
  completedAt?: string
  assessmentAttempts: ModuleAssessmentAttempt[]
}
```

Add collections to Progress V3.

---

# 4. V2 → V3 Migration

Migration must:

- preserve all existing attempts;
- preserve completed problems;
- preserve repair records;
- preserve daily sessions;
- preserve milestones;
- preserve local events;
- preserve learner profile;
- initialize:
  - `lessonProgress: []`
  - `moduleProgress: []`

Do **not** infer lesson completion from page views.

---

# 5. Lesson States

Use:

## Started
Learner has meaningfully entered the lesson.

## Completed
Learner reached the retrieval section and attempted all required checks.

## Passed
Learner met the configured lesson threshold.

## Mastered
Reserved for future durable evidence from later retrieval/practice.

Do not assign “Mastered” immediately after lesson completion.

---

# 6. Lesson Assessment Metadata

Lessons should define:

```ts
assessment?: {
  checkIds: string[]
  minimumCorrect: number
}
```

Every:
- DSA Core lesson;
- Interview Core lesson

must eventually define required checks.

---

# 7. Reuse Existing Question Infrastructure

Use the current renderer registry.

Preferred formats:

- `multiple-choice`
- `constraint-signals`
- `operation-contract`
- `state-sufficiency`
- `near-twin`
- `constraint-mutation`
- `structural-analogy`

Use:
- algorithm builder;
- code construction;
- iteration visualization

only when the objective requires them.

Do not create a separate lesson-question rendering system.

---

# 8. Lesson Check Design

Recommended 2–4 checks per core lesson.

Preferred sequence:

1. **Concept**
2. **Execution/analysis**
3. **Boundary/transfer**

Example — Hash Tables:

1. Operation contract:
   Which structure supports membership lookup?

2. State sufficiency:
   What information must the map store?

3. Near twin:
   When is a fixed frequency array better?

---

# 9. Module Assessments

Every DSA Core module must have a mixed transfer assessment.

Minimum:

- 4 questions;
- at least 2 different module concepts;
- at least 1 unlabeled problem-selection question;
- at least 1 comparison/boundary question.

Do not make module assessment a vocabulary quiz.

---

# 10. Example Graph Module Assessment Goals

Assess whether a learner can:

- choose traversal vs Union-Find;
- distinguish BFS from Dijkstra;
- identify dependency ordering/topological sort;
- distinguish MST from shortest paths.

The algorithm name should not always be present in the prompt.

---

# 11. Continue Learning

Update Learn Home to show, when progress exists:

- current module;
- module progress;
- next recommended lesson;
- Continue CTA.

For new learners:
- default recommendation is Algorithmic Foundations.

Experienced learner behavior may later use onboarding preferences, but that is not required for this milestone.

---

# 12. Progress-Aware Prerequisite Banner

If prerequisites are not passed:

> This lesson builds on **Recursion** and **Graph Foundations**.

Actions:

- Continue
- Review prerequisite

Never hard-lock direct access.

---

# 13. Product Events

Add local product events such as:

```text
learn_home_opened
learn_mode_selected
learn_search_used
learn_search_result_opened
learn_module_opened
learn_lesson_started
learn_lesson_completed
learn_lesson_passed
learn_prerequisite_review_opened
learn_check_answered
learn_module_assessment_started
learn_module_completed
```

Suggested fields:

- lessonSlug;
- moduleId;
- correct;
- firstAttempt;
- source.

Keep behavior aligned with the current local-first privacy model.

---

# 14. Store API

Recommended actions/selectors:

```ts
startLesson(slug)
recordLessonCheck(slug, checkId, result)
completeLesson(slug)

lessonProgressFor(slug)
lessonStatus(slug)
moduleStatus(moduleId)

recordModuleAssessment(...)

completedLessonSlugs
nextRecommendedLesson
```

A dedicated Learn store is acceptable only if it writes through the shared versioned progress architecture.

Do not introduce an independent localStorage key.

---

# 15. Migration Tests

Required:

1. Empty V2 → valid V3
2. Populated V2 → valid V3
3. All legacy attempts preserved
4. All problem completions preserved
5. Serialization round-trip
6. Export/import round-trip
7. Invalid V3 triggers current recovery behavior
8. New lesson/module fields validate correctly

---

# 16. Acceptance Criteria

- [ ] progress schema increments to V3.
- [ ] V2 migration preserves user data.
- [ ] lesson progress persists.
- [ ] module progress persists.
- [ ] every DSA Core lesson has required retrieval checks.
- [ ] every DSA Core module has a transfer assessment.
- [ ] page view alone does not produce Completed.
- [ ] Completed and Passed are distinct.
- [ ] Passed and Mastered are distinct.
- [ ] Continue Learning works.
- [ ] prerequisite banners use actual progress.
- [ ] assessments reuse existing question components.
- [ ] import/export and recovery continue working.

---

# 17. Release Checkpoint

Completion of M7 establishes **Checkpoint C: Core DSA Learning System Complete**.

At this point Pathfinder can credibly describe Learn as:

> A comprehensive core DSA curriculum with guided retrieval, transfer assessment, and persisted progress.

---

# 18. Completion Result

M7 is complete when Learn records evidence of understanding rather than merely exposing content pages.
