import { describe, expect, it } from 'vitest'
import { scrollTopBehavior, shouldShowScrollTopControl } from './scrollTopControl'

describe('scroll-to-top control', () => {
  it('appears after the reader has moved one viewport below the lesson header', () => {
    expect(shouldShowScrollTopControl(799, 800)).toBe(false)
    expect(shouldShowScrollTopControl(800, 800)).toBe(true)
  })

  it('uses instant scrolling when reduced motion is preferred', () => {
    expect(scrollTopBehavior(false)).toBe('smooth')
    expect(scrollTopBehavior(true)).toBe('auto')
  })
})
