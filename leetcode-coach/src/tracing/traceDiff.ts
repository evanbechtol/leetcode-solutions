import type { TraceSnapshot, TraceStructure, TraceValue } from './types'
import { traceValueEquals } from './traceValues'

export interface TraceChange {
  id: string
  kind: 'added' | 'changed' | 'removed'
  before?: TraceValue
  after?: TraceValue
}

const structureValues = (structure: TraceStructure): Record<string, TraceValue> => {
  if (structure.kind === 'array') return Object.fromEntries(structure.items.flatMap((item) => [
    [`${item.id}:value`, item.value],
    ...(item.status ? [[`${item.id}:status`, { kind: 'string', value: item.status } as TraceValue] as const] : []),
  ]))
  return Object.fromEntries(structure.entries.flatMap((entry) => [
    [`${entry.id}:key`, entry.key],
    [`${entry.id}:value`, entry.value],
    ...(entry.status ? [[`${entry.id}:status`, { kind: 'string', value: entry.status } as TraceValue] as const] : []),
  ]))
}

const diffValues = (before: Record<string, TraceValue>, after: Record<string, TraceValue>, prefix: string): TraceChange[] =>
  [...new Set([...Object.keys(before), ...Object.keys(after)])].flatMap((id) => {
    const previous = before[id]
    const next = after[id]
    if (!previous) return [{ id: `${prefix}${id}`, kind: 'added' as const, after: next }]
    if (!next) return [{ id: `${prefix}${id}`, kind: 'removed' as const, before: previous }]
    return traceValueEquals(previous, next) ? [] : [{ id: `${prefix}${id}`, kind: 'changed' as const, before: previous, after: next }]
  })

export const diffSnapshots = (before: TraceSnapshot, after: TraceSnapshot): TraceChange[] => {
  const variablesBefore = Object.fromEntries(Object.entries(before.variables).map(([id, variable]) => [id, variable.value]))
  const variablesAfter = Object.fromEntries(Object.entries(after.variables).map(([id, variable]) => [id, variable.value]))
  const structureIds = new Set([...Object.keys(before.structures), ...Object.keys(after.structures)])
  return [
    ...diffValues(variablesBefore, variablesAfter, 'variable:'),
    ...[...structureIds].flatMap((id) => diffValues(
      before.structures[id] ? structureValues(before.structures[id]) : {},
      after.structures[id] ? structureValues(after.structures[id]) : {},
      `structure:${id}:`,
    )),
    ...(traceValueEquals(before.output, after.output) ? [] : [{ id: 'output', kind: 'changed' as const, before: before.output, after: after.output }]),
  ]
}
