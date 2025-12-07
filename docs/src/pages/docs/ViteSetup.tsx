import { ArrowRight, Check, Copy, Info } from 'lucide-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const CodeBlock: React.FC<{ code: string, language?: string, title?: string }> = ({ code, language = 'typescript', title }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="not-prose my-4 overflow-hidden border border-white/10 rounded-xl bg-slate-900">
      {title && (
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2">
          <span className="text-sm text-slate-400">{title}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-white"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      <div className="relative">
        <pre className="overflow-x-auto p-4">
          <code className={`language-${language} text-sm text-slate-300`}>{code}</code>
        </pre>
        {!title && (
          <button
            onClick={handleCopy}
            className="absolute right-3 top-3 border border-white/10 rounded-lg bg-white/5 p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  )
}

export const ViteSetup: React.FC = () => {
  const { t } = useTranslation()

  const basicConfig = `import react from '@vitejs/plugin-react'
import ReactDevTools from 'react-devtools-plus'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    ReactDevTools(),
  ],
})`

  const advancedConfig = `import react from '@vitejs/plugin-react'
import ReactDevTools from 'react-devtools-plus'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    ReactDevTools({
      // Only enable in specific environments
      enabledEnvironments: ['development', 'test'],
      
      // Enable source code location injection for "Open in Editor"
      injectSource: true,
      
      // Configure assets panel
      assets: {
        files: ['png', 'jpg', 'svg', 'ico', 'gif', 'webp', 'mp4', 'json', 'md']
      }
    }),
  ],
})`

  const envConfig = `# .env.development
VITE_REACT_DEVTOOLS_ENABLED=true

# .env.test
VITE_REACT_DEVTOOLS_ENABLED=true

# .env.production
VITE_REACT_DEVTOOLS_ENABLED=false`

  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="mb-4 text-4xl text-white font-bold">{t('docs.viteSetup.title')}</h1>

      <p className="text-lg text-slate-300 leading-relaxed">
        {t('docs.viteSetup.description')}
      </p>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.viteSetup.basic.title')}</h2>
      <p className="text-slate-300">{t('docs.viteSetup.basic.description')}</p>
      <CodeBlock code={basicConfig} title="vite.config.ts" />

      {/* Placeholder for screenshot */}
      <div className="not-prose my-8 h-64 flex items-center justify-center border border-white/20 rounded-2xl border-dashed bg-white/5">
        <div className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 flex items-center justify-center rounded-full bg-white/10">
            <Info className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-400">{t('docs.common.screenshotPlaceholder')}</p>
          <p className="mt-1 text-xs text-slate-500">Vite Plugin Configuration Preview</p>
        </div>
      </div>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.viteSetup.advanced.title')}</h2>
      <p className="text-slate-300">{t('docs.viteSetup.advanced.description')}</p>
      <CodeBlock code={advancedConfig} title="vite.config.ts" />

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.viteSetup.env.title')}</h2>
      <p className="text-slate-300">{t('docs.viteSetup.env.description')}</p>
      <CodeBlock code={envConfig} title=".env files" language="bash" />

      <div className="not-prose border-brand-500/30 bg-brand-500/10 my-6 border rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="text-brand-400 mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="text-brand-300 text-sm font-medium">{t('docs.viteSetup.tip.title')}</p>
            <p className="text-brand-300/80 mt-1 text-sm">{t('docs.viteSetup.tip.content')}</p>
          </div>
        </div>
      </div>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.viteSetup.options.title')}</h2>
      <div className="not-prose overflow-x-auto">
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
              <td className="py-3 text-slate-300">{t('docs.viteSetup.options.enabledEnvironments')}</td>
            </tr>
            <tr>
              <td className="text-brand-400 py-3 pr-4 font-mono">injectSource</td>
              <td className="py-3 pr-4 text-slate-400">boolean</td>
              <td className="py-3 pr-4 text-slate-400">true</td>
              <td className="py-3 text-slate-300">{t('docs.viteSetup.options.injectSource')}</td>
            </tr>
            <tr>
              <td className="text-brand-400 py-3 pr-4 font-mono">appendTo</td>
              <td className="py-3 pr-4 text-slate-400">string | RegExp</td>
              <td className="py-3 pr-4 text-slate-400">-</td>
              <td className="py-3 text-slate-300">{t('docs.viteSetup.options.appendTo')}</td>
            </tr>
            <tr>
              <td className="text-brand-400 py-3 pr-4 font-mono">assets.files</td>
              <td className="py-3 pr-4 text-slate-400">string[]</td>
              <td className="py-3 pr-4 text-slate-400">-</td>
              <td className="py-3 text-slate-300">{t('docs.viteSetup.options.assetsFiles')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="not-prose mt-10 flex flex-wrap gap-4">
        <Link
          to="/docs/integration/webpack"
          className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm text-white font-medium transition-colors"
        >
          {t('docs.viteSetup.nextSteps.webpack')}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/docs/integration/configuration"
          className="inline-flex items-center gap-2 border border-white/10 rounded-full bg-white/5 px-6 py-3 text-sm text-white font-medium transition-colors hover:bg-white/10"
        >
          {t('docs.viteSetup.nextSteps.config')}
        </Link>
      </div>
    </div>
  )
}
