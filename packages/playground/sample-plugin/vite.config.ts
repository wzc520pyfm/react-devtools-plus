import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs'],
      fileName: format => format === 'es' ? 'index.mjs' : 'index.cjs',
    },
    rollupOptions: {
      // React 外部化，使用宿主应用的 React
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
    // 输出到 dist 目录
    outDir: 'dist',
    emptyOutDir: true,
  },
})
