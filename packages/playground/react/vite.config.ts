import react from '@vitejs/plugin-react'
import ReactDevTools from 'react-devtools'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    ReactDevTools.vite({
      enabledEnvironments: ['development', 'test'],
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
