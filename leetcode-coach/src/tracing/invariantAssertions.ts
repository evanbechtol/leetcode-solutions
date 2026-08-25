import type { ExecutionTrace, TraceSnapshot } from './types'

export type InvariantAssertion = (snapshot: TraceSnapshot, trace: ExecutionTrace) => boolean

const assertions = new Map<string, InvariantAssertion>()

export const registerInvariantAssertion = (id: string, assertion: InvariantAssertion) => {
  if (assertions.has(id)) throw new Error(`Invariant assertion already registered: ${id}`)
  assertions.set(id, assertion)
}

export const runInvariantAssertion = (id: string, snapshot: TraceSnapshot, trace: ExecutionTrace): boolean => {
  const assertion = assertions.get(id)
  if (!assertion) throw new Error(`Unknown invariant assertion: ${id}`)
  return assertion(snapshot, trace)
}
