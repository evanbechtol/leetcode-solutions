<script setup lang="ts">
import { useTrainerStore } from './stores/trainer'

const store = useTrainerStore()
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
          <router-link to="/" class="nav-link"><v-icon icon="mdi-compass-outline" size="19" /> Practice</router-link>
          <router-link to="/learn" class="nav-link"><v-icon icon="mdi-book-open-page-variant-outline" size="19" /> Learn</router-link>
          <router-link to="/profile" class="nav-link"><v-icon icon="mdi-chart-donut" size="19" /> Progress</router-link>
        </nav>
        <div class="streak-pill ml-3 ml-md-6"><span>◆</span> {{ store.streak }} <span class="streak-label">streak</span></div>
      </div>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
