# Pathfinder — LeetCode Coach

A guided, gamified LeetCode practice app built with Vue 3, TypeScript, Pinia, Vuetify, and SCSS.

## Run locally

```bash
npm install
npm run dev
```

The default development command keeps the AI coach disabled and uses only the built-in guided lessons with curated hints. To enable dataset-backed quiz generation and personalized hints, run the frontend in AI mode:

```powershell
npm.cmd run dev:ai
```

The equivalent direct flag is `npm.cmd run dev -- --mode ai`.

In a second terminal, enable AI-generated Socratic hints:

```powershell
$env:OPENAI_API_KEY="your_key_here"
npm.cmd run hints
```

The browser never receives the API key. If the local hint service is stopped or unconfigured, the quiz automatically falls back to its curated hint.

Create a production build with `npm run build`; the output is written to `dist/`.

## Publish to GitHub Pages

The Vite base path is relative and routing uses URL hashes, so the production build works from a repository subpath. Run:

```bash
npm run deploy
```

Then configure the repository's Pages source to the `gh-pages` branch. Progress is intentionally device-local and stored in `localStorage`, so no account or backend is required.

## Content model

The app combines five hand-authored lessons in `src/data/problems.ts` with a generated foundations catalog in `src/data/catalog.generated.json`. Hand-authored lessons take precedence when IDs overlap. Every quiz progresses from pattern recognition through algorithm selection to complexity analysis.

Topic mastery is calculated from the loaded catalog: a track reaches 100% only when every problem carrying that core topic has been completed.

## Problem catalog direction

Do not scrape LeetCode directly. Its current terms prohibit crawling and scraping, and public GitHub dumps may contain content whose upstream copyright is not resolved merely by the repository license.

The foundations catalog is imported from [`newfacade/LeetCodeDataset`](https://github.com/newfacade/LeetCodeDataset), an MIT-licensed, versioned dataset with problem metadata, tags, starter code, tests, and solutions. Imported source data remains attributed on each record and in `THIRD_PARTY_NOTICES.md`. Before public or commercial distribution, replace copied problem prose with original descriptions or obtain appropriate permission.

The catalog pipeline:

1. Download the pinned v0.3.1 training and test archives at build-maintenance time.
2. Normalize tags into the core tracks: arrays, strings, hash maps, linked lists, trees, graphs, dynamic programming, and heaps.
3. Select up to 20 low-numbered foundational problems for each core topic and emit a deduplicated static catalog.
4. Generate the guided decision sequence through the local AI coach on first use and cache it in the browser.
5. Keep original source and license metadata on every imported record.

Refresh the pinned catalog with:

```bash
npm run catalog:import
```

Set `CATALOG_PROBLEMS_PER_TOPIC` to change the default target of 20. The current generated catalog contains 134 unique problems across Array, String, Hash Table, Linked List, Tree, Graph, Dynamic Programming, and Heap tracks.

## Deployment boundary

The static application works on GitHub Pages, but generated quizzes and AI hints require a small separately hosted server or serverless function because API keys must not appear in client-side code. `server/hints.mjs` is the local personal-use implementation and can later be moved to a serverless host without changing the quiz interface; set `VITE_HINT_API_URL` and `VITE_QUIZ_API_URL` to its deployed endpoints.
