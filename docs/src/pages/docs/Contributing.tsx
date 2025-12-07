import { Check, GitFork, Heart } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { CodeBlock } from '../../components/ui/CodeBlock'

export const Contributing: React.FC = () => {
  const { t } = useTranslation()

  const cloneCode = `# Fork the repository on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/react-devtools-plus.git
cd react-devtools-plus`

  const installCode = `# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development
pnpm dev`

  const prCode = `# Create a new branch
git checkout -b feat/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to your fork
git push origin feat/your-feature-name

# Create a Pull Request on GitHub`

  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="mb-4 text-4xl text-white font-bold">{t('docs.contributing.title')}</h1>

      <p className="text-lg text-slate-300 leading-relaxed">
        {t('docs.contributing.description')}
      </p>

      <div className="not-prose from-brand-500/10 my-8 border border-white/10 rounded-2xl to-purple-500/10 bg-gradient-to-br p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-pink-500/20 p-3">
            <Heart className="h-6 w-6 text-pink-400" />
          </div>
          <div>
            <h3 className="text-lg text-white font-semibold">{t('docs.contributing.welcome.title')}</h3>
            <p className="mt-2 text-slate-300">{t('docs.contributing.welcome.description')}</p>
          </div>
        </div>
      </div>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.contributing.ways.title')}</h2>
      <ul className="my-4 text-slate-300 space-y-3">
        {(t('docs.contributing.ways.items', { returnObjects: true }) as string[]).map((item, idx) => (
          <li key={`way-${idx}`} className="flex items-start gap-3">
            <Check className="text-brand-400 mt-0.5 h-5 w-5 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.contributing.setup.title')}</h2>

      <h3 className="mb-3 mt-6 text-xl text-white font-semibold">{t('docs.contributing.setup.clone.title')}</h3>
      <CodeBlock code={cloneCode} language="bash" title="Terminal" />

      <h3 className="mb-3 mt-6 text-xl text-white font-semibold">{t('docs.contributing.setup.install.title')}</h3>
      <CodeBlock code={installCode} language="bash" title="Terminal" />

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.contributing.pr.title')}</h2>
      <p className="text-slate-300">{t('docs.contributing.pr.description')}</p>
      <CodeBlock code={prCode} language="bash" title="Terminal" />

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.contributing.guidelines.title')}</h2>
      <ul className="my-4 text-slate-300 space-y-3">
        {(t('docs.contributing.guidelines.items', { returnObjects: true }) as string[]).map((item, idx) => (
          <li key={`guideline-${idx}`} className="flex items-start gap-3">
            <span className="bg-brand-400 mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
            {item}
          </li>
        ))}
      </ul>

      <div className="not-prose mt-10 flex flex-wrap gap-4">
        <a
          href="https://github.com/wzc520pyfm/react-devtools-plus/fork"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm text-white font-medium transition-colors"
        >
          <GitFork className="h-4 w-4" />
          {t('docs.contributing.cta.fork')}
        </a>
        <a
          href="https://github.com/wzc520pyfm/react-devtools-plus/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-white/10 rounded-full bg-white/5 px-6 py-3 text-sm text-white font-medium transition-colors hover:bg-white/10"
        >
          {t('docs.contributing.cta.issues')}
        </a>
      </div>
    </div>
  )
}
