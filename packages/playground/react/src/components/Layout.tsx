import { Link, Outlet, useLocation } from 'react-router-dom'

export default function Layout() {
  const location = useLocation()

  return (
    <>
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backgroundColor: 'var(--color-bg-base, #fff)',
          borderBottom: '1px solid var(--color-border-base, #e5e7eb)',
          padding: '12px 24px',
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '18px', marginRight: 'auto' }}>
          React DevTools
        </span>
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            color: location.pathname === '/' ? 'var(--color-primary-500, #3b82f6)' : 'inherit',
            fontWeight: location.pathname === '/' ? 600 : 400,
            transition: 'color 0.2s',
          }}
        >
          Home
        </Link>
        <Link
          to="/theme"
          style={{
            textDecoration: 'none',
            color: location.pathname === '/theme' ? 'var(--color-primary-500, #3b82f6)' : 'inherit',
            fontWeight: location.pathname === '/theme' ? 600 : 400,
            transition: 'color 0.2s',
          }}
        >
          Theme
        </Link>
      </nav>
      <Outlet />
    </>
  )
}
