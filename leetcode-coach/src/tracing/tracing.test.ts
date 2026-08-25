import { describe, expect, it } from 'vitest'
import { traceToVisualizationFrames } from './compatibility'
import { registerPilotTraceFixtures } from './fixtures'
import { exactTraceForProblem, exactTraceProblemIds } from './registry'
import { diffSnapshots } from './traceDiff'
import { validateExecutionTrace } from './traceValidation'

registerPilotTraceFixtures()

describe('typed concrete tracing foundation', () => {
  it('registers only the approved Option 2 pilot problems', () => {
    expect(exactTraceProblemIds().sort((left, right) => left - right)).toEqual([1, 704])
  })

  it.each([
    [1, 9, '[0, 1]'],
    [704, 8, '4'],
  ])('builds and independently validates problem %i', (problemId, transitionCount, expectedOutput) => {
    const trace = exactTraceForProblem(problemId)!
    expect(trace.quality).toBe('exact-reviewed')
    expect(trace.transitions).toHaveLength(transitionCount)
    expect(validateExecutionTrace(trace)).toEqual([])
    expect(trace.finalOutput).toEqual(trace.expectedOutput)
    const frames = traceToVisualizationFrames(trace, 'TypeScript')
    expect(frames).toHaveLength(transitionCount + 1)
    expect(frames.at(-1)?.currentOutput).toBe(expectedOutput)
    expect(frames.every(({ activeCodeLines }) => activeCodeLines.length > 0)).toBe(true)
  })

  it('keeps Two Sum output pending until the explicit return transition', () => {
    const trace = exactTraceForProblem(1)!
    expect(trace.transitions.slice(0, -1).every(({ after }) => after.output.kind === 'pending')).toBe(true)
    expect(trace.transitions.at(-1)?.events).toContainEqual({ kind: 'return', description: 'Return indices 0 and 1.' })
  })

  it('derives changes from before and after snapshots instead of authored flags', () => {
    const trace = exactTraceForProblem(704)!
    const discard = trace.transitions.find(({ id }) => id === 'discard-through-2')!
    const changes = diffSnapshots(discard.before, discard.after)
    expect(changes).toContainEqual(expect.objectContaining({ id: 'variable:left', kind: 'changed' }))
    expect(discard.events).toContainEqual(expect.objectContaining({ kind: 'discard-region', from: 0, to: 2 }))
    const frames = traceToVisualizationFrames(trace, 'TypeScript')
    const discardFrame = frames.find(({ id }) => id === 'discard-through-2')!
    expect(discardFrame.structures?.find(({ name }) => name === 'nums')?.items.slice(0, 3).every(({ changed }) => changed)).toBe(true)
  })

  it('marks a newly inserted map entry as a derived structure change', () => {
    const frames = traceToVisualizationFrames(exactTraceForProblem(1)!, 'TypeScript')
    const inserted = frames.find(({ id }) => id === 'insert-2')!
    expect(inserted.structures?.find(({ name }) => name === 'seen')?.items).toContainEqual(expect.objectContaining({ key: '2', value: '0', changed: true }))
  })

  it('preserves exact continuity between every semantic transition', () => {
    for (const problemId of exactTraceProblemIds()) {
      const trace = exactTraceForProblem(problemId)!
      expect(trace.transitions[0].before).toEqual(trace.initialState)
      for (let index = 1; index < trace.transitions.length; index += 1) {
        expect(trace.transitions[index].before).toEqual(trace.transitions[index - 1].after)
      }
    }
  })
})
