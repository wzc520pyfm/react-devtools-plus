import type { NextConfig } from 'next'
import { withReactDevTools } from 'react-devtools-plus/next'

const nextConfig: NextConfig = {
  // Add any Next.js configuration here
}

// Wrap with React DevTools Plus
export default withReactDevTools(nextConfig, {
  // Enable React Scan for render detection
  // scan: { enabled: true }, // Disabled for now until overlay is working
})
