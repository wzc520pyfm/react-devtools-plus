import { ArrowRight, Check, Copy, Terminal } from 'lucide-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const CodeBlock: React.FC<{ code: string, language?: string, title?: string }> = ({ code, language = 'bash', title }) => {
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

export const Installation: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="mb-4 text-4xl text-white font-bold">{t('docs.installation.title')}</h1>

      <p className="text-lg text-slate-300 leading-relaxed">
        {t('docs.installation.description')}
      </p>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.installation.prerequisites.title')}</h2>
      <ul className="my-4 text-slate-300 space-y-2">
        <li>React 16.8+ / 17 / 18 / 19</li>
        <li>
          Vite 4+ / 5+ / 6+
          {t('docs.installation.prerequisites.or')}
          {' '}
          Webpack 4+ / 5+
        </li>
        <li>Node.js 16+</li>
      </ul>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.installation.install.title')}</h2>
      <p className="text-slate-300">{t('docs.installation.install.description')}</p>

      <div className="not-prose my-6 space-y-4">
        <div className="border border-white/10 rounded-xl bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Terminal className="text-brand-400 h-4 w-4" />
            <span className="text-sm text-slate-300 font-medium">pnpm</span>
            <span className="bg-brand-500/20 text-brand-400 rounded px-2 py-0.5 text-xs">{t('docs.installation.recommended')}</span>
          </div>
          <CodeBlock code="pnpm add -D react-devtools-plus" />
        </div>

        <div className="border border-white/10 rounded-xl bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-300 font-medium">npm</span>
          </div>
          <CodeBlock code="npm install -D react-devtools-plus" />
        </div>

        <div className="border border-white/10 rounded-xl bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-300 font-medium">yarn</span>
          </div>
          <CodeBlock code="yarn add -D react-devtools-plus" />
        </div>
      </div>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.installation.nextSteps.title')}</h2>
      <p className="text-slate-300">{t('docs.installation.nextSteps.description')}</p>

      <div className="not-prose mt-6 flex flex-wrap gap-4">
        <Link
          to="/docs/integration/vite"
          className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm text-white font-medium transition-colors"
        >
          {t('docs.installation.nextSteps.vite')}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/docs/integration/webpack"
          className="inline-flex items-center gap-2 border border-white/10 rounded-full bg-white/5 px-6 py-3 text-sm text-white font-medium transition-colors hover:bg-white/10"
        >
          {t('docs.installation.nextSteps.webpack')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
