import { describe, expect, it } from 'vitest'
import { preservesLessonSectionScroll } from './lessonSectionNavigation'

describe('lesson section navigation', () => {
  it('keeps the viewport position while changing sections in the same lesson', () => {
    expect(preservesLessonSectionScroll(
      { name: 'learn', slug: 'trees', section: 'recognition' },
      { name: 'learn', slug: 'trees', section: 'mental-model' },
    )).toBe(true)
  })

  it('does not keep the viewport for another lesson or non-lesson route', () => {
    expect(preservesLessonSectionScroll(
      { name: 'learn', slug: 'heaps', section: 'recognition' },
      { name: 'learn', slug: 'trees', section: 'recognition' },
    )).toBe(false)
    expect(preservesLessonSectionScroll(
      { name: 'problems', slug: undefined, section: undefined },
      { name: 'learn', slug: 'trees', section: 'recognition' },
    )).toBe(false)
  })
})
