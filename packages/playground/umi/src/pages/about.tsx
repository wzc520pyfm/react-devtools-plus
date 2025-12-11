import React, { useState } from 'react'
import { Link } from 'umi'
import styles from './about.less'

interface FeatureItemProps {
  icon: string
  title: string
  description: string
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={styles.featureItem} onClick={() => setExpanded(!expanded)}>
      <span className={styles.icon}>{icon}</span>
      <div className={styles.content}>
        <h3>{title}</h3>
        <p>{description}</p>
        {expanded && (
          <div className={styles.expandedContent}>
            <p>Click to learn more about this feature. This demonstrates React DevTools Plus's ability to track state changes and component re-renders.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AboutPage() {
  const features: FeatureItemProps[] = [
    {
      icon: '🔍',
      title: 'Component Inspection',
      description: 'View and debug React component hierarchy in real-time.',
    },
    {
      icon: '⚡',
      title: 'Performance Monitoring',
      description: 'Track component renders and identify performance bottlenecks.',
    },
    {
      icon: '🎨',
      title: 'Theme Support',
      description: 'Built-in light and dark theme support for the DevTools panel.',
    },
    {
      icon: '🔌',
      title: 'Plugin System',
      description: 'Extend functionality with custom plugins for your specific needs.',
    },
    {
      icon: '📊',
      title: 'State Tracking',
      description: 'Monitor state changes across your entire application.',
    },
    {
      icon: '🛠️',
      title: 'Umi Integration',
      description: 'Seamless integration with Umi framework via chainWebpack.',
    },
  ]

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/" className={styles.backLink}>
          ← Back to Home
        </Link>
        <h1>About React DevTools Plus</h1>
        <p className={styles.subtitle}>
          A modern React development toolkit for debugging and performance optimization
        </p>
      </header>

      <main className={styles.main}>
        <section className={styles.features}>
          {features.map((feature, index) => (
            <FeatureItem key={index} {...feature} />
          ))}
        </section>

        <section className={styles.info}>
          <h2>Integration with Umi</h2>
          <p>
            React DevTools Plus integrates seamlessly with Umi through the
            {' '}
            <code>chainWebpack</code>
            {' '}
            configuration. This playground demonstrates
            this integration, allowing you to test all features in a real Umi
            application environment.
          </p>
          <pre className={styles.codeBlock}>
            {`// .umirc.ts
chainWebpack(memo, { webpack }) {
  memo.plugin('react-devtools-plus').use(
    reactDevToolsPlus({
      enabledEnvironments: ['development'],
      scan: { enabled: true }
    })
  );
  return memo;
}`}
          </pre>
        </section>
      </main>
    </div>
  )
}
