import { describe, expect, it } from 'vitest'
import type { AlgorithmBuilderConfig } from '../types'
import { evaluateAlgorithmOrder, evaluateCodeConstructionChoice, evaluateSelectedOption } from './questionEvaluation'

const builder: AlgorithmBuilderConfig = {
  steps: [
    { id: 'initialize', text: 'Initialize', reason: 'Required first' },
    { id: 'establish', text: 'Establish', reason: 'Defines state' },
    { id: 'iterate', text: 'Iterate', reason: 'Makes progress' },
    { id: 'finish', text: 'Finish', reason: 'Returns answer' },
    { id: 'decoy', text: 'Decoy', reason: 'Wrong pattern' },
    { id: 'decoy-2', text: 'Decoy 2', reason: 'Wrong update' },
  ],
  correctOrder: ['initialize', 'establish', 'iterate', 'finish'],
}

describe('interactive question evaluation', () => {
  it('requires a complete dependency-ordered algorithm', () => {
    expect(evaluateAlgorithmOrder(builder, ['initialize', 'establish'])).toEqual({ ready: false, correct: false, firstMismatch: -1 })
    expect(evaluateAlgorithmOrder(builder, ['initialize', 'iterate', 'establish', 'finish'])).toEqual({ ready: true, correct: false, firstMismatch: 1 })
    expect(evaluateAlgorithmOrder(builder, builder.correctOrder)).toEqual({ ready: true, correct: true, firstMismatch: -1 })
  })

  it('grades the visualization checkpoint without treating an unanswered state as wrong', () => {
    expect(evaluateSelectedOption(2, null)).toEqual({ ready: false, correct: false })
    expect(evaluateSelectedOption(2, 1)).toEqual({ ready: true, correct: false })
    expect(evaluateSelectedOption(2, 2)).toEqual({ ready: true, correct: true })
  })

  it('grades one code-construction choice without revealing another choice', () => {
    const step = {
      id: 'initialize', concept: 'Initialize state', prerequisites: [], correctChoiceId: 'map',
      choices: [
        { id: 'map', codeByLanguage: { Python: 'seen = {}' }, feedback: 'This creates the required lookup state.' },
        { id: 'list', codeByLanguage: { Python: 'seen = []' }, feedback: 'A list does not provide keyed lookup.' },
      ],
      stateEffect: 'An empty lookup exists.', exampleState: 'seen = {}', explanation: 'The map stores earlier values.', hints: [],
    }
    expect(evaluateCodeConstructionChoice(step, null)).toEqual({ ready: false, correct: false, feedback: '' })
    expect(evaluateCodeConstructionChoice(step, 'list')).toEqual({ ready: true, correct: false, feedback: 'A list does not provide keyed lookup.' })
    expect(evaluateCodeConstructionChoice(step, 'map').correct).toBe(true)
  })
})
