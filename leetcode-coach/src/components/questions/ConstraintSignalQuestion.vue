<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ConstraintSignalConfig, QuestionInteractionResult, QuestionInteractionState, QuizQuestion } from '../../types'
import { constraintSignalChoiceReview, evaluateConstraintSignals } from '../../utils/questionEvaluation'

const props = defineProps<{ question: QuizQuestion; submitted: boolean; initialState?: QuestionInteractionState | null }>()
const emit = defineEmits<{ (event: 'response-change', response: QuestionInteractionResult): void }>()
const config = computed(() => props.question.format === 'constraint-signals' ? props.question.config : neverConfig())
const neverConfig = (): never => { throw new Error('Invalid constraint-signals question.') }
const restored = props.initialState?.format === 'constraint-signals' ? props.initialState.mappings : {}
const mappings = ref<Record<string, string | null>>({ ...restored })
const evaluation = computed(() => evaluateConstraintSignals(config.value, mappings.value))

function mapSignal(signalId: string, consequenceId: string | null) {
  if (props.submitted) return
  mappings.value = { ...mappings.value, [signalId]: consequenceId }
}

function reviewState(signal: ConstraintSignalConfig['signals'][number], consequenceId: string | null) {
  return constraintSignalChoiceReview(signal, mappings.value[signal.id], consequenceId, props.submitted)
}

function reviewLabel(signal: ConstraintSignalConfig['signals'][number], consequenceId: string | null) {
  const state = reviewState(signal, consequenceId)
  if (state === 'incorrect') return 'Incorrect'
  if (state === 'correct-selected') return 'Correct'
  return ''
}

const feedback = computed(() => {
  if (evaluation.value.correct) return props.question.explanation
  const signalId = evaluation.value.diagnosticKeys[0]?.split(':').at(-1)
  const selectedId = signalId ? mappings.value[signalId] : null
  if (selectedId) return config.value.consequences.find(({ id }) => id === selectedId)?.feedback ?? props.question.hint
  return props.question.hint
})

watch(mappings, () => emit('response-change', {
  ...evaluation.value,
  firstAttempt: true,
  hintLevelReached: 0,
  feedback: feedback.value,
  state: { format: 'constraint-signals', mappings: { ...mappings.value } },
}), { deep: true, immediate: true })
</script>

<template>
  <div class="intuition-question mt-7">
    <div class="contract-source"><span>Problem contract</span><p>{{ config.sourceText }}</p></div>
    <div class="mapping-stack" aria-label="Map each contract phrase to what it implies">
      <fieldset v-for="signal in config.signals" :key="signal.id" class="mapping-row" :disabled="submitted">
        <legend><span class="signal-chip">{{ signal.label }}</span></legend>
        <p>What does this phrase justify?</p>
        <div class="choice-chips">
          <button
            v-for="consequence in config.consequences"
            :key="consequence.id"
            type="button"
            :aria-pressed="mappings[signal.id] === consequence.id"
            :aria-invalid="reviewState(signal, consequence.id) === 'incorrect' || undefined"
            :data-review-state="reviewState(signal, consequence.id)"
            :class="[mappings[signal.id] === consequence.id && 'selected', reviewState(signal, consequence.id)]"
            @click="mapSignal(signal.id, consequence.id)"
          >
            <span>{{ consequence.text }}</span>
            <span v-if="reviewLabel(signal, consequence.id)" class="choice-review-label">{{ reviewLabel(signal, consequence.id) }}</span>
          </button>
          <button
            type="button"
            :aria-pressed="Object.prototype.hasOwnProperty.call(mappings, signal.id) && mappings[signal.id] === null"
            :aria-invalid="reviewState(signal, null) === 'incorrect' || undefined"
            :data-review-state="reviewState(signal, null)"
            :class="[Object.prototype.hasOwnProperty.call(mappings, signal.id) && mappings[signal.id] === null && 'selected', reviewState(signal, null)]"
            @click="mapSignal(signal.id, null)"
          >
            <span>No direct algorithmic consequence</span>
            <span v-if="reviewLabel(signal, null)" class="choice-review-label">{{ reviewLabel(signal, null) }}</span>
          </button>
        </div>
      </fieldset>
    </div>
  </div>
</template>
