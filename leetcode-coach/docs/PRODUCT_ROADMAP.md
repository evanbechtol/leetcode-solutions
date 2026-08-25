# Pathfinder Product Roadmap

Last updated: August 24, 2026

This document is the planning source of truth for Pathfinder. It describes the current product, the intended learning experience, future question formats, platform capabilities, quality gates, and the order in which work should be considered. It is a roadmap rather than a delivery-date commitment.

For the public-ready delivery sequence that turns these capabilities into a cohesive beginner retention loop, see the [Public Product Implementation Plan](PUBLIC_PRODUCT_IMPLEMENTATION_PLAN.md).

## Status labels

| Status | Meaning |
| --- | --- |
| Complete | Implemented and covered by the current validation/build workflow |
| In progress | Actively being implemented |
| Next | Highest-priority candidate for the next milestone |
| Planned | Accepted direction, but not yet scheduled |
| Exploration | Valuable idea that still needs product or technical validation |

## Product purpose

Pathfinder should teach users how to derive an optimal solution, not merely recognize a memorized answer. A successful practice path should help a user:

1. Interpret the problem contract and constraints.
2. Identify the necessary data structure or minimal maintained state.
3. Recognize the appropriate algorithmic pattern using the established state and structural signals.
4. Define the maintained state and invariant.
5. Follow how that state changes during execution.
6. Explain why each transition is correct and test its edge cases.
7. Construct the algorithm in dependency order.
8. Derive its time and auxiliary-space complexity.
9. Transfer the reasoning to a related problem later.

## Product principles

### Accuracy before coverage

- Every algorithm, invariant, trace, hint, option, complexity claim, and explanation must be technically correct for the solution being taught.
- Content should distinguish between the verified solution taught by Pathfinder and other valid solutions.
- Wrong-answer feedback must explain the misconception without exposing the correct answer prematurely.
- Ambiguous prompts or multiple defensible answers are defects, even when the intended answer is conventional.

### Derivation before memorization

- Questions should follow the dependency order of the reasoning process.
- Contract comprehension should lead to data-structure identification before a specific algorithm is named or implemented. State should then lead to pattern, invariant, transition, proof, and complexity.
- Repeated practice should ask the learner to produce more of the reasoning rather than only recognize it.

### Concrete before formal

- Introduce a concept through a small example or observable state change before relying on its academic name.
- Use plain language first and attach the formal term second: for example, “what must stay true after every step (the invariant).”
- Do not remove fundamental vocabulary. Define it at the moment the learner has enough context to understand it.
- Ask one new conceptual decision at a time. A question should not require unexplained knowledge from several later lesson sections.
- After a correct answer, connect the learner’s intuition to the precise definition, proof obligation, or complexity rule.
- Beginner-friendly wording is the default, not a separate simplified curriculum. Optional depth can expand the explanation without changing correctness.

### Deterministic core, optional AI

- The complete core curriculum must work locally and on GitHub Pages without AI.
- AI may later personalize explanations, assess free-form reasoning, or generate additional practice, but it must remain optional.
- An AI response must never silently replace reviewed canonical facts.

### Accessible interaction

- Every interaction must work with keyboard, mouse, and touch.
- Mobile layouts must not depend on drag-and-drop precision.
- Color cannot be the only indication of correctness, sequence, or state change.

### Measurable learning

- Progress should distinguish first-try understanding from eventual completion.
- Accuracy should be available by topic, reasoning category, question format, problem set, and time period.
- Mastery should reflect durable performance across a complete problem set, not a single successful attempt.

## Current product baseline

### Practice catalog — Complete

- 134 problems imported from the pinned `newfacade/LeetCodeDataset` source.
- Two curated-only problems, for a merged total of 136 practice problems.
- Deterministic coaching paths for every loaded problem.
- Nine questions in a standard path and twelve in a deep representative path.
- Filtering by difficulty, problem set, topic, and algorithm.
- Static hints and reviewed pattern/problem facts; AI is not required.
- Plain-language prompts, choices, hints, walkthroughs, and builder steps for every deterministic path.
- Short teaching context before each decision and a formal term revealed after a correct answer.

### Current reasoning categories — Complete

- Comprehension
- Pattern
- Data Structure
- Invariant
- Algorithm
- Correctness
- Complexity

### Current interaction formats — Complete

#### Decision question

The learner selects one of four answers. Distractors represent identifiable misconceptions and receive option-specific feedback.

Every path places the data-structure decision immediately after contract comprehension and before pattern or implementation questions. Topic tags stay hidden until this checkpoint is answered correctly.

#### Build the algorithm

The learner selects four phases from a larger bank and places them in dependency order. The interaction supports removal, undo, reset, deterministic grading, and first-mismatch guidance. Selection is used instead of free-form text because it is exact, accessible on mobile, and does not require AI-based semantic grading.

#### Construct the code

Five reviewed pilot paths replace the conceptual builder with incremental implementation decisions: Two Sum, Longest Substring Without Repeating Characters, Binary Search, Binary Tree Level Order Traversal, and Course Schedule. Correct lines remain visible, wrong lines receive non-revealing feedback, concrete example state is shown after each decision, unfinished work survives refresh, and the canonical implementation appears only after every step. The first three pilots include Python, Java, C++, and Rust; the tree and graph pilots use reviewed Python variants derived from the catalog implementations.

Every reasoning, correctness, edge-case, and trade-off decision precedes construction. Only time- and space-complexity questions follow it.

### Learning library and reference tools — Complete

- Dedicated lessons for foundational data structures and algorithms.
- Interactive six-frame execution visualizations in every lesson, using a representative problem and canonical implementation. These are instructional walkthroughs rather than scored questions.
- Syntax-highlighted examples with language selection where samples are available.
- Searchable and downloadable algorithm cheat sheet.
- Problem, lesson, cheat-sheet, and profile routes.
- Searchable Problems catalog with shared difficulty, problem-set, topic, and algorithm filters.

### Progress and deployment — Complete

- Browser-local answer history, accuracy, streaks, completed paths, and topic mastery.
- Active problem sessions survive a refresh and are cleared when the learner leaves that problem.
- Accuracy by reasoning category and interaction format.
- Static production build suitable for local use and GitHub Pages.
- Optional AI service remains behind an explicit development flag.

## Roadmap overview

| Milestone | Focus | Status |
| --- | --- | --- |
| Foundation | Deterministic catalog, lessons, profiles, references, and static deployment | Complete |
| Interactive reasoning | Algorithm construction and conceptual execution walkthroughs | Complete |
| Guided discovery | Beginner-first explanations and incremental code construction | Complete |
| Production practice | Counterexamples, edge cases, complexity derivation, and test design | Next |
| Concrete tracing | Problem-specific state animations and code/state synchronization | Planned |
| Adaptive mastery | Spaced repetition, proficiency modeling, and personalized queues | Planned |
| Coding workspace | In-browser editor, tests, execution, and submission analysis | Planned |
| Accounts and sync | Authentication, durable progress, and cross-device continuity | Planned |
| Advanced coaching | Optional rubric-based free response and AI-assisted explanations | Exploration |

## Next milestone: guided discovery

### Beginner-friendly instructional model — Complete / P0

The application should preserve rigorous DSA fundamentals while assuming that a learner may not yet know the vocabulary. The solution is progressive disclosure, not removing the concepts.

**Teaching sequence for a concept:**

1. **Orient:** Explain in one or two sentences what the learner is trying to notice and why it matters.
2. **Observe:** Show a small concrete input, state snapshot, or comparison.
3. **Choose:** Ask one focused question in plain language.
4. **Name:** After the learner succeeds, introduce the formal term and definition.
5. **Connect:** Explain how the concept constrains the next algorithmic decision.
6. **Retrieve:** Ask the learner to use the formal concept later without repeating the full explanation.

**Wording rules:**

- Prefer “What must still be true after this step?” before “Which invariant is preserved?”
- Prefer “What information must we remember?” before “Define the algorithmic state.”
- Prefer “Can one comparison eliminate half of the remaining choices?” before “Is the predicate monotonic?”
- Define terms such as frontier, relaxation, amortized, optimal substructure, stable ordering, and auxiliary space before using them as assumed knowledge.
- Keep sentences short enough that reading comprehension does not become the hidden skill being tested.
- Avoid distractors that are difficult only because they use unfamiliar terminology.

**Guidance ladder:**

1. Initial prompt with a concrete cue.
2. First hint that points to the relevant part of the input or state.
3. Second hint that names the kind of information to track without naming the answer.
4. Optional worked first step that leaves the remaining decision to the learner.
5. Formal explanation after a correct answer.

**Recommended schema additions:**

- `teachingContext`: a short explanation shown before the question. Implemented.
- `formalTerm`: the formal name and concise definition revealed after success. Implemented.
- `hintLevels`: ordered hints from light cue to worked first step. Implemented.
- `prerequisites`: concepts the question is allowed to assume. Implemented.
- `readingLevelNotes`: authoring-only warnings for unexplained or overly academic language. Implemented.

**Acceptance criteria:**

- Every specialized term is defined earlier in the path, in the linked lesson, or directly on the question.
- The first hint never reveals the correct answer or algorithm name.
- A learner can answer the question using information already presented in the problem and path.
- Correct feedback contains both plain-language reasoning and the formal concept.
- Content review includes a beginner-comprehension pass in addition to the algorithm-accuracy pass.
- The deterministic validator reports undefined prerequisite concepts and specialized terms introduced too early.

### Incremental code construction — Complete / P0

The current algorithm builder orders conceptual phases. The new format should let the learner discover the actual implementation before the completed solution is shown.

**Recommended interaction:**

- Begin with the function signature, input names, and an otherwise incomplete syntax-highlighted code panel.
- Present one implementation decision at a time.
- Let the learner select a line, expression, condition, or update from a small bank.
- Insert a correct choice into the code panel and keep it visible as established work.
- Explain why the line is needed and how it changes the maintained state.
- For a wrong choice, explain the misconception without inserting or highlighting the correct line.
- After important updates, show the corresponding state change on the example input.
- Reveal the complete canonical implementation only after the learner has constructed all required pieces.

**Recommended construction sequence:**

1. Initialize the required data structure or scalar state.
2. Choose the traversal, loop guard, recursion base case, or frontier condition.
3. Compute the key, candidate, midpoint, neighbor, or subproblem state.
4. Query or update the maintained data structure.
5. Preserve the invariant and make measurable progress.
6. Handle the success, failure, or boundary condition.
7. Return or assemble the final result.

**Example: Two Sum discovery path:**

1. Create an empty mapping for values already visited.
2. Iterate through each value with its index.
3. Compute `needed = target - value`.
4. Check whether `needed` has already been recorded.
5. Return the stored index and current index when found.
6. Otherwise record the current value only after the lookup, preventing an element from matching itself.

The learner should make each of these choices. The completed implementation should not appear above or beside the exercise.

**Data model direction:**

```ts
interface CodeConstructionStep {
  id: string
  concept: string
  prerequisites: string[]
  correctChoiceId: string
  choices: Array<{
    id: string
    codeByLanguage: Record<string, string>
    feedback: string
  }>
  stateEffect: string
  explanation: string
}
```

The semantic step is language-independent, while reviewed language variants provide actual syntax. This prevents separate Python, Java, C++, Rust, TypeScript, and JavaScript exercises from drifting into different algorithms.

**Typing progression:**

- Introductory: select a complete line from three or four choices.
- Reinforcing: fill a constrained expression or condition.
- Transfer: type the next line with local parsing and execution-based validation.
- Challenge: construct a short block without choices.

Free typing should not be the first version. Equivalent code is difficult to grade safely without execution, and false rejections are especially discouraging for new learners.

**Accuracy and rollout:**

- Do not split arbitrary source code automatically and assume the fragments are pedagogically valid.
- Hand-author semantic steps and reviewed language renderings.
- Pilot with five representative problems: Two Sum, Longest Substring Without Repeating Characters, Binary Search, Binary Tree Level Order Traversal, and Course Schedule.
- Cover hashing, sliding window, binary search, tree BFS, and topological sorting before expanding.
- Expand to the thirty deep representative problems after the pilot passes accuracy and usability review.
- Expand to the remaining catalog only when content authoring and independent review can maintain the same standard.

**Acceptance criteria:**

- No unearned portion of the final implementation is visible before its step is completed.
- Each code choice corresponds to exactly one previously established state, invariant, or transition decision.
- The assembled code passes canonical examples, edge fixtures, and hidden regression tests.
- Language variants implement the same algorithm and complexity.
- Wrong choices receive line-specific feedback without revealing the correct line.
- Retry clears only the current choice and retains correctly constructed earlier code.
- Keyboard and touch users can complete the exercise without drag-and-drop.
- Progress distinguishes conceptual algorithm building from code construction.

## Following milestone: production practice

These formats should be implemented before adding free-form AI grading. Each one can be evaluated deterministically and exercises a skill that multiple-choice questions measure only indirectly.

### 1. Counterexample construction — Next / P0

**Learning objective:** Teach the learner to disprove an incorrect greedy rule, invariant, or optimization by finding the smallest input on which it fails.

**Recommended interaction:** Present a plausible but incorrect claim and a constrained input builder. The learner selects or edits a small array, string, graph, or tree until the claimed algorithm produces the wrong result.

**Recommended placement:** After pattern selection or during the correctness section, before the final proof question.

**Deterministic grading:**

- Execute or simulate the incorrect rule and the verified solution on the candidate input.
- Require different outputs and verify that the input satisfies the original constraints.
- Prefer a minimality bonus rather than requiring the mathematically smallest counterexample for correctness.

**Required content:**

- The incorrect claim being challenged.
- A known valid counterexample.
- Input-shape constraints for the builder.
- A precise explanation of which assumption fails.

**Acceptance criteria:**

- The learner can construct at least one valid counterexample without seeing the canonical example.
- Invalid input is distinguished from a non-counterexample.
- Feedback identifies the broken assumption without immediately inserting the canonical input.
- Automated tests verify both the false rule and canonical solution on every authored counterexample.

### 2. Edge-case prediction — Next / P0

**Learning objective:** Train the learner to predict how initialization, boundaries, duplicates, empty state, overflow, or disconnected input affect an implementation.

**Recommended interaction:** Show a short state definition or pseudocode fragment and ask the learner to select an edge case, predict the behavior, and choose the necessary guard or initialization.

**Recommended placement:** Immediately before correctness or implementation details.

**Deterministic grading:** Match the selected edge case, predicted failure mode, and repair as a linked answer tuple rather than three unrelated multiple-choice questions.

**Required content:**

- A valid boundary input from the problem’s constraints.
- The exact state before the failure or boundary transition.
- Expected behavior under the correct algorithm.
- The defect produced by the tempting implementation.

**Acceptance criteria:**

- Every edge case is legal under the source problem contract.
- The predicted behavior is verified against the canonical implementation or an independent oracle.
- Feedback distinguishes an algorithmic error from a language/runtime error.

### 3. Complexity derivation — Next / P0

**Learning objective:** Make the learner derive a bound from operations, states, and transitions instead of recognizing a Big-O label.

**Recommended interaction:** A three-part equation builder:

1. Select the number of states or processed items.
2. Select the work per state, operation, or data-structure update.
3. Combine and simplify the expression.

Example: `V states + E relaxations`, each heap update `log V`, yielding `O((V + E) log V)`.

**Recommended placement:** Replace or precede the existing time-complexity multiple-choice question.

**Deterministic grading:** Validate each term independently, preserve meaningful variables such as `V`, `E`, `k`, `m`, and `n`, and accept mathematically equivalent simplified bounds where safe.

**Required content:**

- Variable definitions.
- Operation counts.
- Cost per operation.
- Dominant-term simplification.
- Separate auxiliary-space accounting.

**Acceptance criteria:**

- Correct final notation without correct derivation does not receive full credit.
- The explanation accounts for sorting, recursion depth, output-sensitive work, and amortization when applicable.
- Tests reject common but incorrect bounds caused by nested-loop visual inspection alone.

### 4. Test-case design — Next / P1

**Learning objective:** Teach the learner to translate constraints and invariants into a compact, high-value test suite.

**Recommended interaction:** Select a limited number of test cases to cover named risk categories, or construct inputs using an input editor. Score coverage rather than exact equality with one canonical suite.

**Coverage categories:**

- Smallest legal input
- Largest structural boundary
- Duplicate or repeated values
- Already optimal or already sorted input
- No-solution or disconnected state when permitted
- Multiple valid answers
- Overflow or numeric precision boundary
- Degenerate tree, graph, matrix, or linked-list shape

**Acceptance criteria:**

- Each selected test maps to at least one explicit risk.
- Redundant tests are identified without being marked factually wrong.
- The canonical solution and known incorrect variants are run against the authored suite where execution is available.

### 5. Invariant repair — Planned / P1

**Learning objective:** Teach learners to recognize why a state update breaks the invariant and repair only the incorrect line or phase.

**Recommended interaction:** Present a four-to-eight-line pseudocode fragment with one incorrect update. The learner replaces the line from a small bank or edits a constrained expression.

**Deterministic grading:** Compare the selected repair with a set of semantically approved repairs and run trace fixtures when possible.

### 6. Bug hunt / state diagnosis — Planned / P1

**Learning objective:** Build debugging skill by connecting an incorrect output to the first state divergence.

**Recommended interaction:** Show two aligned traces—expected and buggy—until the first mismatch. Ask which invariant was violated and which update caused it.

**Deterministic grading:** The authored trace must identify one unambiguous earliest divergence.

### 7. Solution comparison — Planned / P1

**Learning objective:** Help learners compare two valid algorithms based on constraints rather than treating one technique as universally superior.

**Recommended interaction:** Present two verified approaches and several input/constraint scenarios. The learner chooses the appropriate approach and explains the relevant time, space, stability, mutation, or implementation tradeoff.

**Acceptance criteria:**

- Both solutions must be valid under the base contract.
- The scenario must make the preferred tradeoff explicit.
- Wording must avoid calling an alternative “wrong” when it is merely less suitable.

### 8. Explain in your own words — Exploration / P2

**Learning objective:** Measure whether a learner can articulate the state, invariant, transition, and proof without answer recognition.

**Recommended rollout:**

1. Start with an ungraded reflection field stored only for the current session.
2. Add a deterministic checklist allowing learners to self-assess required concepts.
3. Evaluate rubric-based local matching for required terms and prohibited misconceptions.
4. Consider optional AI feedback only after a benchmark demonstrates acceptable false-positive and false-negative rates.

**Do not implement as scored free text until:**

- A reviewed rubric exists for each prompt.
- Equivalent explanations are represented in evaluation fixtures.
- Users can see why their response was assessed a certain way.
- The deterministic curriculum remains fully usable when AI is disabled.

## Concrete visualization milestone

Visualization now belongs to the Learn curriculum rather than the graded problem path. Every lesson has a representative execution walkthrough using concrete input elements and canonical variable names. Five pilot visualizations have reviewed, exact problem-specific state values; broader exact fixture coverage remains planned.

### Visualization V2 — Planned

- Author trace fixtures for the remaining twenty-five deep representative problems.
- Show the exact input cursor, active nodes or edges, pointer positions, queue/stack/heap contents, dynamic-programming cells, and output changes.
- Highlight only values that changed during the current frame.
- Provide previous, next, play, pause, restart, and reduced-motion behavior.
- Synchronize a pseudocode line with each state transition.
- Allow users to predict the next state before revealing it.
- Explain why removed or discarded candidates can never matter again.
- Expand to the remaining catalog only after the deep trace fixtures pass review.

**Trace fixture requirements:**

- Initial state
- Ordered transitions
- State snapshot after each transition
- Invariant assertion after each transition
- Termination condition
- Final output
- Independent expected-state tests

## Algorithm builder milestone

### Builder V2 — Planned

- Move from four conceptual phases to smaller pseudocode blocks for deep problems.
- Support nested blocks for loops, conditionals, recursion, and backtracking cleanup.
- Add accessible move-up/move-down controls before considering drag-and-drop.
- Award partial diagnostic feedback without awarding correctness for an incomplete sequence.
- Explain dependencies between blocks after a correct submission.
- Add an optional “write the next line” mode for constrained expressions with deterministic parsing.
- Preserve the current phase builder as the introductory difficulty level.

### Builder V3 — Exploration

- Let users write language-neutral pseudocode.
- Normalize harmless syntactic variations.
- Execute the constructed algorithm against hidden trace fixtures.
- Separate syntax, termination, correctness, and complexity feedback.
- Do not depend on generative AI for pass/fail grading.

## Adaptive learning and mastery

### Proficiency model — Planned

Track separate evidence for:

- Contract comprehension
- Pattern recognition
- Data-structure selection
- Invariant definition
- State tracing
- Algorithm construction
- Correctness reasoning
- Edge-case handling
- Time-complexity derivation
- Space-complexity derivation

Recommended initial model:

- First-try correct answers provide the strongest positive signal.
- Correct answers after hints provide a smaller positive signal.
- Repeated errors schedule a related lesson or easier representative problem.
- Mastery requires successful retrieval on different days and multiple problems, not repeated attempts on one path.
- Topic mastery continues to require completion of the entire loaded problem set, with a separate durable-proficiency indicator added later.

### Spaced repetition — Planned

- Create a daily review queue from weak reasoning categories and overdue patterns.
- Prefer a related but different problem over immediately repeating the same wording.
- Use short review paths that target the failed skill.
- Let the user override the queue with filters.
- Store scheduling metadata locally first, then sync it when accounts exist.

## Coding workspace

### Editor and execution — Planned

- In-browser code editor with syntax highlighting and the existing language preference.
- Starter code, visible examples, custom test cases, and run/submit actions.
- Initial languages: Python, Java, C++, Rust, TypeScript, and JavaScript, subject to runner support.
- Sandboxed execution with CPU, memory, output, and wall-time limits.
- Clear distinction between compilation, runtime, wrong-answer, timeout, and memory-limit failures.
- No secrets or unrestricted host/network access inside the execution environment.

### Submission coaching — Planned

- Compare failed test behavior with the invariant and trace rather than immediately revealing code.
- Identify the first divergent state when trace instrumentation is available.
- Ask the learner to repair the relevant phase before showing a canonical solution.
- Record completion independently from copying or viewing the final solution.

## Curriculum and content expansion

### Lesson-to-practice graph — Planned

- Define prerequisites between lessons, patterns, and representative problems.
- Link each failed reasoning category to a precise lesson section.
- Add “practice this concept” actions inside lessons and the cheat sheet.
- Show which problems provide introductory, reinforcing, and transfer practice.

### Curriculum tracks — Planned

- Arrays and strings
- Hash maps and sets
- Two pointers and sliding windows
- Stacks, queues, and monotonic structures
- Linked lists
- Trees and binary search trees
- Graph traversal and connectivity
- Shortest paths and topological ordering
- Heaps and selection
- Intervals and line sweep
- Backtracking
- Dynamic programming
- Tries and string matching
- Range-query structures

### Content-source hardening — Planned

- Keep the external dataset version pinned and attributed.
- Replace copied problem prose before broader public or commercial distribution unless appropriate rights are confirmed.
- Maintain original Pathfinder explanations, hints, traces, and question paths separately from imported metadata.
- Record the content version used for each completed practice attempt when the schema begins changing frequently.

## Accounts and cross-device progress

### Local identity migration — Planned

- Preserve the existing browser-only experience for users who do not want an account.
- Add export and import before introducing authentication.
- Define a versioned progress schema and migration tests.
- Use stable attempt identifiers so local and remote records can be merged safely.

### Accounts and synchronization — Planned

- Email or federated sign-in.
- Cross-device progress, preferences, mastery, and review queues.
- Offline-first writes with deterministic conflict resolution.
- Account deletion and full data export.
- Privacy controls for any saved free-form explanation or code submission.

## Product experience and platform work

### Accessibility — Ongoing

- Full keyboard operation for every question format.
- Visible focus, semantic labels, and announced state changes.
- Reduced-motion support for visualization playback.
- Contrast checks and non-color correctness indicators.
- Screen-reader verification for builder ordering and visual state changes.

### Performance — Planned

- Split large lesson and syntax-highlighting bundles by route and language.
- Lazy-load visualization implementations not used in the active path.
- Keep deterministic question compilation fast enough for low-powered mobile devices.
- Add bundle-size and route-load budgets to continuous integration.

### Deployment — Planned

- Continue supporting local development and GitHub Pages for the static core.
- Add a hosted API only for accounts, synchronized progress, execution, or explicitly enabled AI features.
- Keep API keys and execution credentials out of the browser.
- Document backup, migration, and rollback procedures before storing durable user data.

## Accuracy and content-governance gates

No new scored question format is complete until all applicable gates pass.

### Authoring gate

- The prompt has one unambiguous task.
- The taught solution and all complexity variables are named.
- Correct answers, accepted alternatives, and distractors are documented.
- Every distractor maps to a specific misconception.
- Feedback explains that misconception without revealing later answers.

### Technical verification gate

- Canonical examples and boundary fixtures pass.
- The grader accepts all reviewed equivalent answers.
- The grader rejects known incorrect variants.
- Trace frames reproduce the canonical output.
- Time and space explanations count the actual operations and retained state.
- Deterministic compilation produces stable content.

### Independent review gate

- A second review checks algorithm correctness, invariant, proof, and complexity.
- Ambiguous wording is revised rather than resolved only in an explanation.
- Alternative valid algorithms are acknowledged where relevant.
- A content-review record identifies the reviewer and content version.

### User-experience gate

- Keyboard and touch workflows are complete.
- Wrong answers do not reveal or visually mark the correct answer.
- Retry resets only the current response and preserves attempt history.
- Mobile navigation returns the learner to the top of the active question.
- Progress and first-try scoring behave consistently with existing formats.

## Definition of done for a new question format

A format is complete only when:

1. Its typed data schema is documented.
2. It has an accessible renderer and deterministic evaluator.
3. Retry, next-question, scroll restoration, and progress tracking work.
4. Incorrect feedback is specific and non-revealing.
5. Content validation covers missing, duplicated, contradictory, and placeholder data.
6. Unit tests cover unanswered, correct, incorrect, retry, and legacy-progress behavior.
7. Representative easy, medium, hard, mobile, and deep-path cases are verified.
8. Accuracy-by-format appears in the profile.
9. The complete static application still works without AI.
10. The full test suite and production build pass.

## Suggested delivery sequence

### Milestone A: guided foundations and code discovery

- [x] Plain-language teaching context for every reasoning category
- [x] Formal-term definitions revealed after intuitive understanding
- [x] Multi-level non-revealing hint model
- [x] Incremental code-construction schema and renderer
- [x] Five-problem code-construction pilot
- [x] Beginner-comprehension content-review gate

### Milestone B: deterministic production skills

- [ ] Edge-case prediction
- [ ] Complexity derivation
- [ ] Counterexample construction
- [ ] Test-case design
- [ ] Per-format validation and profile analytics

### Milestone C: concrete tracing

- [ ] Exact state fixtures for thirty deep problems
- [ ] State-diff visual renderer
- [ ] Predict-the-next-state checkpoint
- [ ] Pseudocode synchronization
- [ ] Reduced-motion and screen-reader verification

### Milestone D: stronger construction and debugging

- [ ] Builder V2 pseudocode blocks
- [ ] Invariant repair
- [ ] Bug hunt / first-divergence diagnosis
- [ ] Solution comparison

### Milestone E: adaptive practice

- [ ] Versioned proficiency model
- [ ] Spaced-repetition queue
- [ ] Targeted lesson remediation
- [ ] Local progress export and import

### Milestone F: coding and durable accounts

- [ ] Sandboxed code execution
- [ ] Submission analysis
- [ ] Authentication and cross-device synchronization
- [ ] Privacy, export, and deletion controls

### Milestone G: optional advanced coaching

- [ ] Ungraded written reflection
- [ ] Deterministic self-assessment rubric
- [ ] Free-response grading benchmark
- [ ] Optional AI-assisted feedback behind an explicit flag

## Backlog item template

Use this structure when promoting a roadmap item into implementation work:

```markdown
### Outcome
What should the learner be able to do after this change?

### Placement
Where does the interaction belong in the reasoning sequence, and why?

### Content schema
What reviewed facts, fixtures, accepted answers, and misconceptions are required?

### Interaction
How does the learner respond using keyboard, mouse, and touch?

### Evaluation
How is the response graded deterministically? What equivalent answers are accepted?

### Feedback
What does a wrong answer explain without revealing the answer?

### Progress
Which reasoning category, format, mastery signal, and first-try metric are updated?

### Accuracy evidence
Which canonical implementation, oracle, examples, and independent reviews verify the content?

### Acceptance criteria
Which observable behaviors and automated tests prove completion?
```

## Open product decisions

- Whether visualization V2 should begin with one trace per pattern or one trace per deep representative problem. The accuracy-first recommendation is per-problem fixtures for the thirty deep problems.
- Whether output-size complexity should be reported separately when the returned result dominates memory or runtime.
- Whether partial credit should affect streaks or only diagnostic proficiency.
- Which sandboxed execution provider can support the target languages within acceptable cost and security limits.
- When local progress has enough schema stability to introduce accounts and synchronization.
- Whether AI free-response feedback can meet a measured accuracy threshold without becoming required for the core curriculum.

## Explicit non-goals for the near term

- Scraping LeetCode directly.
- Making AI a dependency for completing the core catalog.
- Scoring unrestricted free text with untested semantic heuristics.
- Adding competitive leaderboards before individual mastery signals are reliable.
- Treating completion of one problem as mastery of an entire topic.
- Shipping generated questions or traces without deterministic validation and human accuracy review.
