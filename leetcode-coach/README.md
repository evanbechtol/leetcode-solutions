# Pathfinder — LeetCode Coach

A guided, gamified LeetCode practice app built with Vue 3, TypeScript, Pinia, Vuetify, and SCSS.

See the [product roadmap](docs/PRODUCT_ROADMAP.md) for the current capability baseline, planned question formats, accuracy gates, and longer-term platform direction. The iterative [public product implementation plan](docs/PUBLIC_PRODUCT_IMPLEMENTATION_PLAN.md) details the path from the current static app to a beginner-focused public MVP.

## Run locally

```bash
npm install
npm run dev
```

The default development command uses the complete deterministic catalog and does not require an API key or local service. To expose the development server to other devices on the same network, run:

```powershell
npm.cmd run dev:network
```

This binds Vite to `0.0.0.0` on port `5173`.

An experimental AI service remains in the repository behind an explicit mode for future coaching work:

```powershell
npm.cmd run dev:ai
```

In a second terminal, start that service with:

```powershell
$env:OPENAI_API_KEY="your_key_here"
npm.cmd run hints
```

The browser never receives the API key. Current static coaching paths deliberately use their reviewed deterministic hints even when AI mode is enabled.

Create a production build with `npm run build`; the output is written to `dist/`.

## Public beta configuration

The static public release can show a non-intrusive beta banner and open a public feedback destination. Both controls are browser-visible build-time configuration and must never contain secrets:

```bash
VITE_PUBLIC_BETA_ENABLED=true
VITE_PUBLIC_FEEDBACK_URL=https://example.com/pathfinder-feedback
```

When no feedback URL is configured, the persistent feedback form offers **Copy feedback** only. Drafts stay in local storage, and diagnostic counts are excluded unless the learner explicitly selects them. Pathfinder never submits the report itself.

Public in-app routes document privacy (`#/privacy`), content policy (`#/content-policy`), accessibility (`#/accessibility`), the changelog (`#/changelog`), and progress backup/restore (`#/data`). The same links are available from the application’s global footer.

## Publish to GitHub Pages

The Vite base path is relative and routing uses URL hashes, so the production build works from a repository subpath. Run:

```bash
npm run deploy
```

Then configure the repository's Pages source to the `gh-pages` branch. Progress is intentionally device-local and stored in `localStorage`, so no account or backend is required.

## Content model

The app combines five hand-authored problem records in `src/data/problems.ts` with a generated foundations catalog in `src/data/catalog.generated.json`. Hand-authored records take precedence when IDs overlap, producing 136 merged problems. A typed deterministic compiler builds every coaching path from reviewed pattern profiles and problem-specific teaching facts.

Standard paths contain ten questions and deep representative paths contain thirteen. They progress from contract comprehension to data-structure identification before introducing the algorithmic pattern, invariant, iteration visualization, algorithm construction, correctness, and complexity. Problem topic tags remain hidden until the learner completes the data-structure checkpoint. All paths work without AI.

Each problem has a bookmarkable hash route in the form `#/problems/{id}`. For example, `#/problems/1` opens Two Sum directly and remains compatible with GitHub Pages hosting.

Topic mastery is calculated from the loaded catalog: a track reaches 100% only when every problem carrying that core topic has been completed.

## Problem catalog direction

Do not scrape LeetCode directly. Its current terms prohibit crawling and scraping, and public GitHub dumps may contain content whose upstream copyright is not resolved merely by the repository license.

The foundations catalog is imported from [`newfacade/LeetCodeDataset`](https://github.com/newfacade/LeetCodeDataset), an MIT-licensed, versioned dataset with problem metadata, tags, starter code, tests, and solutions. Imported source data remains attributed on each record and in `THIRD_PARTY_NOTICES.md`. Before public or commercial distribution, replace copied problem prose with original descriptions or obtain appropriate permission.

The catalog pipeline:

1. Download the pinned v0.3.1 training and test archives at build-maintenance time.
2. Normalize tags into the core tracks: arrays, strings, hash maps, linked lists, trees, graphs, dynamic programming, and heaps.
3. Select up to 20 low-numbered foundational problems for each core topic and emit a deduplicated static catalog.
4. Compile the guided path deterministically from reviewed pattern profiles and problem teaching facts.
5. Keep original source and license metadata on every imported record.

Refresh the pinned catalog with:

```bash
npm run catalog:import
```

Set `CATALOG_PROBLEMS_PER_TOPIC` to change the default target of 20. The current generated catalog contains 134 unique problems across Array, String, Hash Table, Linked List, Tree, Graph, Dynamic Programming, and Heap tracks.

## Deployment boundary

The complete deterministic application works on GitHub Pages. Optional future AI coaching requires a separately hosted server or serverless function because API keys must not appear in client-side code. `server/hints.mjs` remains the local experimental implementation and can later be moved without changing the quiz interface; set `VITE_HINT_API_URL` and `VITE_QUIZ_API_URL` only when deliberately testing that integration.
