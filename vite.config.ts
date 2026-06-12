import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: '/kimariji_master/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: [
        'icon.png',
        'icon-512.png',
        'thumbnail.png',
        'torifuda/tori_0.png',
      ],
      manifest: {
        id: '/kimariji_master/',
        name: '決まり字マスター',
        short_name: '決まり字',
        description:
          '百人一首の決まり字を語呂合わせ付きで学んで暗記できる練習アプリです。',
        start_url: '/kimariji_master/?source=pwa',
        scope: '/kimariji_master/',
        display: 'standalone',
        background_color: '#E1DAC3',
        theme_color: '#E1DAC3',
        icons: [
          {
            src: 'icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,mp3,ogg,wav}'],
        navigateFallback: '/kimariji_master/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /\/kimariji_master\/(torifuda|goro_slide|goro_thumbnail)\/.+\.(?:png|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'kimariji-images',
              expiration: {
                maxEntries: 512,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
