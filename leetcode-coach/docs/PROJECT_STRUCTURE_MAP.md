# Pathfinder Project Structure Map

> **Purpose:** Canonical navigation map for human and AI engineering agents working in `leetcode-coach`.
>
> Use this document to answer:
> 1. **Where is the source of truth for a behavior?**
> 2. **Which files must change together?**
> 3. **Where should new logic live?**
> 4. **Which boundaries must not be bypassed?**

Pathfinder is a Vue 3 + TypeScript + Pinia + Vuetify application. Its learner-facing coaching is primarily deterministic and compiled from reviewed content. Presentation components should render and collect interaction state; they should not become the source of truth for coaching facts, scoring, persistence, or trace correctness.

---

## 1. Read This Before Changing Code

Repository-level engineering and AI-agent rules live outside the application directory:

```text
/
├── AGENTS.md
├── .agents/
│   └── skills/
│       ├── coaching-content/SKILL.md
│       ├── quality-gate/SKILL.md
│       ├── tracing/SKILL.md
│       └── vue-feature/SKILL.md
├── .codex/
│   └── agents/
│       ├── pathfinder-content-review.md
│       └── pathfinder-feature.md
└── leetcode-coach/
```

### Agent precedence

Before implementing a change:

1. Read `/AGENTS.md`.
2. Read the relevant skill under `/.agents/skills/`.
3. For AI-related work, read:
   - `leetcode-coach/docs/ai/AI_BOUNDARIES.md`
   - `leetcode-coach/docs/ai/CODEX_WORKFLOW.md`
4. Use this document to locate the implementation boundary.
5. Read the focused tests next to the affected logic before editing.

### Existing agent resources

| Resource | Use it for |
|---|---|
| `.agents/skills/vue-feature/SKILL.md` | Vue/UI feature implementation, component/store/type boundaries, accessibility |
| `.agents/skills/coaching-content/SKILL.md` | Deterministic learning content, question paths, hints, diagnostics |
| `.agents/skills/tracing/SKILL.md` | Exact reviewed execution traces and visualization continuity |
| `.agents/skills/quality-gate/SKILL.md` | Final product/accessibility/privacy/test verification |
| `.codex/agents/pathfinder-feature.md` | Focused Pathfinder feature implementation |
| `.codex/agents/pathfinder-content-review.md` | Coaching-content review workflow |
| `docs/ai/AI_BOUNDARIES.md` | What AI may and may not own |
| `docs/ai/CODEX_WORKFLOW.md` | Recommended Codex workflow |

---

## 2. Architecture at a Glance

```text
┌─────────────────────────────────────────────────────────────────┐
│                         ROUTING / SHELL                         │
│                   main.ts  →  App.vue                           │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION                            │
│  views/*  +  components/*  +  components/questions/*           │
│  Render state, collect user interactions, route between flows   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RUNTIME ORCHESTRATION                        │
│                       stores/trainer.ts                         │
│ Active problem, question path, answers, onboarding, Today,      │
│ repairs, adaptive selection, progress-derived analytics         │
└───────────────┬─────────────────────────────┬───────────────────┘
                │                             │
                ▼                             ▼
┌──────────────────────────────┐   ┌──────────────────────────────┐
│      PURE DOMAIN LOGIC       │   │       PERSISTED STATE        │
│ utils/*                      │   │ stores/progress.ts           │
│ evaluation, scheduling,      │   │ schema, validation,          │
│ selection, routing helpers   │   │ migration, serialization     │
└───────────────┬──────────────┘   └──────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                 REVIEWED CONTENT / COMPILATION                  │
│ data/problems.ts  →  data/coaching/*                            │
│ catalog + facts + profiles + deterministic question compiler    │
└───────────────┬───────────────────────────────┬─────────────────┘
                │                               │
                ▼                               ▼
┌──────────────────────────────┐   ┌──────────────────────────────┐
│      EXACT TRACING           │   │      LEARNING CONTENT        │
│ tracing/*                    │   │ lessons/deep dives/tracks/   │
│ typed trace model, fixtures, │   │ cheat sheet/repair metadata │
│ validation, compatibility    │   │                              │
└──────────────────────────────┘   └──────────────────────────────┘

Optional and isolated:
QuizView.vue → server/hints.mjs → OpenAI
```

### Core ownership rule

**Put logic at the lowest layer that can correctly own it.**

- UI-only behavior → `views/`, `components/`, or `composables/`
- Cross-page application flow/state → `stores/trainer.ts`
- Persisted progress shape/migration → `stores/progress.ts`
- Pure reusable decision logic → `utils/`
- Coaching truth → `data/coaching/`
- Exact trace truth → `tracing/`
- Shared domain contracts → `src/types.ts`
- Optional external AI → `server/`, never browser-secret code

---

## 3. Application Directory Map

```text
leetcode-coach/
├── .env.example
├── README.md
├── THIRD_PARTY_NOTICES.md
├── index.html
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
│
├── docs/
│   ├── PRODUCT_ROADMAP.md
│   ├── PUBLIC_PRODUCT_IMPLEMENTATION_PLAN.md
│   ├── CONCRETE_TRACING_IMPLEMENTATION_PLAN.md
│   ├── PATHFINDER_INTUITION_FIRST_QUESTION_SYSTEM.md
│   ├── PROJECT_STRUCTURE_MAP.md          # This file
│   └── ai/
│       ├── AI_BOUNDARIES.md
│       └── CODEX_WORKFLOW.md
│
├── scripts/
│   └── import-newfacade-dataset.mjs
│
├── server/
│   └── hints.mjs
│
└── src/
    ├── main.ts
    ├── App.vue
    ├── types.ts
    │
    ├── components/
    │   ├── FilterPanel.vue
    │   ├── TreeDiagramNode.vue
    │   └── questions/
    │       ├── registry.ts
    │       ├── MultipleChoiceQuestion.vue
    │       ├── AlgorithmBuilderQuestion.vue
    │       ├── IterationVisualizationQuestion.vue
    │       ├── CodeConstructionQuestion.vue
    │       ├── ConstraintSignalQuestion.vue
    │       ├── OperationContractQuestion.vue
    │       ├── StateSufficiencyQuestion.vue
    │       ├── NearTwinQuestion.vue
    │       ├── ConstraintMutationQuestion.vue
    │       └── StructuralAnalogyQuestion.vue
    │
    ├── composables/
    │   ├── useCodeLanguagePreference.ts
    │   ├── useReducedMotion.ts
    │   ├── useReducedMotion.test.ts
    │   ├── useTracePlayback.ts
    │   └── useTracePlayback.test.ts
    │
    ├── data/
    │   ├── catalog.generated.json
    │   ├── problems.ts
    │   ├── solutions.ts
    │   ├── tracks.ts
    │   ├── onboarding.ts
    │   ├── onboarding.test.ts
    │   ├── lessons.ts
    │   ├── lessonVisualizations.ts
    │   ├── deepDives.ts
    │   ├── deepDivesPatterns.ts
    │   ├── deepDivesStructures.ts
    │   ├── cheatSheet.ts
    │   ├── cheatSheetCodeSamples.ts
    │   ├── repairMetadata.ts
    │   └── coaching/
    │       ├── contentVersion.ts
    │       ├── compiler.ts
    │       ├── validation.ts
    │       ├── patterns.ts
    │       ├── beginnerProfiles.ts
    │       ├── problemFacts.ts
    │       ├── intuitionFacts.ts
    │       ├── intuitionCompiler.ts
    │       ├── codeConstruction.ts
    │       ├── executionTrace.ts
    │       ├── exactExecutionTraces.ts
    │       ├── lessonExecutionTraces.ts
    │       ├── coaching.test.ts
    │       └── intuitionQuestions.test.ts
    │
    ├── stores/
    │   ├── trainer.ts
    │   ├── trainer.test.ts
    │   ├── progress.ts
    │   └── progress.test.ts
    │
    ├── tracing/
    │   ├── types.ts
    │   ├── registry.ts
    │   ├── traceBuilder.ts
    │   ├── traceValidation.ts
    │   ├── traceDiff.ts
    │   ├── traceValues.ts
    │   ├── codeAnchors.ts
    │   ├── invariantAssertions.ts
    │   ├── compatibility.ts
    │   ├── tracing.test.ts
    │   └── fixtures/
    │       ├── index.ts
    │       ├── twoSum.ts
    │       └── binarySearch.ts
    │
    ├── utils/
    │   ├── activeProblemSession.ts
    │   ├── adaptiveQuestions.ts
    │   ├── dailySession.ts
    │   ├── dailySession.test.ts
    │   ├── problemRoutes.ts
    │   ├── problemRoutes.test.ts
    │   ├── problemSearch.ts
    │   ├── problemSearch.test.ts
    │   ├── questionConfig.ts
    │   ├── questionEvaluation.ts
    │   ├── questionEvaluation.test.ts
    │   ├── questionSequence.ts
    │   ├── questionSequence.test.ts
    │   ├── quizFeedback.ts
    │   ├── quizFeedback.test.ts
    │   ├── randomSelection.ts
    │   ├── randomSelection.test.ts
    │   └── repairSelectors.ts
    │
    ├── views/
    │   ├── QuizView.vue
    │   ├── ProblemsView.vue
    │   ├── OnboardingView.vue
    │   ├── TodayView.vue
    │   ├── LearnView.vue
    │   ├── CheatSheetView.vue
    │   ├── ProfileView.vue
    │   └── DevProgressView.vue
    │
    └── styles/
        └── main.scss
```

---

## 4. Bootstrap, Routing, and Global Shell

### `src/main.ts` — application bootstrap and route table

**Owns:**
- Vue application creation
- Pinia registration
- Vue Router registration
- Vuetify configuration/theme
- global stylesheet import
- top-level route definitions

**Current routes:**

| Route | View | Function |
|---|---|---|
| `/` | `QuizView.vue` | Practice landing/start-random-problem flow |
| `/problems` | `ProblemsView.vue` | Full problem catalog |
| `/problems/:problemId` | `QuizView.vue` | Guided coaching for one problem |
| `/start` | `OnboardingView.vue` | Starting-point diagnostic/onboarding |
| `/today` | `TodayView.vue` | Daily mastery session |
| `/learn/:slug?` | `LearnView.vue` | Lesson catalog and lesson detail |
| `/cheat-sheet` | `CheatSheetView.vue` | Searchable pattern/reference material |
| `/profile` | `ProfileView.vue` | Progress, preferences, Error Atlas |
| `/__dev/progress` | `DevProgressView.vue` | Development-only progress tooling |

**Change here when:**
- adding/removing a top-level route
- changing global Vuetify theme defaults
- changing app bootstrap plugins

**Do not put here:**
- feature business logic
- coaching rules
- progress rules
- per-page data transformations

### `src/App.vue` — global application shell

**Owns:**
- desktop and mobile primary navigation
- global app bar/drawer
- practice-consistency indicator in shell
- `<router-view />`

**Change here when:**
- changing global navigation
- changing top-level shell/mobile menu
- adding UI visible on most/all routes

---

## 5. Shared Domain Contracts

### `src/types.ts` — primary application type contract

This is the shared schema boundary for problems, coaching questions, question configurations, question interaction state, and interaction results.

**Owns:**
- `Problem`
- `QuizQuestion`
- `QuestionType`
- `QuestionFormat`
- `QuestionStage`
- `ReasoningSkillKey`
- `InstructionalLevel`
- every question-format configuration
- every question-format interaction-state type
- `QuestionInteractionResult`
- filter/result records used across the app

### Question formats currently modeled

```text
multiple-choice
algorithm-builder
iteration-visualization
code-construction
constraint-signals
operation-contract
state-sufficiency
near-twin
constraint-mutation
structural-analogy
```

### Critical rule when adding a question format

A new question format is a **cross-cutting domain change**, not a component-only change. At minimum inspect/update:

```text
src/types.ts
src/components/questions/<NewFormat>Question.vue
src/components/questions/registry.ts
src/utils/questionEvaluation.ts
src/data/coaching/* or the reviewed content source that creates it
src/data/coaching/validation.ts
src/stores/trainer.ts              # if result/state handling needs format-specific behavior
src/views/QuizView.vue             # presentation labels/instructions if needed
focused tests
```

Also inspect:
- `src/utils/questionConfig.ts` if the format exposes multiple-choice-compatible options/checkpoints.
- `src/stores/progress.ts` if persisted records require a schema change.
- `src/utils/adaptiveQuestions.ts` if the format participates in transfer/adaptive prerequisites.

---

## 6. Question Rendering and Interaction UI

### `src/components/questions/registry.ts` — question renderer dispatch

Maps each `QuestionFormat` to its Vue component.

```text
QuestionFormat
   │
   ▼
registry.ts
   │
   ▼
specific Question.vue renderer
```

`QuizView.vue` asks `questionComponentFor(format)` for the active renderer.

**This file is the registry, not the schema.**
- Schema authority → `src/types.ts`
- Renderer authority → `src/components/questions/registry.ts`
- Scoring/evaluation authority → `src/utils/questionEvaluation.ts`
- Content authority → `src/data/coaching/`

### `src/components/questions/*.vue` — format-specific interaction components

| Component | Encapsulates |
|---|---|
| `MultipleChoiceQuestion.vue` | Single-answer decision interaction |
| `AlgorithmBuilderQuestion.vue` | Ordering/building algorithm steps |
| `IterationVisualizationQuestion.vue` | Trace/frame playback plus checkpoint interaction |
| `CodeConstructionQuestion.vue` | Incremental code-choice construction |
| `ConstraintSignalQuestion.vue` | Mapping problem/constraint signals to consequences |
| `OperationContractQuestion.vue` | Deriving required operations and selecting fitting state/structure |
| `StateSufficiencyQuestion.vue` | Classifying which state is required/redundant/discardable |
| `NearTwinQuestion.vue` | Comparing near-identical problem contracts and pattern boundaries |
| `ConstraintMutationQuestion.vue` | Reasoning about how changed constraints alter the approach |
| `StructuralAnalogyQuestion.vue` | Mapping abstract roles across structurally similar problems |

### Component responsibility

Question components should:
- render typed config
- maintain transient UI state
- emit/update a typed `QuestionInteractionResult`
- preserve keyboard/touch/mobile accessibility
- expose enough evidence for deterministic evaluation/diagnostics

Question components should **not**:
- invent correct answers
- own canonical coaching facts
- decide progress/mastery policy
- write directly to localStorage
- duplicate scoring rules that belong in `questionEvaluation.ts`

---

## 7. Primary Practice Flow

### `src/views/QuizView.vue` — practice/problem page controller

This is the primary learner-facing guided-problem screen.

**Owns presentation-level orchestration for:**
- practice landing state
- route-driven problem loading
- question renderer selection
- problem statement/example/constraints display
- hidden topic/data-structure gate presentation
- progress bar and answer controls
- hint/retry/continue UI
- code solution language display/highlighting
- optional AI quiz/hint HTTP calls
- daily-task completion handoff after a problem

**Depends on:**
- `stores/trainer.ts` for runtime state/actions
- `components/questions/registry.ts` for renderer selection
- `utils/quizFeedback.ts` for local feedback
- `utils/problemRoutes.ts` for route parsing/building
- `utils/questionConfig.ts` for compatible option access
- `composables/useCodeLanguagePreference.ts`
- `FilterPanel.vue`

### Hidden-topic gate

`QuizView.vue` intentionally withholds topic chips until the learner completes the data-structure checkpoint. Changes that expose algorithm/topic information earlier must be treated as product/coaching changes, not cosmetic UI changes.

---

## 8. Problem Catalog and Filtering

### `src/views/ProblemsView.vue`

**Owns UI for:**
- complete guided-problem catalog
- text search
- catalog sorting
- opening filter drawer
- clearing UI search/filters
- routing into a problem
- completed-state display

### `src/components/FilterPanel.vue`

**Owns UI for selecting:**
- difficulties
- problem sets
- topics
- algorithms

Filter state itself is held by `stores/trainer.ts`.

### `src/utils/problemSearch.ts`

Pure problem text-search/filter helper used by `ProblemsView.vue`.

### `src/utils/problemRoutes.ts`

Pure route parsing/building for problem routes.

### `src/utils/randomSelection.ts`

Pure random-problem selection logic used by the trainer store. Keeps selection policy outside the view.

---

## 9. Problem Catalog Data Pipeline

### Source flow

```text
newfacade/LeetCodeDataset
        │
        ▼
scripts/import-newfacade-dataset.mjs
        │
        ▼
src/data/catalog.generated.json
        │
        ├──────────────┐
        ▼              ▼
imported problems   curatedProblems
                    in problems.ts
        │              │
        └──────┬───────┘
               ▼
      merge by problem ID
      curated wins on collision
               │
               ▼
compileQuestionPath(...)
               │
               ▼
export const problems
               │
               ▼
development validation
assertValidCoachingContent(...)
```

### `scripts/import-newfacade-dataset.mjs`

**Owns:**
- importing the external dataset
- selecting core-topic problems
- normalizing problem text/examples/constraints
- catalog provenance metadata
- writing `src/data/catalog.generated.json`

Run with:

```bash
npm run catalog:import
```

Optional environment:
- `CATALOG_PROBLEMS_PER_TOPIC`

### `src/data/catalog.generated.json`

**Generated artifact.**

Do not make ordinary manual edits here. Change the importer or source policy and regenerate.

### `src/data/problems.ts`

**Runtime problem catalog assembly boundary.**

Owns:
- curated problem overrides
- merge of imported and curated problems by ID
- curated code-sample attachment
- deterministic question-path compilation for every problem
- development-time content validation

Important behavior:
- imported problems are loaded first
- curated problems replace imported records with the same ID
- exported problems receive `compileQuestionPath(...)`
- development mode validates assembled coaching content

### `src/data/solutions.ts`

Curated multi-language/canonical solution samples consumed by problem assembly and UI.

---

## 10. Deterministic Coaching Content

### `src/data/coaching/` — authoritative coaching model

This directory is the source of truth for reviewed learner-facing coaching decisions.

### Key files

| File | Responsibility |
|---|---|
| `compiler.ts` | Builds deterministic question paths from reviewed facts/profiles |
| `validation.ts` | Validates compiled coaching content and invariants |
| `contentVersion.ts` | Version identifier used to track coaching-content compatibility/history |
| `patterns.ts` | Pattern-level teaching profiles |
| `beginnerProfiles.ts` | Beginner-facing mental models/wording for patterns |
| `problemFacts.ts` | Problem-specific verified teaching facts and complexity/correctness data |
| `intuitionFacts.ts` | Reviewed facts that power intuition-first/transfer interactions |
| `intuitionCompiler.ts` | Compiles intuition-first core/transfer questions |
| `codeConstruction.ts` | Reviewed step-by-step code-construction configurations |
| `executionTrace.ts` | Coaching-layer execution-trace construction used by lesson/question compilation |
| `exactExecutionTraces.ts` | Bridge/use of exact reviewed trace fixtures plus reviewed visualization material |
| `lessonExecutionTraces.ts` | Lesson-specific reviewed trace material/fallback coverage |
| `coaching.test.ts` | Broad deterministic coaching/content validation |
| `intuitionQuestions.test.ts` | Focused intuition-question correctness/coverage |

### `compiler.ts` — deterministic question-path compiler

For a `Problem`, the compiler derives a guided sequence using:
- verified problem facts
- pattern profiles
- beginner profiles
- deterministic seeded answer ordering
- prerequisite stages
- hint ladders
- reading-level notes
- reasoning-skill tags
- repair links
- instructional levels
- optional richer intuition-first question formats

The compiler currently models stages including:

```text
contract
data-structure
pattern
invariant
bottleneck
visualization
transition
trace
correctness
edge-case
tradeoff
build-algorithm
time-complexity
space-complexity
```

### Change coaching facts at the source

If an explanation, correct answer, invariant, complexity, hint, pattern clue, or trace is wrong:

**Do:**
1. find the relevant reviewed fact/profile/compiler source
2. correct it there
3. update focused tests/validation
4. verify compiled output

**Do not:**
- patch the rendered text in `QuizView.vue`
- special-case a bad answer in a question component
- silently replace reviewed content with AI output

---

## 11. Question Evaluation, Feedback, and Diagnostics

### `src/utils/questionEvaluation.ts` — pure scoring/evaluation

This is the main deterministic evaluation layer for interactive question formats.

It currently evaluates:
- algorithm order
- selected option
- code-construction choice
- constraint-signal mappings
- operation contracts
- state sufficiency
- near-twin comparisons
- constraint mutations
- structural analogies

Evaluation functions return data such as:
- completion readiness
- correctness
- diagnostic keys
- structured evidence
- format-specific feedback

### `src/utils/questionEvaluation.test.ts`

Focused unit tests for scoring behavior. Update this with any scoring-contract change.

### `src/utils/questionConfig.ts`

Compatibility/access helpers for question config, especially:
- multiple-choice questions
- visualization checkpoints that embed multiple-choice config
- answer/options/feedback/misconception-link access

### `src/utils/quizFeedback.ts`

Learner-facing feedback helpers for quiz interactions.

### `src/utils/questionSequence.ts`

Question ordering constraints, including sequencing rules such as requiring the data-structure gate before algorithm-oriented questions.

---

## 12. Runtime Orchestration: `stores/trainer.ts`

`src/stores/trainer.ts` is the **central application orchestration store**.

It is not the canonical persistence schema and not the canonical coaching-content source.

### It owns runtime state and flow for

#### Active guided problem
- current problem ID
- active compiled/adaptive question path
- current question index
- submitted/correct state
- hints revealed
- confidence
- per-question interaction state
- completion state
- active-session restoration

#### Problem selection
- current filters
- matching problems
- random-problem queue
- generated-quiz cache

#### Answer/attempt orchestration
- record attempts through progress factories
- first-attempt semantics
- diagnostics/evidence
- completion recording
- stats derived from persisted attempts

#### Onboarding
- start/update/skip/restart onboarding
- record onboarding interactions
- persist learner preferences

#### Today/daily mastery
- create today's session
- select planned tasks
- begin/complete tasks
- one-time rebuild
- practice consistency

#### Error Atlas / repair workflow
- open repair records from misconceptions
- snooze repairs
- validate a repair on later transfer/retrieval
- expose repair cards and due repairs

#### Adaptive practice
- combine base and transfer questions
- use prior attempts to select instructional level/path

#### Local persistence coordination
- load `ProgressStateV2`
- watch and persist state
- maintain active problem session
- maintain optional generated quiz cache

### Do not turn `trainer.ts` into a dumping ground

Move logic out when it is:
- a persistence-schema concern → `stores/progress.ts`
- reusable/pure selection logic → `utils/`
- content truth → `data/coaching/`
- trace truth → `tracing/`
- page-only presentation behavior → view/component/composable

---

## 13. Persisted Progress and Migration

### `src/stores/progress.ts` — persistence contract

This file owns the durable local progress model.

### `ProgressStateV2` includes

```text
learner
attempts
completedProblems
repairs
dailySessions
weeklyAggregates
milestones
localEvents
legacyAnswerStreak
legacyBestAnswerStreak
```

It also owns typed records such as:
- `LearnerProfile`
- `AttemptRecord`
- `ProblemCompletion`
- `RepairRecord`
- `DailySessionRecord`
- `WeeklyAggregate`
- `MilestoneRecord`
- `ProductEvent`

### Persistence responsibilities

`progress.ts` owns:
- schema version
- local-storage keys
- validation of imported/stored records
- migration from older progress
- empty state
- record factory helpers
- import/serialization behavior
- compaction/retention behavior
- recovery behavior

### Change workflow for persisted data

When changing persisted shape:

1. Update `ProgressStateV2` and affected record type.
2. Update validation.
3. Add migration/backward-compatibility behavior where required.
4. Update serialization/import logic.
5. Update record factories.
6. Update `trainer.ts` consumers.
7. Update `progress.test.ts`.
8. Verify old data does not become silently unreadable.

Do not mutate localStorage directly from views/components for progress data.

---

## 14. Active Problem Session Restoration

### `src/utils/activeProblemSession.ts`

Owns serialization/parsing/validation helpers for restoring an in-progress guided problem independently of the long-term progress schema.

Used by `trainer.ts` to restore:
- active problem
- selected question path
- question index
- interaction state
- answer state
- hint/confidence/session completion information

Keep active-session compatibility aligned with:
- `QuestionInteractionState` in `src/types.ts`
- content versioning
- adaptive question-path behavior

---

## 15. Adaptive Questions and Instructional Level

### `src/utils/adaptiveQuestions.ts`

Pure adaptive-selection logic.

Owns:
- deciding instructional level from prior attempts
- transfer-question eligibility
- insertion/selection of transfer interactions for daily sessions
- diagnostic-key to repair-stage mapping

Instructional progression currently uses:

```text
observe → complete → construct → retrieve → transfer
```

This file should make deterministic decisions from existing learner evidence. It should not call AI.

### `src/data/coaching/intuitionCompiler.ts`

Creates the reviewed intuition-first/transfer questions that adaptive selection can choose from.

### `src/data/coaching/intuitionFacts.ts`

Provides the reviewed facts used by that compiler.

---

## 16. Onboarding / Starting-Point Flow

### `src/views/OnboardingView.vue`

Owns onboarding presentation and interaction flow.

### `src/data/onboarding.ts`

Owns deterministic onboarding decision selection and recommendation logic.

Important behavior:
- onboarding questions are references to already reviewed compiled coaching questions
- diagnostic content is not generated ad hoc
- recommendation can respect prerequisite tracks

### `src/data/onboarding.test.ts`

Focused onboarding/recommendation tests.

### `stores/trainer.ts`

Owns onboarding runtime state and persistence:
- learner preferences
- status
- answered decision IDs
- attempt recording
- completion/skip/restart

---

## 17. Learning Tracks and Daily Mastery

### `src/data/tracks.ts`

Defines authored learning tracks, prerequisites, entry problems, representative problems, and lesson associations used by onboarding/daily planning.

### `src/utils/dailySession.ts`

Pure daily-plan policy.

Owns:
- `DailyTask`/task kinds
- task construction
- task reconstruction from IDs
- daily task limits based on learner-selected minutes
- prerequisite/entry/transfer/retrieval task selection
- practice-consistency calculation

Daily task kinds include:

```text
lesson
problem
repair
trace
retrieval
```

### `src/views/TodayView.vue`

Owns the Today page presentation:
- ensure/display today's plan
- display practice consistency
- show due Error Atlas review
- open task route
- mark review tasks complete
- trigger allowed rebuild

The selection policy itself belongs in `dailySession.ts`/trainer orchestration, not in the view.

---

## 18. Error Atlas / Misconception Repair

Repair functionality spans content metadata, deterministic evaluation, persisted repair state, selectors, and UI.

### Ownership chain

```text
question answer
    │
    ▼
questionEvaluation / questionConfig
    │
    ▼
diagnostic keys + misconception link
    │
    ▼
trainer.ts opens RepairRecord
    │
    ▼
stores/progress.ts persists repair
    │
    ▼
utils/repairSelectors.ts builds RepairCard / DailyTask
    │
    ├──► TodayView.vue
    └──► ProfileView.vue
```

### `src/data/repairMetadata.ts`

Canonical category-level repair destinations/metadata.

### `src/utils/repairSelectors.ts`

Pure projection from progress + reviewed question data to learner-facing repair cards/tasks.

Owns:
- repair-card construction
- due-repair filtering
- reviewed explanation selection
- content-version awareness
- repeat counts
- repair/trace/retrieval task construction

### `src/views/ProfileView.vue`

Owns Error Atlas/progress presentation, filtering, and navigation to repair destinations.

### `src/views/TodayView.vue`

Surfaces due repair tasks in the daily plan.

---

## 19. Learning Library

### `src/data/lessons.ts`

Primary lesson catalog consumed by `LearnView.vue`.

### `src/data/deepDives.ts`
### `src/data/deepDivesStructures.ts`
### `src/data/deepDivesPatterns.ts`

Authored deep-dive learning material supporting the lesson catalog. Keep conceptual/foundational lesson content here rather than embedding long-form teaching content directly in views.

### `src/views/LearnView.vue`

Owns:
- lesson catalog
- lesson search/category filtering
- lesson detail reader
- mental models
- deep dives
- recognition signals
- walkthrough presentation
- lesson navigation
- repair-return context
- embedded reviewed visualization rendering

### `src/data/lessonVisualizations.ts`

Maps lesson slugs to representative problem IDs and delegates visualization creation to the coaching compiler.

This intentionally reuses reviewed problem/coaching logic instead of maintaining an unrelated lesson-only algorithm implementation.

### `src/components/TreeDiagramNode.vue`

Reusable recursive tree-diagram presentation used by learning/deep-dive content.

---

## 20. Cheat Sheet

### `src/views/CheatSheetView.vue`

Learner-facing searchable/reference view for common problem-solving patterns and concepts.

### `src/data/cheatSheet.ts`

Structured cheat-sheet content.

### `src/data/cheatSheetCodeSamples.ts`

Code samples associated with cheat-sheet material.

Keep cheat-sheet content in data modules rather than hard-coding it into the view.

---

## 21. Progress, Preferences, and Data Portability

### `src/views/ProfileView.vue`

Presentation/controller for:
- overall answer accuracy
- practice consistency
- problem history
- accuracy by decision type
- accuracy by interaction format
- reasoning/mastery views
- Error Atlas
- learning preferences
- preferred code language
- selected tracks/daily minutes
- progress export/import/recovery
- onboarding restart/reset-related UI

### `src/composables/useCodeLanguagePreference.ts`

Reusable preferred-language state/access for code display and learner settings.

Persisted learner-profile preferences still flow through `trainer.ts`/`progress.ts`.

### `src/views/DevProgressView.vue`

Development-only progress inspection/debug tooling. It is registered only in development routing.

Do not make production functionality depend on this view.

---

## 22. Exact Execution Tracing

### `src/tracing/` — exact structured trace subsystem

This is the domain boundary for deterministic, reviewed concrete execution traces.

It is separate from generic question types in `src/types.ts`.

### `src/tracing/types.ts` — trace schema

Defines:
- trace values
- variables and roles
- array/map structures
- snapshots
- trace events
- code anchors
- invariant checkpoints
- transitions
- final `ExecutionTrace`

### Trace quality

```text
exact-reviewed
instructional-overview
```

### `src/tracing/registry.ts`

Maps problem IDs to trace producers.

A trace retrieved from the registry is validated before use.

### `src/tracing/fixtures/`

Reviewed concrete trace producers for supported problems.

Current pilot fixture files include:
- `twoSum.ts`
- `binarySearch.ts`
- `index.ts` for registration

### Supporting trace modules

| File | Responsibility |
|---|---|
| `traceBuilder.ts` | Helpers for constructing structured traces |
| `traceValidation.ts` | Structural/correctness validation for trace artifacts |
| `traceDiff.ts` | Derives/compares state changes across transitions |
| `traceValues.ts` | Trace-value construction/normalization helpers |
| `codeAnchors.ts` | Maps transitions/events to canonical source-code ranges |
| `invariantAssertions.ts` | Invariant assertion/checkpoint support |
| `compatibility.ts` | Converts exact trace model into visualization-compatible frames |
| `tracing.test.ts` | Trace schema, continuity, validation, and fixture coverage |

### Trace-to-UI flow

```text
tracing/fixtures/<problem>.ts
          │
          ▼
tracing/registry.ts
          │
          ▼
traceValidation.ts
          │
          ▼
tracing/compatibility.ts
          │
          ▼
data/coaching/exactExecutionTraces.ts
          │
          ▼
IterationVisualizationQuestion.vue
```

### When adding exact tracing for a problem

Inspect/update:

```text
src/tracing/fixtures/<problem>.ts
src/tracing/fixtures/index.ts
src/tracing/codeAnchors.ts            # if shared anchor definitions require it
src/tracing/invariantAssertions.ts     # if new invariant assertion support is needed
src/tracing/tracing.test.ts
src/data/coaching/exactExecutionTraces.ts
relevant coaching/visualization tests
```

Do not hide invalid or discontinuous traces in a Vue component.

---

## 23. Trace Playback and Accessibility

### `src/composables/useTracePlayback.ts`

Reusable playback/controller state for stepping through execution traces/visualization frames.

### `src/composables/useReducedMotion.ts`

Central reduced-motion preference handling for motion-sensitive users.

### `IterationVisualizationQuestion.vue`

Owns learner-facing visualization interaction, but not the truth of the trace.

For playback changes inspect together:
- `IterationVisualizationQuestion.vue`
- `useTracePlayback.ts`
- `useReducedMotion.ts`
- their tests
- tracing/compatibility if frame semantics change

Preserve:
- keyboard operation
- touch operation
- current-step/status announcements
- reduced-motion behavior
- trace continuity

---

## 24. Optional AI Coach Boundary

### `server/hints.mjs`

Optional Node-side AI service.

Endpoints:
- `POST /api/hint`
- `POST /api/quiz`

Server-only configuration includes:
- `OPENAI_API_KEY`
- `OPENAI_HINT_MODEL`
- `HINT_SERVER_PORT`
- `APP_ORIGIN`

### Client entry point

`QuizView.vue` may call:
- `VITE_HINT_API_URL`
- `VITE_QUIZ_API_URL`

AI use is enabled only in the configured AI mode/flag.

### Important boundary

The OpenAI-backed service is **optional and isolated**. It must not become the authority for:
- reviewed coaching paths
- canonical answers
- correctness proofs
- complexity facts
- exact traces
- learner scoring
- repair decisions
- mastery/progress decisions

Do not place `OPENAI_API_KEY` or other secrets in Vite/browser code.

---

## 25. Styles

### `src/styles/main.scss`

Global application styling for the Pathfinder UI.

Inspect this file for:
- page/layout styles
- shared visual tokens/classes
- responsive behavior
- question/lesson/profile/catalog presentation

When adding component-specific styles, first check whether an existing shared class/system should be reused. Avoid introducing behavior logic into styling.

---

## 26. Utility Ownership Map

| Utility | Owns |
|---|---|
| `activeProblemSession.ts` | In-progress problem-session restoration/validation |
| `adaptiveQuestions.ts` | Instructional level and deterministic transfer-question selection |
| `dailySession.ts` | Daily-task planning and practice consistency |
| `problemRoutes.ts` | Problem route parse/build helpers |
| `problemSearch.ts` | Problem catalog text search |
| `questionConfig.ts` | Shared access to multiple-choice/checkpoint config |
| `questionEvaluation.ts` | Deterministic interactive-format scoring and evidence |
| `questionSequence.ts` | Ordering/gating constraints for question paths |
| `quizFeedback.ts` | Local learner-facing answer feedback helpers |
| `randomSelection.ts` | Random problem selection policy |
| `repairSelectors.ts` | Convert persisted misconceptions into repair cards/tasks |

### Utility rule

A utility should be:
- deterministic
- side-effect-light or side-effect-free where practical
- reusable outside one template
- independently unit-testable

If it needs broad mutable application state, it likely belongs in a store instead.

---

## 27. View Ownership Map

| View | Primary responsibility | Logic authority it delegates to |
|---|---|---|
| `QuizView.vue` | Practice landing + guided problem session | `trainer.ts`, coaching compiler, evaluation utils |
| `ProblemsView.vue` | Browse/search/filter problem catalog | trainer filters, search/routes utils |
| `OnboardingView.vue` | Starting-point questionnaire UI | `data/onboarding.ts`, `trainer.ts` |
| `TodayView.vue` | Daily mastery plan UI | `trainer.ts`, `dailySession.ts`, repair selectors |
| `LearnView.vue` | Lesson catalog/detail/deep dives | lesson data + coaching visualization compiler |
| `CheatSheetView.vue` | Quick-reference learning UI | cheat-sheet data modules |
| `ProfileView.vue` | Progress/preferences/Error Atlas/data portability | trainer/progress/repair selectors |
| `DevProgressView.vue` | Development-only progress tooling | trainer/progress state |

---

## 28. Functional Ownership Matrix

Use this table before searching the repository broadly.

| Change requested | Start here | Then inspect |
|---|---|---|
| Add a top-level page/route | `src/main.ts` | new/existing `views/*.vue`, `App.vue` nav |
| Change global nav/shell | `src/App.vue` | `main.ts`, global styles |
| Change problem practice UI | `src/views/QuizView.vue` | question components, trainer |
| Add a question format | `src/types.ts` | renderer registry/component, evaluation, compiler/content, tests |
| Change question scoring | `src/utils/questionEvaluation.ts` | component interaction result, trainer, tests |
| Change multiple-choice feedback | `src/utils/quizFeedback.ts` / coaching content | `questionConfig.ts`, tests |
| Change coaching sequence | `src/data/coaching/compiler.ts` | facts/profiles, `questionSequence.ts`, validation/tests |
| Change a problem-specific coaching fact | `src/data/coaching/problemFacts.ts` | compiler/content tests |
| Change pattern-level teaching model | `src/data/coaching/patterns.ts` / `beginnerProfiles.ts` | compiler/content tests |
| Add intuition/transfer interaction | `intuitionFacts.ts` + `intuitionCompiler.ts` | types/evaluation/registry/adaptive selection |
| Add code-construction content | `src/data/coaching/codeConstruction.ts` | types, renderer, evaluation, tests |
| Add/modify exact trace | `src/tracing/` | exactExecutionTraces bridge, playback/UI, tests |
| Change trace playback UI | `IterationVisualizationQuestion.vue` | playback/reduced-motion composables |
| Change persisted progress schema | `src/stores/progress.ts` | trainer + migration/import tests |
| Change active problem resume | `src/utils/activeProblemSession.ts` | trainer, interaction-state types |
| Change adaptive difficulty/transfer | `src/utils/adaptiveQuestions.ts` | trainer + intuition compiler/facts |
| Change Today planning | `src/utils/dailySession.ts` | trainer, tracks, repair selectors, TodayView |
| Change practice streak/consistency | `src/utils/dailySession.ts` | trainer, Today/Profile/App displays |
| Change repair/Error Atlas behavior | `repairMetadata.ts` / `repairSelectors.ts` | evaluation diagnostics, trainer, progress, Profile/Today |
| Change learning tracks | `src/data/tracks.ts` | onboarding + daily planning |
| Change onboarding diagnostics | `src/data/onboarding.ts` | trainer + OnboardingView + tests |
| Change lesson content | `src/data/lessons.ts` / deep-dive modules | LearnView |
| Change lesson visualization mapping | `src/data/lessonVisualizations.ts` | coaching compiler/traces |
| Change cheat-sheet content | `src/data/cheatSheet*.ts` | CheatSheetView |
| Add catalog problems | importer or curated `problems.ts` | coaching facts/validation |
| Change catalog import policy | `scripts/import-newfacade-dataset.mjs` | regenerate catalog + provenance review |
| Change preferred code language | `useCodeLanguagePreference.ts` | QuizView/ProfileView |
| Change optional AI behavior | `server/hints.mjs` | QuizView endpoint call + AI boundary docs |
| Change global responsive styling | `src/styles/main.scss` | affected view/component |
| Debug production progress | `stores/progress.ts` / `trainer.ts` | Profile data tools; never rely on dev-only view |

---

## 29. Common Change Recipes

### A. Add a new question interaction type

1. Add the format to `QUESTION_FORMATS` in `src/types.ts`.
2. Add its config interface.
3. Add its question interface to `QuizQuestion`.
4. Add its interaction-state interface to `QuestionInteractionState`.
5. Implement deterministic evaluation in `utils/questionEvaluation.ts`.
6. Add evaluation tests.
7. Create `components/questions/<Format>Question.vue`.
8. Register it in `components/questions/registry.ts`.
9. Add reviewed content/facts/compiler support.
10. Extend `data/coaching/validation.ts`.
11. Update `QuizView.vue` presentation labels/instructions only as needed.
12. Inspect `trainer.ts` for any format-specific persisted state/evidence handling.
13. Inspect `adaptiveQuestions.ts` if it participates in transfer.
14. Run full content tests, unit tests, and build.

### B. Correct a coaching explanation or answer

1. Identify the problem and stage.
2. Find the source in:
   - `problemFacts.ts`
   - `patterns.ts`
   - `beginnerProfiles.ts`
   - `intuitionFacts.ts`
   - `codeConstruction.ts`
   - or the relevant reviewed trace
3. Correct the source.
4. Do not patch rendered output.
5. Update validation/tests.
6. Run the coaching-content validation and full test suite.

### C. Add exact execution tracing to another problem

1. Choose a reviewed concrete fixture input/output.
2. Build the trace under `src/tracing/fixtures/`.
3. Register it through `fixtures/index.ts`.
4. Use stable typed snapshots/events/anchors/invariants.
5. Verify every `before → after` transition is continuous.
6. Verify final output equals expected output.
7. Ensure compatibility conversion produces the required visualization frames.
8. Add tracing tests.
9. Check playback in `IterationVisualizationQuestion.vue`.

### D. Change progress persistence

1. Edit `stores/progress.ts`, not a view.
2. Update schema validation.
3. Add migration/backward compatibility.
4. Update factories/serialization/import.
5. Update trainer consumers.
6. Add tests for old and new persisted forms.
7. Verify import/export/recovery in Profile flow.

### E. Change daily-learning behavior

1. Change deterministic plan selection in `utils/dailySession.ts`.
2. Change adaptive transfer policy in `utils/adaptiveQuestions.ts` if necessary.
3. Change track definitions in `data/tracks.ts` if curriculum structure changed.
4. Change repair scheduling/projection in `repairSelectors.ts` if repair tasks changed.
5. Let `trainer.ts` orchestrate state transitions.
6. Keep `TodayView.vue` focused on rendering/navigation.
7. Add focused tests.

---

## 30. Data and Control Flows

### Guided problem flow

```text
route /problems/:id
      │
      ▼
QuizView.vue
      │
      ▼
trainer.startProblem(id)
      │
      ├──► problems.ts → compiled reviewed questions
      ├──► activeProblemSession.ts → restore if compatible
      └──► adaptiveQuestions.ts → choose leveled/transfer path
      │
      ▼
question renderer from registry.ts
      │
      ▼
QuestionInteractionResult
      │
      ▼
trainer.submit/record interaction
      │
      ├──► questionEvaluation.ts / diagnostics
      ├──► progress.ts attempt/completion factories
      └──► repair workflow if needed
      │
      ▼
local ProgressStateV2
```

### Daily session flow

```text
TodayView.vue
   │
   ▼
trainer.ensureTodaySession()
   │
   ├──► dailySession.ts
   ├──► tracks.ts
   ├──► repairSelectors.ts
   └──► persisted learner history
   │
   ▼
DailySessionRecord + DailyTask projections
   │
   ▼
lesson / repair / trace / problem / retrieval route
```

### Coaching content flow

```text
problem catalog
   │
   ▼
problemFacts + pattern profiles + intuition facts
   │
   ▼
compiler.ts / intuitionCompiler.ts
   │
   ▼
validation.ts
   │
   ▼
Problem.questions
   │
   ▼
trainer adaptive path
   │
   ▼
QuizView + renderer
```

### Progress persistence flow

```text
learner interaction
   │
   ▼
trainer.ts
   │
   ▼
progress.ts factories/schema
   │
   ▼
ProgressStateV2
   │
   ▼
serialized localStorage
```

---

## 31. Generated vs. Authored Files

### Generated — normally do not hand-edit

| Path | Regenerate via |
|---|---|
| `src/data/catalog.generated.json` | `npm run catalog:import` |
| `package-lock.json` | npm dependency operations |
| `dist/` if present locally | `npm run build` |

### Authored source-of-truth content

Treat these as reviewed source:
- `src/data/coaching/*`
- curated entries in `src/data/problems.ts`
- `src/data/solutions.ts`
- `src/data/lessons.ts`
- `src/data/deepDives*.ts`
- `src/data/tracks.ts`
- `src/data/repairMetadata.ts`
- `src/tracing/fixtures/*`

---

## 32. Testing Map

Tests are intentionally colocated near behavior.

| Area | Primary tests |
|---|---|
| Coaching compiler/content | `src/data/coaching/coaching.test.ts` |
| Intuition-first questions | `src/data/coaching/intuitionQuestions.test.ts` |
| Onboarding | `src/data/onboarding.test.ts` |
| Trainer orchestration | `src/stores/trainer.test.ts` |
| Progress persistence | `src/stores/progress.test.ts` |
| Exact tracing | `src/tracing/tracing.test.ts` |
| Trace playback | `src/composables/useTracePlayback.test.ts` |
| Reduced motion | `src/composables/useReducedMotion.test.ts` |
| Daily planning | `src/utils/dailySession.test.ts` |
| Problem routes | `src/utils/problemRoutes.test.ts` |
| Problem search | `src/utils/problemSearch.test.ts` |
| Question evaluation | `src/utils/questionEvaluation.test.ts` |
| Question sequencing | `src/utils/questionSequence.test.ts` |
| Quiz feedback | `src/utils/quizFeedback.test.ts` |
| Random problem selection | `src/utils/randomSelection.test.ts` |

### Required verification

From `leetcode-coach/`:

```bash
npm test
npm run build
```

Useful focused validation:

```bash
npm run content:validate
```

The build already runs the coaching-content validation before TypeScript and Vite build steps.

---

## 33. Package Scripts

From `package.json`:

| Command | Purpose |
|---|---|
| `npm run dev` | Vite development server |
| `npm run dev:network` | Vite bound to `0.0.0.0:5173` |
| `npm run dev:ai` | Vite in AI mode |
| `npm run hints` | Optional local AI coach server |
| `npm run catalog:import` | Regenerate imported problem catalog |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Vitest watch mode |
| `npm run content:validate` | Focused coaching-content tests |
| `npm run build` | Content validation + `vue-tsc` + Vite build |
| `npm run preview` | Preview production build |
| `npm run deploy` | Build and publish `dist` with `gh-pages` |

---

## 34. Boundary Rules for AI Agents

### Never bypass deterministic sources

Do not:
- generate a replacement for reviewed coaching at runtime
- fix invalid coaching output only in a component
- fix an invalid exact trace only in visualization presentation
- reveal topic/algorithm information before the intended gate
- alter scoring based on free-form model output
- use AI to decide mastery, repairs, or progress state

### Never cross the secret boundary

Browser/Vite code may contain intentionally public endpoint configuration.

Secrets and key-bearing calls belong under the server boundary.

### Keep state ownership explicit

Before adding state, ask:

```text
Is it only transient UI state?
  └─ Yes → component/composable

Does it coordinate a learner flow across components/pages?
  └─ Yes → trainer store

Is it durable learner data?
  └─ Yes → progress schema + trainer orchestration

Is it derivable by a pure function?
  └─ Yes → utils

Is it canonical instructional content?
  └─ Yes → data/coaching or authored data module

Is it exact algorithm execution truth?
  └─ Yes → tracing
```

---

## 35. Search Strategy for Agents

When assigned a change, avoid scanning the whole repository first.

### Step 1 — classify the request

Choose one or more:
- route/shell
- page UI
- question UI
- question schema
- question evaluation
- coaching content
- runtime orchestration
- persistence
- adaptive/daily planning
- repair
- lesson/cheat-sheet content
- tracing
- optional AI service
- styling

### Step 2 — open the primary owner from the ownership matrix

Read the file and its imports.

### Step 3 — follow only the relevant dependency direction

Typical dependency direction:

```text
view/component
    ↓
store or pure utility
    ↓
domain type/content/persistence/tracing source
```

For a bug, continue downward until the **first incorrect source value or decision** is found. Fix it there.

### Step 4 — find colocated tests

Read existing expected behavior before changing implementation.

### Step 5 — change the smallest coherent set of files

A small diff is preferred, but never preserve an invalid abstraction merely to reduce file count.

---

## 36. Files That Frequently Need to Change Together

### Question-system cluster

```text
src/types.ts
src/components/questions/*
src/components/questions/registry.ts
src/utils/questionEvaluation.ts
src/utils/questionConfig.ts
src/data/coaching/*
src/stores/trainer.ts
src/views/QuizView.vue
```

### Learner-progress cluster

```text
src/stores/progress.ts
src/stores/trainer.ts
src/utils/activeProblemSession.ts
src/views/ProfileView.vue
```

### Daily/adaptive learning cluster

```text
src/data/tracks.ts
src/utils/dailySession.ts
src/utils/adaptiveQuestions.ts
src/utils/repairSelectors.ts
src/stores/trainer.ts
src/views/TodayView.vue
```

### Tracing cluster

```text
src/tracing/*
src/data/coaching/exactExecutionTraces.ts
src/data/coaching/executionTrace.ts
src/data/lessonVisualizations.ts
src/components/questions/IterationVisualizationQuestion.vue
src/composables/useTracePlayback.ts
src/composables/useReducedMotion.ts
```

### Learning-content cluster

```text
src/data/lessons.ts
src/data/deepDives*.ts
src/data/lessonVisualizations.ts
src/views/LearnView.vue
```

### Catalog cluster

```text
scripts/import-newfacade-dataset.mjs
src/data/catalog.generated.json
src/data/problems.ts
src/data/solutions.ts
src/data/coaching/problemFacts.ts
src/data/coaching/validation.ts
```

---

## 37. Maintenance Rules for This Map

Update `docs/PROJECT_STRUCTURE_MAP.md` when a change does any of the following:

- adds/removes/moves a top-level directory
- adds/removes a route or view
- adds a question format
- changes source-of-truth ownership
- introduces a new store
- changes the persisted progress schema
- adds a major coaching compiler/data subsystem
- changes the trace architecture
- adds a new external service
- introduces another generated data pipeline
- creates a new agent skill/workflow
- materially changes the required test/build workflow

For ordinary leaf-level implementation changes, this map does not need to enumerate every new helper unless ownership becomes ambiguous.

---

## 38. Fast Decision Index

**I need to change...**

- **routes or global theme** → `src/main.ts`
- **global navigation** → `src/App.vue`
- **problem session UI** → `src/views/QuizView.vue`
- **problem browsing** → `ProblemsView.vue` + `problemSearch.ts` + `FilterPanel.vue`
- **question shape** → `src/types.ts`
- **question renderer** → `components/questions/`
- **renderer dispatch** → `components/questions/registry.ts`
- **question correctness/scoring** → `utils/questionEvaluation.ts`
- **question answer/options compatibility** → `utils/questionConfig.ts`
- **question order/gates** → `utils/questionSequence.ts`
- **canonical coaching** → `data/coaching/`
- **problem catalog assembly** → `data/problems.ts`
- **imported catalog generation** → `scripts/import-newfacade-dataset.mjs`
- **active learner flow** → `stores/trainer.ts`
- **durable progress format** → `stores/progress.ts`
- **resume current problem** → `utils/activeProblemSession.ts`
- **adaptive transfer** → `utils/adaptiveQuestions.ts`
- **Today plan** → `utils/dailySession.ts`
- **Error Atlas** → `repairMetadata.ts` + `repairSelectors.ts` + trainer/progress
- **learning tracks** → `data/tracks.ts`
- **onboarding content/recommendation** → `data/onboarding.ts`
- **lessons** → `data/lessons.ts` + `deepDives*.ts`
- **lesson visualization mapping** → `data/lessonVisualizations.ts`
- **cheat sheet** → `data/cheatSheet*.ts`
- **exact execution trace** → `src/tracing/`
- **trace playback** → `useTracePlayback.ts` + `IterationVisualizationQuestion.vue`
- **reduced motion** → `useReducedMotion.ts`
- **preferred code language** → `useCodeLanguagePreference.ts`
- **optional OpenAI coach** → `server/hints.mjs`
- **global styling** → `styles/main.scss`

---

## 39. Definition of Done for Agent Changes

For behavior changes, an AI agent should not consider work complete until it can state:

1. **Primary source of truth changed:** which file owns the behavior.
2. **Dependent boundaries updated:** types/renderers/store/utils/content/persistence as required.
3. **Deterministic coaching preserved:** no unreviewed runtime replacement was introduced.
4. **Accessibility preserved:** keyboard, touch, mobile, labels, focus, and motion were considered where applicable.
5. **Privacy boundary preserved:** no secret entered browser-visible code.
6. **Focused tests updated:** relevant test files cover the behavior.
7. **Verification run from `leetcode-coach`:**
   - `npm test`
   - `npm run build`
8. **This map updated if architecture/ownership changed.**

The goal of this map is not merely to show where files exist. It is to make **ownership and change propagation explicit** so an agent can navigate directly to the correct abstraction, modify the true source of behavior, and avoid duplicating or bypassing Pathfinder's deterministic learning model.
