import { effectScope } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useReducedMotion } from './useReducedMotion'

afterEach(() => vi.unstubAllGlobals())

describe('reduced motion preference', () => {
  it('tracks the system preference and removes its listener with the player scope', () => {
    let listener: (() => void) | null = null
    let removed = false
    const query = {
      matches: true,
      addEventListener: (_event: string, next: () => void) => { listener = next },
      removeEventListener: () => { removed = true },
    }
    vi.stubGlobal('window', { matchMedia: () => query })
    const scope = effectScope()
    const reduced = scope.run(() => useReducedMotion())!
    expect(reduced.value).toBe(true)
    query.matches = false
    listener?.()
    expect(reduced.value).toBe(false)
    scope.stop()
    expect(removed).toBe(true)
  })
})
