---
name: quality-gate
description: Verify Pathfinder changes against product, accessibility, privacy, and build constraints.
---

# Pathfinder quality gate

Review the smallest relevant diff and verify:

- Deterministic reviewed coaching remains authoritative, and content teaches derivation rather than answer memorization.
- Vue 3, TypeScript, Pinia, and Vuetify contracts remain typed and coherent.
- Keyboard, touch, narrow/mobile layouts, control labels, focus behavior, and live announcements remain usable.
- No API key, secret, or server-only behavior crosses into browser code.
- Coaching or trace changes include focused tests and preserve validation, invariants, and continuity.

From `leetcode-coach`, run both required commands:

```bash
npm test
npm run build
```

Report failures directly; do not waive a check or claim success without its result.