import React, { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div className="counter">
      <h2>Counter Component</h2>
      <p>
        Current count:
        <strong>{count}</strong>
      </p>
      <div className="button-group">
        <button onClick={() => setCount(c => c - 1)}>Decrease</button>
        <button onClick={() => setCount(c => c + 1)}>Increase</button>
        <button onClick={() => setCount(0)}>Reset</button>
      </div>
    </div>
  )
}

function TodoList() {
  const [todos, setTodos] = useState<string[]>(['Learn React 19', 'Test DevTools'])
  const [input, setInput] = useState('')

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, input.trim()])
      setInput('')
    }
  }

  const removeTodo = (index: number) => {
    setTodos(todos.filter((_, i) => i !== index))
  }

  return (
    <div className="todo-list">
      <h2>Todo List Component</h2>
      <div className="todo-input">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            <span>{todo}</span>
            <button onClick={() => removeTodo(index)}>×</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ReactInfo() {
  // @ts-expect-error - React.version is available at runtime
  const reactVersion = React.version || 'unknown'

  return (
    <div className="react-info">
      <h2>React Version Info</h2>
      <p>
        Running on React
        {' '}
        <strong>{reactVersion}</strong>
      </p>
      <p className="info-text">
        This playground tests react-devtools-plus compatibility with React 19.
        Open the DevTools panel using
        {' '}
        <kbd>Alt+Shift+D</kbd>
        {' '}
        or click the floating button.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>React 19 DevTools Playground</h1>
      </header>
      <main>
        <ReactInfo />
        <Counter />
        <TodoList />
      </main>
    </div>
  )
}
