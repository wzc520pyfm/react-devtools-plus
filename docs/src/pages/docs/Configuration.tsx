import { Check, Copy, Info } from 'lucide-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

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

export const Configuration: React.FC = () => {
  const { t } = useTranslation()

  const optionsInterface = `interface ReactDevToolsPluginOptions {
  /**
   * Append overlay script to matching files
   * If not provided, script auto-injects into index.html
   */
  appendTo?: string | RegExp

  /**
   * Enable DevTools in specific environments
   * - undefined (default): enabled in dev, disabled in build
   * - true: same as default
   * - false: disabled in all environments
   * - string[] (e.g. ['development', 'test']): enabled in these environments
   */
  enabledEnvironments?: boolean | string[]

  /**
   * Enable source code location injection for "Open in Editor"
   * - true (default in dev): inject data-source-path attributes
   * - false: disable injection
   */
  injectSource?: boolean

  /**
   * Configure the Assets panel
   */
  assets?: {
    /**
     * File extensions to show in the Assets panel
     */
    files?: string[]
  }
}`

  const priorityExample = `// Priority (highest to lowest):
// 1. Environment variable: VITE_REACT_DEVTOOLS_ENABLED
// 2. Plugin config: enabledEnvironments
// 3. Default behavior: dev mode enabled, build mode disabled

// .env.development
VITE_REACT_DEVTOOLS_ENABLED=true  // Highest priority

// vite.config.ts
ReactDevTools({
  enabledEnvironments: ['development', 'test'],  // Second priority
})`

  const editorConfig = `# Set editor in package.json scripts
{
  "scripts": {
    "dev": "EDITOR=code vite",
    "dev:cursor": "EDITOR=cursor vite"
  }
}

# Or set in environment
EDITOR=code pnpm dev
EDITOR=cursor pnpm dev
EDITOR=webstorm pnpm dev

# Configure fallback in browser localStorage
localStorage.setItem('react_devtools_editor', 'cursor')
// Options: 'vscode', 'cursor', 'webstorm', 'sublime', etc.`

  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="mb-4 text-4xl text-white font-bold">{t('docs.configuration.title')}</h1>

      <p className="text-lg text-slate-300 leading-relaxed">
        {t('docs.configuration.description')}
      </p>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.configuration.interface.title')}</h2>
      <p className="text-slate-300">{t('docs.configuration.interface.description')}</p>
      <CodeBlock code={optionsInterface} title="Plugin Options Interface" />

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.configuration.options.title')}</h2>

      <h3 className="mb-3 mt-6 text-xl text-white font-semibold">enabledEnvironments</h3>
      <p className="text-slate-300">{t('docs.configuration.options.enabledEnvironments.description')}</p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-3 pr-4 text-slate-300 font-semibold">{t('docs.common.value')}</th>
              <th className="py-3 text-slate-300 font-semibold">{t('docs.common.behavior')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <tr>
              <td className="text-brand-400 py-3 pr-4 font-mono">undefined</td>
              <td className="py-3 text-slate-300">{t('docs.configuration.options.enabledEnvironments.undefined')}</td>
            </tr>
            <tr>
              <td className="text-brand-400 py-3 pr-4 font-mono">true</td>
              <td className="py-3 text-slate-300">{t('docs.configuration.options.enabledEnvironments.true')}</td>
            </tr>
            <tr>
              <td className="text-brand-400 py-3 pr-4 font-mono">false</td>
              <td className="py-3 text-slate-300">{t('docs.configuration.options.enabledEnvironments.false')}</td>
            </tr>
            <tr>
              <td className="text-brand-400 py-3 pr-4 font-mono">['development', 'test']</td>
              <td className="py-3 text-slate-300">{t('docs.configuration.options.enabledEnvironments.array')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="mb-3 mt-6 text-xl text-white font-semibold">injectSource</h3>
      <p className="text-slate-300">{t('docs.configuration.options.injectSource.description')}</p>
      <ul className="my-4 text-slate-300 space-y-2">
        <li>
          <code className="text-brand-400 rounded bg-white/10 px-2 py-0.5">true</code>
          {' '}
          -
          {' '}
          {t('docs.configuration.options.injectSource.true')}
        </li>
        <li>
          <code className="text-brand-400 rounded bg-white/10 px-2 py-0.5">false</code>
          {' '}
          -
          {' '}
          {t('docs.configuration.options.injectSource.false')}
        </li>
      </ul>

      <h3 className="mb-3 mt-6 text-xl text-white font-semibold">appendTo</h3>
      <p className="text-slate-300">{t('docs.configuration.options.appendTo.description')}</p>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.configuration.priority.title')}</h2>
      <p className="text-slate-300">{t('docs.configuration.priority.description')}</p>
      <CodeBlock code={priorityExample} title="Configuration Priority" language="bash" />

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.configuration.editor.title')}</h2>
      <p className="text-slate-300">{t('docs.configuration.editor.description')}</p>
      <CodeBlock code={editorConfig} title="Editor Configuration" language="bash" />

      <div className="not-prose border-brand-500/30 bg-brand-500/10 my-6 border rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="text-brand-400 mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="text-brand-300 text-sm font-medium">{t('docs.configuration.editor.tip.title')}</p>
            <p className="text-brand-300/80 mt-1 text-sm">{t('docs.configuration.editor.tip.content')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
