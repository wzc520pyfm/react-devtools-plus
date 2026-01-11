import { Link } from '@umijs/max'
import React, { useEffect, useState } from 'react'
import styles from './index.less'

interface CounterProps {
  label: string
  color: string
}

function Counter({ label, color }: CounterProps) {
  const [count, setCount] = useState(0)

  return (
    <div className={styles.counter}>
      <span className={styles.label}>{label}</span>
      <div className={styles.controls}>
        <button onClick={() => setCount(c => c - 1)}>-</button>
        <span style={{ color }}>{count}</span>
        <button onClick={() => setCount(c => c + 1)}>+</button>
      </div>
    </div>
  )
}

function RuntimeInfo() {
  const [isInQiankun, setIsInQiankun] = useState(false)
  const [devToolsExists, setDevToolsExists] = useState(false)

  useEffect(() => {
    // 检测是否在 qiankun 环境中
    setIsInQiankun(!!(window as any).__POWERED_BY_QIANKUN__)
    // 检测 DevTools 是否已初始化
    setDevToolsExists(!!(window as any).__REACT_DEVTOOLS_PLUS_INITIALIZED__)
  }, [])

  return (
    <div className={styles.runtimeInfo}>
      <h3>🔍 Runtime Detection</h3>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span>Qiankun Environment</span>
          <span className={isInQiankun ? styles.active : styles.inactive}>
            {isInQiankun ? '✓ Running in Main App' : '✗ Standalone Mode'}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span>DevTools Initialized</span>
          <span className={devToolsExists ? styles.active : styles.inactive}>
            {devToolsExists ? '✓ Already exists' : '✗ Not found'}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span>Expected Behavior</span>
          <span className={styles.info}>
            {isInQiankun && devToolsExists
              ? '⏭️ Skip DevTools init (child mode)'
              : '✅ Initialize DevTools'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function SubAppHome() {
  const [message, setMessage] = useState('')

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.badge}>🧩 Sub Application</div>
        <h1>Qiankun Sub App</h1>
        <p>
          Running on Port 8001 | DevTools Mode:
          {' '}
          <code>child</code>
        </p>
      </header>

      <main className={styles.main}>
        <RuntimeInfo />

        <section className={styles.section}>
          <h2>Interactive Components</h2>
          <p>These components help test DevTools component inspection:</p>

          <div className={styles.counters}>
            <Counter label="Counter A" color="#22c55e" />
            <Counter label="Counter B" color="#3b82f6" />
            <Counter label="Counter C" color="#f59e0b" />
          </div>
        </section>

        <section className={styles.section}>
          <h2>Form Test</h2>
          <div className={styles.form}>
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type something to test state..."
              className={styles.input}
            />
            {message && (
              <p className={styles.preview}>
                Preview:
                {' '}
                <strong>{message}</strong>
              </p>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Navigation</h2>
          <div className={styles.navLinks}>
            <Link to="/detail" className={styles.link}>
              → Detail Page (Sub App Route)
            </Link>
            <a href="/" className={styles.link}>
              ← Back to Main App Home
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}
