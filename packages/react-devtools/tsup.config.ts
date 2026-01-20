import { copyFileSync, cpSync, existsSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'tsup'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * ESM __dirname polyfill banner
 * This banner injects a safe __dirname polyfill for ESM modules
 * It handles case where import.meta.url might be undefined (e.g., in some bundler scenarios)
 */
const esmDirnameBanner = `
import { dirname as __pathDirname } from 'path';
import { fileURLToPath as __fileURLToPath } from 'url';
var __dirname = (function() {
  try {
    var url = import.meta?.url;
    if (url) return __pathDirname(__fileURLToPath(url));
  } catch (e) {}
  try {
    if (typeof __filename !== 'undefined') return __pathDirname(__filename);
  } catch (e) {}
  return process.cwd();
})();
`.trim()

// Common config for plugin entries
const commonConfig = {
  target: 'es2017',
  outDir: 'dist',
  splitting: false,
  sourcemap: true,
  external: [
    'vite',
    'webpack',
    'react',
    'react-dom',
  ],
  skipNodeModulesBundle: true,
}

// Common config for main plugin entry
const mainEntryCommon = {
  entry: ['src/index.ts'],
  dts: true,
  ...commonConfig,
}

// Common config for vite entry
const viteEntryCommon = {
  entry: { vite: 'src/vite.ts' },
  dts: true,
  ...commonConfig,
}

// Common config for webpack entry
const webpackEntryCommon = {
  entry: { webpack: 'src/webpack.ts' },
  dts: true,
  ...commonConfig,
}

// Common config for umi entry
const umiEntryCommon = {
  entry: { umi: 'src/umi.ts' },
  dts: true,
  ...commonConfig,
}

// Common config for next entry
const nextEntryCommon = {
  entry: { next: 'src/next.ts' },
  dts: true,
  ...commonConfig,
  external: [
    'vite',
    'webpack',
    'react',
    'react-dom',
    'react-dom/client',
    'next',
    'next/server',
  ],
  // Enable JSX transformation for React components
  esbuildOptions(options: any) {
    options.jsx = 'automatic'
  },
}

// Common config for next-api entry
const nextApiEntryCommon = {
  entry: { 'next-api-handler': 'src/next-api-handler.ts', 'next-api': 'src/next-api.ts' },
  dts: true,
  ...commonConfig,
  external: [
    'next',
    'next/server',
  ],
}

// Common config for next-client entry (client components with 'use client')
const nextClientEntryCommon = {
  entry: { 'next-client': 'src/next-client.ts' },
  dts: true,
  ...commonConfig,
  external: [
    'react',
    'react-dom',
    'react-dom/client',
  ],
  esbuildOptions(options: any) {
    options.jsx = 'automatic'
  },
}

// Common config for api entry (re-export from @react-devtools-plus/api)
// DTS disabled - we copy from @react-devtools-plus/api in onSuccess
const apiEntryCommon = {
  entry: { api: 'src/api.ts' },
  dts: false, // Disabled - copy full types from @react-devtools-plus/api instead
  target: 'es2017',
  outDir: 'dist',
  splitting: false,
  sourcemap: true,
  // Bundle @react-devtools-plus/api inline
  external: [],
  noExternal: ['@react-devtools-plus/api'],
  skipNodeModulesBundle: false,
}

export default defineConfig([
  // Main plugin entry - ESM with __dirname polyfill
  {
    ...mainEntryCommon,
    format: ['esm'],
    shims: false,
    clean: true,
    banner: {
      js: esmDirnameBanner,
    },
    // onSuccess runs AFTER build completes, so we copy extra type files here
    onSuccess: async () => {
      // Wait for parallel builds to complete their DTS generation
      // This is necessary because tsup runs multiple configs in parallel
      await new Promise(r => setTimeout(r, 15000))

      // Copy type declarations from @react-devtools-plus/api
      const apiDtsPath = resolve(__dirname, '../react-devtools-api/dist/index.d.ts')
      const apiTargetDtsPath = resolve(__dirname, 'dist/api.d.ts')

      if (existsSync(apiDtsPath)) {
        copyFileSync(apiDtsPath, apiTargetDtsPath)
        console.log('Copied api.d.ts from @react-devtools-plus/api')
      }

      // Copy type declarations from @react-devtools-plus/scan
      const scanDtsPath = resolve(__dirname, '../react-devtools-scan/dist/index.d.ts')
      const scanTargetDtsPath = resolve(__dirname, 'dist/scan.d.ts')

      if (existsSync(scanDtsPath)) {
        copyFileSync(scanDtsPath, scanTargetDtsPath)
        console.log('Copied scan.d.ts from @react-devtools-plus/scan')
      }

      // Copy react-devtools-client/dist to client/ directory
      const clientSourcePath = resolve(__dirname, '../react-devtools-client/dist')
      const clientTargetPath = resolve(__dirname, 'client')

      if (existsSync(clientSourcePath)) {
        if (existsSync(clientTargetPath)) {
          rmSync(clientTargetPath, { recursive: true, force: true })
        }
        cpSync(clientSourcePath, clientTargetPath, { recursive: true })
        console.log('Copied client UI from react-devtools-client')
      }
    },
  },
  // Main plugin entry - CJS (native __dirname)
  {
    ...mainEntryCommon,
    format: ['cjs'],
    shims: false,
    clean: false,
    dts: false, // DTS already generated by ESM build
  },
  // Vite entry - ESM with __dirname polyfill
  {
    ...viteEntryCommon,
    format: ['esm'],
    shims: false,
    clean: false,
    banner: {
      js: esmDirnameBanner,
    },
  },
  // Vite entry - CJS (native __dirname)
  {
    ...viteEntryCommon,
    format: ['cjs'],
    shims: false,
    clean: false,
    dts: false,
  },
  // Webpack entry - ESM with __dirname polyfill
  {
    ...webpackEntryCommon,
    format: ['esm'],
    shims: false,
    clean: false,
    banner: {
      js: esmDirnameBanner,
    },
  },
  // Webpack entry - CJS (native __dirname)
  {
    ...webpackEntryCommon,
    format: ['cjs'],
    shims: false,
    clean: false,
    dts: false,
  },
  // Umi entry - ESM with __dirname polyfill
  {
    ...umiEntryCommon,
    format: ['esm'],
    shims: false,
    clean: false,
    banner: {
      js: esmDirnameBanner,
    },
  },
  // Umi entry - CJS (native __dirname)
  {
    ...umiEntryCommon,
    format: ['cjs'],
    shims: false,
    clean: false,
    dts: false,
  },
  // Next entry - ESM with __dirname polyfill
  {
    ...nextEntryCommon,
    format: ['esm'],
    shims: false,
    clean: false,
    banner: {
      js: esmDirnameBanner,
    },
  },
  // Next entry - CJS (native __dirname)
  {
    ...nextEntryCommon,
    format: ['cjs'],
    shims: false,
    clean: false,
    dts: false,
  },
  // Next API entry - ESM
  {
    ...nextApiEntryCommon,
    format: ['esm'],
    shims: false,
    clean: false,
    banner: {
      js: esmDirnameBanner,
    },
  },
  // Next API entry - CJS
  {
    ...nextApiEntryCommon,
    format: ['cjs'],
    shims: false,
    clean: false,
    dts: false,
  },
  // Next Client entry - ESM with 'use client' banner (must be first line!)
  {
    ...nextClientEntryCommon,
    format: ['esm'],
    shims: false,
    clean: false,
    banner: {
      js: `'use client';`,
    },
  },
  // Next Client entry - CJS with 'use client' banner
  {
    ...nextClientEntryCommon,
    format: ['cjs'],
    shims: false,
    clean: false,
    dts: false,
    banner: {
      js: `'use client';`,
    },
  },
  // API entry - ESM (re-export from @react-devtools-plus/api)
  {
    ...apiEntryCommon,
    format: ['esm'],
    shims: false,
    clean: false,
  },
  // API entry - CJS
  {
    ...apiEntryCommon,
    format: ['cjs'],
    shims: false,
    clean: false,
    dts: false,
  },
  // Scan entry - bundle @react-devtools-plus/scan without resolving its types
  {
    entry: ['src/scan.ts'],
    format: ['esm', 'cjs'],
    target: 'es2017',
    dts: false,
    outDir: 'dist',
    shims: false,
    clean: false,
    splitting: false,
    sourcemap: true,
    external: [
      'react',
      'react-dom',
    ],
    noExternal: [
      '@react-devtools-plus/scan',
    ],
    skipNodeModulesBundle: false,
  },
])
