<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTrainerStore } from '../stores/trainer'
import FilterPanel from '../components/FilterPanel.vue'

const store = useTrainerStore()
const filterOpen = ref(false)
const sessionComplete = ref(false)
const copied = ref(false)
const aiHint = ref('')
const hintLoading = ref(false)
const quizLoading = ref(false)
const quizError = ref('')
const aiCoachEnabled = import.meta.env.MODE === 'ai' || import.meta.env.VITE_AI_COACH_ENABLED === 'true'
const selectedLanguage = ref('')

const progress = computed(() => store.currentProblem
  ? ((store.currentQuestionIndex + (store.submitted && store.selectedAnswer === store.currentQuestion?.answer ? 1 : 0)) / Math.max(store.questionCount, 1)) * 100
  : 0)
const activeFilterCount = computed(() => Object.values(store.filters).reduce((sum, values) => sum + values.length, 0))
const isCorrect = computed(() => store.submitted && store.selectedAnswer === store.currentQuestion?.answer)
const codeSamples = computed<Record<string, string>>(() => {
  if (!store.currentProblem) return {}
  return store.currentProblem.codeSamples || { [store.currentProblem.solutionLanguage || 'TypeScript']: store.currentProblem.solution }
})
const solutionLanguages = computed(() => Object.keys(codeSamples.value))
const activeLanguage = computed(() => selectedLanguage.value || solutionLanguages.value[0] || '')
const displayedSolution = computed(() => codeSamples.value[activeLanguage.value] || store.currentProblem?.solution || '')

async function start() {
  sessionComplete.value = false
  selectedLanguage.value = ''
  aiHint.value = ''
  quizError.value = ''
  if (!store.startRandomProblem() || store.questionCount) return
  await generateQuiz()
}

async function generateQuiz() {
  if (!store.currentProblem) return
  if (!aiCoachEnabled) {
    quizError.value = 'AI-generated lessons are disabled in this development mode.'
    return
  }
  quizLoading.value = true
  quizError.value = ''
  try {
    const endpoint = import.meta.env.VITE_QUIZ_API_URL || 'http://localhost:8787/api/quiz'
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: store.currentProblem.id,
        title: store.currentProblem.title,
        difficulty: store.currentProblem.difficulty,
        topics: store.currentProblem.topics,
        algorithms: store.currentProblem.algorithms,
        description: store.currentProblem.description,
        constraints: store.currentProblem.constraints,
        canonicalSolution: store.currentProblem.solution.slice(0, 9000),
      }),
    })
    if (!response.ok) throw new Error('Coach service unavailable')
    const data = await response.json()
    if (!store.setGeneratedQuestions(data.questions)) throw new Error('Invalid guided quiz')
  } catch {
    quizError.value = 'This catalog problem needs the local AI coach to build its guided path. Start the hint service, then retry.'
  } finally {
    quizLoading.value = false
  }
}

function continueQuiz() {
  aiHint.value = ''
  if (!store.nextQuestion()) sessionComplete.value = true
}

async function checkAnswer() {
  const correct = store.submitAnswer()
  aiHint.value = ''
  if (correct !== false || !store.currentProblem || !store.currentQuestion || store.selectedAnswer === null) return
  if (!aiCoachEnabled) {
    aiHint.value = store.currentQuestion.hint
    return
  }
  hintLoading.value = true
  try {
    const endpoint = import.meta.env.VITE_HINT_API_URL || 'http://localhost:8787/api/hint'
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problem: { title: store.currentProblem.title, description: store.currentProblem.description, constraints: store.currentProblem.constraints },
        question: store.currentQuestion.prompt,
        options: store.currentQuestion.options,
        selectedOption: store.currentQuestion.options[store.selectedAnswer],
        questionType: store.currentQuestion.type,
      }),
    })
    if (!response.ok) throw new Error('Hint service unavailable')
    const data = await response.json()
    aiHint.value = data.hint
  } catch {
    aiHint.value = store.currentQuestion.hint
  } finally {
    hintLoading.value = false
  }
}

function retryQuestion() {
  aiHint.value = ''
  store.tryAgain()
}

async function copySolution() {
  if (!store.currentProblem) return
  await navigator.clipboard.writeText(displayedSolution.value)
  copied.value = true
  window.setTimeout(() => copied.value = false, 1400)
}
</script>

<template>
  <div class="page-wrap">
    <div v-if="!store.currentProblem" class="app-shell hero-shell px-5 px-md-8">
      <section class="hero-grid">
        <div class="hero-copy">
          <div class="eyebrow hero-eyebrow"><span class="live-dot" /> Deliberate practice, not memorization</div>
          <h1>Find the path.<br><em>Build the instinct.</em></h1>
          <p class="hero-subtitle">Turn difficult coding problems into a sequence of decisions you know how to make.</p>
          <div class="d-flex flex-wrap ga-3 mt-8">
            <v-btn color="primary" size="x-large" append-icon="mdi-arrow-right" @click="start">Start a problem</v-btn>
            <v-btn size="x-large" variant="outlined" prepend-icon="mdi-tune-variant" @click="filterOpen = true">
              Choose focus <span v-if="activeFilterCount" class="filter-count ml-2">{{ activeFilterCount }}</span>
            </v-btn>
          </div>
          <p class="match-note mt-5"><v-icon icon="mdi-shuffle-variant" size="18" />
            <template v-if="store.aiCoachEnabled">{{ store.matchingProblems.length }} catalog problems match your focus</template>
            <template v-else>{{ store.matchingProblems.length }} built-in lessons ready · {{ store.catalogSize }} catalog problems in AI mode</template>
          </p>
        </div>
        <div class="path-visual" aria-hidden="true">
          <div class="orbit orbit-one" /><div class="orbit orbit-two" />
          <div class="path-card path-card-a"><span>01</span><strong>Recognize</strong><small>Find the hidden pattern</small></div>
          <div class="path-card path-card-b"><span>02</span><strong>Reason</strong><small>Test your decisions</small></div>
          <div class="path-card path-card-c"><span>03</span><strong>Optimize</strong><small>Prove the complexity</small></div>
          <div class="path-line" />
        </div>
      </section>
      <section class="how-strip">
        <div><span class="how-index">01</span><strong>Read the signal</strong><small>Focus on constraints and invariants.</small></div>
        <div><span class="how-index">02</span><strong>Make a choice</strong><small>Get feedback at the moment it matters.</small></div>
        <div><span class="how-index">03</span><strong>Lock it in</strong><small>Connect the approach to its tradeoffs.</small></div>
      </section>
    </div>

    <div v-else class="quiz-layout app-shell px-5 px-md-8 py-7 py-md-10">
      <aside class="problem-panel">
        <div class="d-flex align-center justify-space-between mb-6">
          <v-btn variant="text" size="small" prepend-icon="mdi-arrow-left" @click="store.currentProblemId = null">Problem picker</v-btn>
          <v-btn icon="mdi-tune-variant" variant="text" size="small" aria-label="Filters" @click="filterOpen = true" />
        </div>
        <div class="problem-number">LEETCODE / {{ String(store.currentProblem.id).padStart(4, '0') }}</div>
        <h2 class="problem-title">{{ store.currentProblem.title }}</h2>
        <div class="d-flex flex-wrap ga-2 my-4">
          <v-chip size="small" :class="`difficulty-${store.currentProblem.difficulty.toLowerCase()}`">{{ store.currentProblem.difficulty }}</v-chip>
          <v-chip v-for="topic in store.currentProblem.topics" :key="topic" size="small" variant="outlined">{{ topic }}</v-chip>
        </div>
        <p class="problem-description">{{ store.currentProblem.description }}</p>
        <div class="example-box mt-6">
          <div class="box-label">Example</div>
          <code><b>Input</b> {{ store.currentProblem.examples[0].input }}<br><b>Output</b> {{ store.currentProblem.examples[0].output }}</code>
          <p v-if="store.currentProblem.examples[0].explanation">{{ store.currentProblem.examples[0].explanation }}</p>
        </div>
        <div class="constraints mt-6">
          <div class="box-label">Constraints</div>
          <ul><li v-for="constraint in store.currentProblem.constraints" :key="constraint">{{ constraint }}</li></ul>
        </div>
        <a v-if="store.currentProblem.source" :href="`${store.currentProblem.source.repository}#readme`" target="_blank" rel="noreferrer" class="source-note mt-6"><v-icon icon="mdi-source-repository" size="16" /> {{ store.currentProblem.source.name }} {{ store.currentProblem.source.version }} · {{ store.currentProblem.source.license }}</a>
      </aside>

      <main class="coach-panel">
        <v-card v-if="quizLoading" class="question-card quiz-loading-card pa-8"><v-progress-circular indeterminate color="primary" size="42" /><h2>Mapping the solution path…</h2><p>The coach is turning this problem into five deliberate decisions.</p></v-card>
        <v-card v-else-if="quizError" class="question-card quiz-loading-card pa-8"><v-icon icon="mdi-connection" color="accent" size="42" /><h2>The AI coach is offline.</h2><p>{{ quizError }}</p><div class="d-flex flex-wrap justify-center ga-3"><v-btn variant="outlined" @click="generateQuiz">Retry</v-btn><v-btn color="primary" @click="start">Choose another</v-btn></div></v-card>
        <template v-else-if="!sessionComplete">
          <div class="quiz-progress mb-7">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Decision {{ store.currentQuestionIndex + 1 }} of {{ store.questionCount }}</span>
              <span>{{ Math.round(progress) }}% explored</span>
            </div>
            <v-progress-linear :model-value="progress" color="primary" bg-color="#2b3039" height="6" rounded />
          </div>
          <v-card class="question-card pa-6 pa-md-9">
            <div class="question-type"><v-icon icon="mdi-lightbulb-on-outline" size="18" /> {{ store.currentQuestion?.type }}</div>
            <h2>{{ store.currentQuestion?.prompt }}</h2>
            <div class="answer-list mt-7" role="radiogroup" :aria-label="store.currentQuestion?.prompt">
              <button
                v-for="(option, index) in store.currentQuestion?.options"
                :key="option"
                class="answer-option"
                :class="{
                  selected: store.selectedAnswer === index,
                  correct: store.submitted && index === store.currentQuestion?.answer,
                  wrong: store.submitted && store.selectedAnswer === index && index !== store.currentQuestion?.answer,
                }"
                :disabled="store.submitted"
                role="radio"
                :aria-checked="store.selectedAnswer === index"
                @click="store.selectedAnswer = index"
              >
                <span class="option-key">{{ String.fromCharCode(65 + index) }}</span>
                <span>{{ option }}</span>
                <v-icon v-if="store.submitted && index === store.currentQuestion?.answer" icon="mdi-check-circle" color="success" />
                <v-icon v-else-if="store.submitted && store.selectedAnswer === index" icon="mdi-close-circle" color="error" />
              </button>
            </div>

            <v-expand-transition>
              <div v-if="store.submitted" class="feedback mt-6" :class="isCorrect ? 'feedback-correct' : 'feedback-wrong'">
                <div class="feedback-heading"><v-icon :icon="isCorrect ? 'mdi-check-decagram' : 'mdi-sign-direction'" /> {{ isCorrect ? 'That’s the move.' : 'Take another look.' }}</div>
                <p v-if="!isCorrect && hintLoading" class="hint-loading"><v-progress-circular indeterminate size="16" width="2" /> Your coach is shaping a hint around that choice…</p>
                <p v-else>{{ isCorrect ? store.currentQuestion?.explanation : (aiHint || store.currentQuestion?.hint) }}</p>
                <div v-if="!isCorrect" class="why-note"><strong>Why this choice misses:</strong> {{ store.currentQuestion?.explanation }}</div>
              </div>
            </v-expand-transition>

            <div class="question-actions mt-7">
              <span v-if="!store.submitted" class="keyboard-note">Select the strongest answer</span>
              <v-spacer />
              <v-btn v-if="!store.submitted" color="primary" size="large" :disabled="store.selectedAnswer === null" @click="checkAnswer">Check reasoning</v-btn>
              <v-btn v-else-if="!isCorrect" color="primary" size="large" prepend-icon="mdi-reload" :disabled="hintLoading" @click="retryQuestion">Try again</v-btn>
              <v-btn v-else color="primary" size="large" append-icon="mdi-arrow-right" @click="continueQuiz">
                {{ store.currentQuestionIndex === store.questionCount - 1 ? 'See solution' : 'Next decision' }}
              </v-btn>
            </div>
          </v-card>
          <div class="coach-note mt-5"><span class="coach-avatar">P</span><p><strong>Your coach</strong> The goal isn’t to guess. Say the invariant out loud before choosing.</p></div>
        </template>

        <template v-else>
          <v-card class="completion-card pa-7 pa-md-10">
            <div class="completion-icon"><v-icon icon="mdi-flag-checkered" /></div>
            <div class="eyebrow mt-6">Path complete</div>
            <h2>{{ store.currentProblem.title }}</h2>
            <p class="insight">“{{ store.currentProblem.insight || 'You connected the problem’s structure to an efficient solution and its tradeoffs.' }}”</p>
            <div class="mastery-score my-7"><strong>{{ store.firstTryCorrect }}/{{ store.questionCount }}</strong><span>first-try decisions</span></div>
            <div class="solution-block text-left">
              <div class="solution-toolbar px-4 py-3">
                <div class="language-tabs" role="tablist" aria-label="Solution language">
                  <button v-for="language in solutionLanguages" :key="language" role="tab" :aria-selected="activeLanguage === language" :class="{ active: activeLanguage === language }" @click="selectedLanguage = language">{{ language }}</button>
                </div>
                <v-btn size="small" variant="text" :prepend-icon="copied ? 'mdi-check' : 'mdi-content-copy'" @click="copySolution">{{ copied ? 'Copied' : 'Copy' }}</v-btn>
              </div>
              <pre><code>{{ displayedSolution }}</code></pre>
            </div>
            <div class="d-flex flex-wrap justify-center ga-3 mt-7">
              <v-btn variant="outlined" size="large" to="/profile" prepend-icon="mdi-chart-donut">View progress</v-btn>
              <v-btn color="primary" size="large" append-icon="mdi-shuffle-variant" @click="start">Another problem</v-btn>
            </div>
          </v-card>
        </template>
      </main>
    </div>

    <v-navigation-drawer v-model="filterOpen" location="right" temporary width="410">
      <FilterPanel @close="filterOpen = false" />
    </v-navigation-drawer>
  </div>
</template>
