import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: '/index.html'
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'dep-annotorious': ['@annotorious/openseadragon'],
        }
      }
    }
  }
});