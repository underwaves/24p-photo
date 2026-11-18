import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://24p-photo.wo-nad.workers.dev',
        changeOrigin: true,
      },
    },
  },
});
