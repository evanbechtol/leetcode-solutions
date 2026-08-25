import type { ExecutionTrace } from './types'
import { assertValidExecutionTrace } from './traceValidation'

export type TraceProducer = () => ExecutionTrace

const producers = new Map<number, TraceProducer>()

export const registerTraceProducer = (problemId: number, producer: TraceProducer) => {
  if (producers.has(problemId)) throw new Error(`Trace producer already registered for problem ${problemId}.`)
  producers.set(problemId, producer)
}

export const exactTraceForProblem = (problemId: number): ExecutionTrace | null => {
  const producer = producers.get(problemId)
  return producer ? assertValidExecutionTrace(producer()) : null
}

export const exactTraceProblemIds = () => [...producers.keys()]
