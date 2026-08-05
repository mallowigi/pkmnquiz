import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import vue from '@vitejs/plugin-vue';
import MotionResolver from 'motion-v/resolver';
import { fileURLToPath, URL } from 'node:url';
import Components from 'unplugin-vue-components/vite';

import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
  css: {
    transformer: 'postcss',
  },
  plugins: [
    vue(),
    vueDevTools(),
    VueI18nPlugin({}),
    Components({
      dts: true,
      resolvers: [
        MotionResolver(),
      ],
    }),
    VitePWA({
      manifest: {
        background_color: '#31adbb',
        description: 'A Pokémon guessing game built with Vue.js',
        display: 'standalone',
        icons: [
          {
            sizes: '64x64',
            src: 'pwa-64x64.png',
            type: 'image/png',
          },
          {
            sizes: '192x192',
            src: 'pwa-192x192.png',
            type: 'image/png',
          },
          {
            sizes: '512x512',
            src: 'pwa-512x512.png',
            type: 'image/png',
          },
          {
            purpose: 'maskable',
            sizes: '512x512',
            src: 'maskable-icon-512x512.png',
            type: 'image/png',
          },
        ],
        name: 'Pokemon Vue Quiz',
        orientation: 'any',
        short_name: 'Pkmn Quiz',
        start_url: '/',
        theme_color: '#31adbb',
      },
      registerType: 'prompt',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,ogg,json}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
