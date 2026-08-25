# Codex workflow for Pathfinder

## Scope the change

Pathfinder is a Vue 3 + TypeScript app with Pinia state, Vuetify controls, and deterministic LeetCode coaching. Begin by locating the smallest relevant view, component, store, type, data source, compiler, or tracing module. Documentation-only work must not change application behavior.

Reviewed deterministic content is authoritative. AI-assisted work may help prepare a change for review, but it must not become the learner-facing source of truth or bypass the existing content compiler and validation gates.

## Build from reasoning

When changing learning interactions or content, preserve the instructional order: understand the contract and constraints; identify sufficient state and a data structure; articulate the invariant; perform safe transitions; then establish correctness and complexity. Maintain hidden-topic gates, three-level hints, and diagnostic repair links where the existing model uses them.

## Implement safely

- Use typed Vue components, composables, and Pinia actions; keep state ownership clear.
- Preserve keyboard and touch operation, accessible names, focus visibility, live status updates, and narrow-screen layouts.
- Keep `OPENAI_API_KEY` and any other credentials only in the server environment. Client code may use intentionally public endpoint configuration, never secrets.
- For content or trace changes, update the source facts/profiles and their focused validation tests. Do not patch around invalid output in a view.

## Verify and hand off

Run these from `leetcode-coach`:

```bash
npm test
npm run build
```

Summarize the user-visible impact, files changed, focused tests added or updated, and the exact results of both commands. Flag any unresolved product, privacy, or accessibility concern rather than guessing.