import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import fse from 'fs-extra'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'vite-plugin-copy-react-devtools-overlay',
      apply: 'build',
      enforce: 'post',
      async closeBundle() {
        const overlayFile = resolve(__dirname, './dist')

        // Copy to vite plugin directory
        fse.copySync(
          overlayFile,
          resolve(__dirname, '../react-devtools/src/overlay'),
        )
      },
    },
  ],
  resolve: {
    alias: {
      '@react-devtools/kit': resolve(__dirname, '../react-devtools-kit/src/index.ts'),
    },
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/main.tsx'),
      formats: ['es'],
      fileName: () => 'react-devtools-overlay.mjs',
    },
    rollupOptions: {
      output: {
        assetFileNames: 'react-devtools-overlay.[ext]',
      },
    },
  },
})
