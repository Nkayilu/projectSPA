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
    // NOTE : Le proxy Vite est supprimé. En production (Vercel), les requêtes
    // sont dirigées directement vers le backend Render via la variable VITE_API_URL.
    // En développement local, définir VITE_API_URL=http://localhost:4000 dans .env.local
  },
})
