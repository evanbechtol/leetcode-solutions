import { defineAnchors } from '../codeAnchors'
import { registerInvariantAssertion } from '../invariantAssertions'
import { createTraceBuilder } from '../traceBuilder'
import type { TraceArrayItem, TraceMapEntry, TraceSnapshot, TraceVariable } from '../types'
import { traceValue as value } from '../traceValues'

const nums = [2, 7, 11, 15]
const pending = value.pending()

const variable = (id: string, role: TraceVariable['role'], item: TraceVariable['value']): TraceVariable => ({ id, name: id, role, value: item })
const arrayItems = (statuses: Record<number, TraceArrayItem['status']> = {}): TraceArrayItem[] => nums.map((item, index) => ({
  id: `nums-${index}`, index, value: value.number(item), status: statuses[index],
}))
const mapEntries = (entries: Array<[number, number]>, activeKey?: number): TraceMapEntry[] => entries.map(([key, index]) => ({
  id: `seen-${key}`, key: value.number(key), value: value.number(index), status: key === activeKey ? 'active' : 'processed',
}))

interface State {
  i?: number
  complement?: number
  lookup?: boolean
  entries?: Array<[number, number]>
  statuses?: Record<number, TraceArrayItem['status']>
  output?: number[]
}

const snapshot = ({ i, complement, lookup, entries, statuses, output }: State = {}): TraceSnapshot => {
  const variables: Record<string, TraceVariable> = {
    target: variable('target', 'input', value.number(9)),
    output: variable('output', 'output', output ? value.array(output.map(value.number)) : pending),
  }
  if (i !== undefined) {
    variables.i = variable('i', 'control', value.number(i))
    variables['nums[i]'] = variable('nums[i]', 'control', value.number(nums[i]))
  }
  if (complement !== undefined) variables.complement = variable('complement', 'state', value.number(complement))
  if (lookup !== undefined && complement !== undefined) variables[`seen.has(${complement})`] = variable(`seen.has(${complement})`, 'state', value.boolean(lookup))
  return {
    variables,
    structures: {
      nums: { id: 'nums', name: 'nums', kind: 'array', description: 'Original values at their stable input indices', items: arrayItems(statuses) },
      ...(entries ? { seen: { id: 'seen', name: 'seen', kind: 'map' as const, description: 'Previously processed value → original index', entries: mapEntries(entries, complement) } } : {}),
    },
    output: output ? value.array(output.map(value.number)) : pending,
  }
}

const anchors = defineAnchors([
  { id: 'function-entry', rangesByLanguage: { TypeScript: { startLine: 0, endLine: 0 } } },
  { id: 'initialize-map', rangesByLanguage: { TypeScript: { startLine: 1, endLine: 1 } } },
  { id: 'select-index', rangesByLanguage: { TypeScript: { startLine: 2, endLine: 2 } } },
  { id: 'compute-complement', rangesByLanguage: { TypeScript: { startLine: 3, endLine: 3 } } },
  { id: 'lookup-complement', rangesByLanguage: { TypeScript: { startLine: 4, endLine: 4 } } },
  { id: 'record-value', rangesByLanguage: { TypeScript: { startLine: 5, endLine: 5 } } },
  { id: 'return-match', rangesByLanguage: { TypeScript: { startLine: 4, endLine: 4 } } },
])

registerInvariantAssertion('two-sum:seen-is-consistent', (state) => {
  const seen = state.structures.seen
  if (!seen || seen.kind !== 'map') return true
  return seen.entries.every((entry) => entry.key.kind === 'number' && entry.value.kind === 'number' && nums[entry.value.value] === entry.key.value)
})

registerInvariantAssertion('two-sum:output-is-valid', (state) => {
  if (state.output.kind !== 'array' || state.output.items.length !== 2) return false
  const [left, right] = state.output.items
  return left.kind === 'number' && right.kind === 'number' && left.value !== right.value && nums[left.value] + nums[right.value] === 9
})

export const produceTwoSumTrace = () => createTraceBuilder({
  problemId: 1,
  fixtureId: 'two-sum:canonical-example-1',
  inputLabel: 'nums = [2, 7, 11, 15], target = 9',
  expectedOutput: value.array([value.number(0), value.number(1)]),
  initialState: snapshot(),
  anchors,
  termination: 'Return immediately when the complement is found at an earlier index.',
})
  .transition({ id: 'initialize-map', title: 'Create the lookup map', action: 'Initialize seen as an empty map.', after: snapshot({ entries: [] }), events: [{ kind: 'initialize', targetId: 'seen', description: 'Create an empty value-to-index map.' }], anchorId: 'initialize-map', invariant: { statement: 'Every entry in seen identifies the original index of a processed value.', status: 'holds', assertionId: 'two-sum:seen-is-consistent' } })
  .transition({ id: 'select-i-0', title: 'Select nums[0]', action: 'Set i to 0 and read nums[i] = 2.', after: snapshot({ i: 0, entries: [], statuses: { 0: 'active' } }), events: [{ kind: 'read', targetId: 'nums-0', description: 'Read the value 2 at index 0.' }], anchorId: 'select-index', invariant: { statement: 'seen contains only values from indices before i.', status: 'holds', assertionId: 'two-sum:seen-is-consistent' } })
  .transition({ id: 'complement-i-0', title: 'Compute the first complement', action: 'Compute complement = 9 - 2 = 7.', after: snapshot({ i: 0, complement: 7, entries: [], statuses: { 0: 'active' } }), events: [{ kind: 'compute', targetId: 'complement', description: 'Subtract nums[0] from target.' }], anchorId: 'compute-complement', invariant: { statement: 'A matching earlier value must equal complement.', status: 'holds', assertionId: 'two-sum:seen-is-consistent' } })
  .transition({ id: 'lookup-7', title: 'Look for 7', action: 'Check seen.has(7); it is false because seen is empty.', after: snapshot({ i: 0, complement: 7, lookup: false, entries: [], statuses: { 0: 'active' } }), events: [{ kind: 'compare', targetId: 'seen', description: 'Test whether key 7 exists in seen.', result: false }], anchorId: 'lookup-complement', invariant: { statement: 'The current element has not been inserted before its own lookup.', status: 'holds', assertionId: 'two-sum:seen-is-consistent' } })
  .transition({ id: 'insert-2', title: 'Remember nums[0]', action: 'Store seen.set(2, 0).', after: snapshot({ i: 0, complement: 7, lookup: false, entries: [[2, 0]], statuses: { 0: 'processed' } }), events: [{ kind: 'write', targetId: 'seen-2', description: 'Associate value 2 with its original index 0.' }], anchorId: 'record-value', invariant: { statement: 'Every map entry matches the value at its stored original index.', status: 'holds', assertionId: 'two-sum:seen-is-consistent' } })
  .transition({ id: 'select-i-1', title: 'Select nums[1]', action: 'Advance i to 1 and read nums[i] = 7.', after: snapshot({ i: 1, entries: [[2, 0]], statuses: { 0: 'processed', 1: 'active' } }), events: [{ kind: 'read', targetId: 'nums-1', description: 'Read the value 7 at index 1.' }], anchorId: 'select-index', invariant: { statement: 'seen contains only values from indices before i.', status: 'holds', assertionId: 'two-sum:seen-is-consistent' } })
  .transition({ id: 'complement-i-1', title: 'Compute the second complement', action: 'Compute complement = 9 - 7 = 2.', after: snapshot({ i: 1, complement: 2, entries: [[2, 0]], statuses: { 0: 'processed', 1: 'active' } }), events: [{ kind: 'compute', targetId: 'complement', description: 'Subtract nums[1] from target.' }], anchorId: 'compute-complement', invariant: { statement: 'A matching earlier value must equal complement.', status: 'holds', assertionId: 'two-sum:seen-is-consistent' } })
  .transition({ id: 'lookup-2', title: 'Find the earlier 2', action: 'Check seen.has(2); it is true and seen.get(2) is 0.', after: snapshot({ i: 1, complement: 2, lookup: true, entries: [[2, 0]], statuses: { 0: 'result', 1: 'result' } }), events: [{ kind: 'compare', targetId: 'seen-2', description: 'Test whether key 2 exists in seen.', result: true }, { kind: 'read', targetId: 'seen-2', description: 'Read the stored index 0.' }], anchorId: 'lookup-complement', invariant: { statement: 'The stored index is earlier than i, so the two elements are distinct.', status: 'holds', assertionId: 'two-sum:seen-is-consistent' } })
  .transition({ id: 'return-match', title: 'Return the matching indices', action: 'Return [seen.get(2), i] = [0, 1].', after: snapshot({ i: 1, complement: 2, lookup: true, entries: [[2, 0]], statuses: { 0: 'result', 1: 'result' }, output: [0, 1] }), events: [{ kind: 'return', description: 'Return indices 0 and 1.' }], anchorId: 'return-match', invariant: { statement: 'nums[0] + nums[1] = 9 and the indices are distinct.', status: 'holds', assertionId: 'two-sum:output-is-valid' } })
  .build()
