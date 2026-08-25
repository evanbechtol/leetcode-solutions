<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { QuestionInteractionResult, QuestionInteractionState, QuizQuestion } from '../../types'
import { evaluateStructuralAnalogy } from '../../utils/questionEvaluation'

type RoleMapping = { problemAChoiceId: string; problemBChoiceId: string }
const props = defineProps<{ question: QuizQuestion; submitted: boolean; initialState?: QuestionInteractionState | null }>()
const emit = defineEmits<{ (event: 'response-change', response: QuestionInteractionResult): void }>()
const config = computed(() => props.question.format === 'structural-analogy' ? props.question.config : neverConfig())
const neverConfig = (): never => { throw new Error('Invalid structural-analogy question.') }
const restored = props.initialState?.format === 'structural-analogy' ? props.initialState.mappings : {}
const mappings = ref<Record<string, RoleMapping>>({ ...restored })
const evaluation = computed(() => evaluateStructuralAnalogy(config.value, mappings.value))

function updateMapping(roleId: string, side: keyof RoleMapping, event: Event) {
  if (props.submitted) return
  const previous = mappings.value[roleId] ?? { problemAChoiceId: '', problemBChoiceId: '' }
  const next = { ...previous, [side]: (event.target as HTMLSelectElement).value }
  const updated = { ...mappings.value }
  if (next.problemAChoiceId && next.problemBChoiceId) updated[roleId] = next
  else updated[roleId] = next
  mappings.value = updated
}

const feedback = computed(() => {
  if (evaluation.value.correct) return props.question.explanation
  const roleId = evaluation.value.diagnosticKeys[0]?.split(':').at(-1)
  return config.value.roles.find(({ id }) => id === roleId)?.explanation ?? props.question.hint
})

watch(mappings, () => emit('response-change', {
  ...evaluation.value,
  firstAttempt: true,
  hintLevelReached: 0,
  feedback: feedback.value,
  state: { format: 'structural-analogy', mappings: { ...mappings.value } },
}), { deep: true, immediate: true })
</script>

<template>
  <div class="intuition-question mt-7">
    <div class="analogy-problems">
      <article><span>Problem A</span><strong>{{ config.problemA.title }}</strong><p>{{ config.problemA.contract }}</p></article>
      <article><span>Problem B</span><strong>{{ config.problemB.title }}</strong><p>{{ config.problemB.contract }}</p></article>
    </div>
    <div class="analogy-table" role="table" aria-label="Map the shared structural roles">
      <div class="analogy-header" role="row"><span>Abstract role</span><span>Problem A</span><span>Problem B</span></div>
      <div v-for="role in config.roles" :key="role.id" class="analogy-row" role="row">
        <strong>{{ role.label }}</strong>
        <select :value="mappings[role.id]?.problemAChoiceId ?? ''" :disabled="submitted" :aria-label="`${role.label} in problem A`" @change="updateMapping(role.id, 'problemAChoiceId', $event)">
          <option value="" disabled>Choose A</option><option v-for="choice in config.choicesA" :key="choice.id" :value="choice.id">{{ choice.label }}</option>
        </select>
        <select :value="mappings[role.id]?.problemBChoiceId ?? ''" :disabled="submitted" :aria-label="`${role.label} in problem B`" @change="updateMapping(role.id, 'problemBChoiceId', $event)">
          <option value="" disabled>Choose B</option><option v-for="choice in config.choicesB" :key="choice.id" :value="choice.id">{{ choice.label }}</option>
        </select>
      </div>
    </div>
  </div>
</template>
