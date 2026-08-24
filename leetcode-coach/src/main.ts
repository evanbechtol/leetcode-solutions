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
    { path: '/learn/:slug?', name: 'learn', component: () => import('./views/LearnView.vue') },
    { path: '/cheat-sheet', name: 'cheat-sheet', component: () => import('./views/CheatSheetView.vue') },
    { path: '/profile', component: ProfileView },
  ],
})

createApp(App).use(createPinia()).use(router).use(vuetify).mount('#app')
