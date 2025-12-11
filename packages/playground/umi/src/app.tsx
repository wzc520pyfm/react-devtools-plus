/**
 * Umi runtime configuration
 * This file is used to expose React to window for react-devtools-plus overlay
 */
import React from 'react'
import ReactDOM from 'react-dom'

// Expose React and ReactDOM to window for react-devtools-plus overlay
if (typeof window !== 'undefined') {
  ;(window as any).React = React
  ;(window as any).ReactDOM = ReactDOM
}

// Export empty object for umi runtime config
export {}
