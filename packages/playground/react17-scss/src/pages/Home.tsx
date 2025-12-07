import React, { useMemo, useState } from 'react'

interface Todo {
  id: number
  title: string
  done: boolean
  assignee?: string
}

const initialTodos: Todo[] = [
  { id: 1, title: 'Test React 17 compatibility', done: true, assignee: 'DevOps' },
  { id: 2, title: 'Verify SCSS preprocessing', done: true, assignee: 'Frontend' },
  { id: 3, title: 'Check Node 14+ support', done: false, assignee: 'Backend' },
  { id: 4, title: 'Test DevTools integration', done: false },
]

function TeamStatus() {
  const totals = useMemo(() => {
    return initialTodos.reduce<Record<string, number>>((acc, todo) => {
      const key = todo.assignee ?? 'Unassigned'
      acc[key] = (acc[key] ?? 0) + 1
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

interface TodoItemProps {
  todo: Todo
  onToggle: (id: number) => void
}

function TodoItem({ todo, onToggle }: TodoItemProps) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, cursor: 'pointer' }}>
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>{todo.title}</span>
      </label>
      <small style={{ color: '#999' }}>{todo.assignee ?? 'Unassigned'}</small>
    </li>
  )
}

export default function Home() {
  const [todos, setTodos] = useState(initialTodos)

  const doneCount = todos.filter(todo => todo.done).length
  const progress = Math.round((doneCount / todos.length) * 100)

  function toggleTodo(id: number) {
    setTodos(prev =>
      prev.map(todo => (todo.id === id ? { ...todo, done: !todo.done } : todo)),
    )
  }

  return (
    <div className="app">
      <div className="demo-section">
        <h2>React 17 + SCSS + Node 14+ Compatibility Test</h2>
        <p>
          This playground demonstrates React DevTools working with:
        </p>
        <ul style={{ marginTop: '1rem', lineHeight: 1.8 }}>
          <li>
            <code>React 17.0.2</code>
            {' '}
            - Using legacy ReactDOM.render API
          </li>
          <li>
            <code>SCSS/Sass</code>
            {' '}
            - CSS preprocessor with variables and mixins
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
        <p style={{ marginTop: '1rem' }}>
          Try toggling tasks below and use
          {' '}
          <strong>Alt/Option + Shift + D</strong>
          {' '}
          to open React DevTools overlay.
        </p>
      </div>

      <div className="grid">
        <section className="card">
          <h2 className="card__title">
            Sprint Progress
            {' '}
            <span style={{ color: '#61dafb', float: 'right' }}>
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
                backgroundColor: '#61dafb',
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
          <h2 className="card__title">SCSS Features</h2>
          <div className="card__content">
            <p>This playground uses SCSS features:</p>
            <ul style={{ marginTop: '0.5rem', lineHeight: 1.8 }}>
              <li>✓ Variables ($primary-color)</li>
              <li>✓ Mixins (@include flex-center)</li>
              <li>✓ Nesting (.card__title)</li>
              <li>✓ Functions (darken, lighten)</li>
            </ul>
          </div>
        </section>

        <section className="card">
          <h2 className="card__title">Useful Links</h2>
          <div className="card__content">
            <ul style={{ listStyle: 'none' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <a
                  href="https://github.com/vuejs/devtools"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#61dafb', textDecoration: 'none' }}
                >
                  📦 GitHub Repository
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a
                  href="https://react17.dev"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#61dafb', textDecoration: 'none' }}
                >
                  ⚛️ React 17 Docs
                </a>
              </li>
              <li>
                <a
                  href="https://sass-lang.com/documentation"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#61dafb', textDecoration: 'none' }}
                >
                  🎨 SCSS Documentation
                </a>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
