import { describe, expect, it, vi } from 'vitest'
import {
  createPwaController,
  type BeforeInstallPromptEvent,
  type PwaBrowserEvent,
  type PwaEnvironment,
  type ServiceWorkerCallbacks,
} from './pwaController'

function environmentFixture({ online = true, installed = false, installInstructions = false } = {}) {
  const listeners = new Map<PwaBrowserEvent, Set<(event: Event) => void>>()
  const state = { online, installed }
  const environment: PwaEnvironment = {
    online: () => state.online,
    installed: () => state.installed,
    supportsInstallInstructions: () => installInstructions,
    listen(type, listener) {
      const entries = listeners.get(type) ?? new Set()
      entries.add(listener)
      listeners.set(type, entries)
      return () => entries.delete(listener)
    },
  }
  return {
    environment,
    state,
    emit(type: PwaBrowserEvent, event = new Event(type)) {
      listeners.get(type)?.forEach((listener) => listener(event))
    },
    listenerCount: () => [...listeners.values()].reduce((sum, entries) => sum + entries.size, 0),
  }
}

function controllerFixture(options = {}) {
  const browser = environmentFixture(options)
  let callbacks: ServiceWorkerCallbacks | null = null
  const update = vi.fn(async () => undefined)
  const controller = createPwaController(browser.environment, (registeredCallbacks) => {
    callbacks = registeredCallbacks
    return update
  })
  controller.start()
  return { browser, callbacks: () => callbacks!, controller, update }
}

describe('PWA lifecycle', () => {
  it('announces offline readiness and defers an available update without losing it', async () => {
    const { browser, callbacks, controller, update } = controllerFixture()
    callbacks().onOfflineReady()
    callbacks().onNeedRefresh()
    expect(controller.offlineReady.value).toBe(true)
    expect(controller.updateAvailable.value).toBe(true)
    expect(controller.updatePromptVisible.value).toBe(true)

    controller.deferUpdate()
    expect(controller.updatePromptVisible.value).toBe(false)
    expect(controller.updateAvailable.value).toBe(true)
    controller.showUpdatePrompt()
    await controller.applyUpdate()
    expect(update).toHaveBeenCalledWith(true)

    browser.state.online = false
    browser.emit('offline')
    expect(controller.isOnline.value).toBe(false)
  })

  it('keeps installation user-triggered and clears the browser prompt after use', async () => {
    const { browser, controller } = controllerFixture()
    const preventDefault = vi.fn()
    const prompt = vi.fn(async () => undefined)
    const event = {
      preventDefault,
      prompt,
      userChoice: Promise.resolve({ outcome: 'dismissed', platform: 'test' }),
    } as unknown as BeforeInstallPromptEvent

    browser.emit('beforeinstallprompt', event)
    expect(preventDefault).toHaveBeenCalledOnce()
    expect(controller.installAvailable.value).toBe(true)
    expect(prompt).not.toHaveBeenCalled()
    expect(await controller.install()).toBe('dismissed')
    expect(prompt).toHaveBeenCalledOnce()
    expect(controller.installAvailable.value).toBe(false)
  })

  it('supports platform instructions, installed mode, cleanup, and registration failure', async () => {
    const { browser, callbacks, controller } = controllerFixture({ installInstructions: true })
    expect(controller.showInstallAction.value).toBe(true)
    await controller.requestInstall()
    expect(controller.installInstructionsVisible.value).toBe(true)

    browser.state.installed = true
    browser.emit('appinstalled')
    expect(controller.isInstalled.value).toBe(true)
    expect(controller.showInstallAction.value).toBe(false)
    expect(controller.installInstructionsVisible.value).toBe(false)

    callbacks().onRegisterError(new Error('registration failed'))
    expect(controller.registrationFailed.value).toBe(true)
    expect(browser.listenerCount()).toBeGreaterThan(0)
    controller.stop()
    expect(browser.listenerCount()).toBe(0)
  })
})
