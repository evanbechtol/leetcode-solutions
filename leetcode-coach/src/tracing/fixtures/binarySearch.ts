import { defineAnchors } from '../codeAnchors'
import { registerInvariantAssertion } from '../invariantAssertions'
import { createTraceBuilder } from '../traceBuilder'
import type { TraceArrayItem, TraceSnapshot, TraceVariable } from '../types'
import { traceValue as value } from '../traceValues'

const nums = [-1, 0, 3, 5, 9, 12]
const pending = value.pending()
const variable = (id: string, role: TraceVariable['role'], item: TraceVariable['value']): TraceVariable => ({ id, name: id, role, value: item })

interface State { left?: number; right?: number; mid?: number; comparison?: -1 | 0 | 1; output?: number; discardedThrough?: number }
const snapshot = ({ left, right, mid, comparison, output, discardedThrough = -1 }: State = {}): TraceSnapshot => {
  const variables: Record<string, TraceVariable> = {
    target: variable('target', 'input', value.number(9)),
    output: variable('output', 'output', output === undefined ? pending : value.number(output)),
  }
  if (left !== undefined) variables.left = variable('left', 'control', value.number(left))
  if (right !== undefined) variables.right = variable('right', 'control', value.number(right))
  if (mid !== undefined) {
    variables.mid = variable('mid', 'state', value.number(mid))
    variables['nums[mid]'] = variable('nums[mid]', 'state', value.number(nums[mid]))
  }
  if (comparison !== undefined) variables.comparison = variable('comparison', 'state', value.string(comparison === 0 ? 'equal' : comparison < 0 ? 'less than target' : 'greater than target'))
  const items: TraceArrayItem[] = nums.map((item, index) => ({
    id: `nums-${index}`,
    index,
    value: value.number(item),
    status: output === index ? 'result' : index <= discardedThrough ? 'discarded' : index === mid ? 'active' : left !== undefined && right !== undefined && index >= left && index <= right ? 'candidate' : undefined,
  }))
  return {
    variables,
    structures: { nums: { id: 'nums', name: 'nums', kind: 'array', description: 'Sorted candidates at stable input indices', items } },
    output: output === undefined ? pending : value.number(output),
  }
}

const anchors = defineAnchors([
  { id: 'function-entry', rangesByLanguage: { TypeScript: { startLine: 0, endLine: 0 } } },
  { id: 'initialize-bounds', rangesByLanguage: { TypeScript: { startLine: 1, endLine: 1 } } },
  { id: 'loop-condition', rangesByLanguage: { TypeScript: { startLine: 2, endLine: 2 } } },
  { id: 'compute-mid', rangesByLanguage: { TypeScript: { startLine: 3, endLine: 3 } } },
  { id: 'compare-mid', rangesByLanguage: { TypeScript: { startLine: 4, endLine: 5 } } },
  { id: 'move-left', rangesByLanguage: { TypeScript: { startLine: 5, endLine: 5 } } },
  { id: 'return-mid', rangesByLanguage: { TypeScript: { startLine: 4, endLine: 4 } } },
])

registerInvariantAssertion('binary-search:target-remains', (state) => {
  if (state.output.kind === 'number') return state.output.value === 4
  const left = state.variables.left?.value
  const right = state.variables.right?.value
  if (!left || !right) return true
  return left.kind === 'number' && right.kind === 'number' && left.value <= 4 && 4 <= right.value
})

export const produceBinarySearchTrace = () => createTraceBuilder({
  problemId: 704,
  fixtureId: 'binary-search:canonical-example-1',
  inputLabel: 'nums = [-1, 0, 3, 5, 9, 12], target = 9',
  expectedOutput: value.number(4),
  initialState: snapshot(),
  anchors,
  termination: 'Return mid when nums[mid] equals target; otherwise stop after the interval becomes empty.',
})
  .transition({ id: 'initialize-bounds', title: 'Initialize the search interval', action: 'Set left = 0 and right = 5.', after: snapshot({ left: 0, right: 5 }), events: [{ kind: 'initialize', targetId: 'left', description: 'Set inclusive boundaries to the full array.' }], anchorId: 'initialize-bounds', invariant: { statement: 'If target exists, its index is within [left, right].', status: 'holds', assertionId: 'binary-search:target-remains' } })
  .transition({ id: 'check-first-interval', title: 'Check that candidates remain', action: 'Evaluate left <= right: 0 <= 5 is true.', after: snapshot({ left: 0, right: 5 }), events: [{ kind: 'compare', targetId: 'left,right', description: 'Compare the inclusive interval boundaries.', result: true }], anchorId: 'loop-condition', invariant: { statement: 'Index 4 remains within [0, 5].', status: 'holds', assertionId: 'binary-search:target-remains' } })
  .transition({ id: 'compute-mid-2', title: 'Compute midpoint 2', action: 'mid = 0 + floor((5 - 0) / 2) = 2.', after: snapshot({ left: 0, right: 5, mid: 2 }), events: [{ kind: 'compute', targetId: 'mid', description: 'Compute an overflow-safe midpoint.' }], anchorId: 'compute-mid', invariant: { statement: 'The midpoint belongs to the current candidate interval.', status: 'holds', assertionId: 'binary-search:target-remains' } })
  .transition({ id: 'compare-index-2', title: 'Compare nums[2] with target', action: 'nums[2] = 3, which is less than 9.', after: snapshot({ left: 0, right: 5, mid: 2, comparison: -1 }), events: [{ kind: 'compare', targetId: 'nums-2', description: 'Compare 3 with target 9.', result: false }], anchorId: 'compare-mid', invariant: { statement: 'Sorted order places target, if present, strictly to the right of index 2.', status: 'holds', assertionId: 'binary-search:target-remains' } })
  .transition({ id: 'discard-through-2', title: 'Discard the lower half', action: 'Set left = mid + 1 = 3, removing indices 0 through 2.', after: snapshot({ left: 3, right: 5, mid: 2, comparison: -1, discardedThrough: 2 }), events: [{ kind: 'discard-region', structureId: 'nums', from: 0, to: 2, description: 'Remove values proven smaller than target.' }, { kind: 'write', targetId: 'left', description: 'Move left to index 3.' }], anchorId: 'move-left', invariant: { statement: 'If target exists, its index is within the reduced interval [3, 5].', status: 'restored', assertionId: 'binary-search:target-remains' } })
  .transition({ id: 'compute-mid-4', title: 'Compute midpoint 4', action: 'mid = 3 + floor((5 - 3) / 2) = 4.', after: snapshot({ left: 3, right: 5, mid: 4, discardedThrough: 2 }), events: [{ kind: 'compute', targetId: 'mid', description: 'Compute the midpoint of [3, 5].' }], anchorId: 'compute-mid', invariant: { statement: 'Index 4 is inside the remaining candidate interval.', status: 'holds', assertionId: 'binary-search:target-remains' } })
  .transition({ id: 'compare-index-4', title: 'Match nums[4] to target', action: 'nums[4] = 9, which equals target.', after: snapshot({ left: 3, right: 5, mid: 4, comparison: 0, discardedThrough: 2 }), events: [{ kind: 'compare', targetId: 'nums-4', description: 'Compare 9 with target 9.', result: true }], anchorId: 'compare-mid', invariant: { statement: 'The equality check proves index 4 is a valid answer.', status: 'holds', assertionId: 'binary-search:target-remains' } })
  .transition({ id: 'return-index-4', title: 'Return the matching index', action: 'Return mid = 4.', after: snapshot({ left: 3, right: 5, mid: 4, comparison: 0, output: 4, discardedThrough: 2 }), events: [{ kind: 'return', description: 'Return index 4.' }], anchorId: 'return-mid', invariant: { statement: 'nums[4] equals target exactly.', status: 'holds', assertionId: 'binary-search:target-remains' } })
  .build()
