# LeetCode Coach Learn Redesign
## Milestone 2 — Learn Navigation & Routing

**Status:** Proposed  
**Date:** August 26, 2026  
**Product:** Pathfinder / LeetCode Coach  
**Area:** Learn — Data Structures & Algorithms curriculum  
**Program source:** `LEARN_CURRICULUM_REDESIGN_IMPLEMENTATION_PLAN.md`  
**Milestone:** M2

---

# 1. Objective

Separate the major Learn user intents into explicit routes and views.

After this milestone, users should no longer experience Learn as a single flat catalog.

---

# 2. User Modes

The Learn experience must expose four primary modes:

1. **Core Curriculum** — learn DSA in prerequisite order.
2. **Topic Library** — look up a specific concept.
3. **Interview Patterns** — browse LeetCode-oriented solution patterns.
4. **Advanced** — explore optional topics beyond the core.

Global Learn search will be added in M3.

---

# 3. Required Routes

Implement canonical routes:

```text
/learn
/learn/curriculum
/learn/curriculum/:moduleSlug
/learn/library
/learn/patterns
/learn/advanced
/learn/topic/:slug
```

---

# 4. Backward Compatibility

Existing URLs such as:

```text
/learn/binary-search
```

must continue working.

Add a compatibility route or redirect.

Example:

```ts
{
  path: '/learn/:slug',
  redirect: to => ({
    name: 'learn-topic',
    params: { slug: to.params.slug },
  }),
}
```

Ensure explicit Learn routes take precedence over the catch-all lesson route.

Reserved names such as:

```text
curriculum
library
patterns
advanced
topic
```

must never be interpreted as lesson slugs.

---

# 5. View Split

Refactor the current monolithic Learn view.

Create:

```text
src/views/learn/
  LearnHomeView.vue
  LearnCurriculumView.vue
  LearnModuleView.vue
  LearnLibraryView.vue
  LearnPatternsView.vue
  LearnAdvancedView.vue
  LearnTopicView.vue
```

Move current lesson-reader behavior into `LearnTopicView.vue` with minimal content reordering in this milestone.

---

# 6. Learn Home Requirements

`/learn`

Display:

- title;
- short explanation;
- four mode cards.

Suggested value proposition:

> Learn DSA in order, or jump directly to the concept you need.

Mode cards:

### Core Curriculum
Learn the foundations in prerequisite order.

### Topic Library
Look up a data structure or algorithm.

### Interview Patterns
Review common solution shapes.

### Advanced
Explore optional depth beyond the core.

---

# 7. Source Context

When a lesson is opened, retain or derive navigation source where practical:

```text
curriculum
library
patterns
advanced
search
```

This can be represented through route query/state or deterministic breadcrumbs.

Future uses:

- return behavior;
- breadcrumbs;
- product analytics;
- context-sensitive related content.

Do not overengineer persistence for this state.

---

# 8. App Navigation

Keep a single top-level global navigation item:

```text
Learn
```

Do not add Curriculum, Library, Patterns, and Advanced to the application-wide navigation bar.

Those are internal Learn modes.

---

# 9. Mobile Requirements

- Mode cards stack vertically.
- Navigation remains touch-friendly.
- No horizontal dependency graph is required.
- Lesson reader remains usable at current mobile breakpoints.
- Breadcrumbs must wrap or collapse gracefully.

---

# 10. Accessibility Requirements

- Use actual links/buttons.
- Preserve semantic headings.
- Visible focus state required.
- Mode cards must have clear accessible names.
- Route changes should preserve expected focus/scroll behavior.

---

# 11. Likely Files

```text
src/main.ts
src/views/LearnView.vue
src/views/learn/*
src/components/learn/LearnModeCard.vue
src/styles/main.scss
```

---

# 12. Acceptance Criteria

- [ ] `/learn` renders the new Learn Home.
- [ ] all canonical Learn routes resolve.
- [ ] legacy `/learn/:slug` URLs redirect or resolve correctly.
- [ ] reserved Learn paths are not treated as slugs.
- [ ] existing lesson content remains available.
- [ ] current lesson slugs remain valid.
- [ ] navigation works on mobile.
- [ ] keyboard navigation works.
- [ ] no backend requirement is introduced.
- [ ] GitHub Pages deployment remains functional.
- [ ] build and route tests pass.

---

# 13. Out of Scope

- weighted search;
- new DSA lessons;
- final curriculum modules;
- Progress V3;
- lesson retrieval checks.

---

# 14. Completion Result

M2 is complete when Learn has a clear, scalable navigational shell that can support curriculum, reference lookup, interview patterns, and advanced content independently.
