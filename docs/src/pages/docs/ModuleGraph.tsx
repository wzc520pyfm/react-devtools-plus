import { GitBranch, Info } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const ModuleGraph: React.FC = () => {
  const { t } = useTranslation()

  const features = t('docs.moduleGraph.features.items', { returnObjects: true }) as Array<{
    title: string
    description: string
  }>

  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="mb-4 text-4xl text-white font-bold">{t('docs.moduleGraph.title')}</h1>

      <p className="text-lg text-slate-300 leading-relaxed">
        {t('docs.moduleGraph.description')}
      </p>

      {/* Module Graph Screenshot */}
      <div className="not-prose my-8 overflow-hidden border-white/10 rounded-2xl border-none">
        <img
          src="/screenshots/modules.png"
          alt="Module Graph Overview"
          className="w-full rounded-2xl"
        />
      </div>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.moduleGraph.whatIs.title')}</h2>
      <p className="text-slate-300">{t('docs.moduleGraph.whatIs.description')}</p>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.moduleGraph.features.title')}</h2>

      <div className="not-prose grid my-6 gap-4 md:grid-cols-2">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="border border-white/10 rounded-xl bg-white/[0.02] p-5"
          >
            <div className="flex items-center gap-3">
              <div className="bg-brand-500/20 h-8 w-8 flex items-center justify-center rounded-lg">
                <GitBranch className="text-brand-400 h-4 w-4" />
              </div>
              <h3 className="text-white font-semibold">{feature.title}</h3>
            </div>
            <p className="mt-3 text-sm text-slate-400">{feature.description}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.moduleGraph.howTo.title')}</h2>

      <ol className="my-4 text-slate-300 space-y-3">
        {(t('docs.moduleGraph.howTo.steps', { returnObjects: true }) as string[]).map((step, idx) => (
          <li key={idx} className="flex gap-4">
            <span className="bg-brand-500/20 text-brand-400 h-7 w-7 flex flex-shrink-0 items-center justify-center rounded-full text-sm font-medium">
              {idx + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>

      <div className="not-prose my-6 border border-blue-500/30 rounded-xl bg-blue-500/10 p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
          <div>
            <p className="text-sm text-blue-300 font-medium">{t('docs.moduleGraph.tip.title')}</p>
            <p className="mt-1 text-sm text-blue-300/80">{t('docs.moduleGraph.tip.content')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
