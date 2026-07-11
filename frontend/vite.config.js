import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // host:true binds to 0.0.0.0 so the dev server is reachable from other devices on the same
    // Wi-Fi (open http://<your-PC-LAN-IP>:5173 on the phone). /api is proxied to the backend on the
    // PC, so the phone never talks to the backend directly and no CORS/backend-LAN setup is needed.
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // The phone's browser sends Origin: http://<PC-IP>:5173. Rewrite it to the localhost dev
        // origin the backend already trusts, so the backend's CORS filter doesn't 403 the proxied
        // request. (The browser↔Vite hop is same-origin, so this is safe for dev.)
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('origin', 'http://localhost:5173');
          });
        },
      },
    },
  },
});
