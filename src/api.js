/**
 * Service API centralisé — SPA RDC
 * 
 * En production (Vercel) : VITE_API_URL = https://projectspabackend.onrender.com
 * En développement local  : VITE_API_URL = http://localhost:4000
 * 
 * Toutes les requêtes passent par cette constante, jamais par des URL relatives.
 */
export const API_BASE = import.meta.env.VITE_API_URL || 'https://projectspabackend.onrender.com';

/**
 * Helper d'appel authentifié avec JWT Bearer token.
 * Gère automatiquement les erreurs 401 (session expirée).
 */
export const fetchWithAuth = async (url, options = {}, onUnauthorized = null) => {
  const savedUserStr = localStorage.getItem('currentUser');
  const token = savedUserStr ? JSON.parse(savedUserStr).token : '';

  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 && onUnauthorized) {
    onUnauthorized();
    throw new Error('Session expirée');
  }

  return res;
};

/**
 * Service API — raccourcis pour les routes principales
 */
export const api = {
  // Auth
  login: (data) =>
    fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  // Vehicles
  getVehicles: (token) => fetchWithAuth(`${API_BASE}/api/vehicles`, {}, null),
  addVehicle: (vehicle, token) => fetchWithAuth(`${API_BASE}/api/vehicles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vehicle),
  }),
  updateVehicle: (plate, data) => fetchWithAuth(`${API_BASE}/api/vehicles/${plate}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  deleteVehicle: (plate) => fetchWithAuth(`${API_BASE}/api/vehicles/${plate}`, { method: 'DELETE' }),

  // Centers
  getCenters: () => fetchWithAuth(`${API_BASE}/api/centers`),

  // Users
  getUsers: () => fetchWithAuth(`${API_BASE}/api/users`),

  // Stats
  getStats: () => fetch(`${API_BASE}/api/stats`),

  // Verification
  verifyQR: (token) => fetch(`${API_BASE}/api/verify/qr/${encodeURIComponent(token)}`),

  // Config
  getPublicUrl: () => fetch(`${API_BASE}/api/config/public-url`),
};