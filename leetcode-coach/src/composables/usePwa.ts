import { registerSW } from 'virtual:pwa-register'
import {
  createPwaController,
  type PwaBrowserEvent,
  type PwaController,
  type PwaEnvironment,
  type ServiceWorkerRegistrar,
} from './pwaController'

function createBrowserPwaEnvironment(): PwaEnvironment {
  const displayMode = window.matchMedia('(display-mode: standalone)')
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean }
  const appleMobile = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const safariDesktop = /Safari/.test(navigator.userAgent) && !/Chrome|Chromium|Edg/.test(navigator.userAgent)

  return {
    online: () => navigator.onLine,
    installed: () => displayMode.matches || navigatorWithStandalone.standalone === true,
    supportsInstallInstructions: () => appleMobile || safariDesktop,
    listen(type: PwaBrowserEvent, listener: (event: Event) => void) {
      if (type === 'displaymodechange') {
        displayMode.addEventListener('change', listener)
        return () => displayMode.removeEventListener('change', listener)
      }
      window.addEventListener(type, listener)
      return () => window.removeEventListener(type, listener)
    },
  }
}

const registerPathfinderServiceWorker: ServiceWorkerRegistrar = (callbacks) => registerSW({
  immediate: true,
  ...callbacks,
})

let controller: PwaController | null = null

export function usePwa() {
  controller ??= createPwaController(createBrowserPwaEnvironment(), registerPathfinderServiceWorker)
  return controller
}
