import type { CodeAnchor, ExecutionTrace, InvariantCheckpoint, TraceEvent, TraceSnapshot, TraceTransition, TraceValue } from './types'

interface TraceBuilderConfig {
  problemId: number
  fixtureId: string
  inputLabel: string
  expectedOutput: TraceValue
  initialState: TraceSnapshot
  anchors: Record<string, CodeAnchor>
  termination: string
}

interface TransitionInput {
  id: string
  title: string
  action: string
  after: TraceSnapshot
  events: TraceEvent[]
  anchorId: string
  invariant: InvariantCheckpoint
}

export const createTraceBuilder = (config: TraceBuilderConfig) => {
  let current = structuredClone(config.initialState)
  const transitions: TraceTransition[] = []

  return {
    transition(input: TransitionInput) {
      transitions.push({ ...input, before: structuredClone(current), after: structuredClone(input.after) })
      current = structuredClone(input.after)
      return this
    },
    build(): ExecutionTrace {
      return {
        schemaVersion: 1,
        quality: 'exact-reviewed',
        ...config,
        initialState: structuredClone(config.initialState),
        transitions,
        finalOutput: structuredClone(current.output),
      }
    },
  }
}
