<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useTrainerStore } from './stores/trainer'
import FeedbackDialog from './components/FeedbackDialog.vue'
import { publicReleaseConfig } from './config/publicRelease'

const store = useTrainerStore()
const mobileNavOpen = ref(false)
const feedbackOpen = ref(false)
let recordedRuntimeError = false
const navigation = [
  { to: '/today', label: 'Today', description: 'Complete a small mastery session', icon: 'mdi-calendar-check-outline' },
  { to: '/paths', label: 'Paths', description: 'Follow the learning map', icon: 'mdi-map-marker-path' },
  { to: '/', label: 'Practice', description: 'Start a guided problem', icon: 'mdi-compass-outline' },
  { to: '/problems', label: 'Problems', description: 'Browse all 136 problems', icon: 'mdi-format-list-bulleted' },
  { to: '/learn', label: 'Learn', description: 'Study data structures and algorithms', icon: 'mdi-book-open-page-variant-outline' },
  { to: '/cheat-sheet', label: 'Cheat Sheet', description: 'Search common patterns', icon: 'mdi-notebook-outline' },
  { to: '/profile', label: 'Progress', description: 'Review accuracy and mastery', icon: 'mdi-chart-donut' },
]

function recordRuntimeError() {
  if (recordedRuntimeError) return
  recordedRuntimeError = true
  store.recordProductEvent('application_error', { kind: 'runtime' })
}

onMounted(() => {
  window.addEventListener('error', recordRuntimeError)
  window.addEventListener('unhandledrejection', recordRuntimeError)
})

onBeforeUnmount(() => {
  window.removeEventListener('error', recordRuntimeError)
  window.removeEventListener('unhandledrejection', recordRuntimeError)
})
</script>

<template>
  <v-app>
    <v-app-bar class="app-bar" height="72" flat>
      <div class="app-shell d-flex align-center w-100 px-5 px-md-8">
        <router-link to="/" class="brand d-flex align-center text-decoration-none">
          <span class="brand-mark"><v-icon icon="mdi-vector-polyline" size="22" /></span>
          <span class="brand-name">pathfinder</span>
        </router-link>
        <v-spacer />
        <nav class="nav-pills" aria-label="Primary navigation">
          <router-link v-for="item in navigation" :key="item.to" :to="item.to" class="nav-link"><v-icon :icon="item.icon" size="19" /> {{ item.label }}</router-link>
        </nav>
        <div class="streak-pill top-streak ml-3 ml-md-6"><span>◆</span> {{ store.practiceConsistency.current }} <span class="streak-label">practice</span></div>
        <v-btn class="mobile-nav-trigger" icon="mdi-menu" variant="text" aria-label="Open navigation menu" @click="mobileNavOpen = true" />
      </div>
    </v-app-bar>
    <v-navigation-drawer v-model="mobileNavOpen" class="mobile-nav-drawer" location="right" temporary width="320">
      <div class="mobile-nav-header">
        <div><span class="eyebrow">Pathfinder</span><strong>Navigate</strong></div>
        <v-btn icon="mdi-close" variant="text" aria-label="Close navigation menu" @click="mobileNavOpen = false" />
      </div>
      <div class="mobile-nav-streak">
        <span class="mobile-streak-icon">◆</span>
        <div><strong>{{ store.practiceConsistency.current }} day practice run</strong><small>A missed day pauses it; your learning remains.</small></div>
      </div>
      <nav class="mobile-nav-list" aria-label="Mobile navigation">
        <router-link v-for="item in navigation" :key="item.to" :to="item.to" class="mobile-nav-link" @click="mobileNavOpen = false">
          <span class="mobile-nav-icon"><v-icon :icon="item.icon" size="22" /></span>
          <span><strong>{{ item.label }}</strong><small>{{ item.description }}</small></span>
          <v-icon icon="mdi-chevron-right" size="20" />
        </router-link>
      </nav>
      <div class="mobile-nav-footer">All progress stays on this device.</div>
    </v-navigation-drawer>
    <v-main>
      <v-banner v-if="publicReleaseConfig.betaEnabled" class="beta-banner" icon="mdi-flask-outline" lines="one">
        Pathfinder public beta · Learning data stays in this browser.
        <template #actions><v-btn size="small" variant="text" @click="feedbackOpen = true">Give feedback</v-btn></template>
      </v-banner>
      <router-view />
    </v-main>
    <footer class="app-footer">
      <div class="app-shell px-5 px-md-8">
        <div><span class="brand-name">pathfinder</span><small>Reviewed coaching. Private by default.</small></div>
        <nav aria-label="Product information">
          <router-link to="/privacy">Privacy</router-link>
          <router-link to="/content-policy">Content</router-link>
          <router-link to="/accessibility">Accessibility</router-link>
          <router-link to="/changelog">Changelog</router-link>
          <router-link to="/data">Your data</router-link>
        </nav>
        <v-btn variant="outlined" prepend-icon="mdi-message-text-outline" @click="feedbackOpen = true">Give feedback</v-btn>
      </div>
    </footer>
    <FeedbackDialog v-model="feedbackOpen" />
  </v-app>
</template>
