# Pathfinder engineering guide

## Product contract

Pathfinder is a Vue 3, TypeScript, Pinia, and Vuetify LeetCode-learning application. Its reviewed, deterministic coaching content is authoritative. Do not replace it with generated guesses, randomization, or an AI response; experimental AI may only be an explicitly isolated, optional enhancement.

Teach derivation over memorization. Content and UI should lead learners from the problem contract and constraints to the necessary state, invariant, transitions, correctness argument, and complexity. Preserve the existing hidden-topic gates and diagnostic feedback rather than revealing answers early.

## Engineering constraints

- Preserve keyboard, touch, and mobile access. Interactive controls need a usable keyboard path, meaningful labels, visible focus behavior, and responsive layouts.
- Keep API keys and other secrets server-side. Never add secrets to Vite client code, checked-in files, or browser-visible configuration.
- Keep Pinia state, TypeScript types, deterministic compilers, and reviewed data aligned. Validate content and trace changes at their source rather than masking invalid output in a component.
- Make the smallest behaviorally focused change. Add or update focused tests alongside changed logic, especially coaching compilers, question evaluation, stores, and execution traces.
- Before handoff, run `npm test` and `npm run build` from `leetcode-coach`.

## Review standard

Call out any proposed change that weakens deterministic reviewed coaching, accessibility, privacy, or trace continuity. Do not alter application behavior for documentation-only work.
