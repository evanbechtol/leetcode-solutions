<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { QuizQuestion } from '../../types'
import { evaluateAlgorithmOrder } from '../../utils/questionEvaluation'

const props = defineProps<{ question: QuizQuestion; submitted: boolean }>()
const emit = defineEmits<{
  (event: 'response-change', response: { ready: boolean; correct: boolean; feedback: string }): void
}>()

const chosenIds = ref<string[]>([])
const config = computed(() => props.question.builder!)
const requiredCount = computed(() => config.value.correctOrder.length)
const chosenSteps = computed(() => chosenIds.value.map((id) => config.value.steps.find((step) => step.id === id)!))
const availableSteps = computed(() => config.value.steps.filter((step) => !chosenIds.value.includes(step.id)))
const evaluation = computed(() => evaluateAlgorithmOrder(config.value, chosenIds.value))
const isCorrect = computed(() => evaluation.value.correct)
const firstMismatch = computed(() => evaluation.value.firstMismatch)

function feedback() {
  if (isCorrect.value) return props.question.explanation
  if (firstMismatch.value >= 0) return `Reconsider step ${firstMismatch.value + 1}. That choice does not have the prerequisites established by the preceding steps.`
  return props.question.hint
}

function choose(id: string) {
  if (props.submitted || chosenIds.value.length >= requiredCount.value) return
  chosenIds.value.push(id)
}

function remove(index: number) {
  if (props.submitted) return
  chosenIds.value.splice(index, 1)
}

function undo() {
  if (!props.submitted) chosenIds.value.pop()
}

function reset() {
  if (!props.submitted) chosenIds.value = []
}

watch(chosenIds, () => emit('response-change', {
  ready: evaluation.value.ready,
  correct: isCorrect.value,
  feedback: feedback(),
}), { deep: true, immediate: true })
</script>

<template>
  <div class="algorithm-builder mt-7">
    <div class="builder-instruction">
      <v-icon icon="mdi-order-numeric-ascending" size="19" />
      <span>Choose {{ requiredCount }} phases. Each phase must have everything it needs before it runs.</span>
    </div>

    <ol class="builder-sequence" aria-label="Your algorithm sequence">
      <li
        v-for="(position, index) in requiredCount"
        :key="position"
        :class="{
          filled: chosenSteps[index],
          misplaced: submitted && !isCorrect && firstMismatch === index,
          verified: submitted && isCorrect,
        }"
      >
        <span class="builder-step-number">{{ String(position).padStart(2, '0') }}</span>
        <button v-if="chosenSteps[index]" type="button" :disabled="submitted" :aria-label="`Remove step ${position}`" @click="remove(index)">
          <strong>{{ chosenSteps[index].text }}</strong>
          <small v-if="submitted && isCorrect">{{ chosenSteps[index].reason }}</small>
          <span v-else-if="!submitted">Tap to remove</span>
        </button>
        <div v-else class="builder-empty">Choose the next phase</div>
      </li>
    </ol>

    <div v-if="!submitted" class="builder-controls">
      <span>{{ chosenIds.length }}/{{ requiredCount }} phases placed</span>
      <div>
        <v-btn size="small" variant="text" prepend-icon="mdi-undo" :disabled="!chosenIds.length" @click="undo">Undo</v-btn>
        <v-btn size="small" variant="text" prepend-icon="mdi-refresh" :disabled="!chosenIds.length" @click="reset">Reset</v-btn>
      </div>
    </div>

    <div v-if="!submitted" class="builder-bank" aria-label="Available algorithm phases">
      <div class="box-label">Available phases</div>
      <button
        v-for="step in availableSteps"
        :key="step.id"
        type="button"
        :disabled="chosenIds.length >= requiredCount"
        @click="choose(step.id)"
      >
        <v-icon icon="mdi-plus" size="17" />
        <span>{{ step.text }}</span>
      </button>
    </div>
  </div>
</template>
