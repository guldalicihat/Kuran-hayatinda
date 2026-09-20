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
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-192.png', 'icon-maskable-512.png'],
      manifest: {
        name: "Kur'an Hayatında",
        short_name: 'Kur\'an',
        description: "Tüm sureler ve ayetler: Arapça, okunuş, kök temelli meal ve günlük hayat açıklamaları.",
        theme_color: '#f2f2f7',
        background_color: '#ffffff',
        display: 'standalone',
        lang: 'tr',
        // Android'de PWA olarak yüklerken doğru simge/splash için PNG boyutları şart;
        // tek başına SVG (sizes: 'any') birçok Android/Chrome sürümünde düzgün gösterilmiyor.
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}', 'data/chapters.json'],
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
