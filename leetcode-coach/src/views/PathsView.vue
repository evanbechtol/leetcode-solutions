<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useTrainerStore } from '../stores/trainer'
import { milestoneCardBlob, milestoneCardFilename } from '../utils/milestoneCard'
import type { EarnedMilestone, LearningMapStatus } from '../utils/learningMap'

const store = useTrainerStore()
const route = useRoute()
const view = ref<'map' | 'list'>('map')
const announcement = ref('')
const selectedTrackId = computed(() => typeof route.query.track === 'string' ? route.query.track : '')

const statusPresentation: Record<LearningMapStatus, { label: string; icon: string }> = {
  'not-started': { label: 'Not started', icon: 'mdi-circle-outline' },
  learning: { label: 'Learning', icon: 'mdi-book-open-page-variant-outline' },
  practiced: { label: 'Practiced', icon: 'mdi-check-circle-outline' },
  stable: { label: 'Stable', icon: 'mdi-shield-check-outline' },
  'complete-set': { label: 'Complete set', icon: 'mdi-check-decagram' },
}

function downloadMilestone(milestone: EarnedMilestone) {
  const url = URL.createObjectURL(milestoneCardBlob(milestone))
  const link = document.createElement('a')
  link.href = url
  link.download = milestoneCardFilename(milestone)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
  announcement.value = `${milestone.label} card downloaded.`
  store.recordProductEvent('milestone_card_downloaded', { kind: milestone.kind })
}

async function copyPathsLink(milestone: EarnedMilestone) {
  const url = new URL('#/paths', window.location.href).toString()
  try {
    await navigator.clipboard.writeText(url)
    announcement.value = 'Pathfinder learning-map link copied.'
    store.recordProductEvent('milestone_link_copied', { kind: milestone.kind })
  } catch {
    announcement.value = 'The link could not be copied. Open Paths and copy the browser address instead.'
  }
}
</script>

<template>
  <div class="app-shell paths-page px-5 px-md-8 py-10 py-md-14">
    <header class="paths-hero">
      <div><span class="eyebrow">Learning map</span><h1>See how the ideas connect.</h1><p>Follow an authored order, revisit what needs practice, or open any node whenever it helps. Nothing is locked.</p></div>
      <v-btn-toggle v-model="view" mandatory variant="outlined" divided aria-label="Learning map view">
        <v-btn value="map" prepend-icon="mdi-map-outline">Map</v-btn><v-btn value="list" prepend-icon="mdi-format-list-bulleted">List</v-btn>
      </v-btn-toggle>
    </header>

    <section class="path-legend mt-7" aria-label="Learning map status legend">
      <span v-for="(item, status) in statusPresentation" :key="status" :class="`status-${status}`"><v-icon :icon="item.icon" size="16" /> {{ item.label }}</span>
    </section>

    <section v-if="view === 'map'" class="track-map-grid mt-7" aria-label="Curriculum map">
      <article v-for="map in store.learningMaps" :id="`track-${map.track.id}`" :key="map.track.id" class="track-map-card" :class="[{ selected: selectedTrackId === map.track.id }, `status-${map.status}`]">
        <header><div class="track-map-icon"><v-icon :icon="map.track.icon" /></div><div><span>{{ statusPresentation[map.status].label }}</span><h2>{{ map.track.title }}</h2><p>{{ map.track.description }}</p></div></header>
        <p v-if="map.track.prerequisiteTrackIds.length" class="track-prerequisite"><v-icon icon="mdi-source-branch" size="15" /> Builds on {{ map.track.prerequisiteTrackIds.map(id => store.learningMaps.find(candidate => candidate.track.id === id)?.track.title).filter(Boolean).join(', ') }}</p>
        <ol class="track-node-list">
          <li v-for="node in map.nodes" :key="node.id" :class="`status-${node.status}`">
            <span class="node-connector" aria-hidden="true" /><router-link :to="node.to"><v-icon :icon="statusPresentation[node.status].icon" /><span><small>{{ node.kind.replaceAll('-', ' ') }} · {{ statusPresentation[node.status].label }}</small><strong>{{ node.title }}</strong><em>{{ node.description }}</em></span><v-icon icon="mdi-arrow-right" size="18" /></router-link>
          </li>
          <li class="track-capstone" :class="{ earned: map.completeSet }"><span class="node-connector" aria-hidden="true" /><div><v-icon :icon="statusPresentation['complete-set'].icon" /><span><small>Track capstone · {{ map.completeSet ? 'Complete set' : 'In progress' }}</small><strong>Complete the loaded {{ map.track.title }} set</strong><em>{{ map.completedCatalogProblems }} of {{ map.catalogProblemCount }} catalog problems complete</em></span></div></li>
        </ol>
        <v-btn v-if="map.nextNode" block color="primary" variant="tonal" :to="map.nextNode.to">Continue {{ map.track.title }}</v-btn>
        <v-chip v-else color="primary" prepend-icon="mdi-check-decagram">Complete set</v-chip>
      </article>
    </section>

    <section v-else class="track-list-view mt-7" aria-labelledby="list-view-heading">
      <h2 id="list-view-heading" class="sr-only">Curriculum in ordered list form</h2>
      <article v-for="map in store.learningMaps" :key="map.track.id"><h3>{{ map.track.title }} — {{ statusPresentation[map.status].label }}</h3><ol><li v-for="node in map.nodes" :key="node.id"><router-link :to="node.to">{{ node.title }}</router-link><span>{{ statusPresentation[node.status].label }}. {{ node.description }}</span></li><li><strong>Complete set capstone</strong><span>{{ map.completedCatalogProblems }} of {{ map.catalogProblemCount }} catalog problems complete.</span></li></ol></article>
    </section>

    <section class="milestone-section mt-12" aria-labelledby="milestone-heading">
      <div class="section-heading"><div><span class="eyebrow">Optional sharing</span><h2 id="milestone-heading">Milestones earned on this device</h2><p class="section-copy">Cards are created locally and contain no name, error details, accuracy, confidence, or dates.</p></div><v-chip variant="outlined" prepend-icon="mdi-lock-outline">Private by default</v-chip></div>
      <div v-if="store.shareableMilestones.length" class="milestone-grid mt-6">
        <article v-for="milestone in store.shareableMilestones" :key="milestone.key" class="milestone-card"><div class="milestone-brand"><v-icon icon="mdi-vector-polyline" /> pathfinder</div><span>{{ milestone.label }}</span><h3>{{ milestone.track ?? 'Pathfinder learning' }}</h3><p>{{ milestone.summary }}</p><div><v-btn size="small" color="primary" prepend-icon="mdi-download-outline" @click="downloadMilestone(milestone)">Download</v-btn><v-btn size="small" variant="outlined" prepend-icon="mdi-link-variant" @click="copyPathsLink(milestone)">Copy link</v-btn></div></article>
      </div>
      <div v-else class="paths-empty mt-6"><v-icon icon="mdi-flag-checkered" size="34" /><div><strong>Your first milestone is ahead.</strong><p>Stable practice, a completed track, a verified repair, or a seven-day practice run will appear here.</p></div></div>
      <p class="sr-only" aria-live="polite">{{ announcement }}</p>
    </section>
  </div>
</template>
