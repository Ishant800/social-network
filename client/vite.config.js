import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Same-origin in dev (empty axios baseURL) → browser hits Vite, which proxies to Express.
const DEV_API = 'http://127.0.0.1:5000'

// Proxy API only. Use `/segment/` (trailing slash) so page routes like `/confessions` are not proxied.
const devProxy = {
  '/auth/': { target: DEV_API, changeOrigin: true },
  '/feed/': { target: DEV_API, changeOrigin: true },
  '/post/': { target: DEV_API, changeOrigin: true },
  '/blog/': { target: DEV_API, changeOrigin: true },
  '/user/': { target: DEV_API, changeOrigin: true },
  '/comment/': { target: DEV_API, changeOrigin: true },
  '/likes/': { target: DEV_API, changeOrigin: true },
  '/bookmark/': { target: DEV_API, changeOrigin: true },
  '/notifications/': { target: DEV_API, changeOrigin: true },
  '/search/': { target: DEV_API, changeOrigin: true },
  '/confession/': { target: DEV_API, changeOrigin: true },
  '/health': { target: DEV_API, changeOrigin: true },
  '/socket.io': { target: DEV_API, changeOrigin: true, ws: true },
}

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: devProxy,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
