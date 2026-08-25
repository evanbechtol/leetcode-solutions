# Pathfinder Public Product Implementation Plan

Last updated: August 24, 2026

## Purpose

This plan turns Pathfinder from a capable guided-practice application into a public-ready, beginner-focused learning product. It is derived from the public-ready feature strategy and is intentionally iterative: each milestone delivers usable learner value, validates a product assumption, and creates the evidence required by the next milestone.

The product position is **a private, daily DSA mastery companion**. Pathfinder should help a learner understand what they misunderstood, repair that specific gap, and return to a small next action that proves improvement. It should not become a competitive problem feed, an AI answer generator, or a service that requires an account to receive value.

## Product decisions and boundaries

| Decision | Implementation direction |
| --- | --- |
| Primary audience | DSA beginners preparing for technical interviews. Plain-language guidance remains the default. |
| MVP business posture | Free-first portfolio product. The complete MVP works on GitHub Pages with no account, API key, or paid service. |
| Retention model | Low-pressure mastery habit: short daily sessions, visible durable progress, and recovery after mistakes. |
| Privacy | Solo-first and browser-local by default. No public profile, leaderboard, or transmitted learning data in the MVP. |
| AI | Optional future Socratic assistance only. Deterministic, reviewed content remains authoritative and complete without it. |
| Framework | Keep the existing Vue 3, TypeScript, Pinia, Vuetify, SCSS, and static hash-routing architecture. Do not rewrite the application in React. |
| Accuracy | New learning signals may schedule reviewed content, but may not invent algorithms, hints, correctness claims, or grading rules. |

### Public-MVP scope

The public MVP includes onboarding, a daily mastery session, a Personal Error Atlas, confidence calibration, learning-map progress, shareable milestones, visible content trust signals, and feedback capture. It deliberately excludes authentication, cloud synchronization, unrestricted code execution, public social features, leaderboards, and AI-dependent grading.

## Shared technical foundation

Milestones 1 through 5 depend on a single versioned progress model. Implement this once rather than storing unrelated feature state in individual components.

### Progress schema V2

Replace the current loosely shaped `pathfinder-progress-v1` payload with a versioned `pathfinder-progress-v2` record. Preserve V1 data through a one-way migration and retain V1 as a read-only fallback only until a successful V2 save completes.

```ts
interface ProgressStateV2 {
  version: 2
  learner: LearnerProfile
  attempts: AttemptRecord[]
  completedProblems: ProblemCompletion[]
  repairs: RepairRecord[]
  dailySessions: DailySessionRecord[]
  weeklyAggregates: WeeklyAggregate[]
  milestones: MilestoneRecord[]
  localEvents: ProductEvent[]
}

interface LearnerProfile {
  onboardingStatus: 'not-started' | 'in-progress' | 'complete'
  experience: 'new-to-dsa' | 'some-foundations' | 'interview-review'
  dailyMinutes: 5 | 10 | 15
  preferredLanguage?: string
  selectedTrackIds: string[]
  createdAt: string
  updatedAt: string
}

interface AttemptRecord {
  id: string
  occurredAt: string
  localDay: string
  problemId: number
  questionId: string
  questionType: QuestionType
  questionFormat: QuestionFormat
  stage?: QuestionStage
  selectedOptionIndex?: number
  correct: boolean
  firstAttempt: boolean
  hintLevelReached: 0 | 1 | 2 | 3
  confidence?: 'low' | 'medium' | 'high'
  contentVersion: string
  source: 'practice' | 'daily-session' | 'repair' | 'onboarding'
}

interface RepairRecord {
  id: string
  misconceptionKey: string
  conceptKey: string
  sourceAttemptId: string
  status: 'open' | 'scheduled' | 'revisited' | 'validated'
  openedAt: string
  nextDueOn: string
  lastReviewedAt?: string
  validatedAt?: string
}

interface DailySessionRecord {
  id: string
  localDay: string
  plannedMinutes: 5 | 10 | 15
  taskIds: string[]
  completedTaskIds: string[]
  status: 'planned' | 'in-progress' | 'complete' | 'skipped'
  startedAt?: string
  completedAt?: string
}
```

`ProblemCompletion`, `WeeklyAggregate`, `MilestoneRecord`, and `ProductEvent` use stable IDs and ISO timestamps. `localDay` is calculated in the learner's browser-local calendar day; streaks and due dates must never depend on a server timezone.

### Storage, migration, and retention policy

1. Migrate each V1 answer into an `AttemptRecord` with `selectedOptionIndex`, `confidence`, and `hintLevelReached` omitted. Legacy attempts may contribute to broad topic and format accuracy, but cannot create a choice-specific repair record.
2. Migrate V1 results into `ProblemCompletion` records, preserving completion date and score.
3. Never delete open repairs, current learner settings, completions, daily-session summaries, or milestones during local compaction.
4. Retain detailed attempts for the newest 5,000 records or 365 days, whichever is reached first. Before removal, roll them into `WeeklyAggregate` records by topic, reasoning category, format, and confidence bucket.
5. If migration or parsing fails, keep the existing progress untouched, start an empty V2 state, and expose a non-blocking export/recovery action. Do not silently overwrite malformed user data.
6. Add JSON export/import before accounts. Export includes only local product data; import validates the schema version, de-duplicates stable attempt IDs, and never accepts unknown content references as completed mastery.

### Content annotations required for personalization

Add reviewed metadata to each generated or authored question rather than inferring a learner's misconception from free text:

```ts
interface MisconceptionLink {
  key: string
  label: string
  conceptKey: string
  lessonSlug: string
  repairMode: 'lesson' | 'trace' | 'retry' | 'transfer'
}
```

Each incorrect option on deep representative content receives a `MisconceptionLink`. Initial broad-catalog questions without a reviewed option-level link use a safe category-level repair based on the question's teaching fact and topic. They must be labelled “practice this concept,” not “we know exactly what you misunderstood.”

### Shared rules

- Existing `AnswerRecord`, `ProblemResult`, quiz-session restore, topic-completion mastery, and static content validation remain supported during migration.
- A correct retry records learning evidence but does not erase the original incorrect attempt.
- Topic completion stays distinct from durable proficiency. Completion still means every catalog problem for that topic was completed.
- New experience signals are diagnostic and private; they do not lower a learner's score, delete a streak, or block content.

## Milestone 0 — Public-MVP foundation and safety rails

**Status:** Complete (verified August 25, 2026).

**Priority:** P0. **Why first:** All later retention features depend on reliable local learning history and a safe migration path.

### Learner outcome

Existing learners retain their progress, while new learners have a stable local profile that can support personalized practice without an account.

### Deliverables

- Implement `ProgressStateV2`, V1 migration, validation, compaction, export, and import.
- Refactor the Pinia trainer store into a focused progress repository plus derived selectors. Views consume selectors rather than reading local-storage arrays directly.
- Add content version constants to the deterministic coaching catalog and persist them with attempts.
- Add an internal developer-only progress inspector that displays schema version, migration state, record counts, and repair counts. It must not be present in production navigation.
- Add product-event instrumentation that writes locally only. Event dispatch is disabled by default; a future analytics transport may consume the same schema only after privacy review.

### Required tests and exit criteria

- V1 migration preserves answer count, completion count, streak, best streak, and topic-completion output.
- Invalid, partial, and future-version imports fail safely without replacing current progress.
- Compaction preserves all active repairs and produces stable weekly aggregates.
- Export → import into a fresh browser state round-trips settings, completions, repairs, and current detailed attempts.
- Existing quiz refresh-resume, reset, profile statistics, full test suite, and production build still pass.

## Milestone 1 — Guided first session and learner profile

**Status:** Complete (verified August 25, 2026).

**Priority:** P0. **Depends on:** Milestone 0. **Strategy tested:** A beginner can quickly find a safe, relevant starting point instead of facing a catalog of 136 problems.

### Learner experience

The first visit presents “Find your starting point,” not a graded placement test. The learner chooses experience level, daily time budget, preferred language, and one initial interest area. They then complete a six-decision diagnostic using existing, reviewed beginner questions. The result is framed as a recommended first path, never as an ability label.

### Deterministic onboarding flow

1. Select experience: new to DSA, some foundations, or interview review.
2. Select daily time: 5, 10, or 15 minutes.
3. Select one starting track from arrays, strings, hash maps, linked lists, trees, graphs, dynamic programming, or heaps.
4. Complete six existing decisions covering contract reading, necessary state, pattern recognition, and a simple complexity judgment. Use reviewed questions only; no generated diagnostic content.
5. Store the outcome as evidence, not a score. The recommendation selects the earliest unfinished lesson/problem in the chosen track, with a prerequisite fallback when diagnostic evidence shows a gap.
6. Present a first daily session containing one concept orientation and one guided problem action. The learner may skip onboarding and begin with an unfiltered catalog.

### Implementation details

- Add a dedicated `/start` route and use it from the empty-state practice CTA. Returning users whose onboarding is complete continue to `/today`.
- Implement track configuration in data, including title, lesson slugs, representative problems, prerequisites, and a beginner entry problem. Do not derive prerequisite order from source tags alone.
- Add a profile settings card for changing daily minutes, language, tracks, or restarting onboarding without resetting progress.
- Keep diagnostic answers in normal attempt history with `source: 'onboarding'`; exclude them from daily-session completion counts.

### Exit criteria

- A new learner reaches a specific recommended next activity in at most six answers and one screen of setup.
- Skipping onboarding leaves all current catalog behavior usable.
- Keyboard, touch, narrow mobile, refresh, and back-navigation flows preserve partial onboarding state.
- The recommendation always resolves to an existing lesson or a problem with a valid deterministic path.

## Milestone 2 — Daily Mastery Session and compassionate consistency

**Status:** Complete (verified August 25, 2026).

**Priority:** P0. **Depends on:** Milestones 0–1. **Strategy tested:** A small, concrete next action increases return behavior more reliably than a random-problem landing page.

### Learner experience

Add a `/today` dashboard as the default post-onboarding entry point. It offers a single session sized to the learner's selected budget, states why each task was chosen, and ends with a short reflection of what strengthened today.

### Session composition

| Daily budget | Session contents | Maximum tasks |
| --- | --- | --- |
| 5 minutes | One due repair or retrieval task, then one quick confidence check | 2 |
| 10 minutes | One due repair, one guided concept/practice task, one retrieval check | 3 |
| 15 minutes | One due repair, one guided task, one transfer problem, one retrieval check | 4 |

The deterministic planner creates at most one session per local day. A learner can rebuild it once before starting; rebuilding excludes the immediately replaced task and records no negative progress.

### Planner rules

1. Select an overdue open repair first.
2. If no repair is due, select the earliest incomplete prerequisite in a selected track.
3. Select a transfer task that uses the same concept on a different problem only after the learner has completed the corresponding guided task.
4. Select a retrieval check from a concept practiced at least one day earlier.
5. Never include the same problem twice in a session. Do not schedule a completed problem again within seven days unless it is an open repair.
6. When no valid task exists, show a meaningful completion state and a catalog recommendation; never create a fake activity.

### Consistency model

Replace answer-by-answer streak resets with a separate **practice consistency** signal.

- A day counts when at least one daily-session task is completed.
- Missing a day pauses the streak; it does not reset historical progress or punish the learner for a wrong answer.
- Show current run, best run, and the last seven days of activity. Do not use language implying failure.
- Existing answer streak is retained only as a legacy accuracy metric until the profile redesign removes it from the primary header.

### Implementation details

- Add typed `DailyTask` selectors for `lesson`, `problem`, `repair`, `trace`, and `retrieval` tasks; task payloads contain only stable IDs and reviewed reasons.
- Resume a started daily session after refresh. Leaving a task preserves its state exactly as ordinary problem sessions do.
- Route problem tasks through their bookmarkable problem route and return to `/today` on completion or explicit “Back to today.”
- Add local notifications only as in-app reminders. Browser push notifications are out of scope.

### Exit criteria

- The same progress state always produces the same daily session on the same local day.
- A session is resumable, rebuildable before start, and completable without entering a problem not selected by the learner.
- Users can see why each task appears and can choose the catalog instead.
- No incorrect answer can reset practice consistency.

## Milestone 3 — Personal Error Atlas and verified repair loops

**Status:** Complete (verified August 25, 2026).

**Priority:** P0. **Depends on:** Milestones 0–2. **Strategy tested:** Specific, non-judgmental recovery from a mistake is more valuable than a generic wrong-answer explanation.

### Learner experience

Add an “Error Atlas” section to Progress and `/today`. It answers three questions:

1. What concept is currently getting in my way?
2. Why was that choice tempting but incorrect?
3. What is the smallest next action that can verify improvement?

Each card has a plain-language misconception label, its source concept, its status, and one deterministic repair CTA. It never exposes a correct answer for an unfinished problem.

### Repair lifecycle

1. An incorrect answer with a reviewed `MisconceptionLink` opens or updates a repair record.
2. The repair appears as `open`, becomes `scheduled` when selected for a daily session, and becomes `revisited` after its first repair task.
3. It becomes `validated` only after a first-try correct retrieval on a different day and either a different problem or a different question instance covering the same concept.
4. A later related error reopens the repair and records the new source attempt. It does not discard prior validation history.

### Repair modes

| Mode | Existing or planned surface | Use case |
| --- | --- | --- |
| Lesson | Exact lesson section with a “return to repair” action | Vocabulary or concept gap |
| Trace | Reviewed Learn playback starting at a defined frame | State-transition or pointer/frontier gap |
| Retry | A fresh instance of the same decision with prior answer cleared | Local misunderstanding that can be safely retried |
| Transfer | Related reviewed problem or question from the same concept | Durable retrieval check |

Counterexample construction, edge-case prediction, and solution comparison become additional repair modes only after their deterministic formats are implemented and content-reviewed.

### Implementation details

- Extend question content with reviewed misconception metadata and repair destinations. Start with all deep representative problems and the most frequently attempted foundation problems; use category-level repair fallback elsewhere.
- Add a `repairSelectors` module that derives open, due, validated, and “high-impact” repair cards from V2 progress.
- Add a Profile error-atlas view with filters for status, track, question format, and concept. Default sort: due date, high-confidence wrong answers, repeat count, then recency.
- Use the current option-specific feedback as the explanation source only when its content version matches the attempt. Otherwise show a current reviewed explanation with a “content updated since this attempt” note.

### Exit criteria

- Every authored repair card has an existing lesson/problem destination and a reviewed explanation.
- Repair state transitions are deterministic and covered by unit tests, including repeated mistakes and legacy attempts.
- Learners can dismiss a card temporarily but cannot accidentally delete learning history.
- Error Atlas copy is supportive and avoids deficit labels such as “weak,” “failed,” or “bad at.”

## Milestone 4 — Confidence calibration and private proficiency signals

**Status:** Complete (verified August 25, 2026). Confidence is requested only at three deterministic high-value checkpoints, calibration insights require five first-attempt confidence records per reasoning skill, and equal-due repairs prioritize high-confidence errors.

**Priority:** P1. **Depends on:** Milestone 3. **Strategy tested:** Learners benefit from knowing whether errors come from uncertainty, overconfidence, or missing retrieval practice.

### Learner experience

Ask “How confident did that feel?” after a submitted answer and before feedback on selected high-value decision stages. The learner chooses low, medium, or high, or skips. Confidence is optional and never changes correctness, streaks, mastery, or grading.

The profile presents only actionable insights:

- “You are accurate and confident with hash-map lookup.”
- “You often feel unsure about tree traversal, but are usually correct; add retrieval practice.”
- “High-confidence boundary errors are due for review.”

Avoid personality claims, numeric learner rankings, or mental-health language.

### Scope rules

- Request confidence once per task, not after every micro-step. In a standard problem path, ask after the data-structure, invariant/correctness, and complexity decisions at most.
- Default planner prioritizes high-confidence incorrect repairs ahead of equally overdue low-confidence incorrect repairs.
- Suppress calibration insights until at least five eligible attempts exist in a concept bucket. Show “still learning your signal” before that threshold.
- Display confidence data only to the current browser user; never include it in share cards or feedback exports by default.

### Exit criteria

- Skipping every confidence prompt has no effect on ordinary practice flows.
- All confidence insights can be reproduced from stored attempts and documented selector rules.
- Test coverage includes correct-high, correct-low, incorrect-high, incorrect-low, skipped, and insufficient-evidence cases.

## Milestone 5 — Learning map, tracks, and milestone sharing

**Status:** Complete (verified August 25, 2026). The eight authored foundation tracks now power `/paths`, shared lesson/repair/daily destinations, deterministic local evidence states, and privacy-safe local SVG milestone cards.

**Priority:** P1. **Depends on:** Milestones 1–4. **Strategy tested:** Beginners return when progress is visible as connected capabilities rather than a flat count of problems completed.

### Learner experience

Add `/paths`, a clear curriculum map of the existing tracks. Each track presents ordered lesson and practice nodes with one of five states:

`not-started` → `learning` → `practiced` → `stable` → `complete-set`

`complete-set` uses the existing all-problems-in-topic completion rule. `stable` is a separate proficiency state requiring successful retrieval on two separate days. A learner may open any node; map state guides order but never locks content.

### Track model

- Start with the eight supported foundations: arrays, strings, hash maps, linked lists, trees, graphs, dynamic programming, and heaps.
- Each track has reviewed prerequisites, lessons, entry problems, reinforcing problems, and transfer problems. Store these in authored configuration, not inferred from the dataset.
- Reuse the same map to power lesson “Practice this concept” actions, Error Atlas destinations, and daily-session explanations.

### Shareable milestones

Create an optional local image card for milestones such as a stable concept, completed track, repaired misconception, or seven-day consistency run.

- Render using application-owned HTML/canvas/SVG assets; do not upload user data.
- Include only display-safe content: Pathfinder branding, milestone label, track, and date-free progress summary.
- Never include error details, raw accuracy, confidence, personal name, or account data.
- Provide Download and Copy link actions. Sharing is a user action outside the application; no social feed is added.

### Exit criteria

- Map status derives solely from documented local evidence rules.
- Every map CTA resolves to a valid lesson, problem, or today-session task.
- Shared cards render legibly on mobile and desktop and contain no private learning record.
- Accessibility includes a semantic list alternative to any visual graph.

## Milestone 6 — Public polish, trust, and feedback loop

**Status:** Complete (verified August 25, 2026). Lessons, guided problems, and traces now expose reviewed trust metadata and explicit trace quality; the app includes local-first feedback with opt-in redacted diagnostics, build-time beta controls, five public policy/help routes, typed local feedback/error events, and verified static GitHub Pages-compatible output.

**Priority:** P1. **Depends on:** Milestones 0–5. **Strategy tested:** Public users will trust and recommend Pathfinder when its instructional quality, privacy posture, and beta feedback path are explicit.

### Trust surfaces

Add a compact “How this is verified” disclosure to lessons, exact traces, and guided problems.

- Identify reviewed deterministic coaching versus optional AI content.
- Link the current content version, canonical approach, known complexity assumptions, and source/provenance where applicable.
- State that imported problem prose has the source/licensing status described in the project notices. Do not present imported content as original Pathfinder material.
- Mark a trace as exact reviewed or instructional overview using the existing trace-quality model.

### Feedback and beta operations

- Add a persistent, low-friction “Give feedback” action that opens a local form containing page route, app version, and user-written message.
- Save drafts locally. The default submit action copies a formatted report and opens a configurable public feedback URL; no feedback is transmitted unless the user explicitly takes that action.
- Add a `VITE_PUBLIC_FEEDBACK_URL` deployment configuration. If absent, show Copy feedback instead of a dead submit button.
- Add a non-intrusive beta banner controlled by a build-time configuration flag, not user-specific server state.
- Publish a privacy page, content policy, accessibility statement, changelog, and data export/import instructions before broad promotion.

### Product measurement

The MVP captures `ProductEvent` records locally for onboarding, daily-session, repair, map, share-card, feedback, and error events. It does not send them.

For an invited beta, users may voluntarily attach an exported diagnostic summary to feedback. Do not build analytics transmission until the product owner explicitly selects a privacy-reviewed provider and publishes disclosure. The event taxonomy makes later measurement possible without redesigning the learning model.

### Release gates

- Test the full public flow on desktop and narrow mobile: new learner, returning learner, offline reload, export/import, no-feedback-URL, and configured-feedback-URL cases.
- Run content validation, unit tests, TypeScript validation, production build, keyboard navigation, reduced-motion checks, and manual screen-reader spot checks.
- Confirm GitHub Pages deployment works with the application base path and all new hash routes.
- Confirm no API key, private progress, confidence record, or AI service dependency appears in the static bundle.
- Review all public learning claims, source attribution, and licensing before publication.

## Deferred hosted capabilities

These are valuable, but must not delay the static public MVP.

### Accounts and synchronization — P2

Introduce only after V2 local progress, export/import, repair lifecycle, and daily-session schemas have been stable through beta use. The server model must support anonymous-to-account migration, offline-first writes, deterministic conflict resolution, data export, deletion, and privacy controls.

### Optional Socratic AI coach — P2

The AI coach may explain a selected misconception or ask a leading question, but only with reviewed context supplied by the current lesson/problem/repair record.

- It may not determine pass/fail, silently override canonical facts, reveal a canonical solution before the existing disclosure point, or access an API key from the browser.
- Require a hosted endpoint, rate limiting, abuse controls, cost limits, prompt/version logging without raw private learning history by default, evaluation fixtures, and an offline deterministic fallback.
- Launch as an explicit opt-in feature flag after a quality benchmark for factual accuracy, non-revelation, usefulness, and refusal behavior passes.

### Sandboxed coding workspace — P2

Implement after daily mastery and remediation loops prove that users value guided practice. It requires isolated execution, resource limits, language support policy, test visibility policy, first-divergence coaching, and a separate security review.

### Social features — not planned for the public MVP

Do not add public profiles, rankings, feeds, or competitive streaks. Reconsider private accountability circles only after mastery signals and privacy controls are trustworthy.

## Cross-cutting implementation and QA checklist

### Accessibility and responsive behavior

- Every new task, map node, confidence control, repair CTA, and export/import action works with keyboard, touch, and screen reader.
- Do not use color alone for confidence, repair status, or map state.
- Preserve scroll-restoration rules when entering a repair, returning to Today, or changing a session task.
- Respect reduced-motion preferences for progress transitions and share-card previews.

### Accuracy and content governance

- Every new repair destination has a reviewed factual basis, a valid canonical content reference, and a non-revealing explanation.
- Add content validation for duplicate misconception keys, invalid lesson/problem routes, missing repair modes, and unreviewed deep-path distractors.
- Require independent review for new question annotations, repair explanations, proficiency criteria, and any future AI grounding content.

### Regression coverage

- Existing local progress, random selection, catalog filters, bookmarkable problem routes, question sequencing, code construction, lesson playback, and GitHub Pages deployment remain functional.
- Unit-test pure selectors for migration, compaction, daily planning, consistency, repair lifecycle, calibration, map state, and share-card payload safety.
- Add component tests for empty, partial, migrated, corrupted, and fully populated states.
- Production build remains static with no required API endpoint.

## Delivery order and success signals

| Release | Milestones | User value unlocked | Decision earned |
| --- | --- | --- | --- |
| Internal alpha | 0 | Safe, durable local learning records | Personalization can be built without losing current users' progress. |
| Public-MVP beta 1 | 1–2 | A clear starting point and a small daily reason to return | The daily mastery loop has activation and completion value. |
| Public-MVP beta 2 | 3–4 | Mistakes become understandable repair plans; learners see calibration privately | Specific remediation improves return and transfer behavior. |
| Public-MVP release | 5–6 | Visible connected progress, safe sharing, and trustworthy public product surfaces | Pathfinder is ready for broad discovery without a backend dependency. |
| Post-MVP | Hosted P2 capabilities | Sync, optional AI, and execution where evidence justifies cost | Server investment is driven by demonstrated user need. |

Track these locally from day one: onboarding completed, first daily session started/completed, repair opened/revisited/validated, daily-session return, track-node advancement, share-card creation, and feedback draft/submission action. During beta, use voluntarily shared diagnostics and qualitative feedback to set formal retention targets; do not add hidden analytics solely to optimize a static, private-by-default product.
