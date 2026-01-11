import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { reactDevToolsPlus } from 'react-devtools-plus/vite'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    reactDevToolsPlus({
      // enabledEnvironments: ['development', 'test'],
      plugins: [
        {
          name: 'my-plugin',
          view: {
            title: 'My Plugin',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>',
            src: path.resolve(__dirname, './src/plugins/MyPlugin.tsx'),
          },
        },
      ],
      // Enable React Scan auto-injection
      scan: {
        enabled: true, // Enable injection, but controlled by showToolbar/DevTools
        showToolbar: false,
        animationSpeed: 'fast',
      },
      // theme: {
      //   mode: 'light', // auto or light or dark
      //   primaryColor: 'yellow', // Custom primary color
      // },
    }),
    react(),
  ],
})
