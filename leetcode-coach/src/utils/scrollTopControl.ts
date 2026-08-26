export function shouldShowScrollTopControl(scrollY: number, viewportHeight: number) {
  return scrollY >= viewportHeight
}

export function scrollTopBehavior(reducedMotion: boolean): ScrollBehavior {
  return reducedMotion ? 'auto' : 'smooth'
}
