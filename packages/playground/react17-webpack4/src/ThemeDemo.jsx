import { useState } from 'react'

export function ThemeDemo() {
  const [mode, setMode] = useState('light')
  const [inputValue, setInputValue] = useState('')

  const toggleMode = () => {
    setMode(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>
        React DevTools UI - Theme System Test
        <span className="webpack-badge">Webpack 4</span>
      </h1>

      {/* Theme Controls */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 className="card__title">🎨 Theme Controls</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <button className="button" onClick={toggleMode}>
            {mode === 'dark' ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
          </button>
          <span className="webpack-badge">
            Current:
            {mode}
          </span>
        </div>
      </div>

      {/* Button Variants */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 className="card__title">🔘 Button Component</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <button className="button">Default</button>
          <button className="button">Primary</button>
          <button className="button button--secondary">Secondary</button>
        </div>
      </div>

      {/* Input Component */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 className="card__title">📝 Input Component</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            placeholder="Default input"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
            }}
          />
          <input
            type="text"
            placeholder="Disabled input"
            disabled
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
              backgroundColor: '#f5f5f5',
            }}
          />
        </div>
      </div>

      {/* Card Variants */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        <div className="card">
          <h3 className="card__title">Regular Card</h3>
          <p className="card__content">This is a regular card component</p>
        </div>
        <div className="card">
          <h3 className="card__title">Hoverable Card</h3>
          <p className="card__content">Hover effect enabled</p>
        </div>
        <div className="card">
          <h3 className="card__title">Another Card</h3>
          <p className="card__content">More content here</p>
        </div>
      </div>

      {/* Webpack 4 + SCSS Info */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h2 className="card__title">🔧 Webpack 4 + SCSS Integration</h2>
        <div className="demo-section">
          <p>This playground bundles with Webpack 4:</p>
          <pre>
            <code>
              {`// webpack.config.js (Webpack 4)
module.exports = {
  module: {
    rules: [
      {
        test: /\\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  }
}`}
            </code>
          </pre>
        </div>
      </div>

      {/* Tech Stack Info */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h2 className="card__title">📚 Technology Stack</h2>
        <div className="card__content">
          <ul style={{ lineHeight: 1.8 }}>
            <li>
              <strong>React:</strong>
              {' '}
              17.0.2
            </li>
            <li>
              <strong>React Router:</strong>
              {' '}
              5.3.4
            </li>
            <li>
              <strong>Webpack:</strong>
              {' '}
              4.47.0
            </li>
            <li>
              <strong>webpack-dev-server:</strong>
              {' '}
              3.11.3
            </li>
            <li>
              <strong>Sass:</strong>
              {' '}
              1.83.4
            </li>
            <li>
              <strong>Node Target:</strong>
              {' '}
              14+
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
