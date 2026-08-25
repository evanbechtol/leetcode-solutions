import type {
  ConstraintMutationConfig,
  NearTwinConfig,
  OperationContractConfig,
  StateSufficiencyConfig,
  StructuralAnalogyConfig,
} from '../../types'

export interface ConstraintFact {
  id: string
  label: string
  importance: 'decisive' | 'supporting' | 'incidental'
  consequence?: { id: string; text: string; feedback: string }
}

export interface ProblemReasoningModel {
  reviewed: true
  sourceText: string
  decisiveConstraints: ConstraintFact[]
  constraintDistractors: Array<{ id: string; text: string; feedback: string }>
  operationContract: OperationContractConfig
  maintainedState: StateSufficiencyConfig
  transferRelations: {
    nearTwin?: NearTwinConfig
    mutation?: ConstraintMutationConfig
    analogy?: StructuralAnalogyConfig
  }
}

const twoSum: ProblemReasoningModel = {
  reviewed: true,
  sourceText: 'Given an integer array and a target, return the indices of two different elements whose values sum to the target. Exactly one valid answer exists.',
  decisiveConstraints: [
    {
      id: 'return-indices', label: 'return the indices', importance: 'decisive',
      consequence: { id: 'preserve-index', text: 'Stored values must remain connected to their original positions.', feedback: 'A value-only set can detect a complement, but it cannot recover the earlier index the output requires.' },
    },
    {
      id: 'different-elements', label: 'two different elements', importance: 'decisive',
      consequence: { id: 'check-before-record', text: 'Check for the complement before recording the current element.', feedback: 'Recording first could let one element match itself when its value is half of the target.' },
    },
    { id: 'exactly-one', label: 'exactly one valid answer exists', importance: 'supporting', consequence: { id: 'stop-first', text: 'The search may stop as soon as a valid pair is found.', feedback: 'Because only one answer is required and guaranteed, no later pair needs to be collected.' } },
    { id: 'integer-array', label: 'integer array', importance: 'incidental' },
  ],
  constraintDistractors: [
    { id: 'sort-required', text: 'The input must be sorted before any useful work can begin.', feedback: 'Sorting is one possible trade-off, but the contract does not require it and sorting complicates recovery of original indices.' },
    { id: 'inspect-all-pairs', text: 'Every pair must be inspected explicitly.', feedback: 'This assumes pair search is the only representation. Rewriting x + y = target exposes a direct complement lookup.' },
  ],
  operationContract: {
    operationOptions: [
      { id: 'membership', label: 'Test whether target − current has appeared', required: true, feedback: 'Without complement membership, the algorithm cannot know whether the current value completes a pair.' },
      { id: 'retrieve-index', label: 'Recover the earlier complement’s index', required: true, feedback: 'The output is a pair of indices, so membership alone is insufficient.' },
      { id: 'record-current', label: 'Associate the current value with its index', required: true, feedback: 'A later value needs this association to return the earlier position.' },
      { id: 'global-min', label: 'Read the globally smallest value', required: false, feedback: 'Priority access does not answer whether one specific complementary value has appeared.' },
      { id: 'fifo', label: 'Remove the oldest value first', required: false, feedback: 'Arrival order does not decide which earlier value is the needed complement.' },
    ],
    structures: [
      { id: 'map', label: 'Hash map: value → index', satisfiesOperationIds: ['membership', 'retrieve-index', 'record-current'], tradeoff: 'Expected O(1) keyed lookup and index recovery, with O(n) auxiliary space.' },
      { id: 'set', label: 'Hash set of values', satisfiesOperationIds: ['membership', 'record-current'], tradeoff: 'A set answers membership but does not retain the index that must be returned.' },
      { id: 'heap', label: 'Min heap', satisfiesOperationIds: ['global-min'], tradeoff: 'A heap exposes an extreme value, not arbitrary lookup by complement.' },
    ],
    correctStructureIds: ['map'],
  },
  maintainedState: {
    checkpoint: { input: 'nums = [2, 7, 11, 15], target = 9; current index = 1', stateDescription: 'The scan has already processed index 0 and is deciding whether nums[1] completes the answer.' },
    items: [
      { id: 'seen-map', label: 'Earlier value → original index associations', classification: 'required', feedback: 'The next decision needs both complement membership and the earlier index.' },
      { id: 'current-index', label: 'The current value and index', classification: 'required', feedback: 'The complement and returned pair both depend on the current scan position.' },
      { id: 'target', label: 'The target sum', classification: 'required', feedback: 'The needed complement is recomputed as target − current.' },
      { id: 'tested-pairs', label: 'A list of every pair already tested', classification: 'discardable', feedback: 'The map summarizes the only useful result of earlier work; individual failed pairs cannot affect a later lookup.' },
      { id: 'seen-values-copy', label: 'A second list containing every earlier value', classification: 'optional-redundant', feedback: 'The map already retains those values as keys, so a second list is correct but unnecessary.' },
    ],
    minimalRequiredSets: [['seen-map', 'current-index', 'target']],
    maxItems: 3,
  },
  transferRelations: {
    mutation: {
      original: { title: 'Two Sum', contract: 'The entire array is available. Return the indices of one valid pair.' },
      mutation: { label: 'Values now arrive as a stream. Report the first pair when it becomes knowable.', removedText: ['The entire array is available before processing.'], addedText: ['Values arrive one at a time.', 'Report immediately when a pair becomes known.'] },
      aspects: [
        { id: 'map-state', label: 'Value → earlier index state', correctImpact: 'unchanged', feedback: 'The same earlier-value lookup is sufficient because every valid reported pair ends at the newest value.' },
        { id: 'iteration', label: 'Iteration model', correctImpact: 'modified', feedback: 'A fixed array loop becomes an event-driven step for each arriving value.' },
        { id: 'output-timing', label: 'Output timing', correctImpact: 'new', feedback: 'The original solution could return during a loop; the stream contract makes immediate reporting an explicit requirement.' },
        { id: 'complexity', label: 'Expected work per value', correctImpact: 'unchanged', feedback: 'Each arrival still performs expected O(1) lookup and insertion.' },
      ],
    },
  },
}

const longestSubstring: ProblemReasoningModel = {
  reviewed: true,
  sourceText: 'Given a string, return the length of its longest substring without repeating characters.',
  decisiveConstraints: [
    { id: 'substring', label: 'substring', importance: 'decisive', consequence: { id: 'contiguous-region', text: 'Every candidate answer is one contiguous region.', feedback: 'A substring uses consecutive positions, so two boundaries can represent the active candidate.' } },
    { id: 'without-repeat', label: 'without repeating characters', importance: 'decisive', consequence: { id: 'repair-violation', text: 'A duplicate is a validity violation that must be repaired.', feedback: 'The active region remains a candidate only while each character occurs at most once.' } },
    { id: 'longest', label: 'return the length of the longest', importance: 'supporting', consequence: { id: 'retain-best', text: 'Keep the best valid length seen so far.', feedback: 'Earlier valid windows can be forgotten after their maximum length is summarized.' } },
    { id: 'string-input', label: 'given a string', importance: 'incidental' },
  ],
  constraintDistractors: [
    { id: 'subsequence-state', text: 'Keep arbitrary non-adjacent character choices.', feedback: 'That representation solves a subsequence problem; substring candidates must remain contiguous.' },
    { id: 'sort-characters', text: 'Sort the characters to place duplicates together.', feedback: 'Sorting destroys the original adjacency that defines a substring.' },
  ],
  operationContract: {
    operationOptions: [
      { id: 'detect-duplicate', label: 'Detect whether the new character violates the active region', required: true, feedback: 'The algorithm must know when expansion breaks uniqueness.' },
      { id: 'locate-duplicate', label: 'Find the duplicate’s most recent relevant position', required: true, feedback: 'The last relevant position tells the left boundary how far it can jump safely.' },
      { id: 'update-position', label: 'Record the newest position for this character', required: true, feedback: 'Future duplicates must compare against the newest occurrence.' },
      { id: 'sort-window', label: 'Maintain the region in sorted order', required: false, feedback: 'Ordering characters does not preserve or repair their original contiguous positions.' },
      { id: 'store-substrings', label: 'Store every valid substring', required: false, feedback: 'Only the best length and current candidate affect future decisions.' },
    ],
    structures: [
      { id: 'last-map', label: 'Hash map: character → last index', satisfiesOperationIds: ['detect-duplicate', 'locate-duplicate', 'update-position'], tradeoff: 'Supports direct boundary jumps using O(k) state for k distinct characters.' },
      { id: 'set', label: 'Set of characters in the current window', satisfiesOperationIds: ['detect-duplicate', 'update-position'], tradeoff: 'A set supports uniqueness but requires moving left one position at a time to locate removal points.' },
      { id: 'sorted-list', label: 'Sorted list of active characters', satisfiesOperationIds: ['sort-window'], tradeoff: 'Sorting adds work and loses the position needed for direct boundary repair.' },
    ],
    correctStructureIds: ['last-map'],
  },
  maintainedState: {
    checkpoint: { input: 's = "abba", right = 3, current character = "a"', stateDescription: 'The active valid window begins at index 2 before the final character is processed.' },
    items: [
      { id: 'last-index', label: 'Most recent index of each character', classification: 'required', feedback: 'The latest relevant occurrence determines whether and where the left boundary may move.' },
      { id: 'left', label: 'Current left boundary', classification: 'required', feedback: 'The algorithm must prevent an older occurrence outside the active window from moving left backward.' },
      { id: 'best', label: 'Best valid length so far', classification: 'required', feedback: 'Once an earlier window ends, its exact contents can be replaced by its best length.' },
      { id: 'all-substrings', label: 'Every substring inspected earlier', classification: 'discardable', feedback: 'Past substrings cannot become future candidates; their useful result is already summarized by best.' },
      { id: 'frequency-copy', label: 'A second frequency table for the same active window', classification: 'optional-redundant', feedback: 'It can represent validity, but the last-index map already supports the chosen direct-jump transition.' },
    ],
    minimalRequiredSets: [['last-index', 'left', 'best']],
    maxItems: 3,
  },
  transferRelations: {
    analogy: {
      problemA: { title: 'Longest substring without repeats', contract: 'Find the longest contiguous string region in which each character occurs at most once.' },
      problemB: { title: 'Longest subarray with at most K distinct values', contract: 'Find the longest contiguous array region containing no more than K distinct values.' },
      roles: [
        { id: 'candidate', label: 'Active candidate', problemAChoiceId: 'a-window', problemBChoiceId: 'b-window', explanation: 'Both candidates are represented by a contiguous window between left and right boundaries.' },
        { id: 'violation', label: 'Violation signal', problemAChoiceId: 'a-duplicate', problemBChoiceId: 'b-too-many', explanation: 'The exact rule differs, but each signal says the expanded window is invalid.' },
        { id: 'repair', label: 'Repair action', problemAChoiceId: 'a-shrink', problemBChoiceId: 'b-shrink', explanation: 'Both algorithms advance left until the maintained validity rule is restored.' },
        { id: 'summary', label: 'Maintained summary', problemAChoiceId: 'a-last', problemBChoiceId: 'b-counts', explanation: 'Each summary answers whether the active window violates its problem-specific rule.' },
      ],
      choicesA: [
        { id: 'a-window', label: 'Current substring boundaries' }, { id: 'a-duplicate', label: 'A repeated character in the window' },
        { id: 'a-shrink', label: 'Move left past the blocking occurrence' }, { id: 'a-last', label: 'Last relevant character positions' },
        { id: 'a-sort', label: 'A sorted copy of the string' },
      ],
      choicesB: [
        { id: 'b-window', label: 'Current subarray boundaries' }, { id: 'b-too-many', label: 'Distinct count exceeds K' },
        { id: 'b-shrink', label: 'Move left until at most K remain' }, { id: 'b-counts', label: 'Active value frequencies' },
        { id: 'b-prefix', label: 'All prefix sums' },
      ],
      sharedFormalTerm: { name: 'Variable-size sliding window', definition: 'A contiguous candidate region that expands for progress and shrinks only to restore a validity rule.' },
    },
  },
}

const binarySearch: ProblemReasoningModel = {
  reviewed: true,
  sourceText: 'Given a sorted array of unique integers and a target, return the target index or −1. The algorithm must run in O(log n) time.',
  decisiveConstraints: [
    { id: 'sorted', label: 'sorted array', importance: 'decisive', consequence: { id: 'eliminate-side', text: 'One midpoint comparison can rule out an entire side.', feedback: 'Ordering connects the midpoint comparison to every value on its left and right.' } },
    { id: 'log-time', label: 'must run in O(log n) time', importance: 'decisive', consequence: { id: 'shrink-fraction', text: 'The remaining candidate set must shrink by a constant fraction.', feedback: 'Removing only one candidate per step would still permit linear work.' } },
    { id: 'return-index', label: 'return the target index', importance: 'supporting', consequence: { id: 'preserve-position', text: 'The search state must retain array positions.', feedback: 'Boundary indices preserve the location needed for the returned result.' } },
    { id: 'unique', label: 'unique integers', importance: 'incidental' },
  ],
  constraintDistractors: [
    { id: 'scan-all', text: 'Inspect every value to prove the target is absent.', feedback: 'Sorted order makes whole ranges provably impossible after one comparison.' },
    { id: 'hash-required', text: 'Build a hash map before searching.', feedback: 'A map can answer lookup, but preprocessing is linear and ignores the required logarithmic search path.' },
  ],
  operationContract: {
    operationOptions: [
      { id: 'mid-access', label: 'Read the middle candidate directly', required: true, feedback: 'Halving requires direct access to the midpoint of the active range.' },
      { id: 'compare', label: 'Compare the midpoint value with the target', required: true, feedback: 'The comparison determines which ordered side can still contain the target.' },
      { id: 'move-boundary', label: 'Replace one active boundary', required: true, feedback: 'Discarding a side is represented by moving left or right past the midpoint.' },
      { id: 'insert', label: 'Insert values during the search', required: false, feedback: 'The input is already available and ordered; the search does not create new candidates.' },
      { id: 'minimum', label: 'Repeatedly remove the smallest value', required: false, feedback: 'The target may be anywhere; global-minimum access does not halve the correct side.' },
    ],
    structures: [
      { id: 'array-bounds', label: 'Array with left and right indices', satisfiesOperationIds: ['mid-access', 'compare', 'move-boundary'], tradeoff: 'O(1) indexed access and constant boundary state support logarithmic elimination.' },
      { id: 'linked-list', label: 'Linked list with two endpoints', satisfiesOperationIds: ['compare', 'move-boundary'], tradeoff: 'Finding a midpoint in a linked list is not constant time, so repeated halving does not yield O(log n) total work.' },
      { id: 'heap', label: 'Min heap', satisfiesOperationIds: ['minimum'], tradeoff: 'A heap supports extreme-value access, not direct midpoint access in sorted rank order.' },
    ],
    correctStructureIds: ['array-bounds'],
  },
  maintainedState: {
    checkpoint: { input: 'nums = [-1, 0, 3, 5, 9, 12], target = 9; left = 3, right = 5', stateDescription: 'Values at indices 0 through 2 have already been ruled out.' },
    items: [
      { id: 'left-right', label: 'Inclusive left and right candidate boundaries', classification: 'required', feedback: 'These boundaries define every index that can still contain the target.' },
      { id: 'target', label: 'The target value', classification: 'required', feedback: 'Every midpoint comparison is relative to the target.' },
      { id: 'array', label: 'The sorted input array', classification: 'required', feedback: 'The next midpoint value and the ordering relation come from the input.' },
      { id: 'discarded-values', label: 'A list of values already ruled out', classification: 'discardable', feedback: 'The boundaries already prove those positions impossible, so their values cannot affect a future decision.' },
      { id: 'mid-history', label: 'Every midpoint visited so far', classification: 'optional-redundant', feedback: 'Keeping the history does not break correctness, but current boundaries summarize all useful consequences.' },
    ],
    minimalRequiredSets: [['left-right', 'target', 'array']],
    maxItems: 3,
  },
  transferRelations: {
    nearTwin: {
      baseProblem: { title: 'Sorted membership search', contract: 'Given a sorted array, decide whether target is present.' },
      variantProblem: { title: 'Unsorted membership search', contract: 'Given an unsorted array, decide whether target is present.' },
      changedFactIds: ['ordering-removed'],
      facts: [
        { id: 'ordering-removed', label: 'The guarantee that values are sorted was removed.', feedback: 'Without global ordering, a midpoint comparison says nothing about uninspected values on either side.' },
        { id: 'same-output', label: 'Both problems ask whether the target exists.', feedback: 'The output is the same, but output wording does not justify directional elimination.' },
        { id: 'array-type', label: 'Both inputs are arrays.', feedback: 'Indexed access reaches a midpoint, but only ordering lets that midpoint eliminate a side.' },
      ],
      relationshipOptions: [
        { id: 'same', label: 'The same directional elimination remains valid.', feedback: 'This assumes midpoint position predicts nearby values even after the ordering guarantee disappears.' },
        { id: 'modified', label: 'The core idea survives with a different midpoint formula.', feedback: 'Changing the midpoint cannot restore information about how values are arranged.' },
        { id: 'invalid', label: 'The original elimination rule is no longer justified.', feedback: 'This is the relationship to test; now identify the contract property responsible.' },
      ],
      correctRelationshipId: 'invalid',
      decisiveReasonIds: ['ordering-removed'],
    },
  },
}

const levelOrder: ProblemReasoningModel = {
  reviewed: true,
  sourceText: 'Given the root of a binary tree, return its node values level by level from left to right.',
  decisiveConstraints: [
    { id: 'level-by-level', label: 'level by level', importance: 'decisive', consequence: { id: 'frontier-order', text: 'Finish the current depth before processing the next depth.', feedback: 'Level order groups nodes by equal distance from the root, so the active frontier must preserve discovery order.' } },
    { id: 'left-to-right', label: 'from left to right', importance: 'supporting', consequence: { id: 'enqueue-order', text: 'Add each parent’s left child before its right child.', feedback: 'FIFO processing preserves the sibling order used when children enter the next frontier.' } },
    { id: 'grouped-output', label: 'return values grouped by level', importance: 'decisive', consequence: { id: 'level-boundary', text: 'Record how many queued nodes belong to the current level.', feedback: 'A queue alone preserves visit order; a level-size boundary determines where one output group ends.' } },
    { id: 'binary-tree', label: 'binary tree', importance: 'incidental' },
  ],
  constraintDistractors: [
    { id: 'deepest-first', text: 'Follow one root-to-leaf path before considering siblings.', feedback: 'Depth-first progress mixes depths instead of completing one level as a group.' },
    { id: 'sort-values', text: 'Sort node values within each level.', feedback: 'The contract asks for structural left-to-right order, not numeric order.' },
  ],
  operationContract: {
    operationOptions: [
      { id: 'remove-oldest', label: 'Process the oldest discovered node', required: true, feedback: 'FIFO order ensures all nodes at depth d are processed before nodes at depth d + 1.' },
      { id: 'append-children', label: 'Append children for later processing', required: true, feedback: 'Children form the future frontier and must remain behind the current frontier.' },
      { id: 'measure-level', label: 'Measure the current frontier before expanding it', required: true, feedback: 'The saved frontier size identifies exactly which nodes belong in the current output row.' },
      { id: 'remove-newest', label: 'Process the newest discovered node first', required: false, feedback: 'LIFO order follows depth before finishing the current level.' },
      { id: 'priority-value', label: 'Process the smallest node value first', required: false, feedback: 'Node value does not determine level or left-to-right structural order.' },
    ],
    structures: [
      { id: 'queue', label: 'FIFO queue plus a saved level size', satisfiesOperationIds: ['remove-oldest', 'append-children', 'measure-level'], tradeoff: 'Stores at most one tree frontier and preserves breadth-first discovery order.' },
      { id: 'stack', label: 'LIFO stack', satisfiesOperationIds: ['remove-newest', 'append-children'], tradeoff: 'A stack naturally follows one branch and does not preserve a complete level frontier.' },
      { id: 'heap', label: 'Min heap ordered by node value', satisfiesOperationIds: ['priority-value', 'append-children'], tradeoff: 'Value priority changes the structural order required by the output.' },
    ],
    correctStructureIds: ['queue'],
  },
  maintainedState: {
    checkpoint: { input: 'Tree: [3, 9, 20, null, null, 15, 7]; queue = [9, 20]', stateDescription: 'The root level is complete. The next output group must contain exactly the two queued nodes.' },
    items: [
      { id: 'queue', label: 'Queue containing the discovered frontier', classification: 'required', feedback: 'The queue preserves which node is next and which children are waiting behind it.' },
      { id: 'level-size', label: 'Number of nodes in the current level', classification: 'required', feedback: 'Saving the size before expansion prevents newly enqueued children from entering the current output group.' },
      { id: 'result', label: 'Completed output levels', classification: 'required', feedback: 'The required return value must retain each completed level.' },
      { id: 'visited-set', label: 'A visited set for node identities', classification: 'discardable', feedback: 'A tree has one path from the root to each node, so children cannot lead back to an already visited node.' },
      { id: 'ancestor-list', label: 'A list of every completed ancestor', classification: 'optional-redundant', feedback: 'Those values already exist in the output; a second ancestor list adds no future capability.' },
    ],
    minimalRequiredSets: [['queue', 'level-size', 'result']],
    maxItems: 3,
  },
  transferRelations: {
    analogy: {
      problemA: { title: 'Binary tree level order', contract: 'Return tree nodes grouped by distance from the root.' },
      problemB: { title: 'Unweighted graph distances', contract: 'Find each reachable vertex’s shortest number of edges from a start vertex.' },
      roles: [
        { id: 'frontier', label: 'Current frontier', problemAChoiceId: 'a-level', problemBChoiceId: 'b-distance-layer', explanation: 'Each frontier contains nodes at the same number of edges from the start.' },
        { id: 'advance', label: 'Advance action', problemAChoiceId: 'a-children', problemBChoiceId: 'b-neighbors', explanation: 'Processing a frontier discovers adjacent nodes for the next layer.' },
        { id: 'order', label: 'Processing order', problemAChoiceId: 'a-fifo', problemBChoiceId: 'b-fifo', explanation: 'FIFO order completes distance d before any node at distance d + 1.' },
      ],
      choicesA: [{ id: 'a-level', label: 'Queued nodes at one depth' }, { id: 'a-children', label: 'Enqueue left and right children' }, { id: 'a-fifo', label: 'Remove the oldest queued node' }, { id: 'a-root-path', label: 'One root-to-leaf path' }],
      choicesB: [{ id: 'b-distance-layer', label: 'Queued vertices at one distance' }, { id: 'b-neighbors', label: 'Enqueue unvisited neighbors' }, { id: 'b-fifo', label: 'Remove the oldest queued vertex' }, { id: 'b-min-weight', label: 'Choose the lightest edge' }],
      sharedFormalTerm: { name: 'Breadth-first search', definition: 'A traversal that processes a complete distance frontier before advancing to the next one.' },
    },
  },
}

const courseSchedule: ProblemReasoningModel = {
  reviewed: true,
  sourceText: 'Courses have directed prerequisite pairs. Return whether all courses can be completed.',
  decisiveConstraints: [
    { id: 'prerequisite', label: 'prerequisite pairs', importance: 'decisive', consequence: { id: 'directed-dependency', text: 'Model each prerequisite as a directed dependency.', feedback: 'A prerequisite points from the course that must occur first to the course it unlocks.' } },
    { id: 'all-courses', label: 'whether all courses can be completed', importance: 'decisive', consequence: { id: 'cycle-test', text: 'The solution must detect whether a dependency cycle blocks completion.', feedback: 'A directed cycle leaves every course in that cycle waiting on another unfinished course.' } },
    { id: 'course-count', label: 'number of courses is known', importance: 'supporting', consequence: { id: 'processed-count', text: 'Compare the number processed with the total course count.', feedback: 'Processing all n courses proves no dependency cycle left a course blocked.' } },
    { id: 'integer-labels', label: 'courses are labeled with integers', importance: 'incidental' },
  ],
  constraintDistractors: [
    { id: 'shortest-path', text: 'Compute the shortest path between every pair of courses.', feedback: 'The contract asks whether dependencies are acyclic, not how far courses are from each other.' },
    { id: 'sort-labels', text: 'Taking courses in numeric-label order is always valid.', feedback: 'Labels carry no prerequisite meaning; only directed edges determine valid order.' },
  ],
  operationContract: {
    operationOptions: [
      { id: 'count-prereqs', label: 'Track each course’s remaining prerequisites', required: true, feedback: 'A course becomes available exactly when this count reaches zero.' },
      { id: 'unlock', label: 'Find courses unlocked by a completed course', required: true, feedback: 'Outgoing dependency edges identify which remaining counts must decrease.' },
      { id: 'take-ready', label: 'Retrieve a course with zero remaining prerequisites', required: true, feedback: 'Only currently unblocked courses can be processed safely.' },
      { id: 'minimum-label', label: 'Always retrieve the smallest numeric label', required: false, feedback: 'Any zero-indegree course is safe; numeric order is irrelevant to feasibility.' },
      { id: 'reverse-edge', label: 'Follow prerequisites only from course to prerequisite', required: false, feedback: 'That direction does not directly identify which courses a completion unlocks.' },
    ],
    structures: [
      { id: 'graph-queue', label: 'Adjacency list + indegree array + queue', satisfiesOperationIds: ['count-prereqs', 'unlock', 'take-ready'], tradeoff: 'Stores O(V + E) dependency state and processes each course and prerequisite once.' },
      { id: 'heap-label', label: 'Min heap of all course labels', satisfiesOperationIds: ['minimum-label'], tradeoff: 'Label priority does not ensure prerequisites are satisfied.' },
      { id: 'edge-list', label: 'Unindexed list of prerequisite pairs', satisfiesOperationIds: ['count-prereqs'], tradeoff: 'Counts can be derived, but finding every newly unlocked course would repeatedly scan all edges.' },
    ],
    correctStructureIds: ['graph-queue'],
  },
  maintainedState: {
    checkpoint: { input: 'numCourses = 4; prerequisites = [[1,0],[2,0],[3,1],[3,2]]', stateDescription: 'Course 0 has been completed. Courses 1 and 2 have just become available.' },
    items: [
      { id: 'indegree', label: 'Remaining prerequisite count for each course', classification: 'required', feedback: 'The transition needs to know exactly when a dependent course becomes unblocked.' },
      { id: 'adjacency', label: 'Courses unlocked by each completed course', classification: 'required', feedback: 'Outgoing edges identify which prerequisite counts to decrement.' },
      { id: 'ready-queue', label: 'Queue of currently unblocked courses', classification: 'required', feedback: 'The next safe course must be retrieved from the zero-prerequisite frontier.' },
      { id: 'processed-count', label: 'Number of courses completed by the traversal', classification: 'required', feedback: 'Comparing this count with numCourses distinguishes complete processing from a cycle-stalled traversal.' },
      { id: 'all-orders', label: 'Every valid course ordering', classification: 'discardable', feedback: 'The original contract asks only whether completion is possible, so enumerating orders adds no needed evidence.' },
      { id: 'processed-list', label: 'A list of processed course labels', classification: 'optional-redundant', feedback: 'A list is correct, but a scalar count is sufficient when no ordering must be returned.' },
    ],
    minimalRequiredSets: [['indegree', 'adjacency', 'ready-queue', 'processed-count']],
    maxItems: 4,
  },
  transferRelations: {
    mutation: {
      original: { title: 'Course Schedule', contract: 'Return whether every course can be completed.' },
      mutation: { label: 'Return one valid course ordering instead of a boolean.', removedText: ['Return true or false.'], addedText: ['Return one valid ordering of all courses.'] },
      aspects: [
        { id: 'indegree-state', label: 'Indegree and adjacency state', correctImpact: 'unchanged', feedback: 'The same dependency state determines which course is safe to take next.' },
        { id: 'ready-frontier', label: 'Zero-indegree frontier', correctImpact: 'unchanged', feedback: 'Any course in this frontier still preserves prerequisite correctness.' },
        { id: 'output', label: 'Output state', correctImpact: 'new', feedback: 'The traversal must now append each processed course so the ordering can be returned.' },
        { id: 'success-check', label: 'Final success check', correctImpact: 'modified', feedback: 'A complete list can be returned on success; an incomplete list still signals a cycle and must produce the specified failure result.' },
        { id: 'complexity', label: 'Asymptotic time and space', correctImpact: 'unchanged', feedback: 'Recording V output items does not exceed the existing O(V + E) graph state and traversal work.' },
      ],
    },
  },
}

export const PILOT_REASONING_MODELS: Record<number, ProblemReasoningModel> = {
  1: twoSum,
  3: longestSubstring,
  704: binarySearch,
  102: levelOrder,
  207: courseSchedule,
}

export const INTUITION_PILOT_IDS = new Set(Object.keys(PILOT_REASONING_MODELS).map(Number))
