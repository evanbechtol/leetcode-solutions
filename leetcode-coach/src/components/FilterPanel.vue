<script setup lang="ts">
import { computed } from 'vue'
import { useTrainerStore } from '../stores/trainer'
import type { Difficulty } from '../types'

const store = useTrainerStore()
const emit = defineEmits<{ close: [] }>()
const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard']
const sets = computed(() => [...new Set(store.availableProblems.flatMap((problem) => problem.set))])
const topics = computed(() => [...new Set(store.availableProblems.flatMap((problem) => problem.topics))].sort())
const algorithms = computed(() => [...new Set(store.availableProblems.flatMap((problem) => problem.algorithms))].sort())

function clear() {
  store.filters = { difficulties: [], sets: [], topics: [], algorithms: [] }
}
</script>

<template>
  <v-card class="filter-card pa-5 pa-md-6">
    <div class="d-flex align-start mb-5">
      <div><div class="eyebrow mb-1">Tune your session</div><h3>Problem filters</h3></div>
      <v-spacer />
      <v-btn icon="mdi-close" variant="text" size="small" aria-label="Close filters" @click="emit('close')" />
    </div>
    <div class="filter-label">Difficulty</div>
    <v-chip-group v-model="store.filters.difficulties" multiple column class="mb-4">
      <v-chip v-for="item in difficulties" :key="item" :value="item" filter>{{ item }}</v-chip>
    </v-chip-group>
    <div class="filter-label">Problem set</div>
    <v-select v-model="store.filters.sets" :items="sets" multiple chips closable-chips placeholder="Any set" variant="outlined" density="comfortable" class="mb-3" />
    <div class="filter-label">Topic</div>
    <v-select v-model="store.filters.topics" :items="topics" multiple chips closable-chips placeholder="Any topic" variant="outlined" density="comfortable" class="mb-3" />
    <div class="filter-label">Algorithm</div>
    <v-select v-model="store.filters.algorithms" :items="algorithms" multiple chips closable-chips placeholder="Any algorithm" variant="outlined" density="comfortable" />
    <div class="filter-summary mt-4 mb-5"><v-icon icon="mdi-tune-variant" size="18" /> {{ store.matchingProblems.length }} matching problems</div>
    <div class="d-flex ga-3">
      <v-btn variant="text" @click="clear">Clear all</v-btn>
      <v-btn color="primary" class="flex-grow-1" @click="emit('close')">Apply filters</v-btn>
    </div>
  </v-card>
</template>
