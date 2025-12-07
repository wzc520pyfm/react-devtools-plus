import { Check, Info, Keyboard } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { CodeBlock } from '../../components/ui/CodeBlock'

export const OpenInEditor: React.FC = () => {
  const { t } = useTranslation()

  const editorEnvExample = `# For VS Code
EDITOR=code pnpm dev

# For Cursor
EDITOR=cursor pnpm dev

# For WebStorm
EDITOR=webstorm pnpm dev

# For Vim
EDITOR=vim pnpm dev`

  const packageJsonExample = `{
  "scripts": {
    "dev": "EDITOR=code vite",
    "dev:cursor": "EDITOR=cursor vite"
  }
}`

  const localStorageExample = `// Configure fallback editor in browser
localStorage.setItem('react_devtools_editor', 'cursor')
// Options: 'vscode', 'cursor', 'webstorm', 'sublime', etc.`

  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="mb-4 text-4xl text-white font-bold">{t('docs.openInEditor.title')}</h1>

      <p className="text-lg text-slate-300 leading-relaxed">
        {t('docs.openInEditor.description')}
      </p>

      {/* Placeholder for screenshot */}
      <div className="not-prose my-8 h-80 flex items-center justify-center border border-white/20 rounded-2xl border-dashed bg-white/5">
        <div className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 flex items-center justify-center rounded-full bg-white/10">
            <Keyboard className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-400">{t('docs.common.screenshotPlaceholder')}</p>
          <p className="mt-1 text-xs text-slate-500">Open in Editor Demo</p>
        </div>
      </div>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.openInEditor.howItWorks.title')}</h2>
      <p className="text-slate-300">{t('docs.openInEditor.howItWorks.description')}</p>

      <ol className="my-4 text-slate-300 space-y-4">
        {(t('docs.openInEditor.howItWorks.steps', { returnObjects: true }) as string[]).map((step, idx) => (
          <li key={`step-${idx}`} className="flex gap-4">
            <span className="bg-brand-500/20 text-brand-400 h-7 w-7 flex flex-shrink-0 items-center justify-center rounded-full text-sm font-medium">
              {idx + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.openInEditor.inspector.title')}</h2>
      <p className="text-slate-300">{t('docs.openInEditor.inspector.description')}</p>

      <ol className="my-4 text-slate-300 space-y-2">
        {(t('docs.openInEditor.inspector.steps', { returnObjects: true }) as string[]).map((step, idx) => (
          <li key={`inspector-${idx}`} className="flex gap-3">
            <span className="text-brand-400 font-medium">
              {idx + 1}
              .
            </span>
            {step}
          </li>
        ))}
      </ol>

      {/* Placeholder for screenshot */}
      <div className="not-prose my-8 h-64 flex items-center justify-center border border-white/20 rounded-2xl border-dashed bg-white/5">
        <div className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 flex items-center justify-center rounded-full bg-white/10">
            <Info className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-400">{t('docs.common.screenshotPlaceholder')}</p>
          <p className="mt-1 text-xs text-slate-500">Inspector Mode Selection</p>
        </div>
      </div>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.openInEditor.editorConfig.title')}</h2>
      <p className="text-slate-300">{t('docs.openInEditor.editorConfig.description')}</p>

      <h3 className="mb-3 mt-6 text-xl text-white font-semibold">{t('docs.openInEditor.editorConfig.env.title')}</h3>
      <CodeBlock code={editorEnvExample} language="bash" title="Environment Variables" />

      <h3 className="mb-3 mt-6 text-xl text-white font-semibold">{t('docs.openInEditor.editorConfig.packageJson.title')}</h3>
      <CodeBlock code={packageJsonExample} language="json" title="package.json" />

      <h3 className="mb-3 mt-6 text-xl text-white font-semibold">{t('docs.openInEditor.editorConfig.fallback.title')}</h3>
      <CodeBlock code={localStorageExample} language="javascript" title="Browser Console" />

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.openInEditor.support.title')}</h2>
      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-3 pr-4 text-slate-300 font-semibold">{t('docs.openInEditor.support.environment')}</th>
              <th className="py-3 text-slate-300 font-semibold">{t('docs.openInEditor.support.status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <tr>
              <td className="py-3 pr-4 text-slate-300">Vite</td>
              <td className="py-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                  <Check className="h-3 w-3" />
                  {' '}
                  Full Support
                </span>
              </td>
            </tr>
            <tr>
              <td className="py-3 pr-4 text-slate-300">Webpack</td>
              <td className="py-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                  <Check className="h-3 w-3" />
                  {' '}
                  Full Support
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="not-prose border-brand-500/30 bg-brand-500/10 my-6 border rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="text-brand-400 mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="text-brand-300 text-sm font-medium">{t('docs.openInEditor.tip.title')}</p>
            <p className="text-brand-300/80 mt-1 text-sm">{t('docs.openInEditor.tip.content')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
