import React, { useState } from 'react'
import { Link } from 'umi'
import styles from './theme.less'

type Theme = 'light' | 'dark' | 'auto'

interface ThemeCardProps {
  theme: Theme
  currentTheme: Theme
  onSelect: (theme: Theme) => void
  icon: string
  label: string
  description: string
}

function ThemeCard({
  theme,
  currentTheme,
  onSelect,
  icon,
  label,
  description,
}: ThemeCardProps) {
  const isSelected = theme === currentTheme

  return (
    <button
      className={`${styles.themeCard}  ${isSelected ? styles.selected : ''}`}
      onClick={() => onSelect(theme)}
    >
      <span className={styles.icon}>{icon}</span>
      <h3>{label}</h3>
      <p>{description}</p>
    </button>
  )
}

interface ColorSwatchProps {
  color: string
  name: string
}

function ColorSwatch({ color, name }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(color)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={styles.swatch} onClick={handleCopy}>
      <div className={styles.color} style={{ background: color }} />
      <span className={styles.name}>{name}</span>
      <span className={styles.value}>{copied ? 'Copied!' : color}</span>
    </div>
  )
}

export default function ThemePage() {
  const [theme, setTheme] = useState<Theme>('light')

  const colors = {
    light: [
      { name: 'Primary', color: '#667eea' },
      { name: 'Secondary', color: '#764ba2' },
      { name: 'Background', color: '#ffffff' },
      { name: 'Surface', color: '#f5f5f5' },
      { name: 'Text', color: '#333333' },
      { name: 'Muted', color: '#666666' },
    ],
    dark: [
      { name: 'Primary', color: '#818cf8' },
      { name: 'Secondary', color: '#a78bfa' },
      { name: 'Background', color: '#1a1a2e' },
      { name: 'Surface', color: '#252542' },
      { name: 'Text', color: '#ffffff' },
      { name: 'Muted', color: '#a0a0a0' },
    ],
  }

  const currentColors = theme === 'dark' ? colors.dark : colors.light

  return (
    <div className={`${styles.container}  ${styles[theme]}`}>
      <header className={styles.header}>
        <Link to="/" className={styles.backLink}>
          ← Back to Home
        </Link>
        <h1>Theme Demo</h1>
        <p className={styles.subtitle}>
          Explore theme switching and color palettes
        </p>
      </header>

      <main className={styles.main}>
        <section className={styles.themeSelector}>
          <h2>Select Theme</h2>
          <div className={styles.themeGrid}>
            <ThemeCard
              theme="light"
              currentTheme={theme}
              onSelect={setTheme}
              icon="☀️"
              label="Light"
              description="Clean and bright interface"
            />
            <ThemeCard
              theme="dark"
              currentTheme={theme}
              onSelect={setTheme}
              icon="🌙"
              label="Dark"
              description="Easy on the eyes"
            />
            <ThemeCard
              theme="auto"
              currentTheme={theme}
              onSelect={setTheme}
              icon="🔄"
              label="Auto"
              description="Follow system preference"
            />
          </div>
        </section>

        <section className={styles.colorPalette}>
          <h2>Color Palette</h2>
          <p>Click a color to copy its value</p>
          <div className={styles.swatchGrid}>
            {currentColors.map(c => (
              <ColorSwatch key={c.name} {...c} />
            ))}
          </div>
        </section>

        <section className={styles.preview}>
          <h2>UI Preview</h2>
          <div className={styles.previewBox}>
            <div className={styles.previewCard}>
              <h3>Sample Card</h3>
              <p>This is a preview of how components look with the current theme.</p>
              <div className={styles.previewActions}>
                <button className={styles.primaryBtn}>Primary Action</button>
                <button className={styles.secondaryBtn}>Secondary</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
