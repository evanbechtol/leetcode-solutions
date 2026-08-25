<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { QuestionInteractionResult, QuestionInteractionState, QuizQuestion } from '../../types'
import { evaluateNearTwin } from '../../utils/questionEvaluation'

const props = defineProps<{ question: QuizQuestion; submitted: boolean; initialState?: QuestionInteractionState | null }>()
const emit = defineEmits<{ (event: 'response-change', response: QuestionInteractionResult): void }>()
const config = computed(() => props.question.format === 'near-twin' ? props.question.config : neverConfig())
const neverConfig = (): never => { throw new Error('Invalid near-twin question.') }
const restored = props.initialState?.format === 'near-twin' ? props.initialState : null
const relationshipId = ref<string | null>(restored?.relationshipId ?? null)
const reasonIds = ref<string[]>([...(restored?.reasonIds ?? [])])
const evaluation = computed(() => evaluateNearTwin(config.value, relationshipId.value, reasonIds.value))

function selectReason(id: string) {
  if (!props.submitted) reasonIds.value = [id]
}

const feedback = computed(() => {
  if (evaluation.value.correct) return props.question.explanation
  const relationship = config.value.relationshipOptions.find(({ id }) => id === relationshipId.value)
  const reason = config.value.facts.find(({ id }) => reasonIds.value.includes(id))
  return relationship?.feedback || reason?.feedback || props.question.hint
})

watch([relationshipId, reasonIds], () => emit('response-change', {
  ...evaluation.value,
  firstAttempt: true,
  hintLevelReached: 0,
  feedback: feedback.value,
  state: { format: 'near-twin', relationshipId: relationshipId.value, reasonIds: [...reasonIds.value] },
}), { deep: true, immediate: true })
</script>

<template>
  <div class="intuition-question mt-7">
    <div class="twin-grid">
      <article><span>Original</span><strong>{{ config.baseProblem.title }}</strong><p>{{ config.baseProblem.contract }}</p></article>
      <article><span>Changed contract</span><strong>{{ config.variantProblem.title }}</strong><p>{{ config.variantProblem.contract }}</p></article>
    </div>
    <section class="reasoning-stage mt-4">
      <strong>Does the original reasoning still hold?</strong>
      <div class="choice-chips mt-3" role="radiogroup" aria-label="Relationship between the two contracts">
        <button v-for="option in config.relationshipOptions" :key="option.id" type="button" :disabled="submitted" role="radio" :aria-checked="relationshipId === option.id" :class="{ selected: relationshipId === option.id }" @click="relationshipId = option.id">{{ option.label }}</button>
      </div>
    </section>
    <section class="reasoning-stage mt-4">
      <strong>Which changed property decides that?</strong>
      <div class="choice-chips mt-3" role="radiogroup" aria-label="Decisive changed property">
        <button v-for="fact in config.facts" :key="fact.id" type="button" :disabled="submitted" role="radio" :aria-checked="reasonIds.includes(fact.id)" :class="{ selected: reasonIds.includes(fact.id) }" @click="selectReason(fact.id)">{{ fact.label }}</button>
      </div>
    </section>
  </div>
</template>
