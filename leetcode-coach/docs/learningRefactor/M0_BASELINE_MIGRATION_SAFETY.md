# LeetCode Coach Learn Redesign
## Milestone 0 — Baseline & Migration Safety

**Status:** Proposed  
**Date:** August 26, 2026  
**Product:** Pathfinder / LeetCode Coach  
**Area:** Learn — Data Structures & Algorithms curriculum  
**Program source:** `LEARN_CURRICULUM_REDESIGN_IMPLEMENTATION_PLAN.md`  
**Milestone:** M0

---

# 1. Objective

Protect the current Learn experience before changing its data model, routing, ordering, or content organization.

This milestone should make later refactoring safer **without materially changing the user experience**.

The current Learn implementation couples:

- lesson identity;
- lesson array order;
- previous/next navigation;
- search;
- routing;
- visualization references.

Before changing those concerns, establish automated coverage for the behavior that must survive migration.

---

# 2. Scope

## 2.1 Add current lesson slug fixtures

Create a canonical test fixture containing all currently supported lesson slugs.

Expected initial set:

```text
arrays-hash-maps
linked-lists
stacks-queues
trees
heaps
graphs
two-pointers
sliding-window
binary-search
graph-traversal
greedy
dynamic-programming
backtracking
```

The fixture exists to detect accidental removal or rename during migration.

---

## 2.2 Add route coverage

Add tests for:

```text
/learn
/learn/:slug
```

Verify:

- `/learn` renders the Learn landing/catalog view;
- every current lesson slug resolves;
- an unknown slug produces the intended fallback/not-found behavior;
- current bookmarked URLs remain valid before the routing redesign.

---

## 2.3 Add lesson-content sanity validation

At minimum validate:

- lesson slugs are unique;
- titles are present;
- levels are present;
- summaries are present;
- visualization mappings reference valid lesson slugs;
- problem-based visualizations reference valid problem IDs.

These tests are a baseline, not the final curriculum validation suite.

---

## 2.4 Establish legacy redirect infrastructure

Introduce a compatibility structure such as:

```ts
export const legacyLessonRedirects: Record<string, string> = {}
```

It may remain empty in this milestone.

The purpose is to establish a single place for future redirects when lessons are split or renamed.

---

# 3. Likely Files

```text
src/main.ts
src/data/lessons.ts
src/data/lessonVisualizations.ts
src/data/learn/learnContent.test.ts
```

If `src/data/learn/` does not yet exist, create only the minimum structure needed for tests.

---

# 4. Engineering Requirements

- Do not change lesson slugs in this milestone.
- Do not change curriculum order.
- Do not change current search behavior.
- Do not add new lesson content.
- Do not add new progress schema fields.
- Keep GitHub Pages behavior unchanged.
- Tests must run in the existing Vitest/build pipeline.

---

# 5. Acceptance Criteria

- [ ] All 13 existing lesson slugs are covered by a canonical fixture.
- [ ] Every current `/learn/:slug` route is tested.
- [ ] Duplicate lesson slugs fail tests.
- [ ] Broken visualization references fail tests.
- [ ] Unknown lesson behavior is tested.
- [ ] Legacy redirect infrastructure exists.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] No intentional user-facing Learn behavior changes.

---

# 6. Out of Scope

- curriculum modules;
- new Learn routes;
- weighted search;
- prerequisite graph;
- lesson splitting;
- new DSA topics;
- lesson assessment;
- progress V3.

---

# 7. Completion Result

When M0 is complete, engineering can safely refactor Learn with automated protection against accidental route, slug, and visualization regressions.
