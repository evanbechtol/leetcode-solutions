import { describe, expect, it } from 'vitest'
import type { Problem } from '../types'
import { filterProblemsBySearch } from './problemSearch'

const problem = (id: number, title: string, topics: string[], algorithms: string[]): Problem => ({
  id,
  title,
  difficulty: id === 1 ? 'Easy' : 'Medium',
  set: ['Interview set'],
  topics,
  algorithms,
  description: '',
  examples: [],
  constraints: [],
  insight: '',
  solution: '',
  questions: [],
})

const catalog = [
  problem(1, 'Two Sum', ['Array', 'Hash Table'], ['Hashing']),
  problem(704, 'Binary Search', ['Array'], ['Binary Search']),
  problem(207, 'Course Schedule', ['Graph'], ['Topological Sort']),
]

describe('problem catalog search', () => {
  it('matches title words regardless of case', () => {
    expect(filterProblemsBySearch(catalog, 'two SUM').map(({ id }) => id)).toEqual([1])
  })

  it('matches ordinary and zero-padded problem numbers', () => {
    expect(filterProblemsBySearch(catalog, '704').map(({ id }) => id)).toEqual([704])
    expect(filterProblemsBySearch(catalog, '0001').map(({ id }) => id)).toEqual([1])
  })

  it('supports topic and algorithm terms and requires every search term', () => {
    expect(filterProblemsBySearch(catalog, 'graph topological').map(({ id }) => id)).toEqual([207])
    expect(filterProblemsBySearch(catalog, 'array graph')).toEqual([])
  })
})
