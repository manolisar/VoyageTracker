import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'iife', // Use IIFE instead of ES modules for file:// compatibility
        manualChunks: undefined, // Single JS file
      }
    }
  },
  base: './', // Use relative paths for assets
})
