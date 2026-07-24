import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 4173,
    host: true,
    // Allow the public tunnel host (Cloudflare quick tunnel) to reach the preview server.
    allowedHosts: true,
  },
})
