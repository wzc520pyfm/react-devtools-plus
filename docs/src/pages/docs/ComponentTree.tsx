import { Info } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const ComponentTree: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="mb-4 text-4xl text-white font-bold">{t('docs.componentTree.title')}</h1>

      <p className="text-lg text-slate-300 leading-relaxed">
        {t('docs.componentTree.description')}
      </p>

      {/* Component Tree Overview Screenshot */}
      <div className="not-prose my-8 overflow-hidden border border-white/10 rounded-2xl">
        <img
          src="/screenshots/component-tree.png"
          alt="Component Tree Overview"
          className="w-full"
        />
      </div>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.componentTree.features.title')}</h2>
      <ul className="my-4 text-slate-300 space-y-3">
        {(t('docs.componentTree.features.items', { returnObjects: true }) as string[]).map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="bg-brand-400 mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
            {item}
          </li>
        ))}
      </ul>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.componentTree.howTo.title')}</h2>
      <ol className="my-4 text-slate-300 space-y-4">
        {(t('docs.componentTree.howTo.steps', { returnObjects: true }) as string[]).map((step, idx) => (
          <li key={idx} className="flex gap-4">
            <span className="bg-brand-500/20 text-brand-400 h-7 w-7 flex flex-shrink-0 items-center justify-center rounded-full text-sm font-medium">
              {idx + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>

      {/* Component Selection Screenshot */}
      <div className="not-prose my-8 overflow-hidden border border-white/10 rounded-2xl">
        <img
          src="/screenshots/component-tree-detail.png"
          alt="Component Selection Demo"
          className="w-full"
        />
      </div>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.componentTree.props.title')}</h2>
      <p className="text-slate-300">{t('docs.componentTree.props.description')}</p>

      <div className="not-prose border-brand-500/30 bg-brand-500/10 my-6 border rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="text-brand-400 mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="text-brand-300 text-sm font-medium">{t('docs.componentTree.tip.title')}</p>
            <p className="text-brand-300/80 mt-1 text-sm">{t('docs.componentTree.tip.content')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
