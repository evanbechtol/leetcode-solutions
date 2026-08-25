---
name: vue-feature
description: Implement focused Pathfinder Vue features while preserving deterministic coaching, accessibility, and state contracts.
---

# Vue feature work

Work in `leetcode-coach`, a Vue 3 + TypeScript application using Pinia and Vuetify.

1. Start from the learner outcome and identify the existing view, component, Pinia store, types, and deterministic data/compiler boundary involved.
2. Prefer typed props, emitted events, composables, and Pinia actions over duplicated local state. Keep data transformations out of templates.
3. Preserve desktop, narrow/mobile, keyboard, and touch use. Use semantic controls or Vuetify controls with explicit accessible names; retain focus and live-region behavior where present.
4. Do not move reviewed coaching decisions into a client AI call. Keep any key-bearing request behind a server boundary.
5. Add narrow Vitest coverage for changed behavior, then run `npm test` and `npm run build` in `leetcode-coach`.

For coaching interactions, guide learners through contract, constraints, state, invariant, transition, and proof—not pattern-name recall alone.