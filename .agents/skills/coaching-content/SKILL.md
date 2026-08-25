---
name: coaching-content
description: Author and review deterministic Pathfinder learning content and question paths.
---

# Deterministic coaching content

Reviewed content in `leetcode-coach/src/data/coaching` is the source of truth. Treat the compiler, pattern profiles, problem teaching facts, intuition facts, and content validation as one model.

- Teach derivation: prompt learners to read the contract and constraints, choose sufficient state, state an invariant, make a safe transition, then justify correctness and complexity.
- Keep answers, explanations, hint ladders, distractor diagnostics, repair links, and instructional levels internally consistent.
- Preserve topic gating: do not reveal the algorithm or topic before the established data-structure checkpoint.
- Use concise, concrete wording and ensure every distractor has instructional value; never substitute unreviewed AI prose for deterministic facts.
- Update focused content/compiler tests or validation fixtures with a content change. Run `npm test` and `npm run build` from `leetcode-coach`.

Do not import scraped LeetCode problem prose or change catalog provenance without explicit review.