'use client'

import { useState } from 'react'
import Counter from '@/components/Counter'
import FeatureCard from '@/components/FeatureCard'
import { features } from '@/components/features'

export default function Home() {
  const [clickCount, setClickCount] = useState(0)

  return (
    <div className="container">
      <header className="header">
        <h1>React DevTools Plus</h1>
        <p>Next.js App Router Integration Playground</p>
      </header>

      <main className="main">
        <section className="card">
          <h3>Interactive Counter</h3>
          <p>
            Test component state updates and React Scan render detection.
          </p>
          <div style={{ marginTop: '1rem' }}>
            <Counter />
          </div>
        </section>

        <section className="card">
          <h3>Click Tracker</h3>
          <p>Track button clicks and observe state changes in DevTools.</p>
          <div style={{ marginTop: '1rem' }}>
            <button
              className="button"
              onClick={() => setClickCount(c => c + 1)}
            >
              Clicked
              {' '}
              {clickCount}
              {' '}
              times
            </button>
          </div>
        </section>

        <section className="features">
          {features.map(feature => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </section>

        <div className="keyboard-hint">
          <p>
            Press
            {' '}
            <code>Option(⌥) + Shift(⇧) + D</code>
            {' '}
            to toggle DevTools panel
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            Or visit
            {' '}
            <a href="/devtools" target="_blank" rel="noreferrer">
              /devtools
            </a>
            {' '}
            to open in a new tab
          </p>
        </div>
      </main>
    </div>
  )
}
