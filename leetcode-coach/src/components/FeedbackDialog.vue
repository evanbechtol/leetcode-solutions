<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { publicReleaseConfig } from '../config/publicRelease'
import { useTrainerStore } from '../stores/trainer'
import {
  MAX_FEEDBACK_MESSAGE_LENGTH,
  clearFeedbackDraft,
  diagnosticSummaryFor,
  formatFeedbackReport,
  loadFeedbackDraft,
  saveFeedbackDraft,
} from '../utils/publicFeedback'

const open = defineModel<boolean>({ required: true })
const route = useRoute()
const store = useTrainerStore()
const message = ref(loadFeedbackDraft().message)
const lastSavedMessage = ref(message.value)
const includeDiagnostics = ref(false)
const status = ref('')
const error = ref('')
const feedbackRoute = ref(route.fullPath)

const report = computed(() => formatFeedbackReport({
  message: message.value,
  route: feedbackRoute.value,
  appVersion: publicReleaseConfig.appVersion,
  diagnostics: includeDiagnostics.value ? diagnosticSummaryFor(store.progressState, store.catalogSize) : undefined,
}))

watch(open, (visible) => {
  if (!visible) return
  feedbackRoute.value = route.fullPath
  includeDiagnostics.value = false
  status.value = ''
  error.value = ''
  store.recordProductEvent('feedback_opened', { route: feedbackRoute.value })
})

function saveDraft() {
  try {
    if (!message.value.trim()) {
      clearFeedbackDraft()
      lastSavedMessage.value = ''
      return
    }
    if (message.value === lastSavedMessage.value) return
    saveFeedbackDraft(message.value)
    lastSavedMessage.value = message.value
    store.recordProductEvent('feedback_draft_saved', { route: feedbackRoute.value })
  } catch {
    error.value = 'This browser could not save the draft. You can still copy it before closing.'
  }
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value)
  const field = document.createElement('textarea')
  field.value = value
  field.setAttribute('readonly', '')
  field.style.position = 'fixed'
  field.style.opacity = '0'
  document.body.appendChild(field)
  field.select()
  const copied = document.execCommand('copy')
  field.remove()
  if (!copied) throw new Error('Clipboard unavailable')
}

async function submitFeedback() {
  error.value = ''
  status.value = ''
  try {
    await copyText(report.value)
    store.recordProductEvent('feedback_report_copied', { route: feedbackRoute.value })
    if (includeDiagnostics.value) store.recordProductEvent('feedback_diagnostics_included')
    clearFeedbackDraft()
    message.value = ''
    lastSavedMessage.value = ''
    status.value = publicReleaseConfig.feedbackUrl
      ? 'Feedback copied. The feedback site opened in a new tab; paste the report there when you are ready.'
      : 'Feedback copied. Nothing was transmitted by Pathfinder.'
    if (publicReleaseConfig.feedbackUrl) {
      window.open(publicReleaseConfig.feedbackUrl, '_blank', 'noopener,noreferrer')
      store.recordProductEvent('feedback_url_opened')
    }
  } catch {
    error.value = 'Pathfinder could not copy the report. Select the text below and copy it manually.'
  }
}
</script>

<template>
  <v-dialog v-model="open" max-width="680" @after-leave="saveDraft">
    <v-card class="feedback-dialog pa-6 pa-md-8">
      <div class="feedback-dialog-heading">
        <div><span class="eyebrow">Local-first beta feedback</span><h2>Help improve Pathfinder</h2></div>
        <v-btn icon="mdi-close" variant="text" aria-label="Close feedback form" @click="open = false" />
      </div>
      <p>Pathfinder prepares a report in this browser. It sends nothing automatically.</p>
      <div class="feedback-context mt-5">
        <span><strong>Page</strong> {{ feedbackRoute }}</span>
        <span><strong>Version</strong> {{ publicReleaseConfig.appVersion }}</span>
      </div>
      <v-textarea
        v-model="message"
        class="mt-5"
        label="What happened, or what should improve?"
        :counter="MAX_FEEDBACK_MESSAGE_LENGTH"
        :maxlength="MAX_FEEDBACK_MESSAGE_LENGTH"
        rows="6"
        auto-grow
        autofocus
        @blur="saveDraft"
      />
      <v-checkbox v-model="includeDiagnostics" hide-details>
        <template #label>
          <span>Include an aggregate diagnostic summary <small>(counts only; no answers, confidence, dates, or error details)</small></span>
        </template>
      </v-checkbox>
      <details class="feedback-preview mt-3">
        <summary>Preview the exact report</summary>
        <pre>{{ report }}</pre>
      </details>
      <p class="sr-only" aria-live="polite">{{ status || error }}</p>
      <v-alert v-if="status" class="mt-4" type="success" variant="tonal" density="compact">{{ status }}</v-alert>
      <v-alert v-if="error" class="mt-4" type="error" variant="tonal" density="compact">{{ error }}</v-alert>
      <div class="feedback-actions mt-6">
        <v-btn variant="text" @click="open = false">Keep draft and close</v-btn>
        <v-btn color="primary" prepend-icon="mdi-content-copy" :disabled="!message.trim()" @click="submitFeedback">
          {{ publicReleaseConfig.feedbackUrl ? 'Copy and open feedback site' : 'Copy feedback' }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>
