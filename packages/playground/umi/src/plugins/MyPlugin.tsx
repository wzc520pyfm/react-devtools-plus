import React, { useEffect, useState } from 'react'

interface RouteInfo {
  path: string
  component: string
}

interface PluginState {
  routeHistory: string[]
  componentCount: number
  renderCount: number
}

export default function MyPlugin() {
  const [state, setState] = useState<PluginState>({
    routeHistory: [],
    componentCount: 0,
    renderCount: 0,
  })

  const [activeTab, setActiveTab] = useState<'routes' | 'stats' | 'about'>(
    'routes',
  )

  useEffect(() => {
    // Simulate tracking route history
    const currentPath = window.location.pathname
    setState(prev => ({
      ...prev,
      routeHistory: [...prev.routeHistory.slice(-4), currentPath],
      renderCount: prev.renderCount + 1,
    }))

    // Simulate component counting
    const updateComponentCount = () => {
      const elements = document.querySelectorAll('[data-reactroot] *')
      setState(prev => ({
        ...prev,
        componentCount: elements.length,
      }))
    }

    updateComponentCount()
    const interval = setInterval(updateComponentCount, 2000)

    return () => clearInterval(interval)
  }, [])

  const routes: RouteInfo[] = [
    { path: '/', component: 'pages/index' },
    { path: '/about', component: 'pages/about' },
    { path: '/theme', component: 'pages/theme' },
    { path: '/counter', component: 'pages/counter' },
  ]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Umi DevTools Plugin</h2>
        <p style={styles.subtitle}>Custom plugin for Umi integration</p>
      </div>

      <div style={styles.tabs}>
        {(['routes', 'stats', 'about'] as const).map(tab => (
          <button
            key={tab}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {activeTab === 'routes' && (
          <div>
            <h3 style={styles.sectionTitle}>Registered Routes</h3>
            <ul style={styles.list}>
              {routes.map(route => (
                <li
                  key={route.path}
                  style={{
                    ...styles.listItem,
                    ...(window.location.pathname === route.path
                      ? styles.activeRoute
                      : {}),
                  }}
                >
                  <span style={styles.routePath}>{route.path}</span>
                  <span style={styles.routeComponent}>{route.component}</span>
                </li>
              ))}
            </ul>

            <h3 style={styles.sectionTitle}>Route History</h3>
            <ul style={styles.list}>
              {state.routeHistory.map((path, index) => (
                <li key={index} style={styles.historyItem}>
                  {path}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <h3 style={styles.sectionTitle}>Application Stats</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <span style={styles.statValue}>{routes.length}</span>
                <span style={styles.statLabel}>Routes</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statValue}>{state.componentCount}</span>
                <span style={styles.statLabel}>DOM Elements</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statValue}>{state.renderCount}</span>
                <span style={styles.statLabel}>Plugin Renders</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div>
            <h3 style={styles.sectionTitle}>About This Plugin</h3>
            <p style={styles.paragraph}>
              This is a custom DevTools plugin for the Umi integration
              playground. It demonstrates how to create plugins for React
              DevTools Plus.
            </p>
            <h4 style={styles.subTitle}>Features:</h4>
            <ul style={styles.featureList}>
              <li>View registered routes</li>
              <li>Track route history</li>
              <li>Monitor application stats</li>
              <li>Custom UI components</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#333',
    minHeight: '100%',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    margin: '0 0 4px',
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  subtitle: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#666',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '16px',
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: '8px',
  },
  tab: {
    padding: '8px 16px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: '#666',
    borderRadius: '4px',
    transition: 'all 0.2s',
  },
  activeTab: {
    background: '#667eea',
    color: 'white',
  },
  content: {
    padding: '8px 0',
  },
  sectionTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    margin: '0 0 12px',
    color: '#444',
  },
  subTitle: {
    fontSize: '0.9rem',
    fontWeight: 600,
    margin: '16px 0 8px',
    color: '#444',
  },
  list: {
    listStyle: 'none',
    margin: '0 0 20px',
    padding: 0,
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 12px',
    background: '#f5f5f5',
    borderRadius: '6px',
    marginBottom: '6px',
    fontSize: '0.875rem',
  },
  activeRoute: {
    background: '#667eea15',
    border: '1px solid #667eea30',
  },
  routePath: {
    fontWeight: 500,
    color: '#333',
  },
  routeComponent: {
    color: '#888',
    fontFamily: 'monospace',
    fontSize: '0.8rem',
  },
  historyItem: {
    padding: '8px 12px',
    background: '#fafafa',
    borderRadius: '4px',
    marginBottom: '4px',
    fontSize: '0.85rem',
    fontFamily: 'monospace',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '16px',
    background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)',
    borderRadius: '8px',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#667eea',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#666',
    marginTop: '4px',
  },
  paragraph: {
    fontSize: '0.9rem',
    lineHeight: 1.6,
    color: '#555',
    margin: '0 0 16px',
  },
  featureList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '0.9rem',
    lineHeight: 1.8,
    color: '#555',
  },
}
