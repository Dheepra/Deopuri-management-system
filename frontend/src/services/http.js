import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

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