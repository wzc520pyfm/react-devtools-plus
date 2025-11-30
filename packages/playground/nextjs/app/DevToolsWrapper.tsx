'use client'

import React, { useEffect, useState } from 'react'

// Dynamically import DevTools to avoid SSR issues with window
export default function DevToolsWrapper() {
  const [DevTools, setDevTools] = useState<React.ComponentType<{ clientUrl: string }> | null>(null)

  useEffect(() => {
    // Only import on client side
    import('@react-devtools/overlay').then(async (mod) => {
      // Initialize DevTools features (React Scan, message listeners, etc.)
      await mod.initDevTools({
        autoStartScan: true,
        installHook: false, // Hook will be installed on-demand when Components page is visited
      })
      
      setDevTools(() => mod.DevTools)
    })
  }, [])

  if (!DevTools) {
    return null
  }

  return <DevTools clientUrl="/api/devtools" />
}
