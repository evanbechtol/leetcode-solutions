<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import FilterPanel from '../components/FilterPanel.vue'
import { useTrainerStore } from '../stores/trainer'
import { filterProblemsBySearch } from '../utils/problemSearch'
import { problemRoutePath } from '../utils/problemRoutes'

const store = useTrainerStore()
const search = ref('')
const filterOpen = ref(false)

const activeFilterCount = computed(() => Object.values(store.filters).reduce((total, values) => total + values.length, 0))
const visibleProblems = computed(() => filterProblemsBySearch(store.matchingProblems, search.value || '')
  .slice()
  .sort((left, right) => left.id - right.id))

const difficultyCounts = computed(() => ({
  Easy: store.availableProblems.filter(({ difficulty }) => difficulty === 'Easy').length,
  Medium: store.availableProblems.filter(({ difficulty }) => difficulty === 'Medium').length,
  Hard: store.availableProblems.filter(({ difficulty }) => difficulty === 'Hard').length,
}))

function clearAll() {
  search.value = ''
  store.filters = { difficulties: [], sets: [], topics: [], algorithms: [] }
}

onMounted(() => {
  document.title = 'Problems | Pathfinder'
})
</script>

<template>
  <div class="page-wrap problems-page">
    <div class="app-shell problems-catalog px-5 px-md-8 py-8 py-md-12">
      <header class="problems-hero">
        <div>
          <div class="eyebrow">Complete practice catalog</div>
          <h1>Choose your next <em>problem.</em></h1>
          <p>Search all verified coaching paths or narrow the catalog with the same difficulty, problem-set, topic, and algorithm filters used by Practice.</p>
        </div>
        <div class="problems-summary" aria-label="Catalog summary">
          <strong>{{ store.availableProblems.length }}</strong>
          <span>guided problems</span>
          <small>{{ difficultyCounts.Easy }} easy · {{ difficultyCounts.Medium }} medium · {{ difficultyCounts.Hard }} hard</small>
        </div>
      </header>

      <section class="problem-catalog-controls mt-8" aria-label="Search and filter problems">
        <v-text-field
          v-model="search"
          label="Search problems"
          placeholder="Try “Two Sum”, 704, graph, or binary search"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          clearable
          hide-details
        />
        <v-btn size="large" variant="outlined" prepend-icon="mdi-tune-variant" @click="filterOpen = true">
          Filters <span v-if="activeFilterCount" class="filter-count ml-2">{{ activeFilterCount }}</span>
        </v-btn>
      </section>

      <div class="problem-results-heading mt-7 mb-4" aria-live="polite">
        <div>
          <span>{{ visibleProblems.length }} {{ visibleProblems.length === 1 ? 'problem' : 'problems' }}</span>
          <small v-if="search || activeFilterCount"> matching your search and focus</small>
          <small v-else> available to practice</small>
        </div>
        <v-btn v-if="search || activeFilterCount" variant="text" size="small" prepend-icon="mdi-filter-off-outline" @click="clearAll">Clear search and filters</v-btn>
      </div>

      <section v-if="visibleProblems.length" class="problem-catalog-grid" aria-label="Problem results">
        <v-card
          v-for="problem in visibleProblems"
          :key="problem.id"
          :to="problemRoutePath(problem.id)"
          class="problem-catalog-card"
          link
        >
          <div class="problem-card-topline">
            <span>LEETCODE / {{ String(problem.id).padStart(4, '0') }}</span>
            <v-chip size="x-small" :class="`difficulty-${problem.difficulty.toLowerCase()}`">{{ problem.difficulty }}</v-chip>
          </div>
          <h2>{{ problem.title }}</h2>
          <p>{{ problem.description }}</p>
          <div class="problem-card-topics">
            <v-chip v-for="topic in problem.topics.slice(0, 3)" :key="topic" size="x-small" variant="outlined">{{ topic }}</v-chip>
            <span v-if="problem.topics.length > 3">+{{ problem.topics.length - 3 }}</span>
          </div>
          <footer>
            <span v-if="store.completedProblemIds.has(problem.id)" class="problem-completed"><v-icon icon="mdi-check-circle" size="16" /> Completed</span>
            <span v-else><v-icon icon="mdi-map-marker-path" size="16" /> {{ problem.questions.length }} guided decisions</span>
            <strong>{{ store.completedProblemIds.has(problem.id) ? 'Practice again' : 'Attempt problem' }} <v-icon icon="mdi-arrow-right" size="17" /></strong>
          </footer>
        </v-card>
      </section>

      <v-card v-else class="problem-catalog-empty pa-8 pa-md-12">
        <v-icon icon="mdi-text-search" size="42" />
        <h2>No problems match yet</h2>
        <p>Try a broader search or clear one of the active filters.</p>
        <v-btn color="primary" @click="clearAll">Show all problems</v-btn>
      </v-card>
    </div>

    <v-navigation-drawer v-model="filterOpen" location="right" temporary width="410">
      <FilterPanel @close="filterOpen = false" />
    </v-navigation-drawer>
  </div>
</template>
