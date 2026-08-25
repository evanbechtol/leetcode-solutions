---
name: tracing
description: Safely create or modify exact reviewed execution traces for Pathfinder visualizations.
---

# Reviewed execution tracing

Exact traces are deterministic teaching artifacts, not illustrative guesses. Work through `leetcode-coach/src/tracing` and `src/data/coaching` together.

1. Choose a concrete input and establish the expected output before authoring transitions.
2. Represent each canonical algorithm step as a continuous `before` → `after` snapshot with stable variables, structures, events, and a valid code anchor.
3. State and test the relevant invariant at transitions. The final output must equal the expected output.
4. Keep trace playback keyboard- and touch-operable, including announced current-frame changes and reduced-motion behavior.
5. Extend focused trace tests, including validation, continuity, and visualization-frame assertions; run `npm test` and `npm run build` from `leetcode-coach`.

Do not conceal an invalid trace through presentation-layer fallback logic.