import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    UnoCSS(),
  ],
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
      '@react-devtools/kit': resolve(__dirname, '../react-devtools-kit/src/index.ts'),
    },
  },
  build: {
    target: 'esnext',
    minify: true,
    emptyOutDir: true,
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  base: './',
})
