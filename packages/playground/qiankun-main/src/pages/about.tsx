import { Link } from '@umijs/max'
import React, { useState } from 'react'
import styles from './about.less'

interface InfoItemProps {
  label: string
  value: string | React.ReactNode
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className={styles.infoItem}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  )
}

export default function AboutPage() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/" className={styles.backLink}>← Back to Home</Link>
        <h1>About Main App</h1>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2>Application Info</h2>
          <div className={styles.infoGrid}>
            <InfoItem label="App Type" value="Main / Host Application" />
            <InfoItem label="Framework" value="Umi 4 + Qiankun" />
            <InfoItem label="Port" value="8000" />
            <InfoItem
              label="DevTools Mode"
              value={<code>microFrontend: 'host'</code>}
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2>Micro Frontend Config</h2>
          <button
            className={styles.toggleBtn}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide' : 'Show'}
            {' '}
            Configuration
          </button>

          {expanded && (
            <pre className={styles.code}>
              {`// .umirc.ts
export default defineConfig({
  qiankun: {
    master: {
      apps: [
        {
          name: 'sub-app',
          entry: '//localhost:8001',
        },
      ],
    },
  },
})

// plugin.ts (React DevTools Plus)
createUmiPlugin({
  microFrontend: 'host',
  theme: { primaryColor: 'blue' },
})`}
            </pre>
          )}
        </section>

        <section className={styles.section}>
          <h2>How It Works</h2>
          <ol className={styles.steps}>
            <li>
              <strong>Main App Initialization</strong>
              <p>
                DevTools initializes with 'host' mode, setting
                <code>window.__REACT_DEVTOOLS_PLUS_INITIALIZED__</code>
              </p>
            </li>
            <li>
              <strong>Sub App Loading</strong>
              <p>When sub-app loads via qiankun, it detects the global marker</p>
            </li>
            <li>
              <strong>Skip Duplicate</strong>
              <p>Sub-app with 'child' mode skips DevTools initialization</p>
            </li>
            <li>
              <strong>Single DevTools</strong>
              <p>Only one DevTools panel exists, inspecting all React apps</p>
            </li>
          </ol>
        </section>
      </main>
    </div>
  )
}
