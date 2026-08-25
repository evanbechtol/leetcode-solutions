<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { codeLanguages, useCodeLanguagePreference } from '../composables/useCodeLanguagePreference'
import { problems } from '../data/problems'
import { learningTracks } from '../data/tracks'
import { useTrainerStore } from '../stores/trainer'

const store = useTrainerStore()
const router = useRouter()
const { preferredLanguage, setPreferredLanguage } = useCodeLanguagePreference()
const showReset = ref(false)
const importInput = ref<HTMLInputElement | null>(null)
const dataMessage = ref('')
const dataError = ref('')
const preferencesMessage = ref('')
const dailyMinutes = ref(store.progressState.learner.dailyMinutes)
const preferredLearningLanguage = ref(store.progressState.learner.preferredLanguage ?? preferredLanguage.value)
const selectedTrackIds = ref([...store.progressState.learner.selectedTrackIds])
const repairStatus = ref('all')
const repairTrack = ref('all')
const repairFormat = ref('all')
const recentResults = computed(() => [...store.results].reverse().slice(0, 5).map((result) => ({
  ...result,
  problem: problems.find((problem) => problem.id === result.problemId),
})))
const practicedDays = computed(() => new Set(store.answers.map((answer) => answer.answeredAt.slice(0, 10))).size)
const strongest = computed(() => [...store.typeStats].filter((stat) => stat.total).sort((a, b) => b.accuracy - a.accuracy)[0])
const repairTrackItems = computed(() => [
  { title: 'All tracks', value: 'all' },
  ...learningTracks.filter((track) => store.repairCards.some((card) => card.lessonSlug === track.lessonSlugs[0])).map((track) => ({ title: track.title, value: track.lessonSlugs[0] })),
])
const repairFormatItems = computed(() => [
  { title: 'All interaction types', value: 'all' },
  ...[...new Set(store.repairCards.map((card) => card.questionFormat))].map((format) => ({ title: format.replaceAll('-', ' '), value: format })),
])
const visibleRepairCards = computed(() => store.repairCards.filter((card) =>
  (repairStatus.value === 'all' || card.status === repairStatus.value)
  && (repairTrack.value === 'all' || card.lessonSlug === repairTrack.value)
  && (repairFormat.value === 'all' || card.questionFormat === repairFormat.value),
))

function download(name: string, contents: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([contents], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function exportProgress() {
  download('pathfinder-progress-backup.json', store.exportProgressData())
  dataError.value = ''
  dataMessage.value = 'Your local progress backup was downloaded.'
}

function exportRecovery() {
  const raw = store.exportRecoveryData()
  if (raw) download('pathfinder-progress-recovery.json', raw, 'text/plain')
}

function chooseImport() {
  importInput.value?.click()
}

async function importProgress(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  try {
    const result = store.importProgressData(await file.text())
    if (!result.ok) {
      dataMessage.value = ''
      dataError.value = result.error || 'That backup could not be imported.'
      return
    }

    dataError.value = ''
    dataMessage.value = 'Progress was merged with this browser. Your existing preferences were kept.'
  } catch {
    dataMessage.value = ''
    dataError.value = 'That backup could not be read. Your current progress was not changed.'
  }
}

function saveLearningPreferences() {
  setPreferredLanguage(preferredLearningLanguage.value)
  store.updateLearnerProfile({
    dailyMinutes: dailyMinutes.value,
    preferredLanguage: preferredLearningLanguage.value,
    selectedTrackIds: selectedTrackIds.value,
  })
  preferencesMessage.value = 'Your learning preferences were updated.'
}

async function restartOnboarding() {
  saveLearningPreferences()
  store.restartOnboarding()
  await router.push({ name: 'start' })
}

async function openRepair(lessonSlug: string, repairId: string) {
  store.recordProductEvent('repair_destination_opened', { lessonSlug })
  await router.push({ path: `/learn/${lessonSlug}`, query: { repair: repairId } })
}
</script>

<template>
  <div class="app-shell profile-page px-5 px-md-8 py-8 py-md-12">
    <header class="profile-header mb-9">
      <div><div class="eyebrow">Your learning signal</div><h1>Progress, not perfection.</h1><p>Every decision sharpens the pattern recognition you’ll use next time.</p></div>
      <v-btn variant="outlined" prepend-icon="mdi-arrow-right" to="/today">Continue practice</v-btn>
    </header>

    <section class="stat-grid mb-6">
      <v-card class="stat-card featured pa-6"><span class="stat-label">Answer accuracy</span><strong>{{ store.accuracy }}<small>%</small></strong><v-progress-linear :model-value="store.accuracy" color="primary" height="7" rounded /><p>{{ store.totalCorrect }} of {{ store.answers.length }} decisions correct</p></v-card>
      <v-card class="stat-card pa-6"><v-icon icon="mdi-calendar-check-outline" color="accent" /><span class="stat-label">Practice consistency</span><strong>{{ store.practiceConsistency.current }}</strong><p>Best run: {{ store.practiceConsistency.best }} days</p></v-card>
      <v-card class="stat-card pa-6"><v-icon icon="mdi-check-decagram-outline" color="secondary" /><span class="stat-label">Problems completed</span><strong>{{ store.results.length }}</strong><p>{{ store.completedProblemIds.size }} unique paths</p></v-card>
      <v-card class="stat-card pa-6"><v-icon icon="mdi-calendar-blank-outline" color="info" /><span class="stat-label">Active days</span><strong>{{ practicedDays }}</strong><p>Keep the signal fresh</p></v-card>
    </section>

    <section class="profile-grid">
      <v-card class="analytics-card pa-6 pa-md-7">
        <div class="section-heading"><div><span class="eyebrow">Reasoning breakdown</span><h2>Accuracy by decision type</h2></div><v-chip v-if="strongest" color="primary" variant="tonal" size="small">Strongest: {{ strongest.type }}</v-chip></div>
        <div class="skill-bars mt-7">
          <div v-for="stat in store.typeStats" :key="stat.type" class="skill-row">
            <div class="d-flex justify-space-between mb-2"><span>{{ stat.type }}</span><strong>{{ stat.total ? `${stat.accuracy}%` : '—' }}</strong></div>
            <v-progress-linear :model-value="stat.accuracy" :color="stat.accuracy >= 80 ? 'primary' : stat.accuracy >= 50 ? 'accent' : 'secondary'" bg-color="#2b3039" height="8" rounded />
            <small>{{ stat.correct }} correct · {{ stat.total }} attempts</small>
          </div>
        </div>
      </v-card>

      <v-card class="analytics-card pa-6 pa-md-7">
        <div class="section-heading"><div><span class="eyebrow">Recent paths</span><h2>Problem history</h2></div></div>
        <div v-if="recentResults.length" class="history-list mt-5">
          <div v-for="result in recentResults" :key="`${result.problemId}-${result.completedAt}`" class="history-row">
            <div class="history-icon"><v-icon icon="mdi-code-tags" /></div>
            <div><strong>{{ result.problem?.title }}</strong><small>#{{ result.problemId }} · {{ result.problem?.difficulty }}</small></div>
            <div class="history-score">{{ result.correct }}/{{ result.total }}</div>
          </div>
        </div>
        <div v-else class="empty-state"><v-icon icon="mdi-map-marker-path" size="42" /><h3>Your first path starts here.</h3><p>Choose a starting point, then complete a guided problem to see it in your history.</p><v-btn color="primary" to="/start">Find your starting point</v-btn></div>
      </v-card>
    </section>

    <v-card class="analytics-card format-analytics pa-6 pa-md-7 mt-4">
      <div class="section-heading"><div><span class="eyebrow">Practice modes</span><h2>Accuracy by interaction</h2><p class="section-copy">See whether you recognize an answer, construct the algorithm, and follow its state equally well.</p></div></div>
      <div class="format-stat-grid mt-6">
        <article v-for="stat in store.formatStats" :key="stat.format" class="format-stat">
          <v-icon :icon="['algorithm-builder', 'code-construction'].includes(stat.format) ? 'mdi-code-braces' : stat.format === 'iteration-visualization' ? 'mdi-motion-play-outline' : 'mdi-format-list-checks'" />
          <div><span>{{ stat.label }}</span><strong>{{ stat.total ? `${stat.accuracy}%` : '—' }}</strong><small>{{ stat.correct }} correct · {{ stat.total }} attempts</small></div>
        </article>
      </div>
    </v-card>

    <v-card class="analytics-card mastery-card pa-6 pa-md-7 mt-4">
      <div class="section-heading"><div><span class="eyebrow">Problem-set mastery</span><h2>Core interview tracks</h2><p class="section-copy">A topic is mastered only after every problem in its loaded set is completed.</p></div><v-chip color="primary" variant="tonal" size="small">{{ store.topicMastery.filter(track => track.mastered).length }} mastered</v-chip></div>
      <div class="mastery-grid mt-6">
        <div v-for="track in store.topicMastery" :key="track.topic" class="mastery-track" :class="{ mastered: track.mastered, unavailable: !track.total }">
          <div class="mastery-ring" :style="{ '--progress': `${track.progress * 3.6}deg` }"><span>{{ track.total ? `${track.progress}%` : '—' }}</span></div>
          <div><strong>{{ track.topic }}</strong><small v-if="track.total">{{ track.completed }} of {{ track.total }} complete</small><small v-else>Catalog expansion planned</small></div>
          <v-icon v-if="track.mastered" icon="mdi-check-decagram" color="primary" />
        </div>
      </div>
    </v-card>

    <v-card class="analytics-card error-atlas-card pa-6 pa-md-7 mt-4">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Personal Error Atlas</span>
          <h2>Turn a difficult decision into a smaller next step</h2>
          <p class="section-copy">Each card reflects a recorded answer. “Practice this concept” is a focused review, not a label about your ability.</p>
        </div>
        <v-chip color="accent" variant="tonal" size="small">{{ store.dueRepairCards.length }} ready to review</v-chip>
      </div>
      <div v-if="store.repairCards.length" class="repair-filters mt-6">
        <v-select v-model="repairStatus" :items="[{ title: 'All statuses', value: 'all' }, { title: 'Open', value: 'open' }, { title: 'Scheduled', value: 'scheduled' }, { title: 'Revisited', value: 'revisited' }, { title: 'Validated', value: 'validated' }]" label="Status" variant="outlined" density="compact" hide-details />
        <v-select v-model="repairTrack" :items="repairTrackItems" label="Track" variant="outlined" density="compact" hide-details />
        <v-select v-model="repairFormat" :items="repairFormatItems" label="Interaction" variant="outlined" density="compact" hide-details />
      </div>
      <div v-if="visibleRepairCards.length" class="repair-card-list mt-6">
        <article v-for="card in visibleRepairCards" :key="card.id" class="repair-card" :class="{ snoozed: card.snoozed }">
          <div class="repair-card-icon"><v-icon :icon="card.repairMode === 'trace' ? 'mdi-motion-play-outline' : 'mdi-wrench-check-outline'" /></div>
          <div class="repair-card-copy">
            <div class="d-flex flex-wrap align-center ga-2"><span class="repair-card-label">{{ card.label }}</span><v-chip size="x-small" variant="tonal">{{ card.status }}</v-chip><v-chip v-if="card.snoozed" size="x-small" variant="outlined">Snoozed until {{ card.snoozedUntil }}</v-chip></div>
            <h3>{{ card.concept }}</h3>
            <p><strong>From {{ card.sourceProblemTitle }}:</strong> {{ card.why }}</p>
            <small v-if="card.contentUpdated"><v-icon icon="mdi-history" size="14" /> Content has been updated since this answer; this uses the current reviewed explanation.</small>
            <small v-else><v-icon icon="mdi-repeat" size="14" /> {{ card.repeatCount }} recorded {{ card.repeatCount === 1 ? 'decision' : 'decisions' }} of this kind</small>
          </div>
          <div class="repair-card-actions"><v-btn color="primary" size="small" @click="openRepair(card.lessonSlug, card.id)">{{ card.repairMode === 'trace' ? 'Open trace lesson' : 'Review lesson' }}</v-btn><v-btn v-if="card.status !== 'validated'" variant="text" size="small" @click="store.snoozeRepair(card.id)">Snooze 7 days</v-btn></div>
        </article>
      </div>
      <div v-else-if="store.repairCards.length" class="repair-empty mt-6">No cards match these filters.</div>
      <div v-else class="repair-empty mt-6"><v-icon icon="mdi-map-marker-check-outline" size="32" /><div><strong>No repair cards yet.</strong><p>When an answer needs another look, Pathfinder will offer one reviewed concept to revisit here.</p></div></div>
    </v-card>

    <v-card class="analytics-card pa-6 pa-md-7 mt-4">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Learning preferences</span>
          <h2>Shape your next practice session</h2>
          <p class="section-copy">These settings stay in this browser and can be changed whenever your goals change.</p>
        </div>
      </div>
      <div class="preference-grid mt-6">
        <v-select v-model="dailyMinutes" :items="[5, 10, 15]" label="Typical daily time" suffix="minutes" variant="outlined" hide-details />
        <v-select v-model="preferredLearningLanguage" :items="codeLanguages" label="Preferred code language" variant="outlined" hide-details />
      </div>
      <div class="mt-6">
        <span class="preference-label">Tracks to prioritize</span>
        <v-chip-group v-model="selectedTrackIds" multiple selected-class="preference-track-active" class="mt-2">
          <v-chip v-for="track in learningTracks" :key="track.id" :value="track.id" filter>{{ track.title }}</v-chip>
        </v-chip-group>
      </div>
      <div class="d-flex flex-wrap align-center ga-3 mt-5">
        <v-btn color="primary" @click="saveLearningPreferences">Save preferences</v-btn>
        <v-btn variant="text" @click="restartOnboarding">Restart starting-point check</v-btn>
      </div>
      <v-alert v-if="preferencesMessage" class="mt-5" density="compact" type="success" variant="tonal">{{ preferencesMessage }}</v-alert>
    </v-card>

    <v-card class="analytics-card pa-6 pa-md-7 mt-4">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Your data</span>
          <h2>Keep your learning history safe</h2>
          <p class="section-copy">Progress stays in this browser. Download a backup before switching devices or clearing browser data.</p>
        </div>
      </div>
      <div class="d-flex flex-wrap ga-3 mt-6">
        <v-btn color="primary" prepend-icon="mdi-download-outline" @click="exportProgress">Download backup</v-btn>
        <v-btn variant="outlined" prepend-icon="mdi-upload-outline" @click="chooseImport">Restore backup</v-btn>
        <input ref="importInput" class="sr-only" type="file" accept="application/json,.json" aria-label="Choose a Pathfinder progress backup" @change="importProgress" />
      </div>
      <v-alert v-if="dataMessage" class="mt-5" density="compact" type="success" variant="tonal">{{ dataMessage }}</v-alert>
      <v-alert v-if="dataError" class="mt-5" density="compact" type="error" variant="tonal">{{ dataError }}</v-alert>
      <v-alert v-if="store.progressStorageError" class="mt-5" density="compact" type="warning" variant="tonal">{{ store.progressStorageError }}</v-alert>
      <v-alert v-if="store.progressRecovery" class="mt-5" density="compact" type="warning" variant="tonal">
        We could not read an older local progress file. Your current session is safe; download the recovery copy before clearing browser data.
        <template #append><v-btn size="small" variant="text" @click="exportRecovery">Download recovery copy</v-btn></template>
      </v-alert>
    </v-card>

    <div class="data-note mt-7"><v-icon icon="mdi-shield-check-outline" /> Progress is stored only in this browser. <v-btn variant="text" size="small" color="error" @click="showReset = true">Reset data</v-btn></div>
    <v-dialog v-model="showReset" max-width="430"><v-card class="pa-6"><h3>Reset all progress?</h3><p class="mt-2 mb-6 text-medium-emphasis">This removes answer history, streaks, and completed problems from this browser.</p><div class="d-flex justify-end ga-3"><v-btn variant="text" @click="showReset = false">Cancel</v-btn><v-btn color="error" @click="store.resetProgress(); showReset = false">Reset progress</v-btn></div></v-card></v-dialog>
  </div>
</template>
