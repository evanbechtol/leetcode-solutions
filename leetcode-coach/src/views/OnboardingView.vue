<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { codeLanguages, useCodeLanguagePreference } from '../composables/useCodeLanguagePreference'
import { onboardingDecisions, recommendationFor } from '../data/onboarding'
import { learningTracks } from '../data/tracks'
import type { LearnerExperience } from '../stores/progress'
import { useTrainerStore } from '../stores/trainer'

const store = useTrainerStore()
const router = useRouter()
const { preferredLanguage, setPreferredLanguage } = useCodeLanguagePreference()

const experience = ref(store.progressState.learner.experience)
const dailyMinutes = ref(store.progressState.learner.dailyMinutes)
const language = ref(store.progressState.learner.preferredLanguage ?? preferredLanguage.value)
const selectedTrackId = ref(store.progressState.learner.selectedTrackIds[0] ?? 'arrays')
const selectedAnswer = ref<number | null>(null)
const submitted = ref(false)
const wasCorrect = ref<boolean | null>(null)
const experienceOptions: Array<{ value: LearnerExperience; title: string; text: string }> = [
  { value: 'new-to-dsa', title: 'New to DSA', text: 'I am learning the foundations for the first time.' },
  { value: 'some-foundations', title: 'Some foundations', text: 'I know a few ideas and want a steadier system.' },
  { value: 'interview-review', title: 'Interview review', text: 'I want to refresh and practice deliberately.' },
]
const minuteOptions: Array<{ value: 5 | 10 | 15; text: string }> = [
  { value: 5, text: 'One focused action' },
  { value: 10, text: 'A guided practice set' },
  { value: 15, text: 'A deeper practice session' },
]

const diagnosticIndex = computed(() => Math.min(store.progressState.learner.onboardingDecisionIds.length, onboardingDecisions.length))
const currentDecision = computed(() => onboardingDecisions[diagnosticIndex.value] ?? null)
const isSetup = computed(() => store.progressState.learner.onboardingStatus === 'not-started')
const isRecommendation = computed(() => !isSetup.value && diagnosticIndex.value >= onboardingDecisions.length)
const diagnosticCorrect = computed(() => {
  const currentRunIds = new Set(store.progressState.learner.onboardingDecisionIds)
  return store.progressState.attempts.filter((attempt) => attempt.source === 'onboarding' && currentRunIds.has(attempt.questionId) && attempt.correct).length
})
const recommendation = computed(() => recommendationFor(selectedTrackId.value, diagnosticCorrect.value))

watch(diagnosticIndex, () => {
  selectedAnswer.value = null
  submitted.value = false
  wasCorrect.value = null
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
})

function beginDiagnostic() {
  setPreferredLanguage(language.value)
  store.beginOnboarding({
    experience: experience.value,
    dailyMinutes: dailyMinutes.value,
    preferredLanguage: language.value,
    selectedTrackIds: [selectedTrackId.value],
  })
}

function checkDecision() {
  if (selectedAnswer.value === null || !currentDecision.value || submitted.value) return
  wasCorrect.value = store.recordOnboardingAnswer(
    currentDecision.value.problem.id,
    currentDecision.value.question,
    selectedAnswer.value,
  )
  submitted.value = true
}

function nextDecision() {
  if (!currentDecision.value) return
  const wasLastDecision = diagnosticIndex.value === onboardingDecisions.length - 1
  store.advanceOnboardingDecision(currentDecision.value.question.id)
  if (wasLastDecision) store.completeOnboarding()
  selectedAnswer.value = null
  submitted.value = false
  wasCorrect.value = null
}

function skip() {
  store.skipOnboarding()
  router.push({ name: 'practice' })
}

function restart() {
  store.restartOnboarding()
}
</script>

<template>
  <div class="app-shell onboarding-page px-5 px-md-8 py-9 py-md-14">
    <header class="onboarding-header">
      <router-link to="/" class="back-link"><v-icon icon="mdi-arrow-left" size="17" /> Practice without setup</router-link>
      <div class="onboarding-brand"><span class="brand-mark"><v-icon icon="mdi-vector-polyline" size="18" /></span> pathfinder</div>
    </header>

    <main class="onboarding-content">
      <template v-if="isSetup">
        <div class="eyebrow">Find your starting point</div>
        <h1>Start with a path<br><em>that feels manageable.</em></h1>
        <p class="onboarding-intro">This is not a score or a placement test. Choose a starting point, then make six short decisions so Pathfinder can suggest one clear first step.</p>

        <section class="onboarding-section mt-9" aria-labelledby="experience-heading">
          <div class="onboarding-section-heading"><span>01</span><div><h2 id="experience-heading">Where are you starting?</h2><p>Choose the description that feels closest today. You can change it later.</p></div></div>
          <div class="setup-choice-grid three-up">
            <button v-for="option in experienceOptions" :key="option.value" class="setup-choice" :class="{ selected: experience === option.value }" @click="experience = option.value">
              <strong>{{ option.title }}</strong><span>{{ option.text }}</span>
            </button>
          </div>
        </section>

        <section class="onboarding-section" aria-labelledby="budget-heading">
          <div class="onboarding-section-heading"><span>02</span><div><h2 id="budget-heading">What fits a normal day?</h2><p>Small, repeatable sessions are enough. This only shapes future daily sessions.</p></div></div>
          <div class="setup-choice-grid three-up">
            <button v-for="option in minuteOptions" :key="option.value" class="setup-choice time-choice" :class="{ selected: dailyMinutes === option.value }" @click="dailyMinutes = option.value"><strong>{{ option.value }} minutes</strong><span>{{ option.text }}</span></button>
          </div>
        </section>

        <section class="onboarding-section" aria-labelledby="track-heading">
          <div class="onboarding-section-heading"><span>03</span><div><h2 id="track-heading">What would you like to explore first?</h2><p>This chooses your initial path; it never locks the rest of the library.</p></div></div>
          <div class="setup-choice-grid track-grid">
            <button v-for="track in learningTracks" :key="track.id" class="setup-choice track-choice" :class="{ selected: selectedTrackId === track.id }" @click="selectedTrackId = track.id">
              <v-icon :icon="track.icon" size="21" /><div><strong>{{ track.title }}</strong><span>{{ track.description }}</span></div>
            </button>
          </div>
        </section>

        <section class="onboarding-section language-section" aria-labelledby="language-heading">
          <div class="onboarding-section-heading"><span>04</span><div><h2 id="language-heading">Which code language do you prefer?</h2><p>Examples will open in this language whenever the reviewed sample is available.</p></div></div>
          <v-select v-model="language" :items="codeLanguages" aria-label="Preferred code language" variant="outlined" hide-details density="comfortable" />
        </section>

        <div class="onboarding-actions mt-8">
          <v-btn color="primary" size="x-large" append-icon="mdi-arrow-right" @click="beginDiagnostic">Continue to six decisions</v-btn>
          <v-btn variant="text" @click="skip">Skip for now</v-btn>
        </div>
      </template>

      <template v-else-if="!isRecommendation && currentDecision">
        <div class="onboarding-progress"><span>Starting-point check</span><strong>Decision {{ diagnosticIndex + 1 }} of {{ onboardingDecisions.length }}</strong><v-progress-linear :model-value="(diagnosticIndex / onboardingDecisions.length) * 100" color="primary" height="7" rounded /></div>
        <div class="eyebrow mt-8">One idea at a time</div>
        <h1>{{ currentDecision.problem.title }}</h1>
        <p class="onboarding-problem-context">This is a reviewed decision from a guided problem. There is no penalty for choosing the option that seems most plausible.</p>

        <v-card class="onboarding-question pa-6 pa-md-8 mt-7">
          <div class="question-type"><v-icon icon="mdi-lightbulb-on-outline" size="18" /> {{ currentDecision.question.type }}</div>
          <div v-if="currentDecision.question.teachingContext" class="teaching-context mt-5"><span>Before you answer</span><strong>{{ currentDecision.question.teachingContext.title }}</strong><p>{{ currentDecision.question.teachingContext.body }}</p></div>
          <h2>{{ currentDecision.question.prompt }}</h2>
          <div class="answer-list mt-7" role="radiogroup" :aria-label="currentDecision.question.prompt">
            <button v-for="(option, index) in currentDecision.question.options" :key="option" class="answer-option" :class="{ selected: selectedAnswer === index, correct: submitted && index === currentDecision.question.answer, wrong: submitted && selectedAnswer === index && index !== currentDecision.question.answer }" :disabled="submitted" role="radio" :aria-checked="selectedAnswer === index" @click="selectedAnswer = index">
              <span class="option-key">{{ String.fromCharCode(65 + index) }}</span><span>{{ option }}</span>
            </button>
          </div>
          <div v-if="submitted" class="feedback mt-6" :class="wasCorrect ? 'feedback-correct' : 'feedback-wrong'">
            <div class="feedback-heading"><v-icon :icon="wasCorrect ? 'mdi-check-decagram' : 'mdi-compass-outline'" /> {{ wasCorrect ? 'That fits.' : 'A useful signal.' }}</div>
            <p>{{ wasCorrect ? currentDecision.question.explanation : (currentDecision.question.optionFeedback?.[selectedAnswer ?? -1] || currentDecision.question.hint) }}</p>
            <p v-if="!wasCorrect" class="why-note">This is evidence for a recommendation, not a mark against you. The next activity will help you build the idea.</p>
          </div>
          <div class="onboarding-actions mt-7"><v-spacer /><v-btn v-if="!submitted" color="primary" size="large" :disabled="selectedAnswer === null" @click="checkDecision">Check decision</v-btn><v-btn v-else color="primary" size="large" append-icon="mdi-arrow-right" @click="nextDecision">{{ diagnosticIndex === onboardingDecisions.length - 1 ? 'See my starting path' : 'Next decision' }}</v-btn></div>
        </v-card>
        <div class="onboarding-skip-row"><v-btn variant="text" size="small" @click="skip">Skip setup and browse the catalog</v-btn></div>
      </template>

      <template v-else>
        <div class="eyebrow">Your first path</div>
        <h1>One clear place<br><em>to begin.</em></h1>
        <p class="onboarding-intro">{{ recommendation.reason }}</p>
        <v-card class="recommendation-card pa-6 pa-md-8 mt-8">
          <div class="recommendation-icon"><v-icon :icon="recommendation.recommendedTrack.icon" size="30" /></div>
          <div><span class="eyebrow">Recommended foundation</span><h2>{{ recommendation.recommendedTrack.title }}</h2><p>{{ recommendation.recommendedTrack.description }}</p></div>
          <div class="recommendation-signal"><strong>{{ recommendation.diagnosticCorrect }}/{{ recommendation.diagnosticTotal }}</strong><span>reviewed decisions completed</span></div>
        </v-card>
        <div class="first-path-grid mt-4">
          <v-card class="first-path-step pa-6"><span>Step 1</span><h2>Learn the foundation</h2><p>Read the first short lesson before attempting the guided problem.</p><v-btn variant="outlined" :to="`/learn/${recommendation.lessonSlug}`" append-icon="mdi-book-open-page-variant-outline">Open lesson</v-btn></v-card>
          <v-card class="first-path-step pa-6"><span>Step 2</span><h2>Try one guided problem</h2><p>Use a structured path that asks about the necessary state before the algorithm.</p><v-btn color="primary" :to="`/problems/${recommendation.problemId}`" append-icon="mdi-arrow-right">Start guided problem</v-btn></v-card>
        </div>
        <div class="onboarding-actions mt-8"><v-btn variant="text" @click="restart">Restart starting-point check</v-btn><v-btn variant="text" to="/problems">Browse the full catalog</v-btn></div>
        <v-btn class="mt-4" color="primary" size="large" to="/today" append-icon="mdi-calendar-check-outline">Build today’s session</v-btn>
      </template>
    </main>
  </div>
</template>
