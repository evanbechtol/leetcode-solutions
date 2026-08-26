import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    VitePWA({
      registerType: 'prompt',
      injectRegister: null,
      includeAssets: [
        'favicon.ico',
        'pathfinder-mark.svg',
        'apple-touch-icon-180x180.png',
      ],
      manifest: {
        id: './',
        scope: './',
        start_url: './#/today',
        name: 'Pathfinder — LeetCode Coach',
        short_name: 'Pathfinder',
        description: 'Build the instincts behind optimal LeetCode solutions, one guided decision at a time.',
        display: 'standalone',
        background_color: '#111318',
        theme_color: '#171A21',
        lang: 'en-US',
        categories: ['education', 'productivity'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Today', short_name: 'Today', url: './#/today', icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }] },
          { name: 'Practice', short_name: 'Practice', url: './#/', icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }] },
          { name: 'Learn', short_name: 'Learn', url: './#/learn', icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        cacheId: 'pathfinder',
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,json,webmanifest,svg,png,ico,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: 'index.html',
      },
      devOptions: { enabled: false },
    }),
  ],
})
