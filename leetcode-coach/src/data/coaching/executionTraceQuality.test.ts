import { describe, expect, it } from 'vitest'
import { problems } from '../problems'
import { beginnerPatternProfiles } from './beginnerProfiles'
import { buildExecutionTrace } from './executionTrace'

describe('execution trace quality', () => {
  it('labels reviewed fixtures as exact and deterministic fallbacks as overviews', () => {
    const reviewed = problems.find(({ id }) => id === 1)!
    expect(buildExecutionTrace(reviewed, beginnerPatternProfiles.hashing, reviewed.examples[0].input, reviewed.examples[0].output).quality)
      .toBe('exact-reviewed')

    const unsupported = { ...reviewed, id: 999_999, algorithms: [], topics: [] }
    const overview = buildExecutionTrace(unsupported, beginnerPatternProfiles.hashing, unsupported.examples[0].input, unsupported.examples[0].output)
    expect(overview.quality).toBe('instructional-overview')
    expect(overview.frames).toHaveLength(6)
  })
})
