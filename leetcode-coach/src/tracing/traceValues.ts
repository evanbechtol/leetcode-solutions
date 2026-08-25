import type { TraceValue } from './types'

export const traceValue = {
  null: (): TraceValue => ({ kind: 'null' }),
  boolean: (value: boolean): TraceValue => ({ kind: 'boolean', value }),
  number: (value: number): TraceValue => ({ kind: 'number', value }),
  string: (value: string): TraceValue => ({ kind: 'string', value }),
  pending: (label = 'Not produced yet'): TraceValue => ({ kind: 'pending', label }),
  array: (items: TraceValue[]): TraceValue => ({ kind: 'array', items }),
}

export const traceValueEquals = (left: TraceValue, right: TraceValue): boolean =>
  JSON.stringify(left) === JSON.stringify(right)

export const formatTraceValue = (value: TraceValue): string => {
  switch (value.kind) {
    case 'null': return 'null'
    case 'boolean': return String(value.value)
    case 'number': return String(value.value)
    case 'string': return value.value
    case 'infinity': return value.sign === 1 ? 'Infinity' : '-Infinity'
    case 'node-reference': return value.nodeId ?? 'null'
    case 'array': return `[${value.items.map(formatTraceValue).join(', ')}]`
    case 'object': return `{ ${Object.entries(value.entries).map(([key, item]) => `${key}: ${formatTraceValue(item)}`).join(', ')} }`
    case 'pending': return value.label ?? 'Pending'
  }
}
