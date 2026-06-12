const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = {
  login: (data) =>
    fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  getVehicles: () =>
    fetch(`${API_BASE_URL}/api/vehicles`),

  getCenters: () =>
    fetch(`${API_BASE_URL}/api/centers`),
};