import React from 'react'
import { Link, Outlet, useLocation } from 'umi'
import styles from './index.less'

interface NavItem {
  path: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/about', label: 'About', icon: '📖' },
  { path: '/theme', label: 'Theme', icon: '🎨' },
  { path: '/counter', label: 'Counter', icon: '⚡' },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⚛️</span>
          <span className={styles.logoText}>DevTools+</span>
        </div>
        <ul className={styles.navList}>
          {navItems.map(item => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`${styles.navLink}  ${
                  location.pathname === item.path ? styles.active : ''
                }`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.footer}>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            GitHub
          </a>
          <span className={styles.version}>v0.0.1</span>
        </div>
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
