import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import './styles/main.scss'
import App from './App.vue'
import QuizView from './views/QuizView.vue'
import ProfileView from './views/ProfileView.vue'

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'pathfinder',
    themes: {
      pathfinder: {
        dark: true,
        colors: {
          background: '#111318', surface: '#191C23', primary: '#8DE5B2', secondary: '#B9A7FF',
          accent: '#FFCC73', error: '#FF8E89', success: '#8DE5B2', info: '#86C5FF',
        },
      },
    },
  },
  icons: { defaultSet: 'mdi', aliases, sets: { mdi } },
  defaults: { VBtn: { rounded: 'lg', elevation: 0 }, VCard: { rounded: 'xl', elevation: 0 } },
})

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior() {
    return { left: 0, top: 0 }
  },
  routes: [
    { path: '/', name: 'practice', component: QuizView },
    { path: '/problems', name: 'problems', component: () => import('./views/ProblemsView.vue') },
    { path: '/problems/:problemId(\\d+)', name: 'problem', component: QuizView },
    { path: '/problems/:pathMatch(.*)*', redirect: { name: 'practice' } },
    { path: '/start', name: 'start', component: () => import('./views/OnboardingView.vue') },
    { path: '/today', name: 'today', component: () => import('./views/TodayView.vue') },
    { path: '/paths', name: 'paths', component: () => import('./views/PathsView.vue') },
    { path: '/learn/:slug?', name: 'learn', component: () => import('./views/LearnView.vue') },
    { path: '/cheat-sheet', name: 'cheat-sheet', component: () => import('./views/CheatSheetView.vue') },
    { path: '/profile', component: ProfileView },
    { path: '/privacy', name: 'privacy', component: () => import('./views/PublicInformationView.vue'), props: { documentKey: 'privacy' } },
    { path: '/content-policy', name: 'content-policy', component: () => import('./views/PublicInformationView.vue'), props: { documentKey: 'content-policy' } },
    { path: '/accessibility', name: 'accessibility', component: () => import('./views/PublicInformationView.vue'), props: { documentKey: 'accessibility' } },
    { path: '/changelog', name: 'changelog', component: () => import('./views/PublicInformationView.vue'), props: { documentKey: 'changelog' } },
    { path: '/data', name: 'data-guide', component: () => import('./views/PublicInformationView.vue'), props: { documentKey: 'data' } },
    ...(import.meta.env.DEV ? [
      { path: '/__dev/progress', name: 'dev-progress', component: () => import('./views/DevProgressView.vue') },
    ] : []),
  ],
})

createApp(App).use(createPinia()).use(router).use(vuetify).mount('#app')
