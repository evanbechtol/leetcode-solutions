<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import hljs from 'highlight.js/lib/core'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import rust from 'highlight.js/lib/languages/rust'
import type { CodeConstructionChoice, QuestionInteractionState, QuizQuestion } from '../../types'
import { useCodeLanguagePreference } from '../../composables/useCodeLanguagePreference'
import { evaluateCodeConstructionChoice } from '../../utils/questionEvaluation'
import { assembleConstructionCode } from '../../data/coaching/codeConstruction'

hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('rust', rust)

const props = defineProps<{ question: QuizQuestion; submitted: boolean; initialState?: QuestionInteractionState | null }>()
const emit = defineEmits<{
  (event: 'response-change', response: { ready: boolean; correct: boolean; feedback: string; state: QuestionInteractionState }): void
}>()

const config = computed(() => props.question.construction!)
const validStepIds = new Set(config.value.steps.map(({ id }) => id))
const restored = props.initialState?.format === 'code-construction' ? props.initialState : null
const restoredPrefix: string[] = []
for (const step of config.value.steps) {
  if (!restored?.completedStepIds.includes(step.id) || !validStepIds.has(step.id)) break
  restoredPrefix.push(step.id)
}

const completedStepIds = ref(restoredPrefix)
const selectedChoiceId = ref<string | null>(restored?.selectedChoiceId ?? null)
const lastCheckedChoiceId = ref<string | null>(restored?.lastCheckedChoiceId ?? null)
const lastCompletedStepId = ref<string | null>(restoredPrefix.at(-1) ?? null)
const revealedStepHints = ref(0)
const { preferredLanguage, setPreferredLanguage } = useCodeLanguagePreference()

const activeLanguage = computed(() => config.value.languages.includes(preferredLanguage.value)
  ? preferredLanguage.value
  : config.value.languages[0])
const currentStep = computed(() => config.value.steps[completedStepIds.value.length] ?? null)
const lastCompletedStep = computed(() => config.value.steps.find(({ id }) => id === lastCompletedStepId.value) ?? null)
const selectedChoice = computed(() => currentStep.value?.choices.find(({ id }) => id === selectedChoiceId.value) ?? null)
const checkedChoice = computed(() => currentStep.value?.choices.find(({ id }) => id === lastCheckedChoiceId.value) ?? null)
const complete = computed(() => completedStepIds.value.length === config.value.steps.length)
const stepProgress = computed(() => (completedStepIds.value.length / config.value.steps.length) * 100)
const highlightLanguage = computed(() => ({ Python: 'python', Java: 'java', 'C++': 'cpp', Rust: 'rust' }[activeLanguage.value] ?? 'python'))

const commentPrefix = computed(() => activeLanguage.value === 'Python' ? '#' : '//')
const displayedCode = computed(() => {
  const built = assembleConstructionCode(config.value, activeLanguage.value, completedStepIds.value)
  if (complete.value) return built
  const placeholders = config.value.steps
    .slice(completedStepIds.value.length)
    .map((step, index) => `${commentPrefix.value} ${index === 0 ? 'Choose next' : 'Later'}: ${step.concept}`)
    .join('\n')
  const closing = config.value.closingByLanguage[activeLanguage.value]
  return [built, placeholders, closing].filter(Boolean).join('\n')
})
const highlightedCode = computed(() => hljs.highlight(displayedCode.value, { language: highlightLanguage.value, ignoreIllegals: true }).value)

function choose(choice: CodeConstructionChoice) {
  if (props.submitted || complete.value) return
  selectedChoiceId.value = choice.id
  if (lastCheckedChoiceId.value !== choice.id) lastCheckedChoiceId.value = null
}

function checkLine() {
  if (!currentStep.value || !selectedChoiceId.value || props.submitted) return
  const evaluation = evaluateCodeConstructionChoice(currentStep.value, selectedChoiceId.value)
  lastCheckedChoiceId.value = selectedChoiceId.value
  if (!evaluation.correct) return
  lastCompletedStepId.value = currentStep.value.id
  completedStepIds.value.push(currentStep.value.id)
  selectedChoiceId.value = null
  lastCheckedChoiceId.value = null
  revealedStepHints.value = 0
}

function revealHint() {
  if (!currentStep.value) return
  revealedStepHints.value = Math.min(revealedStepHints.value + 1, currentStep.value.hints.length)
}

watch([completedStepIds, selectedChoiceId, lastCheckedChoiceId], () => emit('response-change', {
  ready: complete.value,
  correct: complete.value,
  feedback: complete.value ? props.question.explanation : (checkedChoice.value?.feedback ?? props.question.hint),
  state: {
    format: 'code-construction',
    completedStepIds: [...completedStepIds.value],
    selectedChoiceId: selectedChoiceId.value,
    lastCheckedChoiceId: lastCheckedChoiceId.value,
  },
}), { deep: true, immediate: true })
</script>

<template>
  <div class="code-construction mt-7">
    <div class="construction-heading">
      <div>
        <span>Implementation progress</span>
        <strong>{{ completedStepIds.length }} of {{ config.steps.length }} decisions retained</strong>
      </div>
      <span>{{ Math.round(stepProgress) }}%</span>
    </div>
    <v-progress-linear :model-value="stepProgress" color="primary" bg-color="#2b3039" height="6" rounded />

    <div class="construction-code mt-5">
      <div class="solution-toolbar px-4 py-3">
        <div class="language-tabs" role="tablist" aria-label="Construction language">
          <button
            v-for="language in config.languages"
            :key="language"
            role="tab"
            :aria-selected="activeLanguage === language"
            :class="{ active: activeLanguage === language }"
            @click="setPreferredLanguage(language)"
          >{{ language }}</button>
        </div>
        <span>{{ complete ? 'Implementation complete' : 'Incomplete implementation' }}</span>
      </div>
      <pre><code class="hljs" :class="`language-${highlightLanguage}`" v-html="highlightedCode" /></pre>
    </div>

    <div v-if="lastCompletedStep && !checkedChoice" class="construction-state mt-5" aria-live="polite">
      <span>State after that line</span>
      <strong>{{ lastCompletedStep.stateEffect }}</strong>
      <code><b>Example:</b> {{ config.exampleInput }} → {{ lastCompletedStep.exampleState }}</code>
      <p>{{ lastCompletedStep.explanation }}</p>
    </div>

    <section v-if="currentStep && !submitted" class="construction-decision mt-5" :aria-labelledby="`construction-${currentStep.id}`">
      <div class="construction-step-label">Decision {{ completedStepIds.length + 1 }}</div>
      <h3 :id="`construction-${currentStep.id}`">{{ currentStep.concept }}</h3>
      <p>Which line or block preserves the state established so far?</p>

      <div class="construction-choices" role="radiogroup" :aria-label="currentStep.concept">
        <button
          v-for="option in currentStep.choices"
          :key="option.id"
          type="button"
          role="radio"
          :aria-checked="selectedChoiceId === option.id"
          :class="{ selected: selectedChoiceId === option.id, wrong: lastCheckedChoiceId === option.id }"
          @click="choose(option)"
        >
          <span class="option-key">{{ String.fromCharCode(65 + currentStep.choices.indexOf(option)) }}</span>
          <code>{{ option.codeByLanguage[activeLanguage] }}</code>
        </button>
      </div>

      <div v-if="checkedChoice" class="construction-line-feedback" role="alert">
        <v-icon icon="mdi-sign-direction" />
        <p>{{ checkedChoice.feedback }}</p>
      </div>

      <div v-if="checkedChoice" class="construction-hints">
        <div v-for="hint in currentStep.hints.slice(0, revealedStepHints)" :key="hint.id" class="revealed-hint">
          <span>{{ hint.label }}</span><p>{{ hint.text }}</p>
        </div>
        <v-btn v-if="revealedStepHints < currentStep.hints.length" size="small" variant="outlined" prepend-icon="mdi-lightbulb-outline" @click="revealHint">
          {{ revealedStepHints ? 'Reveal next hint' : 'Show a hint' }}
        </v-btn>
      </div>

      <div class="construction-check mt-4">
        <span>Earlier correct code remains in place.</span>
        <v-btn color="primary" :disabled="!selectedChoice" @click="checkLine">Check this line</v-btn>
      </div>
    </section>

    <div v-else-if="complete" class="construction-complete mt-5">
      <v-icon icon="mdi-check-decagram" color="success" />
      <div><strong>Canonical implementation assembled</strong><p>Every implementation decision is now visible in the completed code above.</p></div>
    </div>
  </div>
</template>
