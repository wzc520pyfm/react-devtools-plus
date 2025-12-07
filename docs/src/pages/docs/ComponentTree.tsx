import { Info, Layers } from 'lucide-react'
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

      {/* Placeholder for screenshot */}
      <div className="not-prose my-8 h-80 flex items-center justify-center border border-white/20 rounded-2xl border-dashed bg-white/5">
        <div className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 flex items-center justify-center rounded-full bg-white/10">
            <Layers className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-400">{t('docs.common.screenshotPlaceholder')}</p>
          <p className="mt-1 text-xs text-slate-500">Component Tree Overview</p>
        </div>
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

      {/* Placeholder for screenshot */}
      <div className="not-prose my-8 h-64 flex items-center justify-center border border-white/20 rounded-2xl border-dashed bg-white/5">
        <div className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 flex items-center justify-center rounded-full bg-white/10">
            <Info className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-400">{t('docs.common.screenshotPlaceholder')}</p>
          <p className="mt-1 text-xs text-slate-500">Component Selection Demo</p>
        </div>
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
