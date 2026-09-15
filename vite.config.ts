import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages: site, /kuran-hayatinda/ alt yolunda yayınlanır.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/Kuran-hayatinda/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: "Kur'an Hayatında",
        short_name: 'Kur\'an',
        description: "Tüm sureler ve ayetler: Arapça, okunuş, kök temelli meal ve günlük hayat açıklamaları.",
        theme_color: '#f2f2f7',
        background_color: '#ffffff',
        display: 'standalone',
        lang: 'tr',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}', 'data/chapters.json'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/data/') || url.pathname.includes('/content/'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'kuran-data', expiration: { maxEntries: 400 } },
          },
        ],
      },
    }),
  ],
})
