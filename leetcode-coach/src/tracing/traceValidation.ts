import { runInvariantAssertion } from './invariantAssertions'
import type { ExecutionTrace, TraceSnapshot, TraceStructure } from './types'
import { traceValueEquals } from './traceValues'

const snapshotEquals = (left: TraceSnapshot, right: TraceSnapshot) => JSON.stringify(left) === JSON.stringify(right)

const validateStructureIds = (structure: TraceStructure): boolean => {
  const ids = structure.kind === 'array' ? structure.items.map(({ id }) => id) : structure.entries.map(({ id }) => id)
  return ids.length === new Set(ids).size
}

export const validateExecutionTrace = (trace: ExecutionTrace): string[] => {
  const errors: string[] = []
  if (trace.schemaVersion !== 1) errors.push('Unsupported trace schema version.')
  if (!trace.transitions.length) errors.push('Trace must contain at least one transition.')
  if (!traceValueEquals(trace.expectedOutput, trace.finalOutput)) errors.push('Final output does not equal expected output.')

  let previous = trace.initialState
  const transitionIds = new Set<string>()
  for (const transition of trace.transitions) {
    if (transitionIds.has(transition.id)) errors.push(`Duplicate transition id: ${transition.id}`)
    transitionIds.add(transition.id)
    if (!snapshotEquals(previous, transition.before)) errors.push(`${transition.id}: before snapshot breaks trace continuity.`)
    if (!trace.anchors[transition.anchorId]) errors.push(`${transition.id}: unknown code anchor ${transition.anchorId}.`)
    if (!transition.events.length) errors.push(`${transition.id}: at least one semantic event is required.`)
    for (const structure of Object.values(transition.after.structures)) {
      if (!validateStructureIds(structure)) errors.push(`${transition.id}: ${structure.id} contains duplicate stable item ids.`)
    }
    const assertionId = transition.invariant.assertionId
    if (assertionId && ['holds', 'restored'].includes(transition.invariant.status)) {
      try {
        if (!runInvariantAssertion(assertionId, transition.after, trace)) errors.push(`${transition.id}: invariant assertion ${assertionId} failed.`)
      } catch (error) {
        errors.push(`${transition.id}: ${(error as Error).message}`)
      }
    }
    previous = transition.after
  }
  return errors
}

export const assertValidExecutionTrace = (trace: ExecutionTrace): ExecutionTrace => {
  const errors = validateExecutionTrace(trace)
  if (errors.length) throw new Error(`Invalid execution trace for problem ${trace.problemId}:\n${errors.join('\n')}`)
  return trace
}
