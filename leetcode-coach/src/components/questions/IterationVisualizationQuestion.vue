<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { QuestionInteractionState, QuizQuestion } from '../../types'
import { evaluateSelectedOption } from '../../utils/questionEvaluation'

const props = defineProps<{ question: QuizQuestion; submitted: boolean; initialState?: QuestionInteractionState | null; lessonMode?: boolean }>()
const emit = defineEmits<{
  (event: 'response-change', response: { ready: boolean; correct: boolean; feedback: string; state: QuestionInteractionState }): void
}>()

const restored = props.initialState?.format === 'iteration-visualization' ? props.initialState : null
const frameIndex = ref(restored?.frameIndex ?? 0)
const furthestFrame = ref(restored?.furthestFrame ?? 0)
const selectedAnswer = ref<number | null>(restored?.selectedAnswer ?? null)
const config = computed(() => props.question.visualization!)
const frame = computed(() => config.value.frames[frameIndex.value])
const codeLines = computed(() => config.value.code.split('\n'))
const finalFrame = computed(() => frameIndex.value === config.value.frames.length - 1)
const evaluation = computed(() => evaluateSelectedOption(props.question.answer, selectedAnswer.value))
const isCorrect = computed(() => evaluation.value.correct)
const variableGroups = computed(() => (['input', 'control', 'state', 'output'] as const)
  .map((role) => ({ role, variables: frame.value.variables.filter((item) => item.role === role) }))
  .filter(({ variables }) => variables.length))

function goTo(index: number) {
  if (index < 0 || index >= config.value.frames.length || index > furthestFrame.value + 1) return
  frameIndex.value = index
  furthestFrame.value = Math.max(furthestFrame.value, index)
}

function nextFrame() {
  goTo(frameIndex.value + 1)
}

function choose(index: number) {
  if (!props.submitted) selectedAnswer.value = index
}

watch([frameIndex, furthestFrame, selectedAnswer], () => emit('response-change', {
  ready: evaluation.value.ready,
  correct: isCorrect.value,
  feedback: selectedAnswer.value === null
    ? props.question.hint
    : props.question.optionFeedback?.[selectedAnswer.value] || props.question.hint,
  state: {
    format: 'iteration-visualization',
    frameIndex: frameIndex.value,
    furthestFrame: furthestFrame.value,
    selectedAnswer: selectedAnswer.value,
  },
}), { immediate: true })
</script>

<template>
  <div class="iteration-visualizer mt-7">
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
        :aria-selected="frameIndex === index"
        :disabled="index > furthestFrame + 1"
        :class="{ active: frameIndex === index, visited: index <= furthestFrame }"
        @click="goTo(index)"
      >
        <span>{{ index + 1 }}</span><small>{{ item.phase }}</small>
      </button>
    </div>

    <section class="visualizer-frame" aria-live="polite">
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
              <div v-for="item in dataStructure.items" :key="`${item.key}-${item.value}`" class="structure-item" :class="item.status ? `status-${item.status}` : ''">
                <span>{{ item.key }}</span>
                <strong>{{ item.value }}</strong>
                <small v-if="item.status">{{ item.status }}</small>
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
      <v-btn variant="text" :disabled="frameIndex === 0" prepend-icon="mdi-arrow-left" @click="goTo(frameIndex - 1)">Previous</v-btn>
      <v-btn v-if="!finalFrame" color="primary" append-icon="mdi-arrow-right" @click="nextFrame">Run next step</v-btn>
    </div>

    <div v-else-if="!lessonMode" class="visualizer-checkpoint">
      <div class="box-label">Trace checkpoint</div>
      <div class="answer-list" role="radiogroup" :aria-label="question.prompt">
        <button
          v-for="(option, index) in question.options"
          :key="option"
          type="button"
          class="answer-option"
          :class="{
            selected: selectedAnswer === index,
            correct: submitted && isCorrect && index === question.answer,
            wrong: submitted && selectedAnswer === index && !isCorrect,
          }"
          :disabled="submitted"
          role="radio"
          :aria-checked="selectedAnswer === index"
          @click="choose(index)"
        >
          <span class="option-key">{{ String.fromCharCode(65 + index) }}</span>
          <span>{{ option }}</span>
          <v-icon v-if="submitted && isCorrect && index === question.answer" icon="mdi-check-circle" color="success" />
          <v-icon v-else-if="submitted && selectedAnswer === index" icon="mdi-close-circle" color="error" />
        </button>
      </div>
    </div>
  </div>
</template>
