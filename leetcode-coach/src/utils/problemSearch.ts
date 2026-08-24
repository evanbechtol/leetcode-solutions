import type { Problem } from '../types'

const normalized = (value: string) => value.toLocaleLowerCase().replace(/[^a-z0-9+#]+/g, ' ').trim()

export const filterProblemsBySearch = (problems: Problem[], query: string) => {
  const terms = normalized(query).split(/\s+/).filter(Boolean)
  if (!terms.length) return problems

  return problems.filter((problem) => {
    const searchable = normalized([
      String(problem.id),
      String(problem.id).padStart(4, '0'),
      problem.title,
      problem.difficulty,
      ...problem.set,
      ...problem.topics,
      ...problem.algorithms,
    ].join(' '))
    return terms.every((term) => searchable.includes(term))
  })
}
