import { Link, useLocation } from 'react-router-dom'

export default function Layout({ children }) {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <div className="layout">
      <header className="layout__header">
        <h1>React DevTools Playground</h1>
        <p>React 17 + SCSS + Webpack 4 + Node 14+ Compatibility Test</p>
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
