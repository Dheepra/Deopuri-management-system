import axios from "axios";

// Default to a RELATIVE base ("") so every `/deopuri/...` call goes to the same origin the page is
// served from (the Vite dev server), which proxies `/api` to the backend. This means it works from
// a phone on the same Wi-Fi (http://<PC-IP>:5173) with no CORS or backend-LAN config. Override with
// VITE_API_BASE_URL only when the API lives on a different host (e.g. a separate prod domain).
const baseURL = import.meta.env.VITE_API_BASE_URL || "";

export const http = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔥 AUTO TOKEN ATTACH (FIX FOR 403)
http.interceptors.request.use((config) => {
  try {
    // 1️⃣ FIRST TRY: auth.session (your current system)
    const session = localStorage.getItem("auth.session");

    let token = null;

    if (session) {
      const parsed = JSON.parse(session);
      token = parsed?.token;
    }

    // 2️⃣ FALLBACK: direct token storage
    if (!token) {
      token = localStorage.getItem("token");
    }

    // 3️⃣ ATTACH TOKEN
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

  } catch (err) {
    console.log("Auth interceptor error:", err);
  }

  return config;
});

// 🔒 AUTO-LOGOUT ON EXPIRED / INVALID TOKEN
// The backend returns 401 when the JWT is expired or invalid. When that happens on any authenticated
// call, clear the stored session and bounce the user to /login (once) so they re-authenticate instead
// of being stuck in a dashboard where every request silently fails. Login/registration 401s (wrong
// credentials) are ignored — those are handled inline on the auth screens.
let redirectingToLogin = false;

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    const isAuthCall = /\/deopuri\/auth\/(login|register|create-password|forgot|reset)/.test(url);

    if (status === 401 && !isAuthCall && !redirectingToLogin) {
      const hadSession = Boolean(localStorage.getItem("auth.session"));

      // Clear any stored session (and legacy keys).
      localStorage.removeItem("auth.session");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Only redirect if the user actually had a session and isn't already on the login page,
      // to avoid loops. A full navigation resets AuthProvider state cleanly.
      if (hadSession && !window.location.pathname.startsWith("/login")) {
        redirectingToLogin = true;
        window.location.replace("/login?expired=1");
      }
    }

    return Promise.reject(error);
  }
);