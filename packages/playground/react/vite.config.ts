import react from '@vitejs/plugin-react'
import ReactDevTools from 'react-devtools'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    ReactDevTools({
      enabledEnvironments: ['development', 'test'],
    }),
    react(),
  ],
})
