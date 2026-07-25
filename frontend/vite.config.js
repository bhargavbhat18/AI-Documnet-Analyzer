import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      // In local dev, /api requests are proxied to the local Spring Boot backend.
      // VITE_API_BASE_URL (from .env.local) determines the target.
      // When baseURL is empty (''), axios uses relative paths that hit this proxy.
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
