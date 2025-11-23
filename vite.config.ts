import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Vue DevTools uniquement en développement
    ...(process.env.NODE_ENV !== 'production' ? [vueDevTools()] : []),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    // Optimisations pour la production
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: true,
      format: {
        comments: false
      }
    },
    rollupOptions: {
      output: {
        // Chunking stratégique pour meilleur caching
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'i18n': ['vue-i18n'],
          'animations': ['aos']
        }
      }
    },
    // Optimiser le chunk size
    chunkSizeWarningLimit: 1000,
    // Source maps pour le debugging en production (optionnel, peut être désactivé)
    sourcemap: false
  },
  server: {
    port: 5173,
    strictPort: false,
    host: true
  },
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    allowedHosts: [
      'eventfrontend-production.up.railway.app',
      '.railway.app', // Permet tous les sous-domaines Railway
      'www.baba.events',
      'baba.events'
    ]
  }
})
