import React, { useState } from 'react'
import { Link } from 'umi'
import styles from './index.less'

interface CardProps {
  title: string
  description: string
  link: string
}

function FeatureCard({ title, description, link }: CardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      to={link}
      className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 8px 30px rgba(0, 0, 0, 0.12)'
          : '0 2px 8px rgba(0, 0, 0, 0.08)',
      }}
    >
      <h3>{title}</h3>
      <p>{description}</p>
    </Link>
  )
}

export default function HomePage() {
  const [clickCount, setClickCount] = useState(0)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>React DevTools Plus</h1>
        <p className={styles.subtitle}>Umi Integration Playground</p>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h2>Welcome to the Umi Playground</h2>
          <p>
            This playground demonstrates the integration of React DevTools Plus
            with Umi framework. Explore the features below!
          </p>
          <button
            className={styles.button}
            onClick={() => setClickCount(c => c + 1)}
          >
            Clicked
            {' '}
            {clickCount}
            {' '}
            times
          </button>
        </section>

        <section className={styles.features}>
          <FeatureCard
            title="Component Inspector"
            description="Inspect React components, view props and state in real-time."
            link="/about"
          />
          <FeatureCard
            title="Theme Switching"
            description="Test theme switching capabilities and UI components."
            link="/theme"
          />
          <FeatureCard
            title="Performance Monitor"
            description="Monitor component re-renders and performance metrics."
            link="/counter"
          />
        </section>
      </main>
    </div>
  )
}
