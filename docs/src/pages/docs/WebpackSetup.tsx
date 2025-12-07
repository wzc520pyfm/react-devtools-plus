import { ArrowRight, Check, Info } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CodeBlock } from '../../components/ui/CodeBlock'

export const WebpackSetup: React.FC = () => {
  const { t } = useTranslation()

  const basicConfig = `const path = require('node:path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { ReactDevToolsWebpackPlugin } = require('react-devtools-plus/webpack')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new ReactDevToolsWebpackPlugin({
      enabledEnvironments: ['development'],
    }),
  ],
  devServer: {
    port: 3000,
    hot: true,
  },
}`

  const advancedConfig = `const path = require('node:path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { ReactDevToolsWebpackPlugin } = require('react-devtools-plus/webpack')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new ReactDevToolsWebpackPlugin({
      // Enable in development and test environments
      enabledEnvironments: ['development', 'test'],
      
      // Enable source code location injection
      injectSource: true,
      
      // Configure which editor to open
      launchEditor: 'cursor',
      
      // Configure assets panel
      assets: {
        files: ['png', 'jpg', 'svg', 'ico', 'gif', 'webp']
      }
    }),
  ],
  devServer: {
    port: 3000,
    hot: true,
  },
}`

  const esmConfig = `// For ESM projects, use dynamic import
export default async () => {
  const { ReactDevToolsWebpackPlugin } = await import('react-devtools-plus/webpack')
  
  return {
    // ... other config
    plugins: [
      new ReactDevToolsWebpackPlugin({
        enabledEnvironments: ['development'],
      }),
    ],
  }
}`

  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="mb-4 text-4xl text-white font-bold">{t('docs.webpackSetup.title')}</h1>

      <p className="text-lg text-slate-300 leading-relaxed">
        {t('docs.webpackSetup.description')}
      </p>

      <div className="not-prose my-6 border border-green-500/30 rounded-xl bg-green-500/10 p-4">
        <div className="flex items-start gap-3">
          <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
          <div>
            <p className="text-sm text-green-300 font-medium">{t('docs.webpackSetup.support.title')}</p>
            <p className="mt-1 text-sm text-green-300/80">{t('docs.webpackSetup.support.content')}</p>
          </div>
        </div>
      </div>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.webpackSetup.basic.title')}</h2>
      <p className="text-slate-300">{t('docs.webpackSetup.basic.description')}</p>
      <CodeBlock code={basicConfig} language="javascript" title="webpack.config.js" />

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.webpackSetup.advanced.title')}</h2>
      <p className="text-slate-300">{t('docs.webpackSetup.advanced.description')}</p>
      <CodeBlock code={advancedConfig} language="javascript" title="webpack.config.js" />

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.webpackSetup.esm.title')}</h2>
      <p className="text-slate-300">{t('docs.webpackSetup.esm.description')}</p>
      <CodeBlock code={esmConfig} language="javascript" title="webpack.config.mjs (ESM)" />

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.webpackSetup.features.title')}</h2>
      <ul className="my-4 text-slate-300 space-y-2">
        <li className="flex items-center gap-2">
          <Check className="text-brand-400 h-4 w-4" />
          {t('docs.webpackSetup.features.html')}
        </li>
        <li className="flex items-center gap-2">
          <Check className="text-brand-400 h-4 w-4" />
          {t('docs.webpackSetup.features.devServer')}
        </li>
        <li className="flex items-center gap-2">
          <Check className="text-brand-400 h-4 w-4" />
          {t('docs.webpackSetup.features.env')}
        </li>
        <li className="flex items-center gap-2">
          <Check className="text-brand-400 h-4 w-4" />
          {t('docs.webpackSetup.features.hmr')}
        </li>
        <li className="flex items-center gap-2">
          <Check className="text-brand-400 h-4 w-4" />
          {t('docs.webpackSetup.features.codeSplit')}
        </li>
      </ul>

      <div className="not-prose border-brand-500/30 bg-brand-500/10 my-6 border rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="text-brand-400 mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="text-brand-300 text-sm font-medium">{t('docs.webpackSetup.tip.title')}</p>
            <p className="text-brand-300/80 mt-1 text-sm">{t('docs.webpackSetup.tip.content')}</p>
          </div>
        </div>
      </div>

      <div className="not-prose mt-10 flex flex-wrap gap-4">
        <Link
          to="/docs/integration/configuration"
          className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm text-white font-medium transition-colors"
        >
          {t('docs.webpackSetup.nextSteps.config')}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/docs/features/component-tree"
          className="inline-flex items-center gap-2 border border-white/10 rounded-full bg-white/5 px-6 py-3 text-sm text-white font-medium transition-colors hover:bg-white/10"
        >
          {t('docs.webpackSetup.nextSteps.features')}
        </Link>
      </div>
    </div>
  )
}
