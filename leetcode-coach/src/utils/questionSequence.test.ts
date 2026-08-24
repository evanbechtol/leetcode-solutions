import { describe, expect, it } from 'vitest'
import type { QuestionType, QuizQuestion } from '../types'
import { hasDataStructureGateBeforeAlgorithms, sequenceDataStructureBeforeAlgorithms } from './questionSequence'

const item = (id: string, type: QuestionType): QuizQuestion => ({
  id, type, prompt: id, options: ['A', 'B', 'C', 'D'], answer: 0, explanation: 'Explanation', hint: 'Hint',
})

describe('data-structure sequencing', () => {
  it('requires the data-structure checkpoint before every algorithm-dependent question', () => {
    expect(hasDataStructureGateBeforeAlgorithms([
      item('contract', 'Comprehension'), item('data', 'Data Structure'), item('pattern', 'Pattern'), item('algorithm', 'Algorithm'),
    ])).toBe(true)
    expect(hasDataStructureGateBeforeAlgorithms([
      item('contract', 'Comprehension'), item('pattern', 'Pattern'), item('data', 'Data Structure'),
    ])).toBe(false)
    expect(hasDataStructureGateBeforeAlgorithms([item('contract', 'Comprehension'), item('algorithm', 'Algorithm')])).toBe(false)
  })

  it('normalizes optional generated paths without changing order within each dependency group', () => {
    const ordered = sequenceDataStructureBeforeAlgorithms([
      item('pattern', 'Pattern'), item('data', 'Data Structure'), item('algorithm', 'Algorithm'), item('contract', 'Comprehension'), item('complexity', 'Complexity'),
    ])
    expect(ordered.map(({ id }) => id)).toEqual(['contract', 'data', 'pattern', 'algorithm', 'complexity'])
    expect(hasDataStructureGateBeforeAlgorithms(ordered)).toBe(true)
  })
})
