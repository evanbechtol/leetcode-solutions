export interface LessonNavigationLocation {
  name: unknown
  slug: unknown
  section: unknown
}

export function preservesLessonSectionScroll(
  to: LessonNavigationLocation,
  from: LessonNavigationLocation,
) {
  return to.name === 'learn'
    && from.name === 'learn'
    && to.slug === from.slug
    && to.section !== from.section
}
