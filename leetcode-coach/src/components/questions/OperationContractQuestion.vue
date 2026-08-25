<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { QuestionInteractionResult, QuestionInteractionState, QuizQuestion } from '../../types'
import { evaluateOperationContract } from '../../utils/questionEvaluation'

const props = defineProps<{ question: QuizQuestion; submitted: boolean; initialState?: QuestionInteractionState | null }>()
const emit = defineEmits<{ (event: 'response-change', response: QuestionInteractionResult): void }>()
const config = computed(() => props.question.format === 'operation-contract' ? props.question.config : neverConfig())
const neverConfig = (): never => { throw new Error('Invalid operation-contract question.') }
const restored = props.initialState?.format === 'operation-contract' ? props.initialState : null
const selectedOperationIds = ref<string[]>([...(restored?.selectedOperationIds ?? [])])
const selectedStructureId = ref<string | null>(restored?.selectedStructureId ?? null)
const operationsCommitted = ref(restored?.operationsCommitted ?? false)
const evaluation = computed(() => evaluateOperationContract(config.value, selectedOperationIds.value, selectedStructureId.value))

function toggleOperation(id: string) {
  if (props.submitted || operationsCommitted.value) return
  selectedOperationIds.value = selectedOperationIds.value.includes(id)
    ? selectedOperationIds.value.filter((candidate) => candidate !== id)
    : [...selectedOperationIds.value, id]
}

function commitOperations() {
  if (selectedOperationIds.value.length) operationsCommitted.value = true
}

function reviseOperations() {
  if (!props.submitted) {
    operationsCommitted.value = false
    selectedStructureId.value = null
  }
}

const feedback = computed(() => {
  if (evaluation.value.correct) return props.question.explanation
  const diagnostic = evaluation.value.diagnosticKeys[0]
  const optionId = diagnostic?.split(':').at(-1)
  return config.value.operationOptions.find(({ id }) => id === optionId)?.feedback
    ?? config.value.structures.find(({ id }) => id === selectedStructureId.value)?.tradeoff
    ?? props.question.hint
})

watch([selectedOperationIds, selectedStructureId, operationsCommitted], () => emit('response-change', {
  ...evaluation.value,
  firstAttempt: true,
  hintLevelReached: 0,
  feedback: feedback.value,
  state: {
    format: 'operation-contract',
    selectedOperationIds: [...selectedOperationIds.value],
    selectedStructureId: selectedStructureId.value,
    operationsCommitted: operationsCommitted.value,
  },
}), { deep: true, immediate: true })
</script>

<template>
  <div class="intuition-question mt-7">
    <section class="reasoning-stage">
      <div class="stage-heading"><span>1</span><div><strong>Required operations</strong><p>What must the solution do cheaply while it scans?</p></div></div>
      <div class="choice-chips" role="group" aria-label="Required operations">
        <button v-for="operation in config.operationOptions" :key="operation.id" type="button" :disabled="submitted || operationsCommitted" :aria-pressed="selectedOperationIds.includes(operation.id)" :class="{ selected: selectedOperationIds.includes(operation.id) }" @click="toggleOperation(operation.id)">{{ operation.label }}</button>
      </div>
      <v-btn v-if="!operationsCommitted" class="mt-4" size="small" variant="outlined" :disabled="!selectedOperationIds.length" @click="commitOperations">Use this operation contract</v-btn>
      <v-btn v-else-if="!submitted" class="mt-4" size="small" variant="text" @click="reviseOperations">Revise operations</v-btn>
    </section>
    <section v-if="operationsCommitted" class="reasoning-stage mt-4">
      <div class="stage-heading"><span>2</span><div><strong>Matching state</strong><p>Which structure supports the operations you selected?</p></div></div>
      <div class="choice-chips" role="radiogroup" aria-label="Data structures">
        <button v-for="structure in config.structures" :key="structure.id" type="button" :disabled="submitted" role="radio" :aria-checked="selectedStructureId === structure.id" :class="{ selected: selectedStructureId === structure.id }" @click="selectedStructureId = structure.id">{{ structure.label }}</button>
      </div>
    </section>
  </div>
</template>
