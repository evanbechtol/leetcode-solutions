<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { publicInformation, type PublicInformationKey } from '../data/publicInformation'

const props = defineProps<{ documentKey: PublicInformationKey }>()
const infoDocument = computed(() => publicInformation[props.documentKey])

watchEffect(() => {
  globalThis.document.title = `${infoDocument.value.eyebrow} | Pathfinder`
})
</script>

<template>
  <main class="public-info-page app-shell px-5 px-md-8 py-10 py-md-14">
    <header>
      <span class="eyebrow">{{ infoDocument.eyebrow }}</span>
      <h1>{{ infoDocument.title }}</h1>
      <p>{{ infoDocument.summary }}</p>
      <small>Last updated {{ infoDocument.updated }}</small>
    </header>
    <div class="public-info-layout mt-10">
      <nav aria-label="Public information">
        <router-link to="/privacy">Privacy</router-link>
        <router-link to="/content-policy">Content policy</router-link>
        <router-link to="/accessibility">Accessibility</router-link>
        <router-link to="/changelog">Changelog</router-link>
        <router-link to="/data">Data guide</router-link>
      </nav>
      <article>
        <section v-for="section in infoDocument.sections" :key="section.heading">
          <h2>{{ section.heading }}</h2>
          <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
          <ul v-if="section.items"><li v-for="item in section.items" :key="item">{{ item }}</li></ul>
          <ol v-if="section.steps"><li v-for="step in section.steps" :key="step">{{ step }}</li></ol>
        </section>
      </article>
    </div>
  </main>
</template>
