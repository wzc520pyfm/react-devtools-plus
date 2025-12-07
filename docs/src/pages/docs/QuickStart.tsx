import { ArrowRight, Keyboard } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CodeBlock } from '../../components/ui/CodeBlock'

export const QuickStart: React.FC = () => {
  const { t } = useTranslation()

  const viteConfigCode = `import react from '@vitejs/plugin-react'
import { reactDevToolsPlus } from 'react-devtools-plus/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    reactDevToolsPlus(),
  ],
})`

  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="mb-4 text-4xl text-white font-bold">{t('docs.quickStart.title')}</h1>

      <p className="text-lg text-slate-300 leading-relaxed">
        {t('docs.quickStart.description')}
      </p>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.quickStart.step1.title')}</h2>
      <CodeBlock code="pnpm add -D react-devtools-plus" language="bash" title="Terminal" showLineNumbers={false} />

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.quickStart.step2.title')}</h2>
      <p className="text-slate-300">{t('docs.quickStart.step2.description')}</p>
      <CodeBlock code={viteConfigCode} language="ts" title="vite.config.ts" />

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.quickStart.step3.title')}</h2>
      <CodeBlock code="pnpm dev" language="bash" title="Terminal" showLineNumbers={false} />

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.quickStart.step4.title')}</h2>
      <p className="text-slate-300">{t('docs.quickStart.step4.description')}</p>

      <div className="not-prose my-6 border border-white/10 rounded-xl bg-white/5 p-6">
        <div className="flex items-center gap-4">
          <div className="bg-brand-500/20 rounded-lg p-3">
            <Keyboard className="text-brand-400 h-6 w-6" />
          </div>
          <div>
            <p className="text-lg text-white font-semibold">
              <kbd className="border border-white/20 rounded bg-white/10 px-2 py-1 text-sm">Alt</kbd>
              {' + '}
              <kbd className="border border-white/20 rounded bg-white/10 px-2 py-1 text-sm">Shift</kbd>
              {' + '}
              <kbd className="border border-white/20 rounded bg-white/10 px-2 py-1 text-sm">R</kbd>
            </p>
            <p className="mt-1 text-sm text-slate-400">{t('docs.quickStart.step4.hint')}</p>
          </div>
        </div>
      </div>

      <p className="text-slate-300">{t('docs.quickStart.step4.alternative')}</p>
      <CodeBlock code="http://localhost:5173/__react_devtools__/" language="text" showLineNumbers={false} />

      <div className="not-prose mt-10 flex flex-wrap gap-4">
        <Link
          to="/docs/integration/vite"
          className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm text-white font-medium transition-colors"
        >
          {t('docs.quickStart.learnMore.vite')}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/features"
          className="inline-flex items-center gap-2 border border-white/10 rounded-full bg-white/5 px-6 py-3 text-sm text-white font-medium transition-colors hover:bg-white/10"
        >
          {t('docs.quickStart.learnMore.features')}
        </Link>
      </div>
    </div>
  )
}
