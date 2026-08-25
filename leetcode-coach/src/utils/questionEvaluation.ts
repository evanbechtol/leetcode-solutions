import type {
  AlgorithmBuilderConfig,
  ConstraintMutationConfig,
  ConstraintSignalConfig,
  MutationImpactType,
  NearTwinConfig,
  OperationContractConfig,
  StateItemClassification,
  StateSufficiencyConfig,
  StructuralAnalogyConfig,
} from '../types'
import type { CodeConstructionStep } from '../types'

export const evaluateAlgorithmOrder = (config: AlgorithmBuilderConfig, chosenIds: string[]) => {
  const firstMismatch = chosenIds.findIndex((id, index) => id !== config.correctOrder[index])
  const ready = chosenIds.length === config.correctOrder.length
  return {
    ready,
    correct: ready && firstMismatch === -1,
    firstMismatch,
  }
}

export const evaluateSelectedOption = (answer: number, selectedAnswer: number | null) => ({
  ready: selectedAnswer !== null,
  correct: selectedAnswer !== null && selectedAnswer === answer,
})

export const evaluateCodeConstructionChoice = (step: CodeConstructionStep, selectedChoiceId: string | null) => {
  const choice = step.choices.find(({ id }) => id === selectedChoiceId)
  return {
    ready: Boolean(choice),
    correct: choice?.id === step.correctChoiceId,
    feedback: choice?.feedback ?? '',
  }
}

const owns = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key)
const sameSet = (left: string[], right: string[]) => left.length === right.length && left.every((id) => right.includes(id))

export type SelectedAnswerReview = 'neutral' | 'incorrect' | 'correct-selected'

export const constraintSignalChoiceReview = (
  signal: ConstraintSignalConfig['signals'][number],
  selectedConsequenceId: string | null | undefined,
  consequenceId: string | null,
  submitted: boolean,
): SelectedAnswerReview => {
  if (!submitted) return 'neutral'
  const selected = selectedConsequenceId === consequenceId
  const correct = consequenceId === null
    ? signal.consequenceIds.length === 0
    : signal.consequenceIds.includes(consequenceId)
  if (selected && correct) return 'correct-selected'
  if (selected) return 'incorrect'
  return 'neutral'
}

export const stateClassificationReview = (
  item: StateSufficiencyConfig['items'][number],
  selectedClassification: StateItemClassification | undefined,
  submitted: boolean,
): SelectedAnswerReview => {
  if (!submitted || selectedClassification === undefined) return 'neutral'
  return selectedClassification === item.classification ? 'correct-selected' : 'incorrect'
}

export const evaluateConstraintSignals = (config: ConstraintSignalConfig, mappings: Record<string, string | null>) => {
  const complete = config.signals.every(({ id }) => owns(mappings, id))
  const wrongSignalIds = config.signals.filter((signal) => {
    if (!owns(mappings, signal.id)) return false
    const selected = mappings[signal.id]
    return signal.consequenceIds.length ? selected === null || !signal.consequenceIds.includes(selected) : selected !== null
  }).map(({ id }) => id)
  const decisiveSignalsFound = config.signals
    .filter(({ importance, id }) => importance === 'decisive' && !wrongSignalIds.includes(id) && owns(mappings, id))
    .map(({ id }) => id)
  return {
    complete,
    correct: complete && wrongSignalIds.length === 0,
    diagnosticKeys: wrongSignalIds.map((id) => `constraint-signal:${id}`),
    evidence: {
      mappings: { ...mappings },
      decisiveSignalsFound,
      falseSignalsSelected: wrongSignalIds,
    },
  }
}

export const evaluateOperationContract = (
  config: OperationContractConfig,
  selectedOperationIds: string[],
  selectedStructureId: string | null,
) => {
  const requiredIds = config.operationOptions.filter(({ required }) => required).map(({ id }) => id)
  const missingOperationIds = requiredIds.filter((id) => !selectedOperationIds.includes(id))
  const unnecessaryOperationIds = selectedOperationIds.filter((id) => !requiredIds.includes(id))
  const structureCorrect = selectedStructureId !== null && config.correctStructureIds.includes(selectedStructureId)
  return {
    complete: selectedStructureId !== null,
    correct: selectedStructureId !== null && sameSet(selectedOperationIds, requiredIds) && structureCorrect,
    diagnosticKeys: [
      ...missingOperationIds.map((id) => `operation-missing:${id}`),
      ...unnecessaryOperationIds.map((id) => `operation-unnecessary:${id}`),
      ...(selectedStructureId !== null && !structureCorrect ? [`structure-mismatch:${selectedStructureId}`] : []),
    ],
    evidence: { selectedOperationIds: [...selectedOperationIds], selectedStructureId, missingOperationIds, unnecessaryOperationIds },
  }
}

export const evaluateStateSufficiency = (
  config: StateSufficiencyConfig,
  classifications: Record<string, StateItemClassification>,
) => {
  const complete = config.items.every(({ id }) => owns(classifications, id))
  const incorrectItemIds = config.items
    .filter(({ id, classification }) => owns(classifications, id) && classifications[id] !== classification)
    .map(({ id }) => id)
  const keptIds = config.items
    .filter(({ id }) => classifications[id] === 'required')
    .map(({ id }) => id)
  const minimal = config.minimalRequiredSets.some((set) => sameSet(keptIds, set))
  const missingRequiredIds = config.items
    .filter(({ id, classification }) => classification === 'required' && classifications[id] !== 'required')
    .map(({ id }) => id)
  const sufficiency = missingRequiredIds.length ? 'insufficient' : minimal ? 'minimal' : 'sufficient-redundant'
  return {
    complete,
    correct: complete && incorrectItemIds.length === 0,
    diagnosticKeys: incorrectItemIds.map((id) => `state-classification:${id}`),
    evidence: { classifications: { ...classifications }, essentialStateIds: keptIds, missingRequiredIds, sufficiency },
  }
}

export const evaluateNearTwin = (config: NearTwinConfig, relationshipId: string | null, reasonIds: string[]) => {
  const relationshipCorrect = relationshipId === config.correctRelationshipId
  const reasonsCorrect = sameSet(reasonIds, config.decisiveReasonIds)
  return {
    complete: relationshipId !== null && reasonIds.length > 0,
    correct: relationshipCorrect && reasonsCorrect,
    diagnosticKeys: [
      ...(!relationshipCorrect && relationshipId ? [`pattern-boundary:${relationshipId}`] : []),
      ...(!reasonsCorrect ? ['pattern-boundary:decisive-property'] : []),
    ],
    evidence: { relationshipId, reasonIds: [...reasonIds], changedFactIds: [...config.changedFactIds] },
  }
}

export const evaluateConstraintMutation = (config: ConstraintMutationConfig, impacts: Record<string, MutationImpactType>) => {
  const complete = config.aspects.every(({ id }) => owns(impacts, id))
  const incorrectAspectIds = config.aspects
    .filter(({ id, correctImpact }) => owns(impacts, id) && impacts[id] !== correctImpact)
    .map(({ id }) => id)
  return {
    complete,
    correct: complete && incorrectAspectIds.length === 0,
    diagnosticKeys: incorrectAspectIds.map((id) => `constraint-mutation:${id}`),
    evidence: { impacts: { ...impacts }, incorrectAspectIds },
  }
}

export const evaluateStructuralAnalogy = (
  config: StructuralAnalogyConfig,
  mappings: Record<string, { problemAChoiceId: string; problemBChoiceId: string }>,
) => {
  const complete = config.roles.every(({ id }) => Boolean(mappings[id]?.problemAChoiceId && mappings[id]?.problemBChoiceId))
  const incorrectRoleIds = config.roles.filter((role) => {
    const mapping = mappings[role.id]
    return mapping && (mapping.problemAChoiceId !== role.problemAChoiceId || mapping.problemBChoiceId !== role.problemBChoiceId)
  }).map(({ id }) => id)
  return {
    complete,
    correct: complete && incorrectRoleIds.length === 0,
    diagnosticKeys: incorrectRoleIds.map((id) => `structural-analogy:${id}`),
    evidence: { mappings: structuredClone(mappings), incorrectRoleIds },
  }
}
