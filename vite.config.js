import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    // Écouter sur toutes les interfaces (réseau local / tunnel)
    host: true,
    // NOTE : Le proxy Vite est supprimé. En production (Vercel), les requêtes
    // sont dirigées directement vers le backend Render via la variable VITE_API_URL.
    // En développement local, définir VITE_API_URL=http://localhost:4000 dans .env.local
  },
})
