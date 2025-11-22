import ReactDOM from 'react-dom/client'
import './style.css'

// Note: React DevTools currently only has full support via Vite plugin
// For webpack, you would need a webpack plugin to inject the overlay
// This playground demonstrates the React app structure, but overlay injection
// requires additional webpack plugin development

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
