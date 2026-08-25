<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { MutationImpactType, QuestionInteractionResult, QuestionInteractionState, QuizQuestion } from '../../types'
import { evaluateConstraintMutation } from '../../utils/questionEvaluation'

const props = defineProps<{ question: QuizQuestion; submitted: boolean; initialState?: QuestionInteractionState | null }>()
const emit = defineEmits<{ (event: 'response-change', response: QuestionInteractionResult): void }>()
const config = computed(() => props.question.format === 'constraint-mutation' ? props.question.config : neverConfig())
const neverConfig = (): never => { throw new Error('Invalid constraint-mutation question.') }
const restored = props.initialState?.format === 'constraint-mutation' ? props.initialState.impacts : {}
const impacts = ref<Record<string, MutationImpactType>>({ ...restored })
const evaluation = computed(() => evaluateConstraintMutation(config.value, impacts.value))
const impactChoices: Array<{ value: MutationImpactType; label: string }> = [
  { value: 'unchanged', label: 'Keep unchanged' },
  { value: 'modified', label: 'Modify' },
  { value: 'new', label: 'Add new requirement' },
  { value: 'invalidated', label: 'No longer valid' },
]

function classify(id: string, event: Event) {
  if (!props.submitted) impacts.value = { ...impacts.value, [id]: (event.target as HTMLSelectElement).value as MutationImpactType }
}

const feedback = computed(() => {
  if (evaluation.value.correct) return props.question.explanation
  const aspectId = evaluation.value.diagnosticKeys[0]?.split(':').at(-1)
  return config.value.aspects.find(({ id }) => id === aspectId)?.feedback ?? props.question.hint
})

watch(impacts, () => emit('response-change', {
  ...evaluation.value,
  firstAttempt: true,
  hintLevelReached: 0,
  feedback: feedback.value,
  state: { format: 'constraint-mutation', impacts: { ...impacts.value } },
}), { deep: true, immediate: true })
</script>

<template>
  <div class="intuition-question mt-7">
    <div class="mutation-diff">
      <span>{{ config.original.title }}</span>
      <p>{{ config.original.contract }}</p>
      <div v-for="line in config.mutation.removedText" :key="`remove-${line}`" class="diff-remove">− {{ line }}</div>
      <div v-for="line in config.mutation.addedText" :key="`add-${line}`" class="diff-add">+ {{ line }}</div>
    </div>
    <p class="mutation-label">{{ config.mutation.label }}</p>
    <div class="classification-list">
      <label v-for="aspect in config.aspects" :key="aspect.id" class="classification-row">
        <span>{{ aspect.label }}</span>
        <select :value="impacts[aspect.id] ?? ''" :disabled="submitted" :aria-label="`Impact on ${aspect.label}`" @change="classify(aspect.id, $event)">
          <option value="" disabled>Choose the impact</option>
          <option v-for="choice in impactChoices" :key="choice.value" :value="choice.value">{{ choice.label }}</option>
        </select>
      </label>
    </div>
  </div>
</template>
