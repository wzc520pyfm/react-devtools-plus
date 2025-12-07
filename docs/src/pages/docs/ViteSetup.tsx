import { ArrowRight, Info } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CodeBlock } from '../../components/ui/CodeBlock'

export const ViteSetup: React.FC = () => {
  const { t } = useTranslation()

  const basicConfig = `import react from '@vitejs/plugin-react'
import { reactDevToolsPlus } from 'react-devtools-plus/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    reactDevToolsPlus(),
  ],
})`

  const advancedConfig = `import react from '@vitejs/plugin-react'
import { reactDevToolsPlus } from 'react-devtools-plus/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    reactDevToolsPlus({
      // Only enable in specific environments
      enabledEnvironments: ['development', 'test'],
      
      // Enable source code location injection for "Open in Editor"
      injectSource: true,
      
      // Configure which editor to open
      launchEditor: 'cursor', // 'vscode' | 'cursor' | 'webstorm'
      
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
      <CodeBlock code={basicConfig} language="ts" title="vite.config.ts" />

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.viteSetup.advanced.title')}</h2>
      <p className="text-slate-300">{t('docs.viteSetup.advanced.description')}</p>
      <CodeBlock code={advancedConfig} language="ts" title="vite.config.ts" />

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.viteSetup.env.title')}</h2>
      <p className="text-slate-300">{t('docs.viteSetup.env.description')}</p>
      <CodeBlock code={envConfig} language="bash" title=".env files" />

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
              <td className="text-brand-400 py-3 pr-4 font-mono">launchEditor</td>
              <td className="py-3 pr-4 text-slate-400">string</td>
              <td className="py-3 pr-4 text-slate-400">'code'</td>
              <td className="py-3 text-slate-300">Configure which editor to open ('vscode' | 'cursor' | 'webstorm')</td>
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
