import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: false, // 使用 public/manifest.webmanifest
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // 這幾張景點大圖（>2MB）排除在離線預先快取之外：網頁仍會正常從網路載入顯示，
        // 只是不做離線快取，避免超過 Workbox 2MB 上限而 build 失敗。
        globIgnores: [
          '釜山 LUGE 渠道滑車.PNG',
          '海東龍宮寺.PNG',
          '海東龍宮寺正面.PNG',
          '海岸天空膠囊列車兩張.PNG',
          '青沙浦踏石展望台.PNG',
          '松島龍宮雲橋.png',
          '松島龍宮雲橋2.png',
          'the bay 101 百萬夜景.png',
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
