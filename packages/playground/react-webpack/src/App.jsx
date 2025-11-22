import { useMemo, useState } from 'react'

const initialTodos = [
  { id: 1, title: 'Wire overlay to React root', done: true, assignee: 'Core' },
  { id: 2, title: 'Render component tree in overlay', done: true, assignee: 'Overlay' },
  { id: 3, title: 'Highlight selected component', done: false, assignee: 'UI' },
  { id: 4, title: 'Sync props and state panels', done: false },
]

function TeamStatus() {
  const totals = useMemo(() => {
    return initialTodos.reduce((acc, todo) => {
      const key = todo.assignee ?? 'Unassigned'
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})
  }, [])

  return (
    <section className="card">
      <h2>Team Status</h2>
      <ul>
        {Object.entries(totals).map(([name, count]) => (
          <li key={name}>
            <strong>{name}</strong>
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
    <li className={`todo ${todo.done ? 'todo--done' : ''}`}>
      <label>
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        <span>{todo.title}</span>
      </label>
      <small>{todo.assignee ?? 'Unassigned'}</small>
    </li>
  )
}

export default function App() {
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
      <header className="hero">
        <h1>React DevTools Webpack Playground</h1>
        <p>
          This is a React DevTools playground using Webpack. Note that React DevTools currently
          has limited webpack support compared to Vite. For full features, use the Vite plugin.
        </p>
      </header>

      <main className="layout">
        <section className="card">
          <h2>
            Sprint Progress
            {' '}
            <span>
              {progress}
              %
            </span>
          </h2>
          <div className="progress">
            <div className="progress__bar" style={{ width: `${progress}%` }} />
          </div>

          <ul className="todos">
            {todos.map(todo => (
              <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} />
            ))}
          </ul>
        </section>

        <TeamStatus />

        <section className="card">
          <h2>Useful Links</h2>
          <ul className="links">
            <li>
              <a href="https://devtools.vuejs.org/guide/react-devtools" target="_blank" rel="noreferrer">
                Docs: React DevTools Preview
              </a>
            </li>
            <li>
              <a href="https://github.com/vuejs/devtools" target="_blank" rel="noreferrer">
                GitHub Repository
              </a>
            </li>
            <li>
              <a href="/packages/playground/react" target="_blank" rel="noreferrer">
                Vite Playground (Recommended)
              </a>
            </li>
          </ul>
        </section>
      </main>
    </div>
  )
}
