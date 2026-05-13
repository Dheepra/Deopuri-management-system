import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '';

export const http = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Reads the persisted session (auth.session) so refreshes and new tabs keep
// the bearer token attached without any explicit wiring from callers.
http.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('auth.session');
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    /* ignore malformed storage */
  }
  return config;
});
