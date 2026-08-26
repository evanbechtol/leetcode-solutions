import { describe, expect, it } from 'vitest'
import { lessons } from '../data/lessons'
import { deepDiveLabels } from '../data/deepDiveLabels'
import { lessonSectionPath, lessonTocEntries } from './lessonToc'

describe('lesson table of contents', () => {
  it('lists visible lesson sections with the rendered heading text', () => {
    const lesson = lessons.find(({ slug }) => slug === 'arrays-hash-maps')!
    const entries = lessonTocEntries(lesson, true)

    expect(entries.map(({ title }) => title)).toContain(lesson.walkthrough.title)
    expect(entries.map(({ id }) => id)).toEqual(expect.arrayContaining([
      'mental-model', 'recognition', 'walkthrough', 'interactive-execution',
      'complexity', 'recipe', 'reference-implementation', 'boundaries',
    ]))
    expect(new Set(entries.map(({ id }) => id)).size).toBe(entries.length)
  })

  it('uses neutral shared Foundations subsections for every lesson with a deep dive', () => {
    for (const lesson of lessons.filter((item) => item.deepDive)) {
      expect(lessonTocEntries(lesson, true)).toEqual(expect.arrayContaining([
        { id: 'foundations', title: lesson.deepDive!.title, level: 2 },
        { id: 'core-vocabulary', title: deepDiveLabels.vocabularyHeading, level: 3 },
        { id: 'representations', title: 'How the idea appears in code', level: 3 },
        { id: 'tree-algorithms', title: deepDiveLabels.techniquesHeading, level: 3 },
      ]))
    }

    expect(Object.values(deepDiveLabels).join(' ').toLowerCase()).not.toContain('tree')
  })

  it('omits unavailable interactive execution and creates a shareable section path', () => {
    const lesson = lessons[0]

    expect(lessonTocEntries(lesson, false).some(({ id }) => id === 'interactive-execution')).toBe(false)
    expect(lessonSectionPath('arrays-hash-maps', 'core-vocabulary')).toBe('/learn/arrays-hash-maps?section=core-vocabulary')
  })
})
