import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Same-origin in dev (empty axios baseURL) → browser hits Vite, which proxies to Express.
const DEV_API = 'http://127.0.0.1:5000'

// Use trailing slash so `/confessions` (page) is NOT proxied — only `/confession/*` (API).
const apiProxyPaths = [
  'auth',
  'feed',
  'post',
  'blog',
  'user',
  'comment',
  'likes',
  'bookmark',
  'notifications',
  'search',
  'confession',
]

const devProxy = Object.fromEntries(
  apiProxyPaths.map((segment) => [
    `^/${segment}/`,
    { target: DEV_API, changeOrigin: true },
  ]),
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      ...devProxy,
      '/socket.io': { target: DEV_API, changeOrigin: true, ws: true },
      '/health': { target: DEV_API, changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
})
