import type { Lesson } from '../data/lessons'
import { deepDiveLabels } from '../data/deepDiveLabels'

export interface LessonTocEntry {
  id: string
  title: string
  level: 2 | 3
}

const standardEntries = (lesson: Lesson): LessonTocEntry[] => [
  { id: 'mental-model', title: 'Make it intuitive', level: 2 },
  { id: 'recognition', title: 'Know when to reach for it', level: 2 },
  { id: 'walkthrough', title: lesson.walkthrough.title, level: 2 },
  { id: 'interactive-execution', title: 'Watch every value change', level: 2 },
  { id: 'complexity', title: 'Complexity & tradeoffs', level: 2 },
  { id: 'recipe', title: 'A repeatable recipe', level: 2 },
  { id: 'reference-implementation', title: 'See the pattern in code', level: 2 },
  { id: 'boundaries', title: 'Boundaries & common mistakes', level: 2 },
]

export function lessonTocEntries(lesson: Lesson, hasInteractiveExecution: boolean): LessonTocEntry[] {
  const entries = standardEntries(lesson)
  const walkthroughIndex = entries.findIndex(({ id }) => id === 'walkthrough')

  if (lesson.deepDive) {
    entries.splice(walkthroughIndex, 0,
      { id: 'foundations', title: lesson.deepDive.title, level: 2 },
      { id: 'core-vocabulary', title: deepDiveLabels.vocabularyHeading, level: 3 },
      { id: 'representations', title: 'How the idea appears in code', level: 3 },
      { id: 'tree-algorithms', title: deepDiveLabels.techniquesHeading, level: 3 },
    )
  }

  if (!hasInteractiveExecution) {
    const executionIndex = entries.findIndex(({ id }) => id === 'interactive-execution')
    entries.splice(executionIndex, 1)
  }

  return entries
}

export function lessonSectionPath(slug: string, sectionId: string) {
  return `/learn/${encodeURIComponent(slug)}?section=${encodeURIComponent(sectionId)}`
}
