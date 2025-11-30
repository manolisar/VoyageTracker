import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isSingleFile = mode === 'singlefile';

  return {
    plugins: [
      react(),
      // Only use singlefile plugin when building in singlefile mode
      ...(isSingleFile ? [viteSingleFile()] : []),
    ],
    build: {
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          manualChunks: undefined, // Single JS file
        }
      },
      // For singlefile builds, inline all assets
      ...(isSingleFile && {
        assetsInlineLimit: 100000000, // Inline all assets
        cssCodeSplit: false,
      }),
    },
    // Only set base for regular builds (GitHub Pages), not for singlefile
    base: isSingleFile ? './' : '/VoyageTracker/',
  };
})
