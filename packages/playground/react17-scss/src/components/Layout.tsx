import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <div className="layout">
      <header className="layout__header">
        <h1>React DevTools Playground</h1>
        <p>React 17 + SCSS + Node 14+ Compatibility Test</p>
      </header>
      <nav className="layout__nav">
        <Link to="/" className={isActive('/')}>
          Home
        </Link>
        <Link to="/theme" className={isActive('/theme')}>
          Theme Demo
        </Link>
      </nav>
      <main className="layout__content">{children}</main>
    </div>
  )
}
