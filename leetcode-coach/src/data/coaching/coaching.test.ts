import { describe, expect, it } from 'vitest'
import { problems } from '../problems'
import { compileLessonVisualization, compileQuestionPath } from './compiler'
import { DEEP_PROBLEM_IDS, problemTeachingFacts } from './problemFacts'
import { validateCoachingContent } from './validation'
import { hasDataStructureGateBeforeAlgorithms } from '../../utils/questionSequence'
import { assembleConstructionCode, CODE_CONSTRUCTION_PILOT_IDS } from './codeConstruction'
import { lessons } from '../lessons'
import { lessonVisualizationFor, lessonVisualizationProblemIds } from '../lessonVisualizations'
import { buildExactExecutionTrace } from './exactExecutionTraces'

describe('deterministic coaching catalog', () => {
  it('covers all 134 dataset problems plus two curated-only problems', () => {
    expect(Object.keys(problemTeachingFacts)).toHaveLength(136)
    expect(validateCoachingContent(problems)).toEqual([])
  })

  it('builds nine baseline stages and twelve deep stages', () => {
    for (const problem of problems) {
      expect(problem.questions).toHaveLength(DEEP_PROBLEM_IDS.has(problem.id) ? 12 : 9)
      expect(problem.questions[0].stage).toBe('contract')
      expect(problem.questions[1].stage).toBe('data-structure')
      expect(problem.questions[2].stage).toBe('pattern')
      expect(hasDataStructureGateBeforeAlgorithms(problem.questions)).toBe(true)
      expect(problem.questions.every(({ teachingContext, formalTerm }) => teachingContext && formalTerm)).toBe(true)
      expect(problem.questions.every(({ prompt }) => prompt.trim().split(/\s+/).length <= 24)).toBe(true)
      expect(problem.questions.filter(({ format }) => ['algorithm-builder', 'code-construction'].includes(format ?? 'multiple-choice'))).toHaveLength(1)
      expect(problem.questions.filter(({ format }) => format === 'iteration-visualization')).toHaveLength(0)
      const constructionIndex = problem.questions.findIndex(({ format }) => ['algorithm-builder', 'code-construction'].includes(format ?? 'multiple-choice'))
      expect(constructionIndex).toBe(problem.questions.length - 3)
      expect(problem.questions.slice(constructionIndex + 1).map(({ stage }) => stage)).toEqual(['time-complexity', 'space-complexity'])
      const visualizationQuestion = compileLessonVisualization(problem)
      expect(visualizationQuestion.format).toBe('iteration-visualization')
      if (visualizationQuestion.format !== 'iteration-visualization') throw new Error('Expected visualization question')
      const visualization = visualizationQuestion.config
      expect(['exact-reviewed', 'instructional-overview']).toContain(visualization.traceQuality)
      expect(visualization.frames.length).toBeGreaterThanOrEqual(6)
      expect(visualization.code.trim()).not.toBe('')
      for (const frame of visualization.frames) {
        expect(frame.input).toBe(visualization.input)
        expect(frame.expectedOutput).toBe(visualization.expectedOutput)
        expect(frame.variables.length + (frame.structures?.length ?? 0)).toBeGreaterThanOrEqual(2)
        expect(frame.activeCodeLines.length).toBeGreaterThan(0)
      }
    }
    expect(DEEP_PROBLEM_IDS).toHaveLength(30)
  })

  it('produces stable paths with shuffled, aligned feedback', () => {
    for (const problem of problems) {
      const first = compileQuestionPath(problem, problems)
      const second = compileQuestionPath(problem, problems)
      expect(first).toEqual(second)
      for (const question of first) {
        if (question.format === 'algorithm-builder') {
          expect(new Set(question.config.steps.map(({ id }) => id))).toHaveLength(6)
          expect(question.config.correctOrder).toHaveLength(4)
        } else if (question.format === 'code-construction') {
          expect(question.config.steps.length).toBeGreaterThanOrEqual(5)
          for (const language of question.config.languages) {
            expect(assembleConstructionCode(question.config, language)).not.toContain('Choose next')
            expect(assembleConstructionCode(question.config, language).trim()).not.toBe('')
          }
        } else if (question.format === 'multiple-choice') {
          expect(new Set(question.config.options)).toHaveLength(4)
          expect(question.config.optionFeedback).toHaveLength(4)
          expect(question.config.optionFeedback[question.config.answer]).toBe(question.explanation)
        } else {
          expect(question.reasoningSkillKeys.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('uses reviewed incremental construction for the five roadmap pilots', () => {
    for (const id of CODE_CONSTRUCTION_PILOT_IDS) {
      const problem = problems.find((candidate) => candidate.id === id)!
      const question = problem.questions.find(({ format }) => format === 'code-construction')
      expect(question?.format).toBe('code-construction')
      if (!question || question.format !== 'code-construction') throw new Error('Expected code construction')
      const construction = question.config
      expect(construction.steps.every((step, index) => step.prerequisites.every((required) => construction.steps.findIndex(({ id: stepId }) => stepId === required) < index))).toBe(true)
      expect(construction.steps.every(({ choices, correctChoiceId }) => choices.some(({ id: choiceId }) => choiceId === correctChoiceId))).toBe(true)
    }
  })

  it('assembles the curated implementation exactly for every reviewed pilot language', () => {
    for (const id of [1, 3, 704]) {
      const problem = problems.find((candidate) => candidate.id === id)!
      const question = problem.questions.find(({ format }) => format === 'code-construction')
      if (!question || question.format !== 'code-construction') throw new Error('Expected code construction')
      const construction = question.config
      for (const language of construction.languages) {
        const assembled = assembleConstructionCode(construction, language)
        if (id === 1 && language === 'Rust') {
          expect(assembled).toContain('let complement = target - value;')
          expect(assembled).toContain('seen.get(&complement)')
        } else {
          expect(assembled).toBe(problem.codeSamples?.[language])
        }
      }
    }
  })

  it('uses concrete variables and data-structure elements in the five exact visualizations', () => {
    const genericNames = new Set(['algorithmState', 'currentWork', 'processedWork', 'remainingWork'])
    for (const id of CODE_CONSTRUCTION_PILOT_IDS) {
      const problem = problems.find((candidate) => candidate.id === id)!
      const question = compileLessonVisualization(problem)
      if (question.format !== 'iteration-visualization') throw new Error('Expected visualization')
      const frames = question.config.frames
      expect(question.config.traceQuality).toBe('exact-reviewed')
      expect(frames.every(({ structures }) => structures !== undefined)).toBe(true)
      expect(frames.flatMap(({ variables }) => variables).some(({ name }) => genericNames.has(name))).toBe(false)
      expect(frames.flatMap(({ structures }) => structures ?? []).flatMap(({ items }) => items).length).toBeGreaterThan(0)
    }
  })

  it('never exposes generalized placeholder variable names', () => {
    const genericNames = new Set(['iteration', 'algorithmState', 'currentWork', 'processedWork', 'remainingWork'])
    for (const problem of problems) {
      const question = compileLessonVisualization(problem)
      if (question.format !== 'iteration-visualization') throw new Error('Expected visualization')
      const frames = question.config.frames
      expect(frames.flatMap(({ variables }) => variables).some(({ name }) => genericNames.has(name))).toBe(false)
    }
  })

  it('provides a representative instructional visualization for every lesson', () => {
    for (const lesson of lessons) {
      const visualization = lessonVisualizationFor(lesson.slug)
      expect(visualization?.question.format).toBe('iteration-visualization')
      expect(visualization?.question.format === 'iteration-visualization' ? visualization.question.config.frames.length : 0).toBeGreaterThanOrEqual(6)
    }
  })

  it('uses a reviewed concrete trace for every lesson representative', () => {
    for (const lesson of lessons) {
      const problemId = lessonVisualizationProblemIds[lesson.slug]
      const problem = problems.find(({ id }) => id === problemId)!
      const frames = buildExactExecutionTrace(problem)

      expect(frames, `${lesson.slug} should never use the generic overview fallback`).not.toBeNull()
      expect(frames?.at(-1)?.currentOutput).toBe(problem.examples[0].output)
      expect(frames?.some(({ title }) => title === 'Repeat for the remaining work')).toBe(false)
    }
  })
})
