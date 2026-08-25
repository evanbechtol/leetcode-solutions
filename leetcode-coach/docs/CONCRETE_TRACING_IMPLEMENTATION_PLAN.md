# Concrete Tracing Implementation Plan

Status: Planned

Last updated: August 24, 2026

Related planning document: [Product Roadmap](PRODUCT_ROADMAP.md)

## Purpose

Concrete tracing teaches learners how a verified algorithm changes its maintained state while processing a specific input. Given a reviewed implementation and concrete input, Pathfinder should show exactly what changes at each meaningful execution step, why the change is valid, which instruction caused it, and which invariant remains true.

Tracing is an instructional capability in the Learn experience. It must remain deterministic, accessible, available in the static GitHub Pages deployment, and independent of AI or a hosted execution service.

## Current implementation

| Existing file | Responsibility | Current limitation |
| --- | --- | --- |
| `src/types.ts` | Defines `VisualizationFrame` and visualization configuration. | Values are mostly display strings rather than typed execution state. |
| `src/data/coaching/executionTrace.ts` | Builds visualization frames. | Most problems receive six generalized, approximate frames. |
| `src/data/coaching/exactExecutionTraces.ts` | Supplies five hand-authored exact pilot visualizations. | Frames combine presentation, state, explanations, and sometimes several execution steps. |
| `src/components/questions/IterationVisualizationQuestion.vue` | Displays structures, variables, code highlights, invariants, and navigation. | Does not provide derived differences, complete playback, specialized structure renderers, or prediction checkpoints. |
| `src/data/lessonVisualizations.ts` | Maps Learn lessons to representative problems. | Each lesson currently exposes only one representative problem. |
| `src/data/coaching/validation.ts` | Validates visualization completeness and highlighted line references. | Does not independently validate transition continuity, executable invariants, or exact intermediate states. |

Existing reviewed pilot traces cover Two Sum (1), Longest Substring Without Repeating Characters (3), Binary Search (704), Binary Tree Level Order Traversal (102), and Course Schedule (207).

## Product boundaries

- Keep initial concrete tracing inside Learn rather than the graded problem path.
- Do not expose canonical implementations during graded problem practice before the learner has earned them through code construction.
- Use reviewed, deterministic problem-specific trace producers. Do not execute or instrument arbitrary user code.
- Treat typed execution data as the source of truth. Derive display frames, animations, and highlights from that data.
- Keep prediction checkpoints optional and ungraded in the initial milestone.
- Support keyboard, mouse, touch, screen readers, reduced motion, and narrow screens.
- Preserve the static application and existing no-AI behavior.
- Clearly distinguish exact reviewed traces from approximate instructional overviews.

## Core concepts

### 1. A trace is an ordered sequence of state transitions

Every meaningful transition answers:

1. What was true before the step?
2. What instruction or decision executed?
3. Which variables, pointers, structures, or output changed?
4. Why is the change correct?
5. Which invariant holds afterward, or why is it temporarily relaxed?

For Two Sum, before examining the first value, `i = 0` and `seen = {}`. Executing `complement = target - nums[i]` produces `complement = 7` because any valid partner for `2` must equal `9 - 2`. The invariant remains that `seen` contains values from indices strictly before `i`.

### 2. Execution state must preserve types and identity

Display strings such as `'{2: 0}'` cannot reliably support structural differences, deterministic grading, pointer movement, or independent validation. Represent numbers, strings, booleans, null, infinity, pending output, collections, and node references explicitly.

Assign stable identities to array elements, linked-list nodes, graph vertices, graph edges, heap entries, and recursive frames. Two equal values at different indices must remain distinguishable.

### 3. Differences are derived from consecutive snapshots

Do not hand-author `changed` flags or previous-value strings as canonical data. Compute differences from the previous and current snapshots:

NaNts
const changes = diffSnapshots(previousSnapshot, currentSnapshot)
NaN

Derived changes include variable assignment, pointer movement, insertion, deletion, updated map entries, queue operations, active graph edges, changed dynamic-programming cells, and produced output.

### 4. The primary unit is a semantic transition

A semantic transition may include multiple atomic events when they form one understandable algorithmic action. Atomic events remain available for validation and future expanded inspection.

Do not combine operations in a way that hides consequential state changes, reverses observable ordering, or produces output before the corresponding return instruction.

### 5. Invariants have explicit checkpoints

Some invariants hold only at iteration boundaries. A sliding window can temporarily contain a duplicate after expanding, then restore its invariant after advancing the left boundary.

Represent checkpoint states explicitly:

- `holds`: the declared invariant is currently true.
- `temporarily-relaxed`: an intermediate action temporarily violates the steady-state condition.
- `restored`: the transition repairs the temporary violation.
- `not-applicable`: the invariant has not yet become meaningful.

Executable assertions should run only at declared valid checkpoints.

### 6. Verification is independent from trace production

A producer successfully creating a trace does not establish that the trace is correct. Every reviewed fixture requires a legal input, an independent expected output, reviewed milestone snapshots, invariant assertions, valid code anchors, explicit termination, and tests that fail if state ordering or values change incorrectly.

### 7. Observation and assessment remain separate

Observe mode presents exact execution without affecting score or streak. Prediction mode optionally pauses before selected transitions and evaluates constrained answers deterministically. A future graded state-prediction format requires its own schema, interaction state, profile analytics, feedback, and prerequisite controls.

## Architecture

NaNmermaid
flowchart TD
    A["Reviewed problem fixture"] --> B["Instrumented trace producer"]
    B --> C["Typed execution trace"]
    C --> D["Independent validation"]
    C --> E["Snapshot difference engine"]
    C --> F["Semantic code anchors"]
    E --> G["Visualization view model"]
    F --> G
    G --> H["Structure renderers"]
    G --> I["Playback controls"]
    G --> J["Prediction checkpoints"]
NaN

Trace production and validation must not depend on Vue components, animation libraries, styles, or human-readable display strings.

### Proposed module layout

NaNtext
src/
  tracing/
    types.ts
    registry.ts
    traceBuilder.ts
    traceDiff.ts
    traceValidation.ts
    traceSelectors.ts
    codeAnchors.ts
    invariantAssertions.ts
    fixtures/
      twoSum.ts
      longestSubstring.ts
      binarySearch.ts
      treeLevelOrder.ts
      courseSchedule.ts
    producers/
      twoSum.ts
      longestSubstring.ts
      binarySearch.ts
      treeLevelOrder.ts
      courseSchedule.ts
  components/
    tracing/
      TracePlayer.vue
      TraceTimeline.vue
      TraceControls.vue
      TraceVariables.vue
      TraceCodePanel.vue
      TraceInvariant.vue
      TracePrediction.vue
      structures/
        ArrayRenderer.vue
        MapRenderer.vue
        SetRenderer.vue
        StackRenderer.vue
        QueueRenderer.vue
        LinkedListRenderer.vue
        TreeRenderer.vue
        GraphRenderer.vue
        HeapRenderer.vue
        GridRenderer.vue
        RecursionStackRenderer.vue
  composables/
    useTracePlayback.ts
    useTracePrediction.ts
    useReducedMotion.ts
NaN

The existing `IterationVisualizationQuestion.vue` component should initially consume a compatibility adapter or delegate progressively to the new player.

## Execution data model

### Typed values

NaNts
export type TraceValue =
  | { kind: 'null' }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'number'; value: number }
  | { kind: 'string'; value: string }
  | { kind: 'infinity'; sign: 'positive' | 'negative' }
  | { kind: 'node-reference'; nodeId: string }
  | { kind: 'array'; items: TraceValue[] }
  | { kind: 'object'; fields: Record<string, TraceValue> }
  | { kind: 'pending' }

export interface TraceVariable {
  id: string
  name: string
  role: 'input' | 'control' | 'state' | 'output'
  value: TraceValue
}
NaN

Use explicitly tagged infinity and pending values so static trace assets remain JSON-serializable and semantically unambiguous.

### Data structures

NaNts
export type TraceStructure =
  | ArrayTraceStructure
  | MapTraceStructure
  | SetTraceStructure
  | StackTraceStructure
  | QueueTraceStructure
  | LinkedListTraceStructure
  | TreeTraceStructure
  | GraphTraceStructure
  | HeapTraceStructure
  | GridTraceStructure
  | RecursionStackTraceStructure

export interface ArrayTraceStructure {
  kind: 'array'
  id: string
  label: string
  items: Array<{
    id: string
    index: number
    value: TraceValue
  }>
  pointers: Array<{
    id: string
    label: string
    index: number | null
  }>
  regions: Array<{
    id: string
    label: string
    start: number
    end: number
    status: 'active' | 'processed' | 'discarded' | 'result'
  }>
}

export interface MapTraceStructure {
  kind: 'map'
  id: string
  label: string
  entries: Array<{
    id: string
    key: TraceValue
    value: TraceValue
  }>
}

export interface GraphTraceStructure {
  kind: 'graph'
  id: string
  directed: boolean
  nodes: Array<{
    id: string
    label: string
  }>
  edges: Array<{
    id: string
    from: string
    to: string
    weight?: number
    status?: 'candidate' | 'active' | 'processed'
  }>
}
NaN

Define remaining structure variants as their corresponding renderer and producer are introduced.

### Snapshots and atomic events

NaNts
export interface TraceSnapshot {
  variables: Record<string, TraceVariable>
  structures: Record<string, TraceStructure>
  output: TraceValue
}

export type TraceEvent =
  | { type: 'variable-assigned'; variableId: string }
  | { type: 'pointer-moved'; structureId: string; pointerId: string }
  | { type: 'map-entry-added'; structureId: string; entryId: string }
  | { type: 'map-entry-updated'; structureId: string; entryId: string }
  | { type: 'queue-enqueued'; structureId: string; itemId: string }
  | { type: 'queue-dequeued'; structureId: string; itemId: string }
  | { type: 'edge-visited'; structureId: string; edgeId: string }
  | { type: 'node-relinked'; structureId: string; nodeId: string }
  | { type: 'grid-cell-updated'; structureId: string; row: number; column: number }
  | { type: 'output-updated' }
NaN

Extend the event union only when a newly supported algorithm introduces a genuinely new observable operation.

### Code anchors and invariant checkpoints

NaNts
export interface CodeAnchor {
  id: string
  label: string
  locations: Array<{
    language: string
    startLine: number
    endLine: number
  }>
}

export interface InvariantCheckpoint {
  id: string
  status: 'holds' | 'temporarily-relaxed' | 'restored' | 'not-applicable'
  explanation: string
  assertionId?: string
}
NaN

### Transitions and complete traces

NaNts
export interface TraceTransition {
  id: string
  title: string
  explanation: string
  before: TraceSnapshot
  after: TraceSnapshot
  events: TraceEvent[]
  codeAnchorId: string
  invariant: InvariantCheckpoint
  prediction?: TracePrediction
}

export interface ExecutionTrace {
  schemaVersion: 1
  problemId: number
  fixtureId: string
  input: TraceValue
  expectedOutput: TraceValue
  initialState: TraceSnapshot
  transitions: TraceTransition[]
  codeAnchors: CodeAnchor[]
  termination: {
    transitionId: string
    reason: string
  }
  finalOutput: TraceValue
}
NaN

These interfaces describe intended direction. Final implementation may refine names or normalize repeated snapshots for performance while preserving the same semantic guarantees.

## Trace production

### Selected approach

Use reviewed, problem-specific trace producers rather than manually authored presentation frames or automatic instrumentation of arbitrary source code.

| Approach | Benefit | Drawback |
| --- | --- | --- |
| Hand-authored presentation frames | Easy to display. | Difficult to verify, compare, evolve, or reuse. |
| Automatic arbitrary-code instrumentation | Potentially broad coverage. | Requires execution, parsing, language-specific semantics, security controls, and infrastructure outside this milestone. |
| Reviewed problem-specific producers | Deterministic, reviewable, compatible with static deployment, and capable of typed transitions. | Requires deliberate authoring and independent verification. |

Conceptual producer:

NaNts
export function produceTwoSumTrace(input: TwoSumFixtureInput): ExecutionTrace {
  const trace = createTraceBuilder({
    problemId: 1,
    fixtureId: input.fixtureId,
  })

  trace.transition({
    id: 'initialize-seen',
    codeAnchorId: 'initialize-map',
    explanation: 'Create a mapping for previously visited values.',
    mutate(state) {
      state.structures.seen = createMapStructure('seen')
    },
    invariant: 'seen-is-empty-before-processing',
  })

  // Emit independently reviewed algorithm transitions.

  return trace.finish()
}
NaN

Producers must follow the exact canonical strategy displayed in the lesson. Two valid algorithms producing the same output are not interchangeable when their intermediate states, invariants, update ordering, or auxiliary structures differ.

### Fixture authoring requirements

Every fixture must include:

- Stable problem and fixture identifiers.
- A concrete input legal under the original problem contract.
- The reviewed canonical strategy.
- Initial state.
- Ordered semantic transitions.
- Complete before and after snapshots.
- Atomic events for consequential state changes.
- Invariant checkpoints and executable assertions.
- Reviewed code-anchor mappings.
- Explicit termination condition.
- Independently verified final output.
- Independently reviewed milestone snapshots.
- Known misconception or edge-case notes when prediction checkpoints are present.

For expensive algorithms, select legal, pedagogically useful inputs that expose the intended behavior without creating impractically large traces. Collapse groups in the UI if necessary, but do not invent or silently omit required execution transitions.

## Example: Two Sum

Fixture:

NaNts
nums = [2, 7, 11, 15]
target = 9
NaN

| Step | Instruction | Resulting state | Invariant or explanation |
| --- | --- | --- | --- |
| 0 | Read input. | `nums = [2, 7, 11, 15]`; `target = 9`. | No indices have been processed. |
| 1 | Initialize the map. | `seen = {}`. | The map contains only values from processed indices. |
| 2 | Select index 0. | `i = 0`; `nums[i] = 2`. | The current index has not been inserted prematurely. |
| 3 | Compute the complement. | `complement = 7`. | Any valid partner for 2 must equal 7. |
| 4 | Look up the complement. | `seen.has(7) = false`. | No earlier index can pair with the current value. |
| 5 | Record the current value. | `seen = {2: 0}`. | Every processed value maps to an earlier index. |
| 6 | Select index 1. | `i = 1`; `nums[i] = 7`. | The map retains information from index 0. |
| 7 | Compute the complement. | `complement = 2`. | Any valid partner for 7 must equal 2. |
| 8 | Look up the complement. | `seen.has(2) = true`. | The matching value belongs to an earlier index. |
| 9 | Return the matching indices. | `output = [0, 1]`. | The indices are distinct and their values sum to 9. |

The existing overview displays the completed output in its match frame before a subsequent return frame. The exact trace must keep output pending until the actual return transition.

## Structure renderer requirements

### Arrays and strings

Render indexed cells, duplicate values with distinct identities, named pointers, active positions, processed regions, discarded regions, sliding-window boundaries, and result indices.

Representative problems: Two Sum, Binary Search, Longest Substring Without Repeating Characters, Trapping Rain Water, and Sliding Window Maximum.

### Maps and sets

Render exact entries, insertions, updates, successful and unsuccessful lookups, frequency changes, last-seen positions, and deterministic display ordering.

Representative problems: Two Sum, Minimum Window Substring, Top K Frequent Elements, and Max Points on a Line.

### Stacks and queues

Render top, front, and back indicators; push, pop, enqueue, and dequeue operations; BFS level boundaries; and explanations for monotonic candidate removals.

Representative problems: Valid Parentheses, Binary Tree Level Order Traversal, Sliding Window Maximum, and Course Schedule.

### Linked lists

Render stable node identities, next references, head changes, dummy nodes, fast and slow pointers, rewiring, and cycles.

Representative problems: Remove Nth Node from End of List, Reverse Linked List, Linked List Cycle, and Merge K Sorted Lists.

### Trees and graphs

Render nodes, directed and undirected edges, current nodes, visited state, traversal frontiers, parent-child relationships, indegree updates, edge weights, and relaxation decisions.

Representative problems: Binary Tree Inorder Traversal, Binary Tree Maximum Path Sum, Word Ladder, Course Schedule, and Network Delay Time.

### Heaps

Render logical priority, insertion, removal, selected minimum or maximum, tie-breaking behavior, and optionally a tree or compact list view. Validate ordering and selected entries without assuming one arbitrary internal arrangement for equal priorities.

### Dynamic-programming grids

Render active cells, dependencies, completed cells, base cases, row and column labels, recurrence choices, and the final result. When the canonical algorithm uses compressed memory, show compressed state rather than falsely implying a full retained table.

Representative problems: Unique Paths, Edit Distance, Word Break, and Maximum Subarray.

### Recursion and backtracking

Render call-stack frames, depth, candidate selection, rejected choices, base cases, undo operations, and restored state. Group lengthy recursion in the UI without changing or concealing actual execution semantics.

Representative problems: Sudoku Solver, Binary Tree Maximum Path Sum, and Reconstruct Itinerary.

## Playback and interaction

### Required controls

- Previous transition.
- Next transition.
- Play.
- Pause.
- Restart.
- Jump to an already visited transition.
- Playback speed.
- Keyboard navigation.
- Reduced-motion mode.

| Key | Behavior |
| --- | --- |
| Right arrow | Advance to the next transition. |
| Left arrow | Return to the previous transition. |
| Space | Toggle play or pause when the player has focus. |
| Home | Restart the trace. |
| End | Move to the latest revealed transition where navigation policy permits. |

Playback must advance one semantic transition at a time, pause at enabled prediction checkpoints, restore exact earlier snapshots when navigating backward, and preserve correctness at every playback speed.

### Accessible state changes

Highlight only variables, entries, pointers, edges, cells, nodes, or output that changed in the current transition. Use labels, icons, previous/current values, visible pointer names, and screen-reader announcements in addition to color.

Example announcement:

> Step 5. Added value 2 with index 0 to seen. The current index is still 0.

Respect `prefers-reduced-motion` by suppressing motion while retaining all information and change indicators.

## Prediction checkpoints

### Prediction categories

NaNts
export type PredictionType =
  | 'next-variable-value'
  | 'next-pointer-position'
  | 'next-map-entry'
  | 'next-queue-operation'
  | 'next-stack-operation'
  | 'next-active-node'
  | 'next-grid-cell'
  | 'next-output-value'
  | 'next-invariant-status'

export interface TracePrediction {
  id: string
  type: PredictionType
  prompt: string
  choices: Array<{
    id: string
    label: string
    feedback: string
  }>
  correctChoiceId: string
}
NaN

Each prediction asks one focused question about a state element already explained. Incorrect feedback identifies the misconception without revealing the correct answer or displaying the unrevealed next snapshot.

Initial prediction candidates:

- Two Sum: predict the next map entry.
- Binary Search: predict the next boundary.
- Longest Substring Without Repeating Characters: predict the next left boundary.
- Binary Tree Level Order Traversal: predict the queue contents.
- Course Schedule: predict the next course unlocked by an indegree change.

Initial predictions must be optional, deterministic, ungraded, and independent from completion streaks. A later graded `state-prediction` format requires its own schema, progress records, profile analytics, retry behavior, and non-revealing feedback.

## Code synchronization

Associate transitions with stable semantic anchor identifiers rather than raw line offsets:

NaNts
{
  id: 'lookup-complement',
  label: 'Check whether the needed value has already appeared',
  locations: [
    { language: 'Python', startLine: 5, endLine: 5 },
    { language: 'TypeScript', startLine: 4, endLine: 4 },
    { language: 'Java', startLine: 8, endLine: 10 },
  ],
}
NaN

Code-anchor rules:

- Every transition references an existing semantic anchor.
- Every language location points to valid lines in a reviewed implementation.
- A semantic action may span multiple consecutive source lines.
- Language changes must not alter the underlying trace.
- Preserve the existing language preference when a reviewed variant exists.
- If only Python is reviewed, display Python rather than synthesizing an unverified translation.
- Avoid duplicate or ambiguous anchors when the same source pattern appears multiple times.
- If traces later appear in active problem practice, use pseudocode, hide unearned lines, or wait until construction is complete.

## Coverage and discoverability

The roadmap specifies 30 deep representative problems. However, the linked-list Learn lesson currently uses Reverse Linked List (206), which is not included in `DEEP_PROBLEM_IDS`.

| Strategy | Consequence |
| --- | --- |
| Support only the 30 deep problems. | The existing linked-list representative remains an approximate overview. |
| Replace the linked-list representative with a deep problem. | Coverage remains 30 but changes an existing lesson. |
| Support the 30 deep problems plus Reverse Linked List. | All deep problems and existing lesson representatives receive exact traces. |

**Recommended target: 31 exact traces.** Preserve the 30 deep problems and add Reverse Linked List (206). Five exact pilot overviews already exist; migrating the complete target therefore requires those five migrations, 25 additional deep fixtures, and one additional linked-list fixture.

The current Learn page displays one representative per lesson. Add a topic-relevant `More examples for this topic` selector so additional exact deep-problem traces are discoverable without inserting canonical code into the graded practice path.

Represent reviewed quality explicitly:

NaNts
export type TraceQuality = 'exact-reviewed' | 'instructional-overview'
NaN

## Delivery phases

### Phase 1: Define the trace contract

**Outcome:** A typed, serializable, independently reviewable execution model.

Implementation tasks:

- [ ] Define `TraceValue`, `TraceSnapshot`, and `TraceVariable`.
- [ ] Define discriminated structure variants.
- [ ] Define semantic transitions and atomic events.
- [ ] Define code anchors and invariant checkpoint states.
- [ ] Introduce schema versioning and stable entity identities.
- [ ] Define quality classification and fixture metadata.

Acceptance criteria:

- [ ] Traces serialize without ambiguous infinity, null, pending-output, or node-reference values.
- [ ] Duplicate values retain distinct identities.
- [ ] Every transition has before/after snapshots, an explanation, and a code anchor.
- [ ] Trace interpretation does not depend on Vue.

### Phase 2: Build production and validation infrastructure

**Outcome:** Reviewed producers emit independently verifiable traces.

Implementation tasks:

- [ ] Implement reusable trace-builder utilities.
- [ ] Create fixture and producer registries.
- [ ] Add executable invariant assertion registration.
- [ ] Validate snapshot continuity.
- [ ] Validate final outputs independently.
- [ ] Validate code anchors and stable identities.
- [ ] Add fixture-specific milestone snapshot assertions.
- [ ] Integrate validation with existing content checks and the production build.

Acceptance criteria:

- [ ] `transition[n].after` equals `transition[n + 1].before`.
- [ ] Every final output matches an independent expected result.
- [ ] Invariant assertions execute only at valid checkpoints.
- [ ] Output is not produced before its actual output transition.
- [ ] Every trace contains explicit termination.
- [ ] Incorrect fixtures cause deterministic test failures.

### Phase 3: Migrate the five existing pilots

**Outcome:** Existing reviewed overviews become exact, transition-based traces.

Implementation tasks:

- [ ] Migrate Two Sum.
- [ ] Migrate Longest Substring Without Repeating Characters.
- [ ] Migrate Binary Search.
- [ ] Migrate Binary Tree Level Order Traversal.
- [ ] Migrate Course Schedule.
- [ ] Provide an `ExecutionTrace -> VisualizationFrame[]` compatibility adapter during migration.
- [ ] Remove assumptions that every visualization contains exactly six frames.

Acceptance criteria:

- [ ] Existing Learn visualizations remain available.
- [ ] Each trace includes as many transitions as the canonical example requires.
- [ ] Maps, queues, pointers, indegrees, and outputs match independently reviewed states.
- [ ] Existing canonical code remains synchronized.
- [ ] The static build and full existing test suite continue to pass.

### Phase 4: Implement differences and playback

**Outcome:** Learners can navigate exact traces with automatically derived changes.

Implementation tasks:

- [ ] Implement a typed snapshot difference engine.
- [ ] Create playback and reduced-motion composables.
- [ ] Add previous, next, play, pause, restart, and speed controls.
- [ ] Add accessible timeline navigation.
- [ ] Announce state changes to screen readers.

Acceptance criteria:

- [ ] Only changed state is highlighted.
- [ ] Backward navigation restores exact snapshots.
- [ ] Playback can pause, resume, and restart without state corruption.
- [ ] Keyboard-only operation is complete.
- [ ] Reduced-motion preferences are respected.

### Phase 5: Add reusable structure renderers

**Outcome:** Algorithms display the state representations that match their canonical implementations.

Recommended renderer order:

1. Arrays and strings.
2. Maps and sets.
3. Stacks and queues.
4. Linked lists.
5. Trees and graphs.
6. Heaps.
7. Dynamic-programming grids.
8. Recursion stacks.

Acceptance criteria:

- [ ] Renderers consume typed structures rather than algorithm-specific strings.
- [ ] Duplicate values remain distinguishable.
- [ ] Pointer movements, insertions, removals, and updates are independently visible.
- [ ] Graph and linked-list layouts remain usable on small screens.
- [ ] Every structure has an accessible textual equivalent.

### Phase 6: Add prediction checkpoints

**Outcome:** Learners can actively predict the next meaningful state change.

Implementation tasks:

- [ ] Define prediction schemas and constrained choice types.
- [ ] Create checkpoint rendering and deterministic answer evaluation.
- [ ] Add misconception-specific feedback.
- [ ] Pause playback automatically at enabled checkpoints.
- [ ] Provide an optional prediction enable/disable setting.
- [ ] Author reviewed checkpoints for the five pilot problems.

Acceptance criteria:

- [ ] The next snapshot is not revealed before answering.
- [ ] Incorrect feedback does not reveal the correct choice.
- [ ] Correct answers reveal the transition and explanation.
- [ ] Predictions can be disabled.
- [ ] Predictions do not affect scored progress, streaks, or existing mastery calculations.

### Phase 7: Expand reviewed coverage

**Outcome:** All deep representative problems and existing lesson representatives have exact, independently verified traces.

#### Batch A: arrays, maps, strings, and pointers

- [ ] Two Sum (1).
- [ ] Longest Substring Without Repeating Characters (3).
- [ ] Binary Search (704).
- [ ] Trapping Rain Water (42).
- [ ] Best Time to Buy and Sell Stock (121).
- [ ] Find the Index of the First Occurrence in a String (28).
- [ ] Minimum Window Substring (76).
- [ ] Max Points on a Line (149).
- [ ] Kth Largest Element in an Array (215).
- [ ] Top K Frequent Elements (347).

#### Batch B: stacks, queues, and linked structures

- [ ] Valid Parentheses (20).
- [ ] Remove Nth Node from End of List (19).
- [ ] Reverse Linked List (206).
- [ ] Linked List Cycle (141).
- [ ] Merge K Sorted Lists (23).
- [ ] Sliding Window Maximum (239).

#### Batch C: trees and graph traversal

- [ ] Binary Tree Inorder Traversal (94).
- [ ] Binary Tree Level Order Traversal (102).
- [ ] Binary Tree Maximum Path Sum (124).
- [ ] Word Ladder (127).
- [ ] Course Schedule (207).
- [ ] Redundant Connection (684).
- [ ] Network Delay Time (743).
- [ ] Reconstruct Itinerary (332).

#### Batch D: dynamic programming, backtracking, and sweep-line

- [ ] Maximum Subarray (53).
- [ ] Unique Paths (62).
- [ ] Edit Distance (72).
- [ ] Word Break (139).
- [ ] Sudoku Solver (37).
- [ ] The Skyline Problem (218).
- [ ] Meeting Rooms II (253).

Coverage acceptance criteria:

- [ ] All 30 deep problems have exact reviewed traces.
- [ ] Reverse Linked List has an exact trace if it remains the linked-list lesson representative.
- [ ] Every existing Learn lesson has an exact representative.
- [ ] Additional reviewed examples are discoverable from relevant lessons.
- [ ] Every fixture passes independent validation.

### Phase 8: Expand beyond the initial reviewed set

Add additional problems only after the initial fixture set passes correctness, accessibility, performance, and content-review gates. Prioritize highly practiced problems and reuse established structure renderers. Do not generate traces automatically from arbitrary source text or ship unreviewed state transitions.

## Testing strategy

### Unit tests

Cover:

- Trace-value serialization.
- Snapshot equality and immutability.
- Derived state differences.
- Stable duplicate entity identities.
- Pointer movement.
- Map insertion, updates, and deletion.
- Queue and stack ordering.
- Heap-priority semantics.
- Graph node and edge identity.
- Linked-list rewiring.
- Grid-cell dependency changes.
- Invariant checkpoint handling.
- Code-anchor resolution.
- Playback state transitions.
- Prediction answer evaluation.

### Per-fixture correctness tests

NaNts
describe('Two Sum trace', () => {
  it('matches the independently verified final output')
  it('checks for a complement before inserting the current value')
  it('never matches an element with itself')
  it('preserves previously visited indices in seen')
  it('does not produce output before the return transition')
  it('references valid canonical code anchors')
})
NaN

Equivalent tests should verify problem-specific invariants, legal transitions, edge cases, final outputs, and reviewed canonical semantics for every fixture.

### Accessibility tests

Cover keyboard navigation, focus management, screen-reader announcements, reduced-motion handling, non-color indicators, semantic controls, touch usability, and narrow layouts.

### Regression tests

Cover existing Learn pages, deterministic coaching paths, code construction, local progress, static deployment, no-AI operation, content validation, complete unit tests, and production builds.

Replace existing exact-six-frame assertions:

NaNts
expect(visualization.frames).toHaveLength(6)
NaN

With checks for initial state, at least one meaningful transition, explicit termination, correct final output, snapshot continuity, valid anchors, and invariant evidence.

## Performance considerations

- Keep trace assets static and deterministic.
- Lazy-load trace producers or reviewed fixture assets when practical.
- Lazy-load specialized renderers not needed by the active lesson.
- Avoid copying very large snapshots unnecessarily; normalize or structurally share immutable state where justified.
- Preserve correctness when optimizing storage or playback.
- Use small, representative, legal inputs for exponential or deeply recursive algorithms.
- Keep graph, grid, and recursion views usable on low-powered mobile devices.
- Add route-load and bundle-size checks before broad catalog expansion.

## Implementation decisions

1. Tracing initially belongs inside Learn.
2. Producers are deterministic and problem-specific.
3. Typed execution state is authoritative.
4. Presentation frames and state highlights are derived.
5. Semantic transitions may contain atomic events.
6. Invariants are asserted only at declared valid checkpoints.
7. Prediction is optional and ungraded in the initial release.
8. Code synchronization uses semantic anchors.
9. Coverage targets 31 problems when existing lesson representatives remain unchanged.
10. Additional reviewed traces must be discoverable from Learn.
11. Every exact trace requires independent verification and content review.
12. Existing approximate overviews remain explicitly classified as instructional overviews until replaced.

## Recommended first implementation slice

Implement Phases 1 through 3 for **Two Sum** and **Binary Search** before broadening the system.

Together, these problems validate:

- Typed scalar values.
- Arrays and maps.
- Stable element identity.
- Pointer movement.
- Map lookup and insertion ordering.
- Derived state differences.
- Inclusive boundary invariants.
- Discarded candidate regions.
- Early termination.
- Delayed output production.
- Code-anchor synchronization.
- Independent expected-state assertions.
- Compatibility with the existing Learn visualizer.

Once those two traces pass validation and remain usable through the existing lesson UI, migrate the remaining three pilots and introduce specialized renderers, playback, and prediction incrementally.
