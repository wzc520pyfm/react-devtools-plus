import { ArrowRight, Check, Copy } from 'lucide-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/Button'
import { Spotlight } from './ui/Spotlight'
import { CodeTab, TabbedCodeBlock } from './ui/TabbedCodeBlock'

// Configurable code tabs for the Hero section
const HERO_CODE_TABS: CodeTab[] = [
  {
    name: 'vite.config.ts',
    icon: 'settings',
    language: 'ts',
    code: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { reactDevToolsPlus } from 'react-devtools-plus/vite'

export default defineConfig({
  plugins: [
    react(),
    reactDevToolsPlus(),
  ],
})`,
  },
  {
    name: 'webpack.config.js',
    icon: 'settings',
    language: 'js',
    code: `const ReactDevToolsPlugin =
  require('react-devtools-plus/webpack').webpack

module.exports = {
  plugins: [
    ReactDevToolsPlugin(),
  ],
}`,
  },
  {
    name: 'package.json',
    icon: 'braces',
    language: 'json',
    code: `{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "react-devtools-plus": "^0.0.1",
  }
}`,
  },
]

export const Hero: React.FC = () => {
  const [copied, setCopied] = useState(false)
  const { t } = useTranslation()

  const handleCopy = () => {
    navigator.clipboard.writeText('pnpm add -D react-devtools-plus')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-950 pb-20 pt-24">
      {/* Background Ambience - Radial Top-Down Light */}
      <div className="absolute inset-0 h-full w-full bg-slate-950">
        <div className="[mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* Spotlight Beam - Top Right shining Bottom Left */}
      <Spotlight className="right-0 -top-40 md:right-0 md:-top-20" fill="#38bdf8" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">

          {/* Left Column: Content */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            {/* Badge */}
            <div
              className="animate-slide-up-fade mb-8 inline-flex items-center gap-2 border border-white/5 rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300 backdrop-blur-xl"
              style={{ animationDelay: '0.1s' }}
            >
              <span className="bg-brand-400 h-2 w-2 flex animate-pulse rounded-full"></span>
              <span>{t('hero.badge')}</span>
            </div>

            {/* Heading */}
            <h1
              className="animate-slide-up-fade text-5xl text-white font-extrabold tracking-tight md:text-7xl"
              style={{ animationDelay: '0.2s' }}
            >
              {t('hero.titleLead')}
              {' '}
              <br />
              <span className="from-brand-300 via-brand-500 to-brand-700 bg-gradient-to-r bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="animate-slide-up-fade mt-6 max-w-2xl text-lg text-slate-400 md:text-xl"
              style={{ animationDelay: '0.4s' }}
            >
              {t('hero.subtitle')}
            </p>

            {/* Buttons */}
            <div
              className="animate-slide-up-fade mt-10 w-full flex flex-col items-center gap-4 sm:w-auto sm:flex-row"
              style={{ animationDelay: '0.6s' }}
            >
              <Button withBeam className="w-full sm:w-auto">
                {t('hero.primaryCta')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div
                className="group relative w-full flex cursor-pointer items-center justify-between gap-2 border border-white/10 rounded-full bg-slate-900/50 px-6 py-3 text-sm text-slate-400 font-mono transition-all sm:w-auto hover:border-white/20 hover:text-white"
                onClick={handleCopy}
              >
                <span>{t('hero.snippet')}</span>
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}

                {/* Subtle glow on hover */}
                <div className="bg-brand-500/10 absolute inset-0 rounded-full opacity-0 blur-lg transition-opacity -z-10 group-hover:opacity-100" />
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Code Block */}
          <div
            className="animate-slide-up-fade relative mx-auto max-w-[600px] w-full"
            style={{ animationDelay: '0.8s' }}
          >
            {/* Abstract Glow behind the card */}
            <div className="from-brand-500 to-brand-800 absolute rounded-2xl bg-gradient-to-r opacity-20 blur transition duration-1000 -inset-1 group-hover:opacity-40"></div>

            {/* The Main Card with Shiki Code Highlighting */}
            <TabbedCodeBlock
              tabs={HERO_CODE_TABS}
              statusText="Debugging Session: Active"
            />

            {/* Decorative Floating Elements behind/around */}
            <div className="bg-brand-500/20 absolute h-24 w-24 rounded-full blur-3xl -right-12 -top-12"></div>
            <div className="bg-brand-400/18 absolute h-32 w-32 rounded-full blur-3xl -bottom-12 -left-12"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
