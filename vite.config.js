import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    // Écouter sur toutes les interfaces (requis pour accès Ngrok / réseau)
    host: true,
    allowedHosts: [
      '.ngrok-free.app',
      '.ngrok-free.dev',
      '.ngrok.io',
    ],
    // HMR via HTTPS tunnel (Ngrok utilise le port 443)
    hmr: {
      clientPort: 443,
    },
    // Proxy vers le backend Express pour éviter les problèmes CORS en développement
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
