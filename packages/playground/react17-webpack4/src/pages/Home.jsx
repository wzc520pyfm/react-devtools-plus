import { useMemo, useState } from 'react'

const initialTodos = [
  { id: 1, title: 'Test React 17 compatibility', done: true, assignee: 'DevOps' },
  { id: 2, title: 'Verify SCSS with Webpack 4', done: true, assignee: 'Frontend' },
  { id: 3, title: 'Check Node 14+ support', done: false, assignee: 'Backend' },
  { id: 4, title: 'Test DevTools integration', done: false },
]

function TeamStatus() {
  const totals = useMemo(() => {
    return initialTodos.reduce((acc, todo) => {
      const key = todo.assignee || 'Unassigned'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
  }, [])

  return (
    <section className="card">
      <h2 className="card__title">Team Status</h2>
      <ul>
        {Object.entries(totals).map(([name, count]) => (
          <li key={name}>
            <strong>{name}</strong>
            {': '}
            <span>
              {count}
              {' '}
              task(s)
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function TodoItem({ todo, onToggle }) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, cursor: 'pointer' }}>
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>{todo.title}</span>
      </label>
      <small style={{ color: '#999' }}>{todo.assignee || 'Unassigned'}</small>
    </li>
  )
}

export default function Home() {
  const [todos, setTodos] = useState(initialTodos)

  const doneCount = todos.filter(todo => todo.done).length
  const progress = Math.round((doneCount / todos.length) * 100)

  function toggleTodo(id) {
    setTodos(prev =>
      prev.map(todo => (todo.id === id ? { ...todo, done: !todo.done } : todo)),
    )
  }

  return (
    <div className="app">
      <div className="demo-section">
        <h2>
          React 17 + SCSS + Webpack 4 + Node 14+
          <span className="webpack-badge">Webpack 4.46</span>
        </h2>
        <p>
          This playground demonstrates React DevTools working with legacy build tools:
        </p>
        <ul style={{ marginTop: '1rem', lineHeight: 1.8 }}>
          <li>
            <code>React 17.0.2</code>
            {' '}
            - Using legacy ReactDOM.render API
          </li>
          <li>
            <code>Webpack 4.46</code>
            {' '}
            - Last major version before Webpack 5
          </li>
          <li>
            <code>SCSS/Sass</code>
            {' '}
            - CSS preprocessor with sass-loader 10.x
          </li>
          <li>
            <code>Node 14+</code>
            {' '}
            - ES2017 target for broader compatibility
          </li>
          <li>
            <code>React Router v5</code>
            {' '}
            - Compatible with React 17
          </li>
        </ul>
        <div className="webpack-feature">
          <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>
            🔧 Webpack 4 Features Used:
          </p>
          <ul style={{ marginTop: '0.5rem', lineHeight: 1.8 }}>
            <li>babel-loader with @babel/preset-env for ES2017</li>
            <li>sass-loader 10.x for SCSS preprocessing</li>
            <li>webpack-dev-server 3.x with HMR</li>
            <li>html-webpack-plugin 4.x</li>
          </ul>
        </div>
        <p style={{ marginTop: '1rem' }}>
          Try toggling tasks below and use
          {' '}
          <strong>Alt/Option + Shift + R</strong>
          {' '}
          to open React DevTools overlay.
        </p>
      </div>

      <div className="grid">
        <section className="card">
          <h2 className="card__title">
            Sprint Progress
            {' '}
            <span style={{ color: '#8dd6f9', float: 'right' }}>
              {progress}
              %
            </span>
          </h2>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden',
            margin: '1rem 0',
          }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #8dd6f9 0%, #1c78c0 100%)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          <ul style={{ listStyle: 'none' }}>
            {todos.map(todo => (
              <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} />
            ))}
          </ul>
        </section>

        <TeamStatus />

        <section className="card">
          <h2 className="card__title">Webpack 4 Configuration</h2>
          <div className="card__content">
            <p>Key configurations:</p>
            <ul style={{ marginTop: '0.5rem', lineHeight: 1.8 }}>
              <li>✓ mode: 'development'</li>
              <li>✓ devServer with HMR</li>
              <li>✓ babel-loader 8.x</li>
              <li>✓ sass-loader 10.x</li>
              <li>✓ Target: ES2017</li>
            </ul>
          </div>
        </section>

        <section className="card">
          <h2 className="card__title">SCSS Features</h2>
          <div className="card__content">
            <p>This playground uses SCSS features:</p>
            <ul style={{ marginTop: '0.5rem', lineHeight: 1.8 }}>
              <li>✓ Variables ($webpack-color)</li>
              <li>✓ Mixins (@include flex-center)</li>
              <li>✓ Nesting (.card__title)</li>
              <li>✓ Functions (darken, lighten)</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
