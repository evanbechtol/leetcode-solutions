<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ContentTrustDisclosure from '../ContentTrustDisclosure.vue'
import { TRACE_PLAYBACK_SPEEDS, useTracePlayback } from '../../composables/useTracePlayback'
import type { QuestionInteractionResult, QuestionInteractionState, QuizQuestion } from '../../types'
import { evaluateSelectedOption } from '../../utils/questionEvaluation'

const props = defineProps<{ question: QuizQuestion; submitted: boolean; initialState?: QuestionInteractionState | null; lessonMode?: boolean }>()
const emit = defineEmits<{
  (event: 'response-change', response: QuestionInteractionResult): void
}>()

const restored = props.initialState?.format === 'iteration-visualization' ? props.initialState : null
const config = computed(() => props.question.format === 'iteration-visualization' ? props.question.config : neverConfig())
const neverConfig = (): never => { throw new Error('Invalid iteration-visualization question.') }
const frameCount = computed(() => config.value.frames.length)
const {
  frameIndex, furthestFrame, playing, speed, reducedMotion, finalFrame,
  canPrevious, canNext, goTo, previous, next, restart, toggle, setSpeed,
} = useTracePlayback({
  frameCount,
  initialIndex: restored?.frameIndex,
  initialFurthest: restored?.furthestFrame,
})
const selectedAnswer = ref<number | null>(restored?.selectedAnswer ?? null)
const frame = computed(() => config.value.frames[frameIndex.value])
const codeLines = computed(() => config.value.code.split('\n'))
const evaluation = computed(() => evaluateSelectedOption(config.value.checkpoint.answer, selectedAnswer.value))
const isCorrect = computed(() => evaluation.value.correct)
const variableGroups = computed(() => (['input', 'control', 'state', 'output'] as const)
  .map((role) => ({ role, variables: frame.value.variables.filter((item) => item.role === role) }))
  .filter(({ variables }) => variables.length))

const changedItems = computed(() => frame.value.structures?.flatMap((structure) =>
  structure.items.filter(({ changed }) => changed).map(({ key }) => `${structure.name}[${key}]`)) ?? [])
const changedVariables = computed(() => frame.value.variables.filter(({ changed }) => changed).map(({ name }) => name))
const announcement = computed(() => {
  const changes = [...changedVariables.value, ...changedItems.value]
  return `${frame.value.phase}: ${frame.value.title}. ${frame.value.action}${changes.length ? ` Changed: ${changes.join(', ')}.` : ' No stored value changed.'}`
})

function selectFrame(index: number) {
  if (index === frameIndex.value + 1 && index === furthestFrame.value + 1) next()
  else goTo(index)
}

function handleKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (target !== event.currentTarget && target.closest('button, a, input, select, textarea, summary')) return
  if (event.target !== event.currentTarget && event.key === ' ') return
  if (event.key === 'ArrowRight' && canNext.value) next()
  else if (event.key === 'ArrowLeft' && canPrevious.value) previous()
  else if (event.key === ' ') toggle()
  else if (event.key === 'Home') goTo(0)
  else if (event.key === 'End') goTo(furthestFrame.value)
  else return
  event.preventDefault()
}

function changeSpeed(event: Event) {
  setSpeed(Number((event.target as HTMLSelectElement).value))
}

function choose(index: number) {
  if (!props.submitted) selectedAnswer.value = index
}

watch([frameIndex, furthestFrame, selectedAnswer], () => emit('response-change', {
  complete: evaluation.value.ready,
  correct: isCorrect.value,
  firstAttempt: true,
  hintLevelReached: 0,
  diagnosticKeys: evaluation.value.ready && !isCorrect.value ? ['trace:checkpoint'] : [],
  evidence: { frameIndex: frameIndex.value, furthestFrame: furthestFrame.value, selectedAnswer: selectedAnswer.value },
  feedback: selectedAnswer.value === null
    ? props.question.hint
    : config.value.checkpoint.optionFeedback[selectedAnswer.value] || props.question.hint,
  state: {
    format: 'iteration-visualization',
    frameIndex: frameIndex.value,
    furthestFrame: furthestFrame.value,
    selectedAnswer: selectedAnswer.value,
  },
}), { immediate: true })
</script>

<template>
  <div
    class="iteration-visualizer mt-7"
    :class="{ 'reduced-motion': reducedMotion }"
    tabindex="0"
    aria-label="Algorithm trace player. Use left and right arrows to move, Space to play or pause, Home to restart, and End to jump to the furthest visited step."
    @keydown="handleKeydown"
  >
    <p class="sr-only" aria-live="polite" aria-atomic="true">{{ announcement }}</p>
    <ContentTrustDisclosure
      :content-version="question.contentVersion"
      :canonical-approach="question.explanation"
      complexity-assumptions="The displayed states follow the canonical implementation and the constraints stated for this example."
      :trace-quality="config.traceQuality"
    />
    <div class="visualizer-io">
      <div><span>Example input</span><code>{{ frame.input }}</code></div>
      <div><span>Expected output</span><code>{{ frame.expectedOutput }}</code></div>
      <div class="current-output"><span>Output at this step</span><code>{{ frame.currentOutput }}</code></div>
    </div>

    <div class="visualizer-timeline" role="tablist" aria-label="Algorithm execution frames">
      <button
        v-for="(item, index) in config.frames"
        :key="item.id"
        type="button"
        role="tab"
        aria-controls="trace-current-frame"
        :aria-selected="frameIndex === index"
        :disabled="index > furthestFrame + 1"
        :class="{ active: frameIndex === index, visited: index <= furthestFrame }"
        @click="selectFrame(index)"
      >
        <span>{{ index + 1 }}</span><small>{{ item.phase }}</small>
      </button>
    </div>

    <div class="visualizer-playback" role="group" aria-label="Trace playback controls">
      <div class="playback-progress" aria-hidden="true"><strong>{{ frameIndex + 1 }}</strong><span>/ {{ config.frames.length }}</span></div>
      <v-btn icon="mdi-restart" variant="text" size="small" aria-label="Restart trace" @click="restart" />
      <v-btn icon="mdi-skip-previous" variant="text" size="small" :disabled="!canPrevious" aria-label="Previous step" @click="previous" />
      <v-btn
        :icon="playing ? 'mdi-pause' : 'mdi-play'"
        color="primary"
        size="small"
        :aria-label="playing ? 'Pause trace' : 'Play trace'"
        @click="toggle"
      />
      <v-btn icon="mdi-skip-next" variant="text" size="small" :disabled="!canNext" aria-label="Next step" @click="next" />
      <label class="playback-speed">
        <span>Speed</span>
        <select :value="speed" aria-label="Playback speed" @change="changeSpeed">
          <option v-for="option in TRACE_PLAYBACK_SPEEDS" :key="option" :value="option">{{ option }}×</option>
        </select>
      </label>
    </div>

    <section id="trace-current-frame" class="visualizer-frame" aria-live="polite">
      <header><span>{{ frame.phase }}</span><h3>{{ frame.title }}</h3></header>
      <div class="visualizer-execution-summary">
        <div class="visualizer-action"><v-icon icon="mdi-play-circle-outline" /><p>{{ frame.action }}</p></div>
        <div class="visualizer-progress-state">
          <div><span>Processed</span><strong>{{ frame.processed }}</strong></div>
          <v-icon icon="mdi-arrow-right" size="17" />
          <div><span>Remaining</span><strong>{{ frame.remaining }}</strong></div>
        </div>
      </div>

      <div class="visualizer-section-heading">
        <div><span>Live execution state</span><strong>Every value after this step</strong></div>
        <small><i /> changed or active</small>
      </div>

      <div class="visualizer-workspace">
        <section v-if="frame.structures?.length" class="visualizer-structures" aria-label="Data structure state">
          <header><v-icon icon="mdi-view-grid-outline" /><div><span>Data structures</span><strong>Elements, indices, and contents</strong></div></header>
          <article v-for="dataStructure in frame.structures" :key="dataStructure.name" class="visualizer-structure" :class="`structure-${dataStructure.kind}`">
            <div class="structure-heading"><div><code>{{ dataStructure.name }}</code><span>{{ dataStructure.kind }}</span></div><p>{{ dataStructure.description }}</p></div>
            <div v-if="dataStructure.items.length" class="structure-items">
              <div v-for="item in dataStructure.items" :key="`${item.key}-${item.value}`" class="structure-item" :class="[item.status ? `status-${item.status}` : '', { changed: item.changed }]">
                <span>{{ item.key }}</span>
                <strong>{{ item.value }}</strong>
                <small v-if="item.changed" class="structure-change-label">changed</small>
                <small v-else-if="item.status">{{ item.status }}</small>
              </div>
            </div>
            <div v-else class="structure-empty">Empty</div>
          </article>
        </section>

        <section class="visualizer-variable-panel" aria-label="Algorithm variable state">
          <header><v-icon icon="mdi-variable" /><div><span>Variables</span><strong>Named values in memory</strong></div></header>
          <div v-for="group in variableGroups" :key="group.role" class="variable-group">
            <div class="variable-group-label">{{ group.role }}</div>
            <div class="variable-grid">
              <article v-for="variable in group.variables" :key="variable.name" class="visualizer-variable" :class="[`role-${variable.role}`, { changed: variable.changed }]">
                <div class="variable-name"><code>{{ variable.name }}</code><span>{{ variable.role }}</span></div>
                <div class="variable-value">
                  <em v-if="variable.changed" class="variable-change-label">Changed</em>
                  <small v-if="variable.previousValue"><s>{{ variable.previousValue }}</s><v-icon icon="mdi-arrow-right" size="13" /></small>
                  <strong>{{ variable.value }}</strong>
                </div>
              </article>
            </div>
          </div>
        </section>
      </div>

      <div class="visualizer-code">
        <header><div><span>Canonical algorithm</span><strong>Active lines for this step</strong></div><code>{{ config.language }}</code></header>
        <ol>
          <li v-for="(line, index) in codeLines" :key="index" :class="{ active: frame.activeCodeLines.includes(index) }">
            <span>{{ index + 1 }}</span><code>{{ line || ' ' }}</code>
          </li>
        </ol>
      </div>

      <div class="visualizer-invariant"><v-icon icon="mdi-shield-check-outline" /><div><span>Invariant checkpoint</span><p>{{ frame.invariant }}</p></div></div>
    </section>

    <div v-if="!finalFrame || lessonMode" class="visualizer-nav">
      <v-btn variant="text" :disabled="!canPrevious" prepend-icon="mdi-arrow-left" @click="previous">Previous</v-btn>
      <v-btn v-if="!finalFrame" color="primary" append-icon="mdi-arrow-right" @click="next">Run next step</v-btn>
    </div>

    <div v-else-if="!lessonMode" class="visualizer-checkpoint">
      <div class="box-label">Trace checkpoint</div>
      <div class="answer-list" role="radiogroup" :aria-label="question.prompt">
        <button
          v-for="(option, index) in config.checkpoint.options"
          :key="option"
          type="button"
          class="answer-option"
          :class="{
            selected: selectedAnswer === index,
            correct: submitted && isCorrect && index === config.checkpoint.answer,
            wrong: submitted && selectedAnswer === index && !isCorrect,
          }"
          :disabled="submitted"
          role="radio"
          :aria-checked="selectedAnswer === index"
          @click="choose(index)"
        >
          <span class="option-key">{{ String.fromCharCode(65 + index) }}</span>
          <span>{{ option }}</span>
          <v-icon v-if="submitted && isCorrect && index === config.checkpoint.answer" icon="mdi-check-circle" color="success" />
          <v-icon v-else-if="submitted && selectedAnswer === index" icon="mdi-close-circle" color="error" />
        </button>
      </div>
    </div>
  </div>
</template>
