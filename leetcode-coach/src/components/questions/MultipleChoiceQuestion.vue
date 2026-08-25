<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { QuestionInteractionResult, QuestionInteractionState, QuizQuestion } from '../../types'

const props = defineProps<{ question: QuizQuestion; submitted: boolean; initialState?: QuestionInteractionState | null }>()
const emit = defineEmits<{
  (event: 'response-change', response: QuestionInteractionResult): void
}>()

const config = computed(() => props.question.format === 'multiple-choice' ? props.question.config : neverConfig())
const neverConfig = (): never => { throw new Error('Invalid multiple-choice question.') }
const restored = props.initialState?.format === 'multiple-choice' ? props.initialState.selectedAnswer : null
const selectedAnswer = ref<number | null>(restored)
const complete = computed(() => selectedAnswer.value !== null)
const correct = computed(() => selectedAnswer.value === config.value.answer)

function choose(index: number) {
  if (!props.submitted) selectedAnswer.value = index
}

watch(selectedAnswer, () => emit('response-change', {
  complete: complete.value,
  correct: correct.value,
  firstAttempt: true,
  hintLevelReached: 0,
  diagnosticKeys: complete.value && !correct.value ? [`multiple-choice:${selectedAnswer.value}`] : [],
  evidence: { selectedAnswer: selectedAnswer.value },
  feedback: selectedAnswer.value === null
    ? props.question.hint
    : config.value.optionFeedback[selectedAnswer.value] || props.question.hint,
  state: { format: 'multiple-choice', selectedAnswer: selectedAnswer.value },
}), { immediate: true })
</script>

<template>
  <div class="answer-list mt-7" role="radiogroup" :aria-label="question.prompt">
    <button
      v-for="(option, index) in config.options"
      :key="option"
      type="button"
      class="answer-option"
      :class="{
        selected: selectedAnswer === index,
        correct: submitted && correct && index === config.answer,
        wrong: submitted && selectedAnswer === index && index !== config.answer,
      }"
      :disabled="submitted"
      role="radio"
      :aria-checked="selectedAnswer === index"
      @click="choose(index)"
    >
      <span class="option-key">{{ String.fromCharCode(65 + index) }}</span>
      <span>{{ option }}</span>
      <v-icon v-if="submitted && correct && index === config.answer" icon="mdi-check-circle" color="success" />
      <v-icon v-else-if="submitted && selectedAnswer === index" icon="mdi-close-circle" color="error" />
    </button>
  </div>
</template>
