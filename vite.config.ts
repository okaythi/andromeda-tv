import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const developmentApiTarget = process.env.VITE_DEV_API_PROXY_TARGET ?? 'http://127.0.0.1:3000';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  clearScreen: false,
  server: {
    host: process.env.TAURI_DEV_HOST || '0.0.0.0',
    allowedHosts: true,
    port: 1420,
    strictPort: true,
    hmr: process.env.TAURI_DEV_HOST
      ? {
          protocol: 'ws',
          host: process.env.TAURI_DEV_HOST,
          port: 1421,
        }
      : undefined,
    proxy: {
      '/api': {
        target: developmentApiTarget,
        changeOrigin: true,
      },
    },
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
});
