import { describe, expect, it } from 'vitest'
import constraintSignalComponent from '../../components/questions/ConstraintSignalQuestion.vue?raw'
import operationContractComponent from '../../components/questions/OperationContractQuestion.vue?raw'
import stateSufficiencyComponent from '../../components/questions/StateSufficiencyQuestion.vue?raw'
import nearTwinComponent from '../../components/questions/NearTwinQuestion.vue?raw'
import constraintMutationComponent from '../../components/questions/ConstraintMutationQuestion.vue?raw'
import structuralAnalogyComponent from '../../components/questions/StructuralAnalogyQuestion.vue?raw'
import type { QuestionFormat, QuestionInteractionState, QuizQuestion, ReasoningSkillKey, StateItemClassification } from '../../types'
import { QUESTION_FORMATS } from '../../types'
import { ACTIVE_PROBLEM_SESSION_VERSION, parseActiveProblemSession } from '../../utils/activeProblemSession'
import { instructionalLevelFor, selectAdaptiveQuestionPath } from '../../utils/adaptiveQuestions'
import {
  evaluateConstraintMutation,
  evaluateConstraintSignals,
  constraintSignalChoiceReview,
  evaluateNearTwin,
  evaluateOperationContract,
  evaluateStateSufficiency,
  stateClassificationReview,
  evaluateStructuralAnalogy,
} from '../../utils/questionEvaluation'
import type { AttemptRecord } from '../../stores/progress'
import { problems } from '../problems'
import { compilePilotCoreQuestions, compilePilotTransferQuestions } from './intuitionCompiler'
import { INTUITION_PILOT_IDS } from './intuitionFacts'

const problem = (id: number) => problems.find((candidate) => candidate.id === id)!
const allWaveQuestions = () => [...INTUITION_PILOT_IDS].flatMap((id) => [
  ...Object.values(compilePilotCoreQuestions(problem(id))),
  ...compilePilotTransferQuestions(problem(id)),
]).filter((question): question is QuizQuestion => Boolean(question))
const questionFor = <T extends QuestionFormat>(format: T) => {
  const question = allWaveQuestions().find((candidate) => candidate.format === format)
  if (!question || question.format !== format) throw new Error(`Missing ${format} fixture`)
  return question as Extract<QuizQuestion, { format: T }>
}

describe('Wave 1 intuition questions', () => {
  it('compiles three shared-fact interactions for each reviewed pilot and covers all six formats', () => {
    for (const id of INTUITION_PILOT_IDS) {
      const core = Object.values(compilePilotCoreQuestions(problem(id)))
      expect(core).toHaveLength(3)
      expect(core.map((question) => question?.format)).toEqual(['constraint-signals', 'operation-contract', 'state-sufficiency'])
    }
    const formats = new Set(allWaveQuestions().map(({ format }) => format))
    for (const format of ['constraint-signals', 'operation-contract', 'state-sufficiency', 'near-twin', 'constraint-mutation', 'structural-analogy']) expect(formats.has(format as QuestionFormat)).toBe(true)
  })

  it('grades signal mappings and reports the exact mistaken signal', () => {
    const question = questionFor('constraint-signals')
    const correct = Object.fromEntries(question.config.signals.map((signal) => [signal.id, signal.consequenceIds[0] ?? null]))
    expect(evaluateConstraintSignals(question.config, correct)).toMatchObject({ complete: true, correct: true })
    const wrong = { ...correct, [question.config.signals[0].id]: null }
    expect(evaluateConstraintSignals(question.config, wrong).diagnosticKeys).toContain(`constraint-signal:${question.config.signals[0].id}`)
  })

  it('classifies submitted signal choices for visible answer review', () => {
    const question = questionFor('constraint-signals')
    const decisive = question.config.signals.find((signal) => signal.consequenceIds.length)!
    const correctId = decisive.consequenceIds[0]
    const wrongId = question.config.consequences.find(({ id }) => !decisive.consequenceIds.includes(id))!.id
    expect(constraintSignalChoiceReview(decisive, wrongId, wrongId, true)).toBe('incorrect')
    expect(constraintSignalChoiceReview(decisive, wrongId, correctId, true)).toBe('neutral')
    expect(constraintSignalChoiceReview(decisive, correctId, correctId, true)).toBe('correct-selected')
    expect(constraintSignalChoiceReview(decisive, wrongId, wrongId, false)).toBe('neutral')
    expect(constraintSignalComponent).toContain('choice-review-label')
    expect(constraintSignalComponent).toContain('aria-invalid')
  })

  it('marks selected invariant classifications without revealing replacements', () => {
    const question = questionFor('state-sufficiency')
    const item = question.config.items[0]
    const wrongClassification = (['required', 'optional-redundant', 'discardable'] as StateItemClassification[])
      .find((classification) => classification !== item.classification)!
    expect(stateClassificationReview(item, item.classification, true)).toBe('correct-selected')
    expect(stateClassificationReview(item, wrongClassification, true)).toBe('incorrect')
    expect(stateClassificationReview(item, wrongClassification, false)).toBe('neutral')
    expect(stateSufficiencyComponent).toContain('choice-review-label')
    expect(stateSufficiencyComponent).toContain('aria-invalid')
  })

  it('separates operation inference from structure recognition', () => {
    const question = questionFor('operation-contract')
    const required = question.config.operationOptions.filter(({ required }) => required).map(({ id }) => id)
    expect(evaluateOperationContract(question.config, required, question.config.correctStructureIds[0])).toMatchObject({ complete: true, correct: true })
    const guessedStructure = evaluateOperationContract(question.config, [], question.config.correctStructureIds[0])
    expect(guessedStructure.correct).toBe(false)
    expect(guessedStructure.diagnosticKeys.some((key) => key.startsWith('operation-missing:'))).toBe(true)
  })

  it('distinguishes minimal state from sufficient but redundant state', () => {
    const question = questionFor('state-sufficiency')
    const exact = Object.fromEntries(question.config.items.map(({ id, classification }) => [id, classification]))
    expect(evaluateStateSufficiency(question.config, exact)).toMatchObject({ correct: true, evidence: { sufficiency: 'minimal' } })
    const optional = question.config.items.find(({ classification }) => classification === 'optional-redundant')!
    const redundant = { ...exact, [optional.id]: 'required' as const }
    expect(evaluateStateSufficiency(question.config, redundant)).toMatchObject({ correct: false, evidence: { sufficiency: 'sufficient-redundant' } })
  })

  it('grades linked contrast, mutation, and analogy evidence', () => {
    const twin = questionFor('near-twin')
    expect(evaluateNearTwin(twin.config, twin.config.correctRelationshipId, twin.config.decisiveReasonIds).correct).toBe(true)
    expect(evaluateNearTwin(twin.config, twin.config.correctRelationshipId, [twin.config.facts.find(({ id }) => !twin.config.decisiveReasonIds.includes(id))!.id]).correct).toBe(false)

    const mutation = questionFor('constraint-mutation')
    const impacts = Object.fromEntries(mutation.config.aspects.map(({ id, correctImpact }) => [id, correctImpact]))
    expect(evaluateConstraintMutation(mutation.config, impacts).correct).toBe(true)

    const analogy = questionFor('structural-analogy')
    const mappings = Object.fromEntries(analogy.config.roles.map((role) => [role.id, { problemAChoiceId: role.problemAChoiceId, problemBChoiceId: role.problemBChoiceId }]))
    expect(evaluateStructuralAnalogy(analogy.config, mappings).correct).toBe(true)
  })

  it('keeps every Wave 1 component keyboard/touch operable and explicitly labeled', () => {
    const components: Record<string, string> = {
      'constraint-signals': constraintSignalComponent,
      'operation-contract': operationContractComponent,
      'state-sufficiency': stateSufficiencyComponent,
      'near-twin': nearTwinComponent,
      'constraint-mutation': constraintMutationComponent,
      'structural-analogy': structuralAnalogyComponent,
    }
    expect(QUESTION_FORMATS.filter((format) => components[format])).toHaveLength(6)
    for (const source of Object.values(components)) {
      expect(source).toMatch(/<(button|select)/)
      expect(source).toMatch(/aria-/)
      expect(source).not.toContain('draggable="true"')
    }
  })
})

describe('format-aware resume and adaptive orchestration', () => {
  const completeState = (question: QuizQuestion): QuestionInteractionState => {
    switch (question.format) {
      case 'constraint-signals': return { format: question.format, mappings: Object.fromEntries(question.config.signals.map((signal) => [signal.id, signal.consequenceIds[0] ?? null])) }
      case 'operation-contract': return { format: question.format, selectedOperationIds: question.config.operationOptions.filter(({ required }) => required).map(({ id }) => id), selectedStructureId: question.config.correctStructureIds[0], operationsCommitted: true }
      case 'state-sufficiency': return { format: question.format, classifications: Object.fromEntries(question.config.items.map(({ id, classification }) => [id, classification])) }
      case 'near-twin': return { format: question.format, relationshipId: question.config.correctRelationshipId, reasonIds: [...question.config.decisiveReasonIds] }
      case 'constraint-mutation': return { format: question.format, impacts: Object.fromEntries(question.config.aspects.map(({ id, correctImpact }) => [id, correctImpact])) }
      case 'structural-analogy': return { format: question.format, mappings: Object.fromEntries(question.config.roles.map((role) => [role.id, { problemAChoiceId: role.problemAChoiceId, problemBChoiceId: role.problemBChoiceId }])) }
      default: throw new Error(`Unexpected format ${question.format}`)
    }
  }

  it('validates and restores interaction state for every Wave 1 format', () => {
    const richFormats: QuestionFormat[] = ['constraint-signals', 'operation-contract', 'state-sufficiency', 'near-twin', 'constraint-mutation', 'structural-analogy']
    for (const format of richFormats) {
      const question = questionFor(format)
      const state = completeState(question)
      const raw = JSON.stringify({
        version: ACTIVE_PROBLEM_SESSION_VERSION, contentVersion: question.contentVersion, problemId: Number(question.id.split(':')[0]),
        questionId: question.id, questionIds: [question.id], questionIndex: 0, selectedAnswer: null, submitted: false,
        answerCorrect: null, firstTryCorrect: 0, revealedHintCount: 0, confidence: 'medium', attemptedQuestionIds: [], interactionState: state, completed: false,
      })
      expect(parseActiveProblemSession(raw, Number(question.id.split(':')[0]), [question])?.interactionState).toEqual(state)
    }
  })

  it('migrates a version-1 active multiple-choice session into the version-2 contract', () => {
    const question = problem(121).questions.find((candidate) => candidate.format === 'multiple-choice')!
    const raw = JSON.stringify({ version: 1, problemId: 121, questionId: question.id, questionIndex: 0, selectedAnswer: null, submitted: false, answerCorrect: null, firstTryCorrect: 0, revealedHintCount: 0, attemptedQuestionIds: [], interactionState: null, completed: false })
    const restored = parseActiveProblemSession(raw, 121, [question])
    expect(restored).toMatchObject({ version: 2, contentVersion: 'legacy-active-v1', questionIds: [question.id] })
  })

  const attempt = (id: string, problemId: number, skill: ReasoningSkillKey, localDay: string): AttemptRecord => ({
    id, problemId, questionId: id, questionType: 'Comprehension', questionFormat: 'constraint-signals', correct: true,
    firstAttempt: true, hintLevelReached: 0, reasoningSkillKeys: [skill], instructionalLevel: 'construct', diagnosticKeys: [], evidence: {},
    occurredAt: `${localDay}T12:00:00.000Z`, localDay, contentVersion: 'test', source: 'practice', topicKeys: [],
  })

  it('fades support from completion to construction, retrieval, and delayed transfer', () => {
    expect(instructionalLevelFor('constraint-signal', [], 704, new Date('2026-08-25'))).toBe('complete')
    expect(instructionalLevelFor('constraint-signal', [attempt('a', 704, 'constraint-signal', '2026-08-25'), attempt('b', 704, 'constraint-signal', '2026-08-25')], 704, new Date('2026-08-25'))).toBe('construct')
    expect(instructionalLevelFor('constraint-signal', [attempt('a', 704, 'constraint-signal', '2026-08-25'), attempt('b', 1, 'constraint-signal', '2026-08-25')], 704, new Date('2026-08-25'))).toBe('retrieve')
    expect(instructionalLevelFor('constraint-signal', [attempt('a', 704, 'constraint-signal', '2026-08-23'), attempt('b', 1, 'constraint-signal', '2026-08-24')], 704, new Date('2026-08-25'))).toBe('transfer')
  })

  it('uses an eligible delayed contrast in Daily Mastery without lengthening the path', () => {
    const binary = problem(704)
    const evidence = [attempt('a', 1, 'constraint-signal', '2026-08-23'), attempt('b', 3, 'constraint-signal', '2026-08-24')]
    const selected = selectAdaptiveQuestionPath(binary.questions, compilePilotTransferQuestions(binary), evidence, { dailySession: true, now: new Date('2026-08-25') })
    expect(selected).toHaveLength(binary.questions.length)
    expect(selected.find(({ stage }) => stage === 'pattern')?.format).toBe('near-twin')
    expect(selectAdaptiveQuestionPath(binary.questions, compilePilotTransferQuestions(binary), evidence, { dailySession: false, now: new Date('2026-08-25') }).find(({ stage }) => stage === 'pattern')?.format).toBe('multiple-choice')
  })
})
