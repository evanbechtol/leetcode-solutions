import { computed, onScopeDispose, ref, type Ref } from 'vue'
import { useReducedMotion } from './useReducedMotion'

export const TRACE_PLAYBACK_SPEEDS = [0.5, 1, 1.5, 2] as const

interface TracePlaybackOptions {
  frameCount: Ref<number>
  initialIndex?: number
  initialFurthest?: number
  stepDurationMs?: number
}

export function useTracePlayback({
  frameCount,
  initialIndex = 0,
  initialFurthest = 0,
  stepDurationMs = 1400,
}: TracePlaybackOptions) {
  const frameIndex = ref(Math.max(0, Math.min(initialIndex, frameCount.value - 1)))
  const furthestFrame = ref(Math.max(frameIndex.value, Math.min(initialFurthest, frameCount.value - 1)))
  const playing = ref(false)
  const speed = ref<(typeof TRACE_PLAYBACK_SPEEDS)[number]>(1)
  const reducedMotion = useReducedMotion()
  let timer: ReturnType<typeof setTimeout> | null = null

  const finalFrame = computed(() => frameIndex.value === frameCount.value - 1)
  const canPrevious = computed(() => frameIndex.value > 0)
  const canNext = computed(() => frameIndex.value < frameCount.value - 1)

  const clearTimer = () => {
    if (timer !== null) clearTimeout(timer)
    timer = null
  }

  const pause = () => {
    playing.value = false
    clearTimer()
  }

  const goTo = (index: number, revealNext = false) => {
    const maximum = revealNext ? Math.min(frameCount.value - 1, furthestFrame.value + 1) : furthestFrame.value
    if (index < 0 || index >= frameCount.value || index > maximum) return false
    frameIndex.value = index
    furthestFrame.value = Math.max(furthestFrame.value, index)
    return true
  }

  const previous = () => {
    pause()
    return goTo(frameIndex.value - 1)
  }

  const next = (automatic = false) => {
    if (!automatic) pause()
    const moved = goTo(frameIndex.value + 1, true)
    if (!moved || finalFrame.value) pause()
    return moved
  }

  const restart = () => {
    pause()
    frameIndex.value = 0
  }

  const schedule = () => {
    clearTimer()
    if (!playing.value || finalFrame.value) return pause()
    timer = setTimeout(() => {
      next(true)
      if (playing.value) schedule()
    }, stepDurationMs / speed.value)
  }

  const play = () => {
    if (finalFrame.value) frameIndex.value = 0
    playing.value = true
    schedule()
  }

  const toggle = () => playing.value ? pause() : play()

  const setSpeed = (nextSpeed: number) => {
    if (!TRACE_PLAYBACK_SPEEDS.includes(nextSpeed as (typeof TRACE_PLAYBACK_SPEEDS)[number])) return
    speed.value = nextSpeed as (typeof TRACE_PLAYBACK_SPEEDS)[number]
    if (playing.value) schedule()
  }

  const jumpToVisited = (index: number) => {
    pause()
    return goTo(index)
  }

  const pauseWhenHidden = () => { if (document.hidden) pause() }
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', pauseWhenHidden)

  onScopeDispose(() => {
    clearTimer()
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', pauseWhenHidden)
  })

  return {
    frameIndex,
    furthestFrame,
    playing,
    speed,
    reducedMotion,
    finalFrame,
    canPrevious,
    canNext,
    goTo: jumpToVisited,
    previous,
    next,
    restart,
    play,
    pause,
    toggle,
    setSpeed,
  }
}
