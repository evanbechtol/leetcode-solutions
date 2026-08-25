import type { Component } from 'vue'
import type { QuestionFormat } from '../../types'
import AlgorithmBuilderQuestion from './AlgorithmBuilderQuestion.vue'
import CodeConstructionQuestion from './CodeConstructionQuestion.vue'
import ConstraintMutationQuestion from './ConstraintMutationQuestion.vue'
import ConstraintSignalQuestion from './ConstraintSignalQuestion.vue'
import IterationVisualizationQuestion from './IterationVisualizationQuestion.vue'
import MultipleChoiceQuestion from './MultipleChoiceQuestion.vue'
import NearTwinQuestion from './NearTwinQuestion.vue'
import OperationContractQuestion from './OperationContractQuestion.vue'
import StateSufficiencyQuestion from './StateSufficiencyQuestion.vue'
import StructuralAnalogyQuestion from './StructuralAnalogyQuestion.vue'

export const QUESTION_COMPONENTS: Record<QuestionFormat, Component> = {
  'multiple-choice': MultipleChoiceQuestion,
  'algorithm-builder': AlgorithmBuilderQuestion,
  'iteration-visualization': IterationVisualizationQuestion,
  'code-construction': CodeConstructionQuestion,
  'constraint-signals': ConstraintSignalQuestion,
  'operation-contract': OperationContractQuestion,
  'state-sufficiency': StateSufficiencyQuestion,
  'near-twin': NearTwinQuestion,
  'constraint-mutation': ConstraintMutationQuestion,
  'structural-analogy': StructuralAnalogyQuestion,
}

export const questionComponentFor = (format: QuestionFormat) => QUESTION_COMPONENTS[format]
