import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => ({
  plugins: [react()],
  // GitHub Pages demo (vite build --mode pages) is served from a sub-folder, so use relative asset links
  base: command === 'build' && mode === 'pages' ? './' : '/',
  // FastAPI runs on :8000; the UI calls /api/... on :5173
  server: { proxy: { '/api': 'http://localhost:8000' } },
}))
