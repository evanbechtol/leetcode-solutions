import type { LessonDeepDive } from './lessons'
import { structureDeepDives } from './deepDivesStructures'
import { patternDeepDives } from './deepDivesPatterns'

export const expandedLessonDeepDives: Record<string, LessonDeepDive> = {
  ...structureDeepDives,
  ...patternDeepDives,
}
