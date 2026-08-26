export interface ScrollPosition {
  left: number
  top: number
}

const storagePrefix = 'pathfinder:scroll-position:'

function storageKey(routePath: string) {
  return `${storagePrefix}${routePath}`
}

export function saveScrollPosition(storage: Storage, routePath: string, position: ScrollPosition) {
  storage.setItem(storageKey(routePath), JSON.stringify(position))
}

export function loadScrollPosition(storage: Storage, routePath: string): ScrollPosition | null {
  const savedPosition = storage.getItem(storageKey(routePath))
  if (!savedPosition) return null

  try {
    const position = JSON.parse(savedPosition) as Partial<ScrollPosition>
    if (typeof position.left !== 'number' || typeof position.top !== 'number') return null
    return { left: position.left, top: position.top }
  } catch {
    return null
  }
}

/**
 * Keeps the viewport position available if the browser reloads the active route
 * while this tab is in the background. Router navigation still owns resetting
 * the viewport for newly visited routes.
 */
export function installScrollPositionPersistence() {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return

  const saveCurrentPosition = () => {
    try {
      saveScrollPosition(sessionStorage, window.location.hash.slice(1) || '/', {
        left: window.scrollX,
        top: window.scrollY,
      })
    } catch {
      // Storage may be disabled; normal router scrolling remains available.
    }
  }

  window.addEventListener('scroll', saveCurrentPosition, { passive: true })
  window.addEventListener('pagehide', saveCurrentPosition)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveCurrentPosition()
  })
}
