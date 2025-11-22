import React from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [React()],
  define: {
    __DEV__: true,
    __FEATURE_PROD_DEVTOOLS__: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
