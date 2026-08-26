import { describe, expect, it } from 'vitest'
import { loadScrollPosition, saveScrollPosition } from './scrollRestoration'

function createStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() { return values.size },
    clear: () => values.clear(),
    getItem: key => values.get(key) ?? null,
    key: index => [...values.keys()][index] ?? null,
    removeItem: key => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  }
}

describe('scroll restoration', () => {
  it('restores the position saved for the current route', () => {
    const storage = createStorage()
    saveScrollPosition(storage, '/learn/two-sum', { left: 12, top: 420 })

    expect(loadScrollPosition(storage, '/learn/two-sum')).toEqual({ left: 12, top: 420 })
    expect(loadScrollPosition(storage, '/problems')).toBeNull()
  })

  it('ignores malformed saved positions', () => {
    const storage = createStorage()
    storage.setItem('pathfinder:scroll-position:/learn/two-sum', '{bad json')

    expect(loadScrollPosition(storage, '/learn/two-sum')).toBeNull()
  })
})
