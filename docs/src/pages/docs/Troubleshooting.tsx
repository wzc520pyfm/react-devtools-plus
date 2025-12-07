import { AlertTriangle, Check, Copy, Info } from 'lucide-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

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
      <pre className="overflow-x-auto p-4">
        <code className={`language-${language} text-sm text-slate-300`}>{code}</code>
      </pre>
    </div>
  )
}

export const Troubleshooting: React.FC = () => {
  const { t } = useTranslation()

  const buildFix = `# Rebuild the plugin
cd packages/react-devtools
pnpm build`

  const cliInstall = `# For Cursor
# Open Cursor → Cmd+Shift+P → "Shell Command: Install 'cursor' command in PATH"

# For VS Code  
# Open VS Code → Cmd+Shift+P → "Shell Command: Install 'code' command in PATH"

# Verify installation
cursor --version
code --version`

  const editorFallback = `// In browser console, set fallback editor
localStorage.setItem('react_devtools_editor', 'code')
// Or: 'cursor', 'webstorm', 'sublime'`

  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="mb-4 text-4xl text-white font-bold">{t('docs.troubleshooting.title')}</h1>

      <p className="text-lg text-slate-300 leading-relaxed">
        {t('docs.troubleshooting.description')}
      </p>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.troubleshooting.pluginNotLoading.title')}</h2>
      <p className="text-slate-300">{t('docs.troubleshooting.pluginNotLoading.description')}</p>
      <CodeBlock code={buildFix} title="Terminal" />

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.troubleshooting.editorNotOpening.title')}</h2>

      <div className="not-prose my-6 border border-yellow-500/30 rounded-xl bg-yellow-500/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
          <div>
            <p className="text-sm text-yellow-300 font-medium">{t('docs.troubleshooting.editorNotOpening.error')}</p>
            <p className="mt-1 text-sm text-yellow-300/80">{t('docs.troubleshooting.editorNotOpening.cause')}</p>
          </div>
        </div>
      </div>

      <h3 className="mb-3 mt-6 text-xl text-white font-semibold">{t('docs.troubleshooting.editorNotOpening.solution.title')}</h3>
      <CodeBlock code={cliInstall} title="Install CLI Tool" />

      <h3 className="mb-3 mt-6 text-xl text-white font-semibold">{t('docs.troubleshooting.editorNotOpening.fallback.title')}</h3>
      <CodeBlock code={editorFallback} title="Browser Console" />

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.troubleshooting.overlayNotShowing.title')}</h2>
      <p className="text-slate-300">{t('docs.troubleshooting.overlayNotShowing.description')}</p>
      <ul className="my-4 text-slate-300 space-y-2">
        {(t('docs.troubleshooting.overlayNotShowing.checks', { returnObjects: true }) as string[]).map((check, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="bg-brand-400 mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
            {check}
          </li>
        ))}
      </ul>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.troubleshooting.conflictWithExtension.title')}</h2>
      <p className="text-slate-300">{t('docs.troubleshooting.conflictWithExtension.description')}</p>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.troubleshooting.sourceLocations.title')}</h2>
      <p className="text-slate-300">{t('docs.troubleshooting.sourceLocations.description')}</p>
      <ul className="my-4 text-slate-300 space-y-2">
        {(t('docs.troubleshooting.sourceLocations.checks', { returnObjects: true }) as string[]).map((check, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="bg-brand-400 mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
            {check}
          </li>
        ))}
      </ul>

      <div className="not-prose my-8 border border-white/10 rounded-2xl bg-white/5 p-6">
        <div className="flex items-start gap-4">
          <div className="bg-brand-500/20 rounded-xl p-3">
            <Info className="text-brand-400 h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg text-white font-semibold">{t('docs.troubleshooting.stillStuck.title')}</h3>
            <p className="mt-2 text-slate-300">
              {t('docs.troubleshooting.stillStuck.description')}
              {' '}
              <a
                href="https://github.com/nicepkg/react-devtools-plus/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-400 hover:text-brand-300"
              >
                {t('docs.troubleshooting.stillStuck.link')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
