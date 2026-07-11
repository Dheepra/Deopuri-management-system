import axios from "axios";

// Default to a RELATIVE base ("") so every `/api/...` call goes to the same origin the page is
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