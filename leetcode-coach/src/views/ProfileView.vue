<script setup lang="ts">
import { computed, ref } from 'vue'
import { problems } from '../data/problems'
import { useTrainerStore } from '../stores/trainer'

const store = useTrainerStore()
const showReset = ref(false)
const recentResults = computed(() => [...store.results].reverse().slice(0, 5).map((result) => ({
  ...result,
  problem: problems.find((problem) => problem.id === result.problemId),
})))
const practicedDays = computed(() => new Set(store.answers.map((answer) => answer.answeredAt.slice(0, 10))).size)
const strongest = computed(() => [...store.typeStats].filter((stat) => stat.total).sort((a, b) => b.accuracy - a.accuracy)[0])
</script>

<template>
  <div class="app-shell profile-page px-5 px-md-8 py-8 py-md-12">
    <header class="profile-header mb-9">
      <div><div class="eyebrow">Your learning signal</div><h1>Progress, not perfection.</h1><p>Every decision sharpens the pattern recognition you’ll use next time.</p></div>
      <v-btn variant="outlined" prepend-icon="mdi-arrow-right" to="/">Continue practice</v-btn>
    </header>

    <section class="stat-grid mb-6">
      <v-card class="stat-card featured pa-6"><span class="stat-label">Answer accuracy</span><strong>{{ store.accuracy }}<small>%</small></strong><v-progress-linear :model-value="store.accuracy" color="primary" height="7" rounded /><p>{{ store.totalCorrect }} of {{ store.answers.length }} decisions correct</p></v-card>
      <v-card class="stat-card pa-6"><v-icon icon="mdi-fire" color="accent" /><span class="stat-label">Current streak</span><strong>{{ store.streak }}</strong><p>Best streak: {{ store.bestStreak }}</p></v-card>
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
        <div v-else class="empty-state"><v-icon icon="mdi-map-marker-path" size="42" /><h3>Your first path starts here.</h3><p>Complete a guided problem to see it in your history.</p><v-btn color="primary" to="/">Start practicing</v-btn></div>
      </v-card>
    </section>

    <v-card class="analytics-card format-analytics pa-6 pa-md-7 mt-4">
      <div class="section-heading"><div><span class="eyebrow">Practice modes</span><h2>Accuracy by interaction</h2><p class="section-copy">See whether you recognize an answer, construct the algorithm, and follow its state equally well.</p></div></div>
      <div class="format-stat-grid mt-6">
        <article v-for="stat in store.formatStats" :key="stat.format" class="format-stat">
          <v-icon :icon="stat.format === 'algorithm-builder' ? 'mdi-code-braces' : stat.format === 'iteration-visualization' ? 'mdi-motion-play-outline' : 'mdi-format-list-checks'" />
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

    <div class="data-note mt-7"><v-icon icon="mdi-shield-check-outline" /> Progress is stored only in this browser. <v-btn variant="text" size="small" color="error" @click="showReset = true">Reset data</v-btn></div>
    <v-dialog v-model="showReset" max-width="430"><v-card class="pa-6"><h3>Reset all progress?</h3><p class="mt-2 mb-6 text-medium-emphasis">This removes answer history, streaks, and completed problems from this browser.</p><div class="d-flex justify-end ga-3"><v-btn variant="text" @click="showReset = false">Cancel</v-btn><v-btn color="error" @click="store.resetProgress(); showReset = false">Reset progress</v-btn></div></v-card></v-dialog>
  </div>
</template>
