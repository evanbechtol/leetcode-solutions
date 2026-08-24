import { describe, expect, it } from 'vitest'
import { parseProblemRouteId, problemRoutePath } from './problemRoutes'

describe('problem routes', () => {
  it('creates a stable route for a problem id', () => {
    expect(problemRoutePath(1)).toBe('/problems/1')
    expect(problemRoutePath(743)).toBe('/problems/743')
  })

  it('parses valid route parameters', () => {
    expect(parseProblemRouteId('1')).toBe(1)
    expect(parseProblemRouteId(['704'])).toBe(704)
  })

  it('rejects malformed and unsafe ids', () => {
    expect(parseProblemRouteId(undefined)).toBeNull()
    expect(parseProblemRouteId('1-two-sum')).toBeNull()
    expect(parseProblemRouteId('-1')).toBeNull()
    expect(parseProblemRouteId('1.5')).toBeNull()
    expect(parseProblemRouteId('9007199254740992')).toBeNull()
  })
})
