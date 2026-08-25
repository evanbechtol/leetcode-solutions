<script setup lang="ts">
import { computed } from 'vue'
import { useTrainerStore } from '../stores/trainer'

const store = useTrainerStore()
const summary = computed(() => ({
  schemaVersion: store.progressState.version,
  migration: store.progressMigrationStatus,
  attempts: store.progressState.attempts.length,
  completions: store.progressState.completedProblems.length,
  repairs: store.progressState.repairs.length,
  dailySessions: store.progressState.dailySessions.length,
  aggregates: store.progressState.weeklyAggregates.length,
  localEvents: store.progressState.localEvents.length,
  recovery: store.progressRecovery?.reason ?? 'none',
}))
</script>

<template>
  <div class="app-shell profile-page px-5 px-md-8 py-8 py-md-12">
    <header class="profile-header mb-9">
      <div>
        <div class="eyebrow">Development only</div>
        <h1>Progress inspector</h1>
        <p>Inspect the local V2 progress shape while developing migrations and selectors.</p>
      </div>
    </header>

    <v-card class="analytics-card pa-6 pa-md-7">
      <pre class="dev-progress-json">{{ JSON.stringify(summary, null, 2) }}</pre>
    </v-card>
  </div>
</template>
