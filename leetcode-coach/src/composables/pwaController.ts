import { computed, readonly, ref, type Ref } from 'vue'

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export type PwaBrowserEvent = 'online' | 'offline' | 'beforeinstallprompt' | 'appinstalled' | 'displaymodechange'

export interface PwaEnvironment {
  online(): boolean
  installed(): boolean
  supportsInstallInstructions(): boolean
  listen(type: PwaBrowserEvent, listener: (event: Event) => void): () => void
}

export interface ServiceWorkerCallbacks {
  onNeedRefresh(): void
  onOfflineReady(): void
  onRegisterError(error: unknown): void
}

export type ServiceWorkerUpdater = (reloadPage?: boolean) => Promise<void>
export type ServiceWorkerRegistrar = (callbacks: ServiceWorkerCallbacks) => ServiceWorkerUpdater

export interface PwaController {
  isOnline: Readonly<Ref<boolean>>
  offlineReady: Readonly<Ref<boolean>>
  updateAvailable: Readonly<Ref<boolean>>
  updatePromptVisible: Readonly<Ref<boolean>>
  installAvailable: Readonly<Ref<boolean>>
  installInstructionsVisible: Ref<boolean>
  isInstalled: Readonly<Ref<boolean>>
  showInstallAction: Readonly<Ref<boolean>>
  registrationFailed: Readonly<Ref<boolean>>
  start(): void
  stop(): void
  install(): Promise<'accepted' | 'dismissed' | 'unavailable'>
  requestInstall(): Promise<void>
  applyUpdate(): Promise<void>
  deferUpdate(): void
  showUpdatePrompt(): void
  dismissOfflineReady(): void
}

export function createPwaController(environment: PwaEnvironment, registerServiceWorker: ServiceWorkerRegistrar): PwaController {
  const isOnline = ref(environment.online())
  const offlineReady = ref(false)
  const updateAvailable = ref(false)
  const updatePromptVisible = ref(false)
  const installPrompt = ref<BeforeInstallPromptEvent | null>(null)
  const installAvailable = computed(() => installPrompt.value !== null)
  const installInstructionsVisible = ref(false)
  const isInstalled = ref(environment.installed())
  const registrationFailed = ref(false)
  const showInstallAction = computed(() => !isInstalled.value && (installAvailable.value || environment.supportsInstallInstructions()))
  let updateServiceWorker: ServiceWorkerUpdater = async () => undefined
  let cleanups: Array<() => void> = []
  let started = false

  function start() {
    if (started) return
    started = true
    updateServiceWorker = registerServiceWorker({
      onNeedRefresh() {
        updateAvailable.value = true
        updatePromptVisible.value = true
      },
      onOfflineReady() {
        offlineReady.value = true
      },
      onRegisterError() {
        registrationFailed.value = true
      },
    })
    cleanups = [
      environment.listen('online', () => { isOnline.value = true }),
      environment.listen('offline', () => { isOnline.value = false }),
      environment.listen('beforeinstallprompt', (event) => {
        event.preventDefault()
        installPrompt.value = event as BeforeInstallPromptEvent
      }),
      environment.listen('appinstalled', () => {
        installPrompt.value = null
        installInstructionsVisible.value = false
        isInstalled.value = true
      }),
      environment.listen('displaymodechange', () => {
        isInstalled.value = environment.installed()
        if (isInstalled.value) installInstructionsVisible.value = false
      }),
    ]
  }

  function stop() {
    cleanups.forEach((cleanup) => cleanup())
    cleanups = []
    started = false
  }

  async function install() {
    const prompt = installPrompt.value
    if (!prompt) return 'unavailable' as const
    installPrompt.value = null
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    return outcome
  }

  async function requestInstall() {
    if (installPrompt.value) {
      await install()
      return
    }
    installInstructionsVisible.value = true
  }

  async function applyUpdate() {
    await updateServiceWorker(true)
  }

  return {
    isOnline: readonly(isOnline),
    offlineReady: readonly(offlineReady),
    updateAvailable: readonly(updateAvailable),
    updatePromptVisible: readonly(updatePromptVisible),
    installAvailable: readonly(installAvailable),
    installInstructionsVisible,
    isInstalled: readonly(isInstalled),
    showInstallAction: readonly(showInstallAction),
    registrationFailed: readonly(registrationFailed),
    start,
    stop,
    install,
    requestInstall,
    applyUpdate,
    deferUpdate() { updatePromptVisible.value = false },
    showUpdatePrompt() { updatePromptVisible.value = true },
    dismissOfflineReady() { offlineReady.value = false },
  }
}
