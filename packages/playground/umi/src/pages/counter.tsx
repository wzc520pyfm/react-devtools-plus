import React, { memo, useCallback, useMemo, useState } from 'react'
import { Link } from 'umi'
import styles from './counter.less'

// Memoized counter display component to test re-render detection
const CounterDisplay = memo(({
  value,
  label,
}: {
  value: number
  label: string
}) => {
  return (
    <div className={styles.counterDisplay}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  )
})

// Component that re-renders on every parent render
function UnoptimizedCounter({ value }: { value: number }) {
  return (
    <div className={styles.counterDisplay}>
      <span className={styles.label}>Unoptimized</span>
      <span className={styles.value}>{value}</span>
      <span className={styles.tag}>Re-renders every time</span>
    </div>
  )
}

// Expensive calculation simulation
function ExpensiveList({ count }: { count: number }) {
  const items = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      name: `Item ${i + 1}`,
      computed: Math.sqrt(i * 1000),
    }))
  }, [count])

  return (
    <div className={styles.list}>
      <h4>
        Generated
        {' '}
        {items.length}
        {' '}
        items (memoized)
      </h4>
      <ul>
        {items.slice(0, 5).map(item => (
          <li key={item.id}>
            {item.name}
            {' '}
            -
            {' '}
            {item.computed.toFixed(2)}
          </li>
        ))}
        {items.length > 5 && (
          <li>
            ... and
            {' '}
            {items.length - 5}
            {' '}
            more
          </li>
        )}
      </ul>
    </div>
  )
}

export default function CounterPage() {
  const [count, setCount] = useState(0)
  const [otherState, setOtherState] = useState(0)
  const [listSize, setListSize] = useState(10)

  // Optimized callback
  const handleIncrement = useCallback(() => {
    setCount(c => c + 1)
  }, [])

  const handleDecrement = useCallback(() => {
    setCount(c => c - 1)
  }, [])

  // Non-optimized callback (for comparison)
  const handleOtherClick = () => {
    setOtherState(s => s + 1)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/" className={styles.backLink}>
          ← Back to Home
        </Link>
        <h1>Performance Demo</h1>
        <p className={styles.subtitle}>
          Test React DevTools Plus render detection
        </p>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2>Counter Example</h2>
          <p className={styles.description}>
            Watch the React DevTools scan overlay to see which components
            re-render when you click buttons.
          </p>

          <div className={styles.counters}>
            <CounterDisplay value={count} label="Optimized (memo)" />
            <UnoptimizedCounter value={count} />
          </div>

          <div className={styles.actions}>
            <button onClick={handleDecrement} className={styles.btn}>
              - Decrease
            </button>
            <button onClick={handleIncrement} className={styles.btn}>
              + Increase
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Unrelated State</h2>
          <p className={styles.description}>
            Click this button to update unrelated state. The memoized counter
            should NOT re-render, but the unoptimized one will.
          </p>

          <div className={styles.counters}>
            <div className={styles.counterDisplay}>
              <span className={styles.label}>Other State</span>
              <span className={styles.value}>{otherState}</span>
            </div>
          </div>

          <button onClick={handleOtherClick} className={styles.btn}>
            Update Other State
          </button>
        </section>

        <section className={styles.section}>
          <h2>Memoized Computation</h2>
          <p className={styles.description}>
            Adjust the list size to see how useMemo optimizes expensive
            calculations.
          </p>

          <div className={styles.sliderContainer}>
            <label>
              List Size:
              {' '}
              {listSize}
              <input
                type="range"
                min="10"
                max="1000"
                value={listSize}
                onChange={e => setListSize(Number(e.target.value))}
                className={styles.slider}
              />
            </label>
          </div>

          <ExpensiveList count={listSize} />
        </section>

        <section className={styles.tips}>
          <h2>Tips for Testing</h2>
          <ul>
            <li>
              <strong>React Scan Overlay:</strong>
              {' '}
              Enable the scan overlay to
              see visual indicators when components re-render.
            </li>
            <li>
              <strong>Component Tree:</strong>
              {' '}
              Open the DevTools panel to
              inspect component props and state.
            </li>
            <li>
              <strong>Performance:</strong>
              {' '}
              Use the Timeline feature to record
              and analyze render patterns.
            </li>
          </ul>
        </section>
      </main>
    </div>
  )
}
