import { Link } from '@umijs/max'
import React, { useReducer, useState } from 'react'
import styles from './detail.less'

interface Todo {
  id: number
  text: string
  completed: boolean
}

type TodoAction
  = | { type: 'ADD', text: string }
    | { type: 'TOGGLE', id: number }
    | { type: 'DELETE', id: number }

function todoReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case 'ADD':
      return [...state, { id: Date.now(), text: action.text, completed: false }]
    case 'TOGGLE':
      return state.map(todo =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo,
      )
    case 'DELETE':
      return state.filter(todo => todo.id !== action.id)
    default:
      return state
  }
}

function TodoList() {
  const [todos, dispatch] = useReducer(todoReducer, [
    { id: 1, text: 'Test DevTools component inspection', completed: false },
    { id: 2, text: 'Check useReducer state in DevTools', completed: true },
    { id: 3, text: 'Try editing state via DevTools', completed: false },
  ])
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      dispatch({ type: 'ADD', text: input.trim() })
      setInput('')
    }
  }

  return (
    <div className={styles.todoList}>
      <h3>📝 Todo List (useReducer)</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add a new todo..."
          className={styles.input}
        />
        <button type="submit" className={styles.addBtn}>Add</button>
      </form>
      <ul className={styles.list}>
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? styles.completed : ''}>
            <label>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => dispatch({ type: 'TOGGLE', id: todo.id })}
              />
              <span>{todo.text}</span>
            </label>
            <button
              className={styles.deleteBtn}
              onClick={() => dispatch({ type: 'DELETE', id: todo.id })}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <p className={styles.count}>
        {todos.filter(t => !t.completed).length}
        {' '}
        items remaining
      </p>
    </div>
  )
}

function NestedComponents() {
  return (
    <div className={styles.nested}>
      <h3>🏗️ Nested Components</h3>
      <p>Test component tree navigation in DevTools:</p>
      <Grandparent>
        <Parent>
          <Child name="Alice" />
          <Child name="Bob" />
        </Parent>
      </Grandparent>
    </div>
  )
}

function Grandparent({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.component} data-name="Grandparent">
      <span className={styles.tag}>Grandparent</span>
      {children}
    </div>
  )
}

function Parent({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.component} data-name="Parent">
      <span className={styles.tag}>Parent</span>
      <div className={styles.children}>{children}</div>
    </div>
  )
}

function Child({ name }: { name: string }) {
  const [likes, setLikes] = useState(0)

  return (
    <div className={styles.component} data-name="Child">
      <span className={styles.tag}>
        Child:
        {' '}
        {name}
      </span>
      <button onClick={() => setLikes(l => l + 1)}>
        ❤️
        {' '}
        {likes}
      </button>
    </div>
  )
}

export default function DetailPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/" className={styles.backLink}>← Back</Link>
        <h1>Detail Page</h1>
        <p>Complex components for DevTools testing</p>
      </header>

      <main className={styles.main}>
        <TodoList />
        <NestedComponents />
      </main>
    </div>
  )
}
