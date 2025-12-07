import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>My DevTools Playground</h1>
      <div className="card">
        <button onClick={() => setCount(count => count + 1)}>
          count is
          {' '}
          {count}
        </button>
        <p>
          Press
          {' '}
          <code>Option+Shift+D</code>
          {' '}
          to open DevTools.
        </p>
        <p>
          You should see the
          {' '}
          <strong>"Inspector"</strong>
          {' '}
          tab which comes pre-installed with MyDevTools!
        </p>
      </div>
    </div>
  )
}

export default App
