import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  target: 'es2017',
  splitting: false,
  sourcemap: true,
  // No external dependencies - this is a pure utility module
  external: [],
})
