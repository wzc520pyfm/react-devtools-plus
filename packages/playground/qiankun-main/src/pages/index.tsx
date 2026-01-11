import { Link } from '@umijs/max'
import React, { useState } from 'react'
import styles from './index.less'

interface NavCardProps {
  title: string
  description: string
  link: string
  isExternal?: boolean
}

function NavCard({ title, description, link, isExternal }: NavCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const cardStyle = {
    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
    boxShadow: isHovered
      ? '0 8px 30px rgba(0, 0, 0, 0.12)'
      : '0 2px 8px rgba(0, 0, 0, 0.08)',
  }

  if (isExternal) {
    return (
      <a
        href={link}
        className={styles.card}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={cardStyle}
        target="_blank"
        rel="noopener noreferrer"
      >
        <h3>
          {title}
          {' '}
          ↗
        </h3>
        <p>{description}</p>
      </a>
    )
  }

  return (
    <Link
      to={link}
      className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={cardStyle}
    >
      <h3>{title}</h3>
      <p>{description}</p>
    </Link>
  )
}

function AppStatus() {
  return (
    <div className={styles.status}>
      <div className={styles.statusItem}>
        <span className={styles.dot} style={{ background: '#22c55e' }} />
        <span>Main App (Port 8000)</span>
      </div>
      <div className={styles.statusItem}>
        <span className={styles.dot} style={{ background: '#3b82f6' }} />
        <span>Sub App (Port 8001)</span>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [clickCount, setClickCount] = useState(0)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🏠 Qiankun Main App</h1>
        <p className={styles.subtitle}>
          React DevTools Plus - Micro Frontend Demo
        </p>
        <AppStatus />
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h2>Micro Frontend Architecture</h2>
          <p>
            This is the main/host application using
            {' '}
            <strong>qiankun</strong>
            {' '}
            micro-frontend framework.
            The DevTools is configured with
            {' '}
            <code>microFrontend: 'host'</code>
            {' '}
            mode.
          </p>
          <button
            className={styles.button}
            onClick={() => setClickCount(c => c + 1)}
          >
            Main App Clicks:
            {' '}
            {clickCount}
          </button>
        </section>

        <section className={styles.features}>
          <NavCard
            title="About Page"
            description="Main app's about page - demonstrates local routing"
            link="/about"
          />
          <NavCard
            title="Sub Application"
            description="Navigate to the sub-app (Port 8001) integrated via qiankun"
            link="/sub"
          />
          <NavCard
            title="Sub App Direct"
            description="Open sub-app directly in a new tab (standalone mode)"
            link="http://localhost:8001"
            isExternal
          />
        </section>

        <section className={styles.info}>
          <h3>📋 DevTools Configuration</h3>
          <pre>
            {`// Main App (plugin.ts)
createUmiPlugin({
  microFrontend: 'host',  // Always initialize DevTools
  theme: { primaryColor: 'blue' }
})

// Sub App (plugin.ts)
createUmiPlugin({
  microFrontend: 'child', // Skip if DevTools exists
  theme: { primaryColor: 'green' }
})`}
          </pre>
        </section>
      </main>
    </div>
  )
}
