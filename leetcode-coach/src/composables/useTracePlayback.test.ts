import { effectScope, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useTracePlayback } from './useTracePlayback'

afterEach(() => {
  vi.useRealTimers()
})

const setup = (count = 4, initialIndex = 0, initialFurthest = 0) => {
  const scope = effectScope()
  const playback = scope.run(() => useTracePlayback({
    frameCount: ref(count), initialIndex, initialFurthest,
  }))!
  return { playback, stop: () => scope.stop() }
}

describe('trace playback', () => {
  it('reveals semantic steps sequentially and restores visited steps exactly', () => {
    const { playback, stop } = setup()
    expect(playback.goTo(2)).toBe(false)
    expect(playback.next()).toBe(true)
    expect(playback.frameIndex.value).toBe(1)
    expect(playback.furthestFrame.value).toBe(1)
    expect(playback.previous()).toBe(true)
    expect(playback.frameIndex.value).toBe(0)
    expect(playback.goTo(1)).toBe(true)
    expect(playback.frameIndex.value).toBe(1)
    stop()
  })

  it('plays at the selected speed and pauses at the final frame', () => {
    vi.useFakeTimers()
    const { playback, stop } = setup(3)
    playback.setSpeed(2)
    playback.play()
    vi.advanceTimersByTime(700)
    expect(playback.frameIndex.value).toBe(1)
    expect(playback.playing.value).toBe(true)
    vi.advanceTimersByTime(700)
    expect(playback.frameIndex.value).toBe(2)
    expect(playback.playing.value).toBe(false)
    stop()
  })

  it('restarts without erasing visited progress and resumes from the beginning', () => {
    const { playback, stop } = setup(4, 2, 2)
    playback.restart()
    expect(playback.frameIndex.value).toBe(0)
    expect(playback.furthestFrame.value).toBe(2)
    expect(playback.goTo(2)).toBe(true)
    stop()
  })
})
