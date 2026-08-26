<script setup lang="ts">
import { usePwa } from '../composables/usePwa'

const pwa = usePwa()
</script>

<template>
  <v-banner
    v-if="!pwa.isOnline.value"
    class="offline-banner"
    icon="mdi-cloud-off-outline"
    lines="one"
    role="status"
    aria-live="polite"
  >
    You’re offline. Downloaded lessons and practice remain available.
  </v-banner>

  <v-snackbar
    :model-value="pwa.offlineReady.value"
    color="surface"
    location="bottom"
    :timeout="-1"
    @update:model-value="pwa.dismissOfflineReady"
  >
    Pathfinder is ready to use offline.
    <template #actions>
      <v-btn v-if="pwa.installAvailable.value" color="primary" variant="text" @click="pwa.requestInstall">Install</v-btn>
      <v-btn variant="text" aria-label="Dismiss offline-ready message" @click="pwa.dismissOfflineReady">Dismiss</v-btn>
    </template>
  </v-snackbar>

  <v-snackbar
    :model-value="pwa.updatePromptVisible.value"
    color="surface"
    location="bottom"
    :timeout="-1"
    @update:model-value="pwa.deferUpdate"
  >
    A new Pathfinder version is ready.
    <template #actions>
      <v-btn color="primary" variant="text" @click="pwa.applyUpdate">Update now</v-btn>
      <v-btn variant="text" @click="pwa.deferUpdate">Later</v-btn>
    </template>
  </v-snackbar>

  <v-dialog v-model="pwa.installInstructionsVisible.value" max-width="560">
    <v-card class="install-dialog pa-6 pa-md-8">
      <div class="feedback-dialog-heading">
        <div><span class="eyebrow">Install Pathfinder</span><h2>Keep practice within reach</h2></div>
        <v-btn icon="mdi-close" variant="text" aria-label="Close installation instructions" @click="pwa.installInstructionsVisible.value = false" />
      </div>
      <p>Open your browser’s page or share menu and choose <strong>Install app</strong>, <strong>Add to Home Screen</strong>, or <strong>Add to Dock</strong>.</p>
      <p>When installation is supported, Pathfinder opens in its own window and keeps the downloaded learning experience available offline.</p>
      <v-alert class="mt-5" type="info" variant="tonal" density="compact">
        If your browser does not show an install option, you can continue using Pathfinder as a normal website.
      </v-alert>
      <div class="feedback-actions mt-6">
        <v-btn color="primary" @click="pwa.installInstructionsVisible.value = false">Done</v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>
