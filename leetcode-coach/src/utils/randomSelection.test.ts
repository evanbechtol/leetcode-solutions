import { describe, expect, it } from 'vitest'
import { drawRandomProblem, shuffleProblemIds } from './randomSelection'

describe('random problem selection', () => {
  it('shuffles a copy without changing the available problem list', () => {
    const ids = [1, 2, 3, 4]
    const result = shuffleProblemIds(ids, () => 0)
    expect(ids).toEqual([1, 2, 3, 4])
    expect(result).not.toEqual(ids)
    expect(new Set(result)).toEqual(new Set(ids))
  })

  it('draws every eligible problem once before refilling the bag', () => {
    const eligible = [1, 2, 3, 4]
    const selected: number[] = []
    let queue: number[] = []
    let current: number | null = null

    for (let count = 0; count < eligible.length; count += 1) {
      const draw = drawRandomProblem(eligible, current, queue, (upper) => (count + 1) % upper)
      selected.push(draw.selectedId!)
      current = draw.selectedId
      queue = draw.remainingQueue
    }

    expect(new Set(selected)).toEqual(new Set(eligible))
    expect(selected).toHaveLength(eligible.length)
  })

  it('avoids immediately repeating the current problem after a reshuffle', () => {
    const draw = drawRandomProblem([1, 2, 3], 1, [], () => 0)
    expect(draw.selectedId).not.toBe(1)
    expect(draw.remainingQueue).toHaveLength(2)
  })

  it('respects a filtered eligible list and handles an empty list', () => {
    expect(drawRandomProblem([7, 9], 7, [1, 7, 9, 9], () => 0).selectedId).toBe(9)
    expect(drawRandomProblem([], null, [1, 2], () => 0)).toEqual({ selectedId: null, remainingQueue: [] })
  })
})
