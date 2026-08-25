import { describe, expect, it } from 'vitest'
import { milestoneCardFilename, milestoneCardSvg } from './milestoneCard'

describe('milestone card', () => {
  const milestone = { key: 'stable:arrays:1', kind: 'stable' as const, label: 'Stable concept', track: 'Arrays', summary: 'Recalled a reviewed path on two separate days.' }

  it('renders only the approved public presentation', () => {
    const svg = milestoneCardSvg(milestone)
    expect(svg).toContain('Stable concept')
    expect(svg).toContain('Arrays')
    expect(svg).toContain('Private progress · shared by choice')
    expect(svg).not.toMatch(/accuracy|confidence|learner name|2026-/i)
  })

  it('produces a stable safe filename', () => {
    expect(milestoneCardFilename(milestone)).toBe('pathfinder-stable-arrays.svg')
  })
})
