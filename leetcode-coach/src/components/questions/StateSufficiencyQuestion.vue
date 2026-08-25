<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { QuestionInteractionResult, QuestionInteractionState, QuizQuestion, StateItemClassification } from '../../types'
import { evaluateStateSufficiency } from '../../utils/questionEvaluation'

const props = defineProps<{ question: QuizQuestion; submitted: boolean; initialState?: QuestionInteractionState | null }>()
const emit = defineEmits<{ (event: 'response-change', response: QuestionInteractionResult): void }>()
const config = computed(() => props.question.format === 'state-sufficiency' ? props.question.config : neverConfig())
const neverConfig = (): never => { throw new Error('Invalid state-sufficiency question.') }
const restored = props.initialState?.format === 'state-sufficiency' ? props.initialState.classifications : {}
const classifications = ref<Record<string, StateItemClassification>>({ ...restored })
const evaluation = computed(() => evaluateStateSufficiency(config.value, classifications.value))
const choices: Array<{ value: StateItemClassification; label: string }> = [
  { value: 'required', label: 'Keep — required' },
  { value: 'optional-redundant', label: 'Optional — already represented' },
  { value: 'discardable', label: 'Safe to forget' },
]

function classify(id: string, event: Event) {
  if (props.submitted) return
  classifications.value = { ...classifications.value, [id]: (event.target as HTMLSelectElement).value as StateItemClassification }
}

const feedback = computed(() => {
  if (evaluation.value.correct) return props.question.explanation
  const itemId = evaluation.value.diagnosticKeys[0]?.split(':').at(-1)
  return config.value.items.find(({ id }) => id === itemId)?.feedback ?? props.question.hint
})

watch(classifications, () => emit('response-change', {
  ...evaluation.value,
  firstAttempt: true,
  hintLevelReached: 0,
  feedback: feedback.value,
  state: { format: 'state-sufficiency', classifications: { ...classifications.value } },
}), { deep: true, immediate: true })
</script>

<template>
  <div class="intuition-question mt-7">
    <div class="contract-source"><span>Checkpoint</span><strong>{{ config.checkpoint.input }}</strong><p>{{ config.checkpoint.stateDescription }}</p></div>
    <div v-if="config.maxItems" class="state-budget">State budget: keep at most {{ config.maxItems }} essential items.</div>
    <div class="classification-list">
      <label v-for="item in config.items" :key="item.id" class="classification-row">
        <span>{{ item.label }}</span>
        <select :value="classifications[item.id] ?? ''" :disabled="submitted" :aria-label="`Classify ${item.label}`" @change="classify(item.id, $event)">
          <option value="" disabled>Choose what happens to this information</option>
          <option v-for="choice in choices" :key="choice.value" :value="choice.value">{{ choice.label }}</option>
        </select>
      </label>
    </div>
  </div>
</template>
