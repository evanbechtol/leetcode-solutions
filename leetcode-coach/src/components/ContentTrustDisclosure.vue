<script setup lang="ts">
import { computed } from 'vue'

interface SourceReference {
  name: string
  version: string
  repository: string
  license: string
}

const props = defineProps<{
  contentVersion: string
  canonicalApproach: string
  complexityAssumptions: string
  source?: SourceReference
  traceQuality?: 'exact-reviewed' | 'instructional-overview'
}>()

const traceLabel = computed(() => props.traceQuality === 'exact-reviewed'
  ? 'Exact reviewed trace'
  : props.traceQuality === 'instructional-overview'
    ? 'Instructional overview'
    : null)
</script>

<template>
  <details class="trust-disclosure">
    <summary><v-icon icon="mdi-shield-check-outline" size="17" /> How this is verified</summary>
    <div class="trust-disclosure-body">
      <div class="trust-facts">
        <span><strong>Coaching</strong> Reviewed and deterministic</span>
        <span><strong>AI role</strong> Optional and non-authoritative</span>
        <span><strong>Content version</strong> <router-link to="/changelog">{{ contentVersion }}</router-link></span>
        <span v-if="traceLabel"><strong>Trace quality</strong> {{ traceLabel }}</span>
      </div>
      <p><strong>Canonical approach:</strong> {{ canonicalApproach }}</p>
      <p><strong>Complexity assumptions:</strong> {{ complexityAssumptions }}</p>
      <p v-if="traceQuality === 'exact-reviewed'">Every displayed state is backed by a reviewed fixture for this example.</p>
      <p v-else-if="traceQuality === 'instructional-overview'">This deterministic overview explains the algorithm’s phases; it is not presented as a line-by-line execution record.</p>
      <p v-if="source">
        Problem metadata is attributed to
        <a :href="source.repository" target="_blank" rel="noreferrer">{{ source.name }} {{ source.version }}</a>
        ({{ source.license }}). Imported problem prose remains subject to the boundaries in Pathfinder’s notices.
      </p>
      <p v-else>Pathfinder’s lesson explanation and coaching sequence are maintained as reviewed application content.</p>
      <div class="trust-links">
        <router-link to="/content-policy">Content policy</router-link>
        <router-link to="/privacy">Privacy</router-link>
      </div>
    </div>
  </details>
</template>
