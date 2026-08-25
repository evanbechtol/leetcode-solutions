import { onScopeDispose, ref } from 'vue'

export function useReducedMotion() {
  const reducedMotion = ref(false)
  const media = typeof window === 'undefined' ? null : window.matchMedia('(prefers-reduced-motion: reduce)')
  const update = () => { reducedMotion.value = media?.matches ?? false }

  update()
  media?.addEventListener('change', update)
  onScopeDispose(() => media?.removeEventListener('change', update))

  return reducedMotion
}
