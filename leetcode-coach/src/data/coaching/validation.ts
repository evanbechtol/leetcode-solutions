import { QUESTION_FORMATS } from '../../types'
import type { Problem, QuizQuestion } from '../../types'
import { hasDataStructureGateBeforeAlgorithms } from '../../utils/questionSequence'
import { lessons } from '../lessons'
import { assembleConstructionCode } from './codeConstruction'
import { compileQuestionPath } from './compiler'
import { compilePilotCoreQuestions, compilePilotTransferQuestions } from './intuitionCompiler'
import { INTUITION_PILOT_IDS, PILOT_REASONING_MODELS } from './intuitionFacts'
import { beginnerPatternProfiles } from './beginnerProfiles'
import { DEEP_PROBLEM_IDS, problemTeachingFacts } from './problemFacts'
import { patternProfiles, rawTagPatternMap } from './patterns'

const wordCount = (value: string) => value.trim().split(/\s+/).filter(Boolean).length
const duplicates = (ids: string[]) => ids.filter((id, index) => ids.indexOf(id) !== index)
const empty = (value: string) => !value.trim() || /TODO|placeholder/i.test(value)

const validateQuestion = (question: QuizQuestion, problem: Problem, lessonSlugs: Set<string>) => {
  const errors: string[] = []
  const prefix = question.id
  if (!QUESTION_FORMATS.includes(question.format)) errors.push(`${prefix}: unknown format.`)
  if ([question.id, question.prompt, question.explanation, question.hint, question.contentVersion].some(empty)) errors.push(`${prefix}: empty or placeholder common content.`)
  if (!question.reasoningSkillKeys.length) errors.push(`${prefix}: at least one reasoning skill is required.`)
  if (!['observe', 'complete', 'construct', 'retrieve', 'transfer'].includes(question.instructionalLevel)) errors.push(`${prefix}: invalid instructional level.`)
  if (question.hintLevels?.length !== 3 || new Set(question.hintLevels?.map(({ id }) => id)).size !== 3) errors.push(`${prefix}: the cue, relationship, and worked-step hint ladder is required.`)

  switch (question.format) {
    case 'multiple-choice': {
      const { options, answer, optionFeedback, misconceptionLinks } = question.config
      if (options.length !== 4 || new Set(options).size !== 4 || options.some(empty)) errors.push(`${prefix}: multiple choice requires four unique options.`)
      if (answer < 0 || answer >= options.length) errors.push(`${prefix}: answer is out of bounds.`)
      if (optionFeedback.length !== options.length || optionFeedback.some(empty)) errors.push(`${prefix}: every option needs feedback.`)
      if (optionFeedback[answer] !== question.explanation) errors.push(`${prefix}: correct-option feedback must equal the consolidation explanation.`)
      if (misconceptionLinks.length !== options.length) errors.push(`${prefix}: option-level repair metadata is incomplete.`)
      if (misconceptionLinks.some((link, index) => index === answer ? link !== undefined : !link || !lessonSlugs.has(link.lessonSlug))) errors.push(`${prefix}: every distractor needs a valid repair destination.`)
      if (DEEP_PROBLEM_IDS.has(problem.id) && misconceptionLinks.some((link, index) => index !== answer && link?.specificity !== 'reviewed-option')) errors.push(`${prefix}: deep paths require reviewed distractor diagnostics.`)
      if (!['contract', 'time-complexity', 'space-complexity'].includes(question.stage ?? '') && options.some((option) => wordCount(option) > 32)) errors.push(`${prefix}: answer option exceeds 32 words.`)
      if (question.hintLevels?.some(({ text }) => options.some((option) => text.trim().toLocaleLowerCase() === option.trim().toLocaleLowerCase()))) errors.push(`${prefix}: a hint directly reveals an option.`)
      break
    }
    case 'algorithm-builder': {
      const { steps, correctOrder } = question.config
      if (steps.length < 6 || correctOrder.length !== 4 || duplicates(steps.map(({ id }) => id)).length) errors.push(`${prefix}: invalid algorithm-builder step set.`)
      if (correctOrder.some((id) => !steps.some((step) => step.id === id))) errors.push(`${prefix}: builder order references an unknown step.`)
      if (steps.some((step) => empty(step.text) || empty(step.reason) || wordCount(step.text) > 32)) errors.push(`${prefix}: builder steps need concise reviewed wording.`)
      break
    }
    case 'code-construction': {
      const config = question.config
      if (!config.languages.length || duplicates(config.languages).length || config.steps.length < 5 || config.steps.length > 7) errors.push(`${prefix}: invalid construction language or step count.`)
      const priorIds = new Set<string>()
      for (const language of config.languages) {
        if (empty(config.openingByLanguage[language] ?? '') || config.closingByLanguage[language] === undefined) errors.push(`${prefix}: missing ${language} construction boundary.`)
        if (empty(assembleConstructionCode(config, language))) errors.push(`${prefix}: assembled ${language} code is empty.`)
      }
      for (const step of config.steps) {
        if (step.prerequisites.some((id) => !priorIds.has(id))) errors.push(`${prefix}/${step.id}: prerequisite must reference an earlier step.`)
        if (step.choices.length !== 3 || duplicates(step.choices.map(({ id }) => id)).length || !step.choices.some(({ id }) => id === step.correctChoiceId)) errors.push(`${prefix}/${step.id}: invalid construction choices.`)
        if (step.hints.length !== 3 || duplicates(step.hints.map(({ id }) => id)).length) errors.push(`${prefix}/${step.id}: construction step needs three hints.`)
        priorIds.add(step.id)
      }
      break
    }
    case 'iteration-visualization': {
      const { input, expectedOutput, code, language, frames, checkpoint } = question.config
      if ([input, expectedOutput, code, language].some(empty) || frames.length < 6) errors.push(`${prefix}: visualization needs complete I/O, code, and at least six frames.`)
      if (checkpoint.options.length !== 4 || checkpoint.answer < 0 || checkpoint.answer >= checkpoint.options.length) errors.push(`${prefix}: invalid visualization checkpoint.`)
      const lineCount = code.split('\n').length
      if (frames.some((frame) => empty(frame.title) || empty(frame.action) || empty(frame.invariant) || !frame.activeCodeLines.length || frame.activeCodeLines.some((line) => line < 0 || line >= lineCount))) errors.push(`${prefix}: incomplete visualization frame.`)
      break
    }
    case 'constraint-signals': {
      const { sourceText, signals, consequences } = question.config
      const consequenceIds = new Set(consequences.map(({ id }) => id))
      if (empty(sourceText) || signals.length < 3 || !signals.some(({ importance }) => importance === 'decisive')) errors.push(`${prefix}: constraint fixture needs source text and decisive signals.`)
      if (duplicates(signals.map(({ id }) => id)).length || duplicates(consequences.map(({ id }) => id)).length) errors.push(`${prefix}: signal and consequence ids must be unique.`)
      if (signals.some(({ importance, consequenceIds: ids }) => importance === 'incidental' ? ids.length !== 0 : !ids.length || ids.some((id) => !consequenceIds.has(id)))) errors.push(`${prefix}: signal consequence mapping is invalid.`)
      if (consequences.some(({ text, feedback }) => empty(text) || empty(feedback))) errors.push(`${prefix}: every consequence needs text and diagnostic feedback.`)
      break
    }
    case 'operation-contract': {
      const { operationOptions, structures, correctStructureIds } = question.config
      const operationIds = new Set(operationOptions.map(({ id }) => id))
      if (!operationOptions.some(({ required }) => required) || duplicates(operationOptions.map(({ id }) => id)).length || duplicates(structures.map(({ id }) => id)).length) errors.push(`${prefix}: operation fixture needs unique required operations and structures.`)
      if (structures.some(({ satisfiesOperationIds }) => satisfiesOperationIds.some((id) => !operationIds.has(id)))) errors.push(`${prefix}: structure references an unknown operation.`)
      if (!correctStructureIds.length || correctStructureIds.some((id) => !structures.some((structure) => structure.id === id))) errors.push(`${prefix}: correct structure ids are invalid.`)
      if (operationOptions.some(({ label, feedback }) => empty(label) || empty(feedback)) || structures.some(({ label, tradeoff }) => empty(label) || empty(tradeoff))) errors.push(`${prefix}: operation choices need diagnostic wording.`)
      break
    }
    case 'state-sufficiency': {
      const { checkpoint, items, minimalRequiredSets, maxItems } = question.config
      const itemIds = new Set(items.map(({ id }) => id))
      const requiredIds = items.filter(({ classification }) => classification === 'required').map(({ id }) => id)
      if (empty(checkpoint.input) || empty(checkpoint.stateDescription) || duplicates(items.map(({ id }) => id)).length || !minimalRequiredSets.length) errors.push(`${prefix}: invalid state fixture.`)
      if (minimalRequiredSets.some((set) => !set.length || set.some((id) => !itemIds.has(id)) || requiredIds.some((id) => !set.includes(id)))) errors.push(`${prefix}: minimal state set is not sufficient.`)
      if (maxItems !== undefined && minimalRequiredSets.some((set) => set.length > maxItems)) errors.push(`${prefix}: state budget is smaller than a minimal sufficient set.`)
      if (items.some(({ label, feedback }) => empty(label) || empty(feedback))) errors.push(`${prefix}: state items need diagnostic wording.`)
      break
    }
    case 'near-twin': {
      const config = question.config
      const factIds = new Set(config.facts.map(({ id }) => id))
      if (!config.relationshipOptions.some(({ id }) => id === config.correctRelationshipId) || !config.decisiveReasonIds.length || config.decisiveReasonIds.some((id) => !factIds.has(id))) errors.push(`${prefix}: near-twin tuple is invalid.`)
      if (!config.changedFactIds.length || config.changedFactIds.some((id) => !factIds.has(id))) errors.push(`${prefix}: near-twin changed facts are invalid.`)
      break
    }
    case 'constraint-mutation': {
      const config = question.config
      if (!(config.mutation.addedText?.length || config.mutation.removedText?.length) || config.aspects.length < 3 || duplicates(config.aspects.map(({ id }) => id)).length) errors.push(`${prefix}: mutation needs a concrete diff and unique aspects.`)
      if (config.aspects.some(({ label, feedback }) => empty(label) || empty(feedback))) errors.push(`${prefix}: mutation aspects need feedback.`)
      break
    }
    case 'structural-analogy': {
      const config = question.config
      const choiceAIds = new Set(config.choicesA.map(({ id }) => id))
      const choiceBIds = new Set(config.choicesB.map(({ id }) => id))
      if (config.roles.length < 3 || duplicates(config.roles.map(({ id }) => id)).length) errors.push(`${prefix}: analogy needs at least three unique roles.`)
      if (config.roles.some(({ problemAChoiceId, problemBChoiceId }) => !choiceAIds.has(problemAChoiceId) || !choiceBIds.has(problemBChoiceId))) errors.push(`${prefix}: analogy role references an unknown choice.`)
      break
    }
    default: {
      const exhaustive: never = question
      errors.push(`Unknown question format: ${JSON.stringify(exhaustive)}`)
    }
  }
  return errors
}

export const validateCoachingContent = (problems: Problem[]) => {
  const errors: string[] = []
  if (problems.length !== 136) errors.push(`Expected 136 merged catalog problems; found ${problems.length}.`)
  const catalogIds = new Set(problems.map(({ id }) => id))
  const lessonSlugs = new Set(lessons.map(({ slug }) => slug))

  for (const pattern of Object.keys(patternProfiles)) {
    const beginner = beginnerPatternProfiles[pattern as keyof typeof beginnerPatternProfiles]
    if (!beginner) {
      errors.push(`${pattern}: missing beginner-facing pattern content.`)
      continue
    }
    for (const [field, value] of Object.entries(beginner)) {
      if (empty(value)) errors.push(`${pattern}.${field}: beginner-facing content is empty.`)
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
    const expected = DEEP_PROBLEM_IDS.has(problem.id) ? 12 : 9
    if (path.length !== expected) errors.push(`${problem.id}: expected ${expected} questions; found ${path.length}.`)
    const formats = path.map(({ format }) => format)
    if (formats.filter((format) => format === 'algorithm-builder' || format === 'code-construction').length !== 1) errors.push(`${problem.id}: expected one algorithm-building interaction.`)
    if (formats.includes('iteration-visualization')) errors.push(`${problem.id}: iteration visualization belongs in Learn, not the graded path.`)
    const buildIndex = formats.findIndex((format) => format === 'algorithm-builder' || format === 'code-construction')
    if (buildIndex !== formats.length - 3 || path.at(-2)?.stage !== 'time-complexity' || path.at(-1)?.stage !== 'space-complexity') errors.push(`${problem.id}: construction must be followed only by time and space complexity.`)
    if (!hasDataStructureGateBeforeAlgorithms(path)) errors.push(`${problem.id}: data-structure reasoning must precede algorithm-dependent questions.`)
    for (const question of path) errors.push(...validateQuestion(question, problem, lessonSlugs))
    if (JSON.stringify(path) !== JSON.stringify(compileQuestionPath(problem, problems))) errors.push(`${problem.id}: compilation is not deterministic.`)
  }

  for (const id of Object.keys(problemTeachingFacts).map(Number)) if (!catalogIds.has(id)) errors.push(`${id}: teaching fact has no catalog problem.`)
  if (INTUITION_PILOT_IDS.size !== 5) errors.push(`Expected five intuition pilots; found ${INTUITION_PILOT_IDS.size}.`)
  const pilotFormats = new Set<string>()
  for (const id of INTUITION_PILOT_IDS) {
    const problem = problems.find((candidate) => candidate.id === id)
    const model = PILOT_REASONING_MODELS[id]
    if (!problem || !model?.reviewed) {
      errors.push(`${id}: missing reviewed pilot reasoning model.`)
      continue
    }
    const core = Object.values(compilePilotCoreQuestions(problem)) as QuizQuestion[]
    const transfer = compilePilotTransferQuestions(problem)
    if (core.length < 3) errors.push(`${id}: pilot metadata must support at least three Wave 1 formats.`)
    for (const question of [...core, ...transfer]) {
      pilotFormats.add(question.format)
      errors.push(...validateQuestion(question, problem, lessonSlugs))
    }
  }
  for (const format of ['constraint-signals', 'operation-contract', 'state-sufficiency', 'near-twin', 'constraint-mutation', 'structural-analogy']) if (!pilotFormats.has(format)) errors.push(`Wave 1 format ${format} has no reviewed pilot fixture.`)
  return errors
}

export const assertValidCoachingContent = (problems: Problem[]) => {
  const errors = validateCoachingContent(problems)
  if (errors.length) throw new Error(`Static coaching content failed validation:\n${errors.join('\n')}`)
}
