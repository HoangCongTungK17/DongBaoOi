import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa' // Cần cài đặt: npm install vite-plugin-pwa

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'DongBaoOi - Disaster Management',
        short_name: 'DongBaoOi',
        description: 'Ứng dụng hỗ trợ cứu trợ thiên tai khẩn cấp',
        theme_color: '#0f172a',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        // TỐI ƯU: Cache các API quan trọng như Mẹo an toàn (Safety Tips)
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/safety-tips'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-safety-tips-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 } // 30 ngày
            }
          }
        ]
      }
    })
  ],
})