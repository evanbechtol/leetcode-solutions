import type { Problem } from '../../types'
import { compileQuestionPath } from './compiler'
import { DEEP_PROBLEM_IDS, problemTeachingFacts } from './problemFacts'
import { patternProfiles, rawTagPatternMap } from './patterns'
import { beginnerPatternProfiles } from './beginnerProfiles'
import { hasDataStructureGateBeforeAlgorithms } from '../../utils/questionSequence'

const wordCount = (value: string) => value.trim().split(/\s+/).filter(Boolean).length

export const validateCoachingContent = (problems: Problem[]) => {
  const errors: string[] = []
  // The external dataset contains 134 entries; two curated-only problems (121 and 704) bring the merged catalog to 136.
  if (problems.length !== 136) errors.push(`Expected 136 merged catalog problems; found ${problems.length}.`)
  const catalogIds = new Set(problems.map(({ id }) => id))
  for (const pattern of Object.keys(patternProfiles)) {
    const beginner = beginnerPatternProfiles[pattern as keyof typeof beginnerPatternProfiles]
    if (!beginner) {
      errors.push(`${pattern}: missing beginner-facing pattern content.`)
      continue
    }
    for (const [field, value] of Object.entries(beginner)) {
      if (!value.trim()) errors.push(`${pattern}.${field}: beginner-facing content is empty.`)
      if (wordCount(value) > 32) errors.push(`${pattern}.${field}: beginner-facing content exceeds 32 words.`)
    }
  }
  for (const problem of problems) {
    const fact = problemTeachingFacts[problem.id]
    if (!fact) {
      errors.push(`${problem.id}: missing teaching fact.`)
      continue
    }
    if (!fact.verified || !patternProfiles[fact.pattern]) errors.push(`${problem.id}: teaching fact is not verified or has an unknown pattern.`)
    for (const algorithm of problem.algorithms) if (!rawTagPatternMap[algorithm]) errors.push(`${problem.id}: unmapped source algorithm tag “${algorithm}”.`)
    const path = compileQuestionPath(problem, problems)
    const expected = DEEP_PROBLEM_IDS.has(problem.id) ? 13 : 10
    if (path.length !== expected) errors.push(`${problem.id}: expected ${expected} questions; found ${path.length}.`)
    const formats = path.map((question) => question.format ?? 'multiple-choice')
    if (formats.filter((format) => format === 'algorithm-builder').length !== 1) errors.push(`${problem.id}: expected one algorithm builder.`)
    if (formats.filter((format) => format === 'iteration-visualization').length !== 1) errors.push(`${problem.id}: expected one iteration visualization.`)
    if (formats[4] !== 'iteration-visualization') errors.push(`${problem.id}: iteration visualization must be question five.`)
    if (!hasDataStructureGateBeforeAlgorithms(path)) errors.push(`${problem.id}: data-structure identification must precede every algorithm-dependent question.`)
    path.forEach((question) => {
      const format = question.format ?? 'multiple-choice'
      if (!question.teachingContext?.title.trim() || !question.teachingContext.body.trim()) errors.push(`${question.id}: missing beginner teaching context.`)
      if (!question.formalTerm?.name.trim() || !question.formalTerm.definition.trim()) errors.push(`${question.id}: missing formal-term reveal.`)
      if (wordCount(question.prompt) > 24) errors.push(`${question.id}: prompt exceeds 24 words.`)
      if (wordCount(question.hint) > 32) errors.push(`${question.id}: hint exceeds 32 words.`)
      if (question.teachingContext && wordCount(question.teachingContext.body) > 32) errors.push(`${question.id}: teaching context exceeds 32 words.`)
      if (question.formalTerm && wordCount(question.formalTerm.definition) > 24) errors.push(`${question.id}: formal definition exceeds 24 words.`)
      const learnerCopy = [question.prompt, question.hint, question.teachingContext?.body ?? '', ...question.options].join(' ')
      if (/proof obligation|monotonic predicate|structural induction|optimal substructure/i.test(learnerCopy)) errors.push(`${question.id}: learner-facing copy contains unexplained advanced language.`)
      if (format === 'algorithm-builder') {
        const builder = question.builder
        if (!builder || builder.steps.length < 6) errors.push(`${question.id}: builder must contain at least six candidate steps.`)
        if (!builder || builder.correctOrder.length !== 4) errors.push(`${question.id}: builder must require four ordered phases.`)
        if (builder && new Set(builder.steps.map(({ id }) => id)).size !== builder.steps.length) errors.push(`${question.id}: builder step ids must be unique.`)
        if (builder && builder.correctOrder.some((id) => !builder.steps.some((step) => step.id === id))) errors.push(`${question.id}: builder order references an unknown step.`)
        if (builder?.steps.some((step) => !step.text.trim() || !step.reason.trim())) errors.push(`${question.id}: builder steps require text and reasoning.`)
        if (builder?.steps.some((step) => wordCount(step.text) > 32)) errors.push(`${question.id}: builder step exceeds 32 words.`)
      } else {
        if (question.options.length !== 4 || new Set(question.options).size !== 4) errors.push(`${question.id}: options must contain four unique values.`)
        if (question.answer < 0 || question.answer > 3) errors.push(`${question.id}: answer is out of bounds.`)
        if (question.optionFeedback?.length !== 4) errors.push(`${question.id}: missing option-specific feedback.`)
        if (!['contract', 'time-complexity', 'space-complexity'].includes(question.stage ?? '') && question.options.some((option) => wordCount(option) > 32)) errors.push(`${question.id}: answer option exceeds 32 words.`)
      }
      if (format === 'iteration-visualization') {
        const visualization = question.visualization
        const frames = visualization?.frames
        if (!visualization?.input.trim() || !visualization.expectedOutput.trim() || !visualization.code.trim() || !visualization.language.trim()) errors.push(`${question.id}: visualization requires input, output, code, and language.`)
        if (!frames || frames.length < 6) errors.push(`${question.id}: visualization must contain at least six execution frames.`)
        if (frames?.some((frame) =>
          !frame.title.trim()
          || !frame.action.trim()
          || !frame.invariant.trim()
          || !frame.input.trim()
          || !frame.expectedOutput.trim()
          || !frame.currentOutput.trim()
          || !frame.processed.trim()
          || !frame.remaining.trim()
          || frame.variables.length < 4
        )) errors.push(`${question.id}: every visualization frame needs complete input, output, progress, variable, action, and invariant state.`)
        if (frames?.some((frame) => new Set(frame.variables.map(({ name }) => name)).size !== frame.variables.length)) errors.push(`${question.id}: visualization variable names must be unique within a frame.`)
        if (frames?.some((frame) => frame.variables.some(({ name, value, role }) => !name.trim() || !value.trim() || !['input', 'control', 'state', 'output'].includes(role)))) errors.push(`${question.id}: visualization variables require names, values, and valid roles.`)
        const codeLineCount = visualization?.code.split('\n').length ?? 0
        if (frames?.some((frame) => !frame.activeCodeLines.length || frame.activeCodeLines.some((line) => line < 0 || line >= codeLineCount))) errors.push(`${question.id}: every visualization frame must reference valid active code lines.`)
        if (frames?.some((frame) => frame.input !== visualization?.input || frame.expectedOutput !== visualization?.expectedOutput)) errors.push(`${question.id}: every frame must retain the concrete example input and expected output.`)
        if (frames?.slice(1).some((frame) => !frame.variables.some(({ changed }) => changed))) errors.push(`${question.id}: every state-changing frame must identify at least one changed variable.`)
      }
      if ([question.prompt, question.explanation, question.hint, ...question.options].some((value) => !value.trim() || /TODO|placeholder/i.test(value))) errors.push(`${question.id}: empty or placeholder content.`)
    })
    if (JSON.stringify(path) !== JSON.stringify(compileQuestionPath(problem, problems))) errors.push(`${problem.id}: compilation is not deterministic.`)
  }
  for (const id of Object.keys(problemTeachingFacts).map(Number)) if (!catalogIds.has(id)) errors.push(`${id}: teaching fact has no catalog problem.`)
  return errors
}

export const assertValidCoachingContent = (problems: Problem[]) => {
  const errors = validateCoachingContent(problems)
  if (errors.length) throw new Error(`Static coaching content failed validation:\n${errors.join('\n')}`)
}
