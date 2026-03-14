import { useState } from 'react'

const initialTodos = [
  { id: 1, title: 'Setup Rspack project', done: true },
  { id: 2, title: 'Integrate React DevTools', done: true },
  { id: 3, title: 'Test component tree inspection', done: false },
  { id: 4, title: 'Verify source path tracking', done: false },
]

function TodoItem({ todo, onToggle }) {
  return (
    <li className={`todo ${todo.done ? 'todo--done' : ''}`}>
      <label>
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        <span>{todo.title}</span>
      </label>
    </li>
  )
}

export default function App() {
  const [todos, setTodos] = useState(initialTodos)

  const doneCount = todos.filter(t => t.done).length
  const progress = Math.round((doneCount / todos.length) * 100)

  function toggleTodo(id) {
    setTodos(prev =>
      prev.map(todo => (todo.id === id ? { ...todo, done: !todo.done } : todo)),
    )
  }

  return (
    <div className="app">
      <header className="hero">
        <h1>React DevTools + Rspack</h1>
        <p>
          A minimal playground for testing React DevTools with Rspack.
          Toggle the tasks and try <strong>Alt/Option + Shift + D</strong> to open the overlay.
        </p>
      </header>

      <main className="layout">
        <section className="card">
          <h2>
            Progress <span>{progress}%</span>
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
      </main>
    </div>
  )
}
