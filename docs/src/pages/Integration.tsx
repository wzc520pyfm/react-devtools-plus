import { ArrowRight, Settings, Zap } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { CodeBlock } from '../components/ui/CodeBlock'
import { Logo } from '../components/ui/Logo'

export const Integration: React.FC = () => {
  const { t, i18n } = useTranslation()

  const viteConfig = `import react from '@vitejs/plugin-react'
import { reactDevToolsPlus } from 'react-devtools-plus/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    reactDevToolsPlus(),
  ],
})`

  const webpackConfig = `const HtmlWebpackPlugin = require('html-webpack-plugin')
const { ReactDevToolsWebpackPlugin } = require('react-devtools-plus/webpack')

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new ReactDevToolsWebpackPlugin({
      enabledEnvironments: ['development'],
    }),
  ],
}`

  const advancedConfig = `reactDevToolsPlus({
  // Enable in specific environments
  enabledEnvironments: ['development', 'test'],
  
  // Enable source location injection
  injectSource: true,
  
  // Configure which editor to open
  launchEditor: 'cursor',
  
  // Configure assets panel
  assets: {
    files: ['png', 'jpg', 'svg', 'gif', 'webp']
  }
})`

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link to="/" className="group flex items-center gap-2.5">
              <Logo size={32} className="transition-transform duration-300 group-hover:scale-105" />
              <span className="from-white to-slate-400 bg-gradient-to-r bg-clip-text text-lg text-transparent font-bold">
                DevTools
                <sup className="text-brand-400 relative text-xs -top-2">+</sup>
              </span>
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              <Link
                to="/docs"
                className="rounded-lg px-3 py-2 text-sm text-slate-400 font-medium transition-colors hover:bg-white/5 hover:text-white"
              >
                {t('common.nav.docs')}
              </Link>
              <Link
                to="/features"
                className="rounded-lg px-3 py-2 text-sm text-slate-400 font-medium transition-colors hover:bg-white/5 hover:text-white"
              >
                {t('common.nav.features')}
              </Link>
              <Link
                to="/integration"
                className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white font-medium"
              >
                {t('common.nav.integration')}
              </Link>
              <Link
                to="/community"
                className="rounded-lg px-3 py-2 text-sm text-slate-400 font-medium transition-colors hover:bg-white/5 hover:text-white"
              >
                {t('common.nav.community')}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleLanguage}
              className="rounded-lg px-3 py-2 text-sm text-slate-400 font-medium transition-colors hover:bg-white/5 hover:text-white"
            >
              {i18n.language === 'en' ? '中文' : 'EN'}
            </button>
            <a
              href="https://github.com/wzc520pyfm/react-devtools-plus"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden border border-white/10 rounded-lg bg-white/5 px-4 py-2 text-sm text-white font-medium transition-colors sm:inline-flex hover:bg-white/10"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pb-16 pt-32">
        <div className="bg-brand-500/10 pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full blur-[120px]" />

        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 border border-white/10 rounded-full bg-white/5 px-4 py-2 text-xs text-slate-300 tracking-wider uppercase">
              <Settings className="text-brand-400 h-4 w-4" />
              {t('integrationPage.badge')}
            </div>
            <h1 className="mb-4 text-4xl text-white font-bold md:text-5xl">
              {t('integrationPage.title')}
            </h1>
            <p className="text-lg text-slate-400">
              {t('integrationPage.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Installation */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-2xl text-white font-bold">{t('integrationPage.install.title')}</h2>
            <CodeBlock code="pnpm add -D react-devtools-plus" language="bash" title="Terminal" showLineNumbers={false} />
          </div>
        </div>
      </section>

      {/* Vite & Webpack configs side by side */}
      <section className="border-t border-white/5 py-16">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Vite */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-500/20 rounded-lg p-2">
                    <Zap className="text-brand-400 h-5 w-5" />
                  </div>
                  <h3 className="text-xl text-white font-bold">{t('integrationPage.vite.title')}</h3>
                </div>
                <p className="text-slate-400">{t('integrationPage.vite.description')}</p>
                <CodeBlock code={viteConfig} language="ts" title="vite.config.ts" />
                <Link
                  to="/docs/integration/vite"
                  className="text-brand-400 hover:text-brand-300 inline-flex items-center gap-2 text-sm font-medium"
                >
                  {t('integrationPage.vite.learnMore')}
                  {' '}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Webpack */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/20 p-2">
                    <Settings className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="text-xl text-white font-bold">{t('integrationPage.webpack.title')}</h3>
                </div>
                <p className="text-slate-400">{t('integrationPage.webpack.description')}</p>
                <CodeBlock code={webpackConfig} language="javascript" title="webpack.config.js" />
                <Link
                  to="/docs/integration/webpack"
                  className="text-brand-400 hover:text-brand-300 inline-flex items-center gap-2 text-sm font-medium"
                >
                  {t('integrationPage.webpack.learnMore')}
                  {' '}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Configuration Options */}
      <section className="border-t border-white/5 py-16">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-2xl text-white font-bold">{t('integrationPage.config.title')}</h2>
            <p className="mb-6 text-slate-400">{t('integrationPage.config.description')}</p>
            <CodeBlock code={advancedConfig} language="ts" title="Advanced Configuration" />

            <h3 className="mb-4 mt-8 text-xl text-white font-semibold">{t('integrationPage.config.options.title')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 pr-4 text-slate-300 font-semibold">{t('docs.common.option')}</th>
                    <th className="py-3 pr-4 text-slate-300 font-semibold">{t('docs.common.type')}</th>
                    <th className="py-3 pr-4 text-slate-300 font-semibold">{t('docs.common.default')}</th>
                    <th className="py-3 text-slate-300 font-semibold">{t('docs.common.description')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="text-brand-400 py-3 pr-4 font-mono">enabledEnvironments</td>
                    <td className="py-3 pr-4 text-slate-400">boolean | string[]</td>
                    <td className="py-3 pr-4 text-slate-400">true</td>
                    <td className="py-3 text-slate-300">{t('integrationPage.config.options.enabledEnvironments')}</td>
                  </tr>
                  <tr>
                    <td className="text-brand-400 py-3 pr-4 font-mono">injectSource</td>
                    <td className="py-3 pr-4 text-slate-400">boolean</td>
                    <td className="py-3 pr-4 text-slate-400">true</td>
                    <td className="py-3 text-slate-300">{t('integrationPage.config.options.injectSource')}</td>
                  </tr>
                  <tr>
                    <td className="text-brand-400 py-3 pr-4 font-mono">launchEditor</td>
                    <td className="py-3 pr-4 text-slate-400">string</td>
                    <td className="py-3 pr-4 text-slate-400">'code'</td>
                    <td className="py-3 text-slate-300">Configure which editor to open</td>
                  </tr>
                  <tr>
                    <td className="text-brand-400 py-3 pr-4 font-mono">appendTo</td>
                    <td className="py-3 pr-4 text-slate-400">string | RegExp</td>
                    <td className="py-3 pr-4 text-slate-400">-</td>
                    <td className="py-3 text-slate-300">{t('integrationPage.config.options.appendTo')}</td>
                  </tr>
                  <tr>
                    <td className="text-brand-400 py-3 pr-4 font-mono">assets.files</td>
                    <td className="py-3 pr-4 text-slate-400">string[]</td>
                    <td className="py-3 pr-4 text-slate-400">-</td>
                    <td className="py-3 text-slate-300">{t('integrationPage.config.options.assetsFiles')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/docs/integration/configuration"
                className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm text-white font-medium transition-colors"
              >
                {t('integrationPage.config.cta')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
