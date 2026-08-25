# Pathfinder Intuition-First Question System
## Research-Informed Product and Implementation Specification

**Status:** Proposal  
**Prepared:** August 25, 2026  
**Repository:** `evanbechtol/leetcode-solutions`  
**Primary scope:** `leetcode-coach`  
**Goal:** Add engaging question formats that build durable algorithmic intuition, pattern recognition, transfer, and problem-solving skill rather than rote memorization.

---

# 1. Executive Summary

Pathfinder already has a strong educational premise: learners should **derive** an optimal solution rather than memorize an algorithm label or canonical answer.

The current repository supports or already plans a substantial set of interactions:

- multiple-choice reasoning decisions,
- algorithm phase construction,
- incremental code construction,
- execution visualizations,
- counterexample construction,
- edge-case prediction,
- complexity derivation,
- test-case design,
- invariant repair,
- bug/state diagnosis,
- solution comparison,
- self-explanation,
- and trace prediction.

Because those areas are already covered, the next question system should not simply create more variants of "pick the right algorithm."

The highest-value gap is teaching learners how experts *notice structure before they know the answer*.

This proposal therefore focuses on five capabilities:

1. **Signal extraction** — Which words, constraints, and relationships actually matter?
2. **Elimination** — Which approaches are impossible or unjustified, and why?
3. **State economy** — What information must survive, and what can be safely forgotten?
4. **Contrastive transfer** — Why do similar problems diverge, and why do different-looking problems share a structure?
5. **Counterfactual adaptation** — If one constraint changes, which parts of the old reasoning survive?

The proposed new formats are:

1. **Constraint Signal Annotation**
2. **Complexity Budget Gate**
3. **Operation Contract Builder**
4. **Minimal Sufficient State / Forgetting Test**
5. **Near-Twin Pattern Boundary**
6. **Constraint Mutation Transfer**
7. **Structural Analogy Mapping**
8. **Representation Invention Sandbox**
9. **Faded Derivation**
10. **Monotonicity Probe**
11. **Commit-or-Defer Safety Check**
12. **Worst-Case Adversary**
13. **Algorithm Fingerprint**
14. **Proof Obligation Mapper**

The recommended first implementation wave is:

- Constraint Signal Annotation
- Operation Contract Builder
- Minimal Sufficient State
- Near-Twin Pattern Boundary
- Constraint Mutation Transfer
- Structural Analogy Mapping

These six most directly strengthen the core Pathfinder promise: **teach learners to derive and transfer problem-solving structure instead of memorizing problem-to-pattern mappings.**

---

# 2. Repository Findings

## 2.1 Documents and implementation surfaces reviewed

This proposal was derived from the current repository, especially:

- `leetcode-coach/docs/PRODUCT_ROADMAP.md`
- `leetcode-coach/docs/PUBLIC_PRODUCT_IMPLEMENTATION_PLAN.md`
- `leetcode-coach/docs/CONCRETE_TRACING_IMPLEMENTATION_PLAN.md`
- `leetcode-coach/src/types.ts`
- `leetcode-coach/src/data/coaching/compiler.ts`
- `leetcode-coach/src/components/questions/`

The current architecture should be extended rather than replaced.

---

## 2.2 Existing pedagogical sequence

The roadmap currently defines a strong dependency order:

1. Interpret the problem contract and constraints.
2. Identify the necessary data structure or minimal maintained state.
3. Recognize the appropriate algorithmic pattern from state and structural signals.
4. Define the maintained state and invariant.
5. Follow state changes during execution.
6. Explain why each transition is correct and test edge cases.
7. Construct the algorithm in dependency order.
8. Derive time and auxiliary-space complexity.
9. Transfer the reasoning later.

This sequence should remain the backbone of Pathfinder.

The proposed formats mostly deepen steps **1 through 4 and 9**, where expert intuition is formed.

---

## 2.3 Existing reasoning categories

Current categories are:

- Comprehension
- Pattern
- Data Structure
- Invariant
- Algorithm
- Correctness
- Complexity

These should remain the public-facing categories initially.

A new interaction can produce evidence for several categories rather than forcing every distinct cognitive skill into a new top-level category.

Example:

| New format | Primary existing category | Secondary category |
| --- | --- | --- |
| Constraint Signal Annotation | Comprehension | Pattern |
| Operation Contract Builder | Data Structure | Algorithm |
| Minimal Sufficient State | Data Structure | Invariant |
| Near-Twin Pattern Boundary | Pattern | Correctness |
| Constraint Mutation Transfer | Pattern | Algorithm |
| Worst-Case Adversary | Complexity | Algorithm |

Later, Pathfinder can add finer-grained `reasoningSkillKeys` for adaptive scheduling.

---

# 3. Existing and Already-Planned Question Territory

New formats should not duplicate roadmap work.

## 3.1 Complete formats

### Decision Question

The learner selects one of four answers. Distractors correspond to identifiable misconceptions and receive option-specific feedback.

**Strengths**

- deterministic,
- accessible,
- efficient,
- good for focused misconception checks.

**Limitation**

A learner can sometimes recognize a correct statement without reconstructing the reasoning that produced it.

---

### Build the Algorithm

The learner selects algorithm phases and places them in dependency order.

**Strengths**

- teaches causal ordering,
- exposes dependencies,
- bridges reasoning to implementation.

**Limitation**

Most discovery decisions have already occurred before the learner starts assembling phases.

---

### Construct the Code

The learner incrementally chooses code lines or expressions while earned code remains visible.

**Strengths**

- maps reasoning to implementation,
- reveals update-order bugs,
- maintains concrete state effects.

**Limitation**

It is deliberately downstream of contract, state, pattern, invariant, and correctness reasoning.

---

### Iteration Visualization

The learner observes execution frames containing variables, structures, code anchors, and invariants.

**Strengths**

- makes abstract state concrete,
- supports tracing,
- can expose hidden pointer/frontier behavior.

**Limitation**

The current surface is primarily observational; prediction is planned separately.

---

## 3.2 Already-planned formats

The roadmap already includes:

- Counterexample construction
- Edge-case prediction
- Complexity derivation
- Test-case design
- Invariant repair
- Bug hunt / state diagnosis
- Solution comparison
- Explain in your own words
- Trace state prediction

Those are important and should still be built. The formats in this document target different reasoning gaps.

---

# 4. Research-Informed Teaching Model

Pathfinder should borrow from strong learning-science principles while remaining a software product rather than imitating a classroom.

The important point is not that a technique comes from a prestigious institution. The point is that the technique has a defensible learning mechanism that maps cleanly to algorithmic reasoning.

## 4.1 Retrieval practice: make learners reconstruct knowledge

Research on retrieval-based learning, including work by Jeffrey Karpicke and colleagues at Purdue, shows that actively retrieving learned material can produce stronger long-term learning than repeatedly restudying it.

### Pathfinder implication

A learner should not repeatedly see:

> Which pattern solves this problem?

Instead, later sessions should make them reconstruct increasingly earlier parts of the chain:

> Which constraint matters?

then:

> What operation must be cheap?

then:

> What state is sufficient?

then:

> Which family of algorithms follows?

### Product rule

**Repeat the concept, not the wording.**

A scheduled review should preferably use:

- a different problem,
- a different surface story,
- a different interaction format,
- or a counterfactual mutation.

This is especially important for the Daily Mastery Session.

---

## 4.2 Spacing and interleaving: build discrimination, not familiarity

Robert and Elizabeth Bjork's desirable-difficulties work emphasizes spacing, interleaving, testing, and variation as techniques that can improve retention and transfer when difficulty is appropriate for the learner.

### Pathfinder implication

Do not teach:

```text
Sliding Window
Sliding Window
Sliding Window
Sliding Window
```

as the only practice sequence.

Use contrasts such as:

```text
Sliding Window
Prefix Sum
Sliding Window
Two Pointers
Sliding Window transfer problem
```

The learner must repeatedly decide **which pattern fits**, not merely execute a pattern they know has been preselected.

### Critical safeguard

Difficulty is only desirable when the learner has enough prerequisite knowledge to engage productively.

The app must not confuse:

- productive struggle,
- random guessing,
- and lack of prerequisite knowledge.

If a user repeatedly fails at the signal/state level, the system should reduce the reasoning distance rather than simply repeating harder questions.

---

## 4.3 Contrasting cases: help learners see deep structure

Daniel Schwartz and John Bransford's work at Stanford used contrasting cases to help learners notice important distinctions and prepare them to learn from later instruction.

### Pathfinder implication

Near-transfer and far-transfer questions should deliberately contrast:

- sorted vs unsorted,
- contiguous vs subsequence,
- positive-only vs arbitrary integers,
- unweighted vs weighted graphs,
- fixed vs variable windows,
- return-any vs return-all,
- online/streaming vs fully available input.

The question should not merely ask which algorithm works. It should ask:

> **Which changed property makes the previous reasoning valid or invalid?**

This directly trains pattern boundaries.

---

## 4.4 Productive Failure: generation before consolidation

Manu Kapur's Productive Failure research at ETH Zurich describes a learning design in which learners first generate and explore representations or solution methods for a novel problem, followed by instruction that consolidates those attempts into canonical concepts.

A 2021 meta-analysis reported an overall advantage for problem-solving-before-instruction designs, with stronger effects when Productive Failure principles were implemented with high fidelity.

### Pathfinder implication

For selected concepts, Pathfinder should sometimes ask the learner to **invent a representation or state model before naming the canonical technique**.

Examples:

- Choose what columns you would track while manually solving Two Sum.
- Design a compact state summary for a grid path recurrence.
- Decide what must be recorded about a BFS frontier.

Then the app should explicitly consolidate:

> Your representation captured X and Y. The canonical hash-map state keeps the same information while supporting lookup in expected O(1) time.

### Critical safeguard

Productive Failure is not:

> Give a beginner a Hard problem and let them fail.

It requires:

1. prerequisite knowledge,
2. constrained generation,
3. exploration,
4. comparison,
5. consolidation into canonical knowledge.

---

## 4.5 Self-explanation: ask why a step is justified

Harvard's ABLConnect summary of self-explanation research and Carnegie Mellon learning resources both emphasize that explaining relationships and worked-example steps can improve conceptual learning.

### Pathfinder implication

Do not only ask:

> What happens next?

Also ask:

> Why is that update safe?

or:

> Which fact from the contract justifies discarding these candidates?

Self-explanation does not need to begin as unrestricted free text.

A deterministic first version can ask learners to assemble a reason from reviewed clauses.

Example:

```text
We may discard [the left half]
because [every value there is <= nums[mid]]
and [nums[mid] is already too small].
```

---

## 4.6 Worked examples and guidance fading: decrease support over mastery

Carnegie Mellon research and Cognitive Tutor work have explored worked examples, self-explanation, and gradual fading of worked-out steps.

### Pathfinder implication

Every major question family should support a progression such as:

**Level 1 — Observe**

- canonical reasoning visible,
- learner identifies why one step is valid.

**Level 2 — Complete**

- one reasoning step is missing,
- learner fills it.

**Level 3 — Construct**

- learner builds the reasoning from a constrained bank.

**Level 4 — Retrieve**

- scaffolding is removed.

**Level 5 — Transfer**

- same concept appears in a different problem or representation.

This progression should be controlled by proficiency evidence, not by problem difficulty labels alone.

---

## 4.7 Prediction → observation → explanation

Yale's active-learning guidance highlights prediction before a demonstration as a way to expose misconceptions and encourage learners to revise their mental model.

### Pathfinder implication

The planned tracing system should not end at:

> Predict the next pointer.

After revealing the state, optionally ask:

> What assumption made your prediction differ from the actual update?

The important learning event is not merely being wrong; it is **reconciling the mental model**.

---

## 4.8 Active learning and knowledge organization

Carnegie Mellon emphasizes that learning depends on what students actively do and that the way knowledge is organized affects later retrieval and application.

### Pathfinder implication

The app should help users organize algorithm knowledge by **decision structure**, not only topic labels.

A useful mental graph is:

```text
constraint
  → required operation
  → maintained state
  → valid transition
  → invariant
  → pattern
  → complexity
```

Many of the new formats explicitly train an edge in this graph.

---

# 5. Cross-Format Pedagogical Rules

## 5.1 Derive before name

Prefer:

> Which property lets you permanently eliminate one side?

before:

> Why is binary search valid?

Formal vocabulary should be revealed after the learner demonstrates the intuition.

---

## 5.2 One new inference at a time

A rich interaction may have multiple checkpoints, but each checkpoint should ask for one conceptual leap.

Do not simultaneously require a learner to:

- infer a state,
- identify a pattern,
- calculate complexity,
- and repair code.

---

## 5.3 Deterministic grading first

Initial implementations should rely on:

- exact mappings,
- reviewed equivalence sets,
- tuple validation,
- set comparison,
- constrained builders,
- canonical simulators,
- authored trace fixtures.

Optional AI can later enrich explanations, but it should not be required for correctness.

---

## 5.4 Diagnose the failed assumption

Weak feedback:

> Incorrect.

Better feedback:

> This choice assumes an index that leaves the active window may become relevant again. Once `left` passes it, that index can no longer belong to any future window ending at or after the current `right`.

Wrong-answer feedback should identify the mistaken assumption without immediately revealing the correct answer.

---

## 5.5 Separate correctness from efficiency

A learner may propose state that is:

- correct and minimal,
- correct but redundant,
- insufficient,
- or invalid.

The UI should distinguish those cases.

Calling a correct-but-wasteful idea "wrong" can teach the wrong lesson.

---

## 5.6 Use confidence as diagnosis, not scoring

For high-value questions, optionally ask:

> How confident are you?

High-confidence wrong answers are strong misconception signals.

Low-confidence correct answers may need retrieval practice rather than remedial instruction.

Confidence must not change correctness or punish the learner.

---

## 5.7 Make hints reduce reasoning distance gradually

Recommended hint ladder:

1. **Cue** — point to the relevant input property.
2. **Relationship** — name the kind of relationship to inspect.
3. **Partial structure** — provide one side of the reasoning.
4. **Worked first step** — demonstrate one instance.
5. **Canonical consolidation** — only after completion or explicit reveal.

---

# 6. Architecture Recommendation Before Adding Many Formats

## 6.1 Current scaling risk

The current `QuestionFormat` is:

```ts
export type QuestionFormat =
  | 'multiple-choice'
  | 'algorithm-builder'
  | 'iteration-visualization'
  | 'code-construction'
```

`QuizQuestion` contains optional format-specific fields such as:

- `builder?`
- `construction?`
- `visualization?`

That works with four formats. It becomes brittle with 10–20.

---

## 6.2 Move to a discriminated union

Recommended direction:

```ts
interface BaseQuestion {
  id: string
  type: QuestionType | LegacyQuestionType
  stage?: QuestionStage
  prompt: string
  explanation: string
  hintLevels?: HintLevel[]
  prerequisites?: QuestionStage[]
  teachingContext?: TeachingContext
  formalTerm?: FormalTerm
  reasoningSkillKeys?: ReasoningSkillKey[]
  contentVersion: string
}

interface MultipleChoiceQuestion extends BaseQuestion {
  format: 'multiple-choice'
  config: MultipleChoiceConfig
}

interface ConstraintSignalQuestion extends BaseQuestion {
  format: 'constraint-signals'
  config: ConstraintSignalConfig
}

interface StateSufficiencyQuestion extends BaseQuestion {
  format: 'state-sufficiency'
  config: StateSufficiencyConfig
}

type QuizQuestion =
  | MultipleChoiceQuestion
  | AlgorithmBuilderQuestion
  | IterationVisualizationQuestion
  | CodeConstructionQuestion
  | ConstraintSignalQuestion
  | StateSufficiencyQuestion
  // ...
```

Benefits:

- format and config cannot disagree,
- validators can switch exhaustively,
- components receive the correct config type,
- schema migration becomes safer,
- content-authoring defects become compile-time errors.

---

## 6.3 Use a question-component registry

Avoid a giant template conditional.

```ts
const QUESTION_COMPONENTS: Record<QuestionFormat, Component> = {
  'multiple-choice': MultipleChoiceQuestion,
  'algorithm-builder': AlgorithmBuilderQuestion,
  'iteration-visualization': IterationVisualizationQuestion,
  'code-construction': CodeConstructionQuestion,
  'constraint-signals': ConstraintSignalQuestion,
  'complexity-budget': ComplexityBudgetQuestion,
  'operation-contract': OperationContractQuestion,
  'state-sufficiency': StateSufficiencyQuestion,
  'near-twin': NearTwinQuestion,
  'constraint-mutation': ConstraintMutationQuestion,
  'structural-analogy': StructuralAnalogyQuestion,
  'representation-invention': RepresentationInventionQuestion,
  'faded-derivation': FadedDerivationQuestion,
  'monotonicity-probe': MonotonicityProbeQuestion,
  'commit-or-defer': CommitOrDeferQuestion,
  'worst-case-adversary': WorstCaseAdversaryQuestion,
  'algorithm-fingerprint': AlgorithmFingerprintQuestion,
  'proof-obligation': ProofObligationQuestion,
}
```

---

## 6.4 Common result contract

Every component should produce compatible evidence.

```ts
interface QuestionInteractionResult {
  complete: boolean
  correct: boolean
  firstAttempt: boolean
  hintLevelReached: 0 | 1 | 2 | 3
  diagnosticKeys: string[]
  evidence: Record<string, unknown>
}
```

The `evidence` payload is format-specific and supports later Error Atlas or proficiency analysis.

---

## 6.5 Add fine-grained reasoning skills

Recommended initial keys:

```ts
type ReasoningSkillKey =
  | 'constraint-signal'
  | 'runtime-feasibility'
  | 'operation-requirement'
  | 'state-sufficiency'
  | 'safe-discard'
  | 'pattern-boundary'
  | 'counterfactual-transfer'
  | 'structural-analogy'
  | 'representation-generation'
  | 'derivation-completion'
  | 'monotonicity'
  | 'greedy-safety'
  | 'worst-case-construction'
  | 'behavioral-pattern-recognition'
  | 'proof-structure'
```

These are better adaptive-learning signals than only recording that a question was "Pattern."

---

# 7. New Format 1 — Constraint Signal Annotation

## Purpose

Teach the learner to notice which parts of the problem contract meaningfully constrain the algorithm.

### Examples of high-value signals

- sorted input,
- contiguous region,
- streaming input,
- bounded alphabet,
- nonnegative weights,
- distinct elements,
- mutation forbidden,
- constant-space requirement,
- `n` large enough to reject quadratic work,
- "all answers" vs "any answer."

---

## Teaching-science basis

This format activates prior knowledge and trains learners to organize knowledge around meaningful relationships.

It also supports contrastive learning because the same surface noun can appear with different decisive constraints.

---

## Interaction

Example:

> Given an **array sorted in non-decreasing order**, return the indices of two values that sum to target. Use **constant extra space**.

Selectable signals:

- `sorted in non-decreasing order`
- `return the indices`
- `constant extra space`

Consequence cards:

- A comparison can sometimes rule out an entire side.
- We need to preserve positions for the returned result.
- O(n) auxiliary lookup storage conflicts with the required memory bound.
- We should use dynamic programming.
- We must inspect every pair.

The learner maps signals to consequences.

Do **not** initially ask for "two pointers."

After success:

> The ordering makes directional elimination safe. Combined with the constant-space constraint, this strongly motivates an inward-moving two-pointer strategy.

---

## UI design

### Desktop

Two-pane layout:

- left: statement + signal chips,
- right: consequence cards,
- mapping rows beneath.

### Mobile

Avoid text-selection precision.

Render authored phrase chips:

```text
[ sorted in non-decreasing order ]
[ return the indices ]
[ constant extra space ]
```

Tap a signal, then tap its consequence.

### Accessibility

Each mapping is keyboard-operable and announced as:

> "Signal: sorted in non-decreasing order. Mapped to: comparison can eliminate one side."

Color is supplemental only.

---

## Grading

Each signal defines:

- whether it is decisive,
- valid consequence IDs,
- whether multiple consequences are allowed.

Grade:

- required mappings,
- false mappings,
- identification of incidental vs decisive facts.

---

## Schema

```ts
interface ConstraintSignalConfig {
  sourceText: string
  signals: Array<{
    id: string
    label: string
    importance: 'decisive' | 'supporting' | 'incidental'
    consequenceIds: string[]
  }>
  consequences: Array<{
    id: string
    text: string
    feedback: string
  }>
}
```

---

## Difficulty progression

**Observe:** important phrases are already highlighted.

**Complete:** select the consequence of one highlighted phrase.

**Construct:** identify both signal and consequence.

**Transfer:** same pattern appears with a new surface story.

**Contrast:** one decisive constraint is removed; learner predicts which implication disappears.

---

## Analytics

Track:

- decisive-signal recall,
- false implication types,
- signal → consequence accuracy,
- confidence,
- hint use.

Useful diagnosis:

> Learner recognizes "sorted" as important but does not understand what ordering allows the algorithm to eliminate.

---

# 8. New Format 2 — Complexity Budget Gate

## Purpose

Teach learners to use input bounds to reject implausible algorithm families before implementation.

Desired habit:

> "What amount of work can this input size plausibly tolerate?"

---

## Teaching-science basis

This uses active generation and elimination rather than post-hoc Big-O recognition.

It also creates an authentic expert heuristic: constraint analysis narrows the search space.

---

## Interaction

Example:

> `n <= 200,000`

Approach cards:

- compare every pair,
- sort once and scan,
- one linear pass with maintained state,
- enumerate every subset.

Buckets:

- **Plausible**
- **Serious concern**
- **Effectively ruled out**

After classification, reveal the growth class and explain why.

---

## Important authoring rule

Do not teach fake universal thresholds such as:

> "`10^5` always means O(n log n)."

Each fixture should state an appropriate context and teach comparative growth, not pretend Big-O maps to exact wall-clock time.

---

## UI design

Three buckets with accessible tap-to-place controls.

On mobile:

1. tap candidate,
2. choose bucket from bottom sheet.

Optional advanced mode asks the learner to infer complexity before classification.

---

## Grading

Per-candidate classification.

Partial evidence:

- exponential rejected,
- quadratic rejected,
- plausible near-linear candidates retained.

Final Big-O recognition should not override incorrect feasibility reasoning.

---

## Schema

```ts
interface ComplexityBudgetConfig {
  bounds: string[]
  context: string
  candidates: Array<{
    id: string
    description: string
    complexity: string
    classification: 'plausible' | 'warning' | 'ruled-out'
    feedback: string
  }>
}
```

---

## Best placement

After problem-contract comprehension and before data-structure/pattern selection.

---

# 9. New Format 3 — Operation Contract Builder

## Purpose

Derive a data structure from the operations the algorithm needs.

Instead of:

> Which data structure should you use?

ask:

> What must the solution be able to do cheaply?

---

## Example: Two Sum

Required operations:

- test whether a needed value has appeared,
- retrieve the index associated with that value,
- record the current value and index.

Distractors:

- get global minimum,
- pop most recent item,
- maintain full sorted order,
- dequeue oldest item.

After establishing the operation contract, the learner selects the structure that satisfies it.

---

## Teaching-science basis

This promotes relational knowledge and self-explanation.

The learner is not memorizing:

```text
Two Sum → Hash Map
```

They are building:

```text
required operation
  → performance need
  → data-structure capability
```

That representation transfers to unfamiliar problems.

---

## Interaction flow

### Stage 1 — What operations are required?

Select operation chips.

### Stage 2 — Which structure satisfies them?

Choose or compare structures.

### Stage 3 — Why not the closest alternative?

Optional reinforcing checkpoint.

Example:

> Why not a heap?

> Because priority access does not provide arbitrary membership lookup by complementary value.

---

## UI design

Panel 1:

> The algorithm needs to...

Panel 2 appears after Stage 1:

> Therefore the state should support...

Panel 3:

> Which structure matches this contract?

Do not reveal data-structure names before Stage 1 in introductory mode.

---

## Grading

Grade Stage 1 separately from Stage 2.

Do not award full mastery evidence when the learner guesses the correct structure but selects the wrong operations.

---

## Schema

```ts
interface OperationContractConfig {
  operationOptions: Array<{
    id: string
    label: string
    required: boolean
    feedback: string
  }>
  structures: Array<{
    id: string
    label: string
    satisfiesOperationIds: string[]
    tradeoff: string
  }>
  correctStructureIds: string[]
}
```

---

## Analytics

Two evidence dimensions:

- operation inference,
- structure selection.

This lets Pathfinder distinguish recognition from derivation.

---

# 10. New Format 4 — Minimal Sufficient State / Forgetting Test

## Purpose

Train the expert question:

> "What information from the past can still affect the future?"

This is one of the most transferable DSA intuitions.

---

## Concepts trained

- minimal maintained state,
- safe discard,
- sliding-window state,
- prefix summaries,
- DP compression,
- BFS frontier state,
- monotonic candidate elimination,
- visited vs active state.

---

## Interaction

Show a concrete checkpoint.

Example: Longest Substring Without Repeating Characters.

```text
s = "abca..."
left = 1
right = 3
current window = "bca"
```

Candidate information:

- every character from index 0 through right,
- last relevant position of each character,
- every substring previously inspected,
- current best length,
- current left boundary.

Ask:

1. What must remain available to make the next correct decision?
2. What can be discarded permanently?

Advanced variant:

> You have a conceptual budget of three state items.

---

## Teaching-science basis

The format forces self-explanation around information sufficiency.

It also supports worked-example fading:

- initially show canonical state and ask why each item exists,
- later ask learner to choose the state,
- finally ask them to construct it under a budget.

---

## UI design

Three zones:

- Available history
- Keep
- Safe to forget

Optional indicator:

> 2 / 3 state slots used

The "slots" are conceptual, not literal machine words.

---

## Grading

Each candidate can be:

- required,
- optional but redundant,
- discardable.

Score should distinguish:

1. insufficient,
2. sufficient but redundant,
3. minimal and sufficient.

---

## Schema

```ts
interface StateSufficiencyConfig {
  checkpoint: {
    input: string
    stateDescription: string
  }
  items: Array<{
    id: string
    label: string
    classification:
      | 'required'
      | 'optional-redundant'
      | 'discardable'
    feedback: string
  }>
  minimalRequiredSets: string[][]
  maxItems?: number
}
```

---

## Example feedback

If a learner retains all prior substrings:

> This would preserve enough information, but it stores history the next decision never needs. Once a prefix is permanently outside the active window, future windows do not need to reconstruct it.

That teaches optimization without mislabeling a correct-but-wasteful representation as logically incorrect.

---

# 11. New Format 5 — Near-Twin Pattern Boundary

## Purpose

Teach where a familiar pattern **stops being justified**.

This is contrastive learning applied directly to LeetCode pattern recognition.

---

## Example

### Problem A

> Given a **sorted** array, determine whether two values sum to target.

### Problem B

> Given an **unsorted** array, determine whether two values sum to target.

Questions:

1. Can the same directional elimination rule be used in both?
2. Which changed property is decisive?
3. What capability disappears when ordering is removed?

Do not initially ask for the final algorithm.

---

## Teaching-science basis

This directly applies the contrasting-cases model: the learner notices the critical dimension by comparing cases that are deliberately similar except for one meaningful property.

---

## Difference from Solution Comparison

Solution Comparison:

> Two valid approaches exist for one contract. Which tradeoff is preferable?

Near-Twin Pattern Boundary:

> One contract property changed. Does the previous reasoning remain valid?

---

## UI design

Split diff view.

```diff
- sorted array
+ unsorted array
```

Possible relationship answers:

- Same reasoning remains valid.
- Core idea survives but one component must change.
- The original elimination rule is no longer justified.

Then require the decisive reason.

---

## Grading

Use linked tuples:

```text
relationship
+ changed property
+ consequence
```

Full credit requires all three.

---

## Schema

```ts
interface NearTwinConfig {
  baseProblem: MiniProblem
  variantProblem: MiniProblem
  changedFactIds: string[]
  relationshipOptions: Array<{
    id: string
    label: string
  }>
  correctRelationshipId: string
  decisiveReasonIds: string[]
}
```

---

## Strong candidate pairs

- sorted Two Sum vs unsorted Two Sum,
- substring vs subsequence,
- BFS on unweighted shortest path vs weighted shortest path,
- fixed-size window vs variable-size window,
- positive-only subarray sums vs arbitrary integers,
- graph tree vs graph with cycles,
- "exists?" vs "return all solutions."

---

# 12. New Format 6 — Constraint Mutation Transfer

## Purpose

Test whether the learner can adapt a known solution when one contract condition changes.

This is among the strongest anti-memorization formats in this proposal.

---

## Example A — Streaming mutation

Original:

> The entire Two Sum array is available.

Mutation:

> Values now arrive one at a time. Report the first valid pair when it becomes known.

Ask the learner to classify:

- maintained state — unchanged / modified / invalidated,
- iteration model — unchanged / modified / invalidated,
- output timing — unchanged / modified / new requirement.

---

## Example B — Output mutation

Original:

> Determine whether Course Schedule is possible.

Mutation:

> Return one valid course ordering.

The topological reasoning can survive, but output state must now record the produced order.

---

## Teaching-science basis

This combines retrieval with transfer.

The learner must retrieve the old reasoning and then adapt it, which is much harder to fake through memorized pattern names.

---

## UI design

Explicit contract diff:

```diff
- return whether a valid ordering exists
+ return one valid ordering
```

Then "Keep / Change / Add / Invalidated" rows for:

- state,
- invariant,
- traversal,
- output,
- complexity target.

---

## Grading

Each authored mutation defines an impact matrix.

```ts
interface MutationImpact {
  aspectId: string
  impact: 'unchanged' | 'modified' | 'new' | 'invalidated'
  explanation: string
}
```

---

## Schema

```ts
interface ConstraintMutationConfig {
  original: MiniProblem
  mutation: {
    label: string
    removedText?: string[]
    addedText?: string[]
  }
  aspects: Array<{
    id: string
    label: string
    correctImpact:
      | 'unchanged'
      | 'modified'
      | 'new'
      | 'invalidated'
    feedback: string
  }>
}
```

---

## Progression

**Beginner:** one changed property, three aspects.

**Reinforcing:** one mutation, five aspects.

**Transfer:** unfamiliar story, same structural change.

**Challenge:** learner must identify which mutated constraint invalidated the old strategy.

---

# 13. New Format 7 — Structural Analogy Mapping

## Purpose

Teach far transfer by mapping two superficially different problems onto the same structural skeleton.

Near-Twin asks:

> These look similar. Why are they different?

Structural Analogy asks:

> These look different. Why are they the same?

---

## Example

Problem A:

> Longest substring without repeating characters.

Problem B:

> Longest contiguous sequence satisfying a bounded-frequency constraint.

Surface details differ.

Learner maps:

| Abstract role | Problem A | Problem B |
| --- | --- | --- |
| active candidate | substring | contiguous sequence |
| violation signal | duplicate character | frequency exceeds limit |
| expand action | move right | move right |
| repair action | move left until unique | move left until valid |
| invariant | active window has no duplicates | active window respects frequency bound |

Only after mapping should Pathfinder reveal:

> Both are variable-size sliding-window problems.

---

## Teaching-science basis

This supports meaningful knowledge organization and transfer by emphasizing relational structure over surface vocabulary.

---

## Interaction

Display two mini-problems without topic tags.

Provide abstract role cards:

- candidate region,
- maintained summary,
- violation,
- repair,
- progress measure,
- stopping condition.

Learner matches the corresponding elements in each problem.

---

## UI design

A three-column mapping table works well:

```text
Abstract role | Problem A | Problem B
```

Mobile:

one role at a time with two selectors.

---

## Grading

Each role has an approved mapping pair.

Require a minimum number of diagnostic roles before awarding structural-transfer mastery.

---

## Schema

```ts
interface StructuralAnalogyConfig {
  problemA: MiniProblem
  problemB: MiniProblem
  roles: Array<{
    id: string
    label: string
    problemAChoiceId: string
    problemBChoiceId: string
    explanation: string
  }>
  choicesA: AnalogyChoice[]
  choicesB: AnalogyChoice[]
  sharedFormalTerm?: FormalTerm
}
```

---

## Best scheduling use

This should often appear **on a later day** after the learner has completed one of the two problem families.

That turns the question into retrieval + transfer instead of immediate imitation.

---

# 14. New Format 8 — Representation Invention Sandbox

## Purpose

Let the learner invent a useful representation before Pathfinder gives them the canonical one.

This is the clearest Productive Failure-inspired interaction.

---

## Example: Two Sum

Prompt:

> Solve the first three steps manually. You may create a small scratch table. Which columns would be useful to keep between steps?

Available column tiles:

- current index,
- current value,
- target,
- needed partner,
- all pairs examined,
- values already seen,
- best prefix sum,
- previous queue front.

The learner creates a table such as:

```text
i | value | needed | seen
```

Pathfinder then runs the example with the selected representation.

If the representation is insufficient, the learner encounters a concrete question it cannot answer:

> At `i = 2`, can your saved state tell whether the needed partner has appeared?

Then consolidation:

> The canonical representation stores previously seen values keyed to their indices. Your `seen` column was pointing toward the same information requirement.

---

## Teaching-science basis

The learner generates a representation first, then receives canonical consolidation.

The app must preserve the sequence:

1. generate,
2. test,
3. compare,
4. consolidate.

---

## UI design

A small "scratch model" builder:

- add/remove state columns,
- select a value source,
- simulate one or two steps.

Do not make this a full spreadsheet.

The goal is representational reasoning, not UI complexity.

---

## Grading

Initial version should not require the one canonical representation.

Classify submitted representations as:

- sufficient and efficient,
- sufficient but redundant,
- insufficient.

Use a reviewed evaluator based on whether required queries can be answered from the representation.

---

## Schema

```ts
interface RepresentationInventionConfig {
  stateTiles: Array<{
    id: string
    label: string
    capabilities: string[]
    costClass: 'constant' | 'linear' | 'other'
  }>
  requiredCapabilities: string[]
  approvedMinimalSets: string[][]
  maxTiles?: number
  simulation: RepresentationSimulation
  consolidation: string
}
```

---

## Important constraint

Do not use this on a concept where the learner lacks all prerequisites.

The productive task should be just beyond current knowledge, not arbitrary.

---

# 15. New Format 9 — Faded Derivation

## Purpose

Transition learners from reading a worked reasoning chain to generating the reasoning independently.

---

## Example

Fully worked first exposure:

```text
1. The array is sorted.
2. If nums[mid] < target, every index <= mid can be discarded.
3. Therefore set left = mid + 1.
```

Later version:

```text
1. The array is sorted.
2. [ missing reason ]
3. Therefore set left = mid + 1.
```

Learner fills:

> Every value at or before `mid` is no larger than `nums[mid]`, so none can equal the larger target.

Later still:

```text
1. [ missing observation ]
2. [ missing elimination rule ]
3. Therefore set left = mid + 1.
```

Eventually the learner reconstructs the entire derivation.

---

## Teaching-science basis

This directly applies worked-example completion and guidance fading.

---

## Difference from Algorithm Builder

Algorithm Builder arranges implementation phases.

Faded Derivation reconstructs the **reasoning justification** that connects observations to decisions.

---

## UI design

A vertical reasoning chain:

```text
Observation
    ↓
Implication
    ↓
Safe action
    ↓
Preserved invariant
```

Missing nodes appear as selectable or fillable blanks.

Connections remain visible so the learner understands the causal structure.

---

## Grading

Each node can accept:

- one canonical clause,
- authored equivalent clauses.

A submission is only fully correct if the reasoning chain is logically consistent.

---

## Schema

```ts
interface FadedDerivationConfig {
  nodes: Array<{
    id: string
    role:
      | 'observation'
      | 'implication'
      | 'action'
      | 'invariant'
      | 'conclusion'
    content?: string
    choiceIds?: string[]
    correctChoiceIds?: string[]
  }>
  choices: Array<{
    id: string
    text: string
    feedback: string
  }>
  fadeLevel: number
}
```

---

## Adaptive use

A user's proficiency controls which nodes are faded.

This gives Pathfinder a powerful single interaction that can scale from novice to advanced.

---

# 16. New Format 10 — Monotonicity Probe

## Purpose

Build intuition for binary search over an answer space by making the learner discover monotonic feasibility.

---

## Example: Koko Eating Bananas

Show sampled speeds:

| Speed | Finish within H hours? |
| --- | --- |
| 3 | No |
| 4 | No |
| 5 | Yes |
| 6 | Yes |

Ask:

1. If speed 5 works, what can be concluded about larger speeds?
2. Can feasibility switch back to "No" after it becomes "Yes"?
3. Are we searching for any feasible value or the smallest feasible value?

Only then reveal:

> This is a monotonic predicate, so binary search can locate the threshold.

---

## UI design

Horizontal candidate scale with Yes/No labels.

After success, show the discovered threshold boundary.

---

## Grading

Grade separately:

- direction,
- threshold type,
- bounds.

---

## Schema

```ts
interface MonotonicityProbeConfig {
  domainLabel: string
  samples: Array<{
    candidate: number
    feasible: boolean
  }>
  direction: 'false-then-true' | 'true-then-false'
  target:
    | 'first-true'
    | 'last-true'
    | 'first-false'
    | 'last-false'
  bounds: {
    low: number
    high: number
  }
}
```

---

# 17. New Format 11 — Commit-or-Defer Safety Check

## Purpose

Teach when a local decision is safe to make permanently.

This is core intuition for:

- greedy algorithms,
- pruning,
- monotonic stacks,
- candidate dominance,
- some shortest-path decisions.

---

## Example: interval scheduling

Candidates:

```text
A = [1, 4]
B = [2, 3]
```

Prompt:

> These intervals overlap. If the goal is to leave as much room as possible for future non-overlapping intervals, do we have enough information to permanently discard one?

Decision:

- Commit
- Defer

Then choose the justification.

Correct reasoning:

> Keeping the interval that ends earlier cannot leave less room for future intervals.

---

## Teaching-science basis

This asks for self-explanation of a local proof obligation, not just the greedy rule.

---

## UI design

A decision gate:

```text
Current state
    ↓
[ COMMIT ] [ DEFER ]
    ↓
Why?
```

---

## Grading

Linked tuple:

```text
decision + justification
```

Do not award full credit for the correct action with an incorrect safety argument.

---

## Schema

```ts
interface CommitOrDeferConfig {
  scenario: string
  correctDecision: 'commit' | 'defer'
  justificationOptions: Array<{
    id: string
    label: string
    correct: boolean
    feedback: string
  }>
}
```

---

# 18. New Format 12 — Worst-Case Adversary

## Purpose

Teach complexity by constructing an input that makes a correct algorithm perform the most or near-most work.

---

## Difference from Counterexample Construction

Counterexample:

> Make an incorrect algorithm fail logically.

Worst-Case Adversary:

> Make a correct algorithm work as hard as possible.

---

## Interaction

Give:

- a small fixed input size,
- an input editor,
- an operation metric,
- a target.

Example:

> Build a length-6 input that causes at least 10 pointer moves.

Or:

> Build a histogram that causes this monotonic stack to pop as many stored bars as possible.

The learner runs the canonical simulator and sees the count.

---

## Teaching-science basis

Generation makes complexity concrete. The learner experiences why an apparently nested process may still be amortized linear, or why an input produces worst-case recursion depth.

---

## UI design

- constrained input builder,
- Run button,
- operation counter,
- optional trace after submission.

Do not require mathematically global maximum unless the fixture space has been independently verified.

---

## Grading

Validate:

1. legal input,
2. canonical algorithm still returns correct output,
3. metric threshold reached.

Optional bonus:

- exact verified maximum,
- smaller adversarial input,
- correct explanation.

---

## Schema

```ts
interface WorstCaseAdversaryConfig {
  inputShape: InputBuilderConfig
  metric: {
    id: string
    label: string
  }
  target: {
    comparator: '>=' | '=='
    value: number
  }
  simulatorId: string
  knownExamples: string[]
}
```

---

# 19. New Format 13 — Algorithm Fingerprint

## Purpose

Recognize an algorithm family from behavior and maintained state instead of problem keywords.

---

## Example

Evidence cards:

- `left` never moves backward.
- `right` never moves backward.
- A frequency structure represents the current contiguous region.
- When the condition becomes invalid, `left` advances until validity is restored.

Prompt:

> Which behavioral description best matches this process?

Possible answers:

- Maintain a changing contiguous region while repairing a condition.
- Split into independent recursive subproblems.
- Repeatedly extract the globally smallest candidate.
- Explore a choice, recurse, then undo.

After success:

> This behavioral fingerprint is a variable-size sliding window.

---

## Teaching-science basis

This is retrieval with altered cues.

The learner cannot rely on surface words such as `substring`, `BFS`, or `heap`.

---

## UI design

3–5 evidence cards.

Advanced variant:

> Select the two clues that are most diagnostic.

That teaches learners to distinguish defining properties from incidental implementation details.

---

## Grading

Two dimensions:

- behavior family,
- diagnostic evidence.

---

## Schema

```ts
interface AlgorithmFingerprintConfig {
  evidence: Array<{
    id: string
    text: string
    diagnostic: boolean
  }>
  behaviorChoices: Array<{
    id: string
    label: string
    correct: boolean
    feedback: string
  }>
  formalTerm: FormalTerm
}
```

---

# 20. New Format 14 — Proof Obligation Mapper

## Purpose

Teach learners that algorithm correctness is composed of smaller obligations.

Instead of asking:

> Why is this algorithm correct?

ask the learner to connect claims to the evidence that proves them.

---

## Common obligations

- initialization is valid,
- every transition preserves the invariant,
- the algorithm makes progress,
- termination eventually occurs,
- state at termination implies the requested result,
- discarded candidates can never become necessary.

---

## Example: Binary Search

Claims:

1. Target, if present, remains inside `[left, right]`.
2. The search interval shrinks every iteration.
3. If `nums[mid] < target`, indices `<= mid` can be eliminated.
4. Empty interval implies the target is absent.

Evidence cards:

- sorted order,
- strict bound update,
- loop guard,
- midpoint comparison.

Learner maps evidence to obligations.

---

## Teaching-science basis

This is scaffolded self-explanation.

It breaks an intimidating proof into visible relationships and can later be faded.

---

## UI design

Two-column mapper:

```text
Proof obligation | Supporting reason
```

Then show a final assembled proof outline after success.

---

## Grading

Each obligation has one or more approved supporting reasons.

Do not require exact prose.

---

## Schema

```ts
interface ProofObligationConfig {
  obligations: Array<{
    id: string
    label: string
    correctReasonIds: string[]
  }>
  reasons: Array<{
    id: string
    text: string
    feedback: string
  }>
}
```

---

# 21. Question Formats vs Curriculum Orchestration

Adding 14 widgets will not, by itself, create durable learning.

Pathfinder should treat **format selection, spacing, fading, and contrast** as a second system.

## 21.1 Recommended mastery progression

For a reasoning skill:

### Phase A — Preparation

Use:

- concrete example,
- signal annotation,
- representation invention,
- worked explanation.

Goal:

> Notice the important dimensions.

### Phase B — Guided construction

Use:

- operation contract,
- minimal state,
- faded derivation,
- proof mapper.

Goal:

> Reconstruct the causal chain.

### Phase C — Independent retrieval

Use:

- algorithm fingerprint,
- unscaffolded signal/state questions.

Goal:

> Retrieve without the original cues.

### Phase D — Contrast

Use:

- near-twin pattern boundary.

Goal:

> Learn where the pattern applies and where it does not.

### Phase E — Transfer

Use:

- constraint mutation,
- structural analogy.

Goal:

> Apply the reasoning to a changed or unfamiliar problem.

### Phase F — Stress test

Use:

- worst-case adversary,
- roadmap counterexample construction,
- edge-case prediction,
- test-case design.

Goal:

> Understand failure boundaries and performance behavior.

---

# 22. Adaptive Difficulty Rules

## 22.1 Do not equate LeetCode difficulty with instructional difficulty

An Easy problem can support an advanced transfer question.

A Hard problem can support a beginner-friendly state observation.

Track the difficulty of the **reasoning demand**, not only the source problem.

Recommended field:

```ts
type InstructionalLevel =
  | 'observe'
  | 'complete'
  | 'construct'
  | 'retrieve'
  | 'transfer'
```

---

## 22.2 Evidence-based fading rule

Example deterministic first version:

```text
If learner is first exposed to concept:
    observe or complete

If two correct attempts with hints <= 1:
    construct

If first-try correct on a different problem:
    retrieve

If first-try correct after >= 1 day:
    transfer
```

This is a product heuristic, not a scientifically exact mastery threshold. It should be validated with product data.

---

## 22.3 Failure routing

If a learner fails a transfer question, identify the earliest missing dependency.

Example:

```text
Constraint Mutation Transfer failed
    ↓
Did learner identify changed constraint?
    no → Constraint Signal repair
    yes
    ↓
Did learner understand required operation?
    no → Operation Contract repair
    yes
    ↓
Did learner understand maintained state?
    no → Minimal State repair
```

This is much more useful than repeating the entire problem.

---

# 23. Engaging Without Gamifying Away the Learning

Engagement should come from **agency, surprise, visible reasoning, and challenge**, not from distracting reward systems.

## Recommended interaction motifs

### Reveal the consequence

The learner commits to an interpretation before seeing what it causes.

### Break the pattern

After two examples supporting a heuristic, show a near-twin where it fails.

### Beat the adversary target

Worst-Case Adversary provides a natural challenge without unrelated points.

### Build a mental model

State and representation builders give the learner a sense of ownership.

### Contract mutation

Small `diff` views make transfer questions feel like debugging the problem definition itself.

### Confidence wager without points

Ask:

> "How sure are you?"

Then show calibration afterward.

Do not convert confidence into gambling-style rewards.

---

# 24. Feedback Design

## 24.1 Correct answer feedback

Should contain three layers:

1. **Plain-language reason**
2. **Formal concept**
3. **Transfer cue**

Example:

> Yes. Because the array is sorted, everything left of `mid` is no larger than `nums[mid]`, so those values cannot equal a larger target. This is the elimination property that makes binary search valid. Look for the same one-direction elimination signal when the search space is not literally an array.

---

## 24.2 Incorrect answer feedback

Use:

```text
tempting assumption
→ why it fails
→ what to inspect next
```

Example:

> Keeping every earlier index feels safe because no information is lost. But this problem only needs the most recent relevant occurrence once the left boundary has passed older duplicates. Ask which old positions could still affect a future valid window.

---

## 24.3 Post-error reconciliation

For high-value errors:

1. preserve the user's choice,
2. reveal the canonical state or reasoning,
3. highlight the first divergence,
4. ask one short reconciliation question.

Example:

> You expected the left pointer to stay at 2, but the invariant requires the duplicate to be outside the window. Which occurrence of `a` is still inside the active window?

This applies the prediction/observation/explanation model.

---

# 25. Authoring System

Richer questions increase content-authoring cost. Pathfinder should create reusable authoring primitives.

## 25.1 Shared semantic facts

A deep problem should eventually expose reviewed facts such as:

```ts
interface ProblemReasoningModel {
  decisiveConstraints: ConstraintFact[]
  requiredOperations: OperationFact[]
  maintainedState: StateFact[]
  invariant: InvariantFact
  transitionRules: TransitionFact[]
  proofObligations: ProofFact[]
  complexityModel: ComplexityFact
  transferRelations: TransferRelation[]
}
```

Multiple formats can compile from the same reviewed facts.

For example:

- Constraint Signal Annotation uses `decisiveConstraints`.
- Operation Contract uses `requiredOperations`.
- Minimal State uses `maintainedState`.
- Proof Mapper uses `proofObligations`.
- Constraint Mutation uses `transferRelations`.

This reduces semantic drift.

---

## 25.2 Avoid fully automatic question generation initially

Do not infer deep pedagogical facts directly from arbitrary source code and publish them unreviewed.

Recommended:

1. author reviewed semantic facts,
2. use deterministic compilers to create interaction instances,
3. validate schema and known-answer fixtures,
4. independently review the educational wording.

---

# 26. Validation Requirements

Every new format needs both **technical correctness** and **instructional validity**.

## 26.1 Technical validation

Examples:

- all referenced choice IDs exist,
- correct mappings are nonempty,
- minimal state set is actually sufficient,
- simulator fixtures produce expected outputs,
- mutation facts are compatible with the source contract,
- proof obligations are supported by reviewed facts.

---

## 26.2 Ambiguity validation

Flag:

- multiple defensible answers not declared as equivalents,
- consequences stronger than the source constraint justifies,
- pattern labels revealed before the intended reasoning checkpoint,
- "always/never" language unsupported by the contract,
- complexity thresholds presented as universal hardware facts.

---

## 26.3 Learning-design validation

Reviewer checklist:

- Does this question require the intended reasoning skill?
- Can it be solved through a superficial keyword?
- Is the prerequisite knowledge already available?
- Does the distractor represent a real misconception?
- Does incorrect feedback identify the mistaken assumption?
- Is the difficulty productive rather than arbitrary?
- Is a transfer version available?
- Can the question be completed without precision drag-and-drop?

---

# 27. Analytics and Proficiency Evidence

Do not reduce rich interactions to one boolean.

Example evidence record:

```ts
interface ReasoningEvidence {
  questionId: string
  problemId: number
  format: QuestionFormat
  skillKeys: ReasoningSkillKey[]
  correct: boolean
  firstAttempt: boolean
  hintLevelReached: number
  confidence?: 'low' | 'medium' | 'high'

  diagnostics?: {
    decisiveSignalsFound?: string[]
    falseSignalsSelected?: string[]
    operationIdsSelected?: string[]
    stateClassification?: Record<string, string>
    mutationImpacts?: Record<string, string>
    analogyMappings?: Record<string, string>
  }
}
```

This enables Error Atlas messages such as:

> You usually identify hash-map problems after seeing the pattern name, but you are still missing the operation signal that makes lookup necessary.

That is substantially more actionable than:

> Hash Maps: 62%.

---

# 28. Recommended Prioritization

## Wave 1 — Highest learning value / moderate implementation cost

### 1. Constraint Signal Annotation

Why first:

- works across nearly every problem,
- directly addresses pattern-recognition weakness,
- simple deterministic grading,
- creates reusable constraint metadata.

### 2. Operation Contract Builder

Why:

- bridges constraints to data structures,
- attacks rote `problem → structure` memorization.

### 3. Minimal Sufficient State

Why:

- central to nearly all DSA reasoning,
- creates a strong foundation for invariants and tracing.

### 4. Near-Twin Pattern Boundary

Why:

- contrastive learning,
- teaches pattern limits,
- reusable curated pairs.

### 5. Constraint Mutation Transfer

Why:

- strong test of understanding,
- excellent Daily Mastery retrieval format.

### 6. Structural Analogy Mapping

Why:

- measures far transfer,
- directly tests whether the learner sees deep structure.

---

## Wave 2 — High value, richer authoring or UI

### 7. Faded Derivation
### 8. Representation Invention Sandbox
### 9. Algorithm Fingerprint
### 10. Proof Obligation Mapper

---

## Wave 3 — Specialized but powerful

### 11. Monotonicity Probe
### 12. Commit-or-Defer Safety Check
### 13. Worst-Case Adversary

These are especially valuable for medium/hard concepts and advanced interview preparation.

---

# 29. Pilot Problem Set

Use a small but structurally diverse pilot.

## Two Sum

Test:

- constraint signal,
- operation contract,
- state sufficiency,
- representation invention,
- mutation to streaming.

## Binary Search

Test:

- constraint signal,
- near-twin boundary,
- faded derivation,
- proof obligation.

## Longest Substring Without Repeating Characters

Test:

- minimal state,
- algorithm fingerprint,
- structural analogy,
- safe discard.

## Binary Tree Level Order Traversal

Test:

- operation contract,
- state sufficiency,
- structural analogy with graph BFS.

## Course Schedule

Test:

- constraint mutation from "possible?" to "return order,"
- proof obligations,
- structural analogy with dependency processing.

## Koko Eating Bananas or equivalent binary-search-on-answer problem

Test:

- monotonicity probe,
- fingerprint,
- proof obligations.

## Interval Scheduling / Non-overlapping Intervals

Test:

- commit-or-defer safety.

---

# 30. Example End-to-End Learning Path

Consider a learner encountering **Longest Substring Without Repeating Characters**.

## Step 1 — Constraint Signal Annotation

Learner notices:

- "substring" means contiguous,
- answer depends on a changing region.

No pattern name yet.

---

## Step 2 — Representation Invention

Learner tries to track:

- current candidate region,
- seen characters.

The concrete example exposes that simply knowing "seen before somewhere" is insufficient if the occurrence is outside the active region.

---

## Step 3 — Operation Contract

Learner derives:

- need fast duplicate detection,
- need enough location/count state to restore validity.

---

## Step 4 — Minimal Sufficient State

Learner decides what old history can be forgotten.

---

## Step 5 — Formal naming

Pathfinder introduces:

> variable-size sliding window

after the learner has already reconstructed why the pattern fits.

---

## Step 6 — Faded Derivation

Learner completes:

```text
expand right
→ violation occurs
→ move left until invariant restored
→ update best valid length
```

---

## Step 7 — Existing code construction

Learner translates the reasoning into code.

---

## Step 8 — Existing/planned trace prediction

Learner predicts pointer movement.

---

## Step 9 — Near-Twin Pattern Boundary

Compare:

- substring
- subsequence

Learner explains why window boundaries no longer represent all candidates for a subsequence.

---

## Step 10 — Structural Analogy on another day

Map the same behavior to:

> longest subarray with at most K distinct values.

This final step is much closer to durable interview intuition than repeating the original problem.

---

# 31. Implementation Plan

## Phase 0 — Refactor the format type model

- [ ] Introduce discriminated question union.
- [ ] Introduce `QuestionFormat` registry.
- [ ] Add common interaction-result contract.
- [ ] Preserve backward compatibility with existing stored sessions.
- [ ] Add format-aware state migration/versioning.

### Exit criteria

- Existing four formats behave identically.
- Invalid format/config combinations fail TypeScript compilation.
- Existing progress and refresh-resume tests pass.

---

## Phase 1 — Shared reasoning metadata

- [ ] Define decisive constraint facts.
- [ ] Define required operation facts.
- [ ] Define state facts and minimal sufficient sets.
- [ ] Define transfer relationships.
- [ ] Add review/validation utilities.
- [ ] Author facts for the five current deep pilot problems.

### Exit criteria

Each pilot problem has independently reviewed metadata that can support at least three new formats.

---

## Phase 2 — Wave 1 components

Implement:

- [ ] `ConstraintSignalQuestion.vue`
- [ ] `OperationContractQuestion.vue`
- [ ] `StateSufficiencyQuestion.vue`
- [ ] `NearTwinQuestion.vue`
- [ ] `ConstraintMutationQuestion.vue`
- [ ] `StructuralAnalogyQuestion.vue`

For each:

- [ ] keyboard support,
- [ ] touch support,
- [ ] narrow-screen layout,
- [ ] screen-reader labels,
- [ ] refresh-resume state,
- [ ] deterministic grading,
- [ ] option-specific feedback,
- [ ] progress evidence,
- [ ] unit tests,
- [ ] component tests.

---

## Phase 3 — Adaptive orchestration

- [ ] Add `InstructionalLevel`.
- [ ] Add `reasoningSkillKeys`.
- [ ] Let Daily Mastery select format based on missing reasoning evidence.
- [ ] Schedule contrast and transfer after a delay.
- [ ] Avoid immediate same-wording repetition.
- [ ] Prefer a different problem for validated retrieval.

---

## Phase 4 — Wave 2 components

- [ ] Faded Derivation
- [ ] Representation Invention Sandbox
- [ ] Algorithm Fingerprint
- [ ] Proof Obligation Mapper

---

## Phase 5 — Wave 3 components

- [ ] Monotonicity Probe
- [ ] Commit-or-Defer
- [ ] Worst-Case Adversary

---

# 32. Product Success Metrics

Do not judge the new system only by completion rate.

## Primary learning metrics

### Transfer accuracy

Can the learner solve a structurally related question on a different problem?

### Delayed retrieval accuracy

Can the learner reconstruct the reasoning at least one day later?

### Hint reduction

Does the same reasoning skill require fewer hints over time?

### Contrast discrimination

Can the learner correctly reject a familiar pattern when one necessary condition is missing?

### State minimality

Does the learner progress from redundant-but-correct state to sufficient/minimal state?

### Confidence calibration

Do high-confidence incorrect answers decrease for a misconception after repair?

---

## Secondary engagement metrics

- voluntary continuation into transfer question,
- completion rate by format,
- retry rate after diagnostic feedback,
- time spent before first answer,
- hint-open rate,
- abandonment after incorrect answer.

Do not optimize for low time-to-answer if faster answers reduce reasoning.

---

# 33. Research References

The following sources informed the teaching model.

## Retrieval practice and metacognition

**Purdue University — Cognition and Learning Lab**  
Retrieval-Based Learning, metacognition, and educational applications.  
https://learninglab.psych.purdue.edu/projects/

Karpicke, J. D., & Roediger, H. L. (2008). *The critical importance of retrieval for learning*. Science.

Roediger, H. L., & Karpicke, J. D. (2006). *Test-enhanced learning: Taking memory tests improves long-term retention*. Psychological Science.

---

## Desirable difficulties, spacing, and interleaving

**UCLA Bjork Learning and Forgetting Lab**  
Bjork, E. L., & Bjork, R. A. — work on desirable difficulties, spacing, interleaving, and testing.  
https://bjorklab.psych.ucla.edu/

Important design caveat from this body of work: difficulty must be appropriate to the learner; making a task harder is not automatically educationally beneficial.

---

## Contrasting cases and preparation for future learning

**Stanford University — Schwartz & Bransford**  
Schwartz, D. L., & Bransford, J. D. (1998). *A Time for Telling*.  
https://aaalab.stanford.edu/assets/papers/earlier/A_time_for_telling.pdf

Contrasting cases can prepare learners to notice important distinctions and learn more from later explanation.

---

## Productive Failure

**ETH Zurich — Professorship for Learning Sciences and Higher Education**  
https://lse.ethz.ch/research/productive-failure.html

Kapur, M. (2015). *Learning from Productive Failure*.

Sinha, T., & Kapur, M. (2021). *When Problem Solving Followed by Instruction Works: Evidence for Productive Failure*. Review of Educational Research.

---

## Self-explanation

**Harvard ABLConnect — Self-Explanation & Think-Alouds**  
https://ablconnect.harvard.edu/self-explanation-think-alouds-research

Self-explanation can help learners integrate new and prior knowledge and refine mental models.

---

## Worked examples and fading

**Carnegie Mellon University — Cognitive Tutor / learning-science research**

CMU learning resources also explicitly teach:

- practice quizzing,
- self-explanation,
- worked examples,
- spaced practice,
- interleaved practice.

Student Cognition Toolbox:  
https://www.oli.cmu.edu/courses/student-cognition-toolbox-open-free/

Worked-example and fading research in CMU tutoring systems supports gradually moving learners from studied examples toward independent problem solving.

---

## Active learning and prediction

**Yale Poorvu Center for Teaching and Learning**  
https://poorvucenter.yale.edu/teaching/teaching-resource-library/active-learning

Relevant technique: ask learners to predict an outcome, observe the result, and reconcile differences in their mental model.

---

## Learning principles and knowledge organization

**Carnegie Mellon Eberly Center**  
https://www.cmu.edu/teaching/principles/learning.html

Relevant principles include:

- prior knowledge can help or hinder learning,
- knowledge organization affects retrieval and application,
- active cognitive engagement matters.

---

# 34. Final Recommendation

Pathfinder should resist becoming a larger collection of quiz widgets.

The real product opportunity is to model the **reasoning transitions that experts perform automatically** and then create interactions that make those transitions visible and trainable.

The most important transitions are:

```text
problem language
    ↓
decisive constraint
    ↓
required operation
    ↓
minimal sufficient state
    ↓
safe transition
    ↓
invariant
    ↓
algorithmic pattern
    ↓
correctness
    ↓
complexity
    ↓
transfer
```

The first implementation wave should therefore focus on formats that exercise those edges directly:

1. Constraint Signal Annotation
2. Operation Contract Builder
3. Minimal Sufficient State
4. Near-Twin Pattern Boundary
5. Constraint Mutation Transfer
6. Structural Analogy Mapping

Then use educationally grounded orchestration:

```text
worked / concrete
→ partially faded
→ constructed
→ retrieved
→ contrasted
→ transferred
→ spaced and interleaved later
```

If Pathfinder consistently asks learners to **notice, derive, justify, contrast, adapt, and retrieve**, it will teach something substantially more valuable than a catalog of LeetCode solutions: it will teach the mental models that make unfamiliar problems feel tractable.
