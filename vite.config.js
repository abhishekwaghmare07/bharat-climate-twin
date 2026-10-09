import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // MapLibre locates its web-worker via `new URL('./maplibre-gl-worker.mjs',
  // import.meta.url)`. Vite's dep pre-bundling rewrites import.meta.url to
  // /node_modules/.vite/deps/..., where no worker file exists → blank map +
  // "Worker failed to load". Excluding it keeps the real file layout intact.
  optimizeDeps: { exclude: ['maplibre-gl'] },
})
