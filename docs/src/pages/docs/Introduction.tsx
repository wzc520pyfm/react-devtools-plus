import { ArrowRight, CheckCircle, Zap } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export const Introduction: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="mb-4 text-4xl text-white font-bold">{t('docs.introduction.title')}</h1>

      <p className="text-lg text-slate-300 leading-relaxed">
        {t('docs.introduction.description')}
      </p>

      {/* DevTools Overview Screenshot */}
      <div className="not-prose my-8 overflow-hidden border border-white/10 rounded-2xl">
        <img
          src="/screenshots/overview-full.png"
          alt="React DevTools Plus Overview"
          className="w-full"
        />
      </div>

      <div className="not-prose my-8 border border-white/10 rounded-2xl bg-white/5 p-6">
        <h2 className="mb-4 text-xl text-white font-semibold">{t('docs.introduction.whatIs.title')}</h2>
        <p className="text-slate-300 leading-relaxed">
          {t('docs.introduction.whatIs.description')}
        </p>
      </div>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.introduction.whyUse.title')}</h2>
      <p className="text-slate-300 leading-relaxed">
        {t('docs.introduction.whyUse.description')}
      </p>

      <ul className="my-6 space-y-3">
        {(t('docs.introduction.whyUse.benefits', { returnObjects: true }) as string[]).map((benefit, idx) => (
          <li key={idx} className="flex items-start gap-3 text-slate-300">
            <CheckCircle className="text-brand-400 mt-0.5 h-5 w-5 flex-shrink-0" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.introduction.coreFeatures.title')}</h2>
      <div className="not-prose grid gap-4 sm:grid-cols-2">
        {(t('docs.introduction.coreFeatures.items', { returnObjects: true }) as Array<{ title: string, description: string }>).map((feature, idx) => (
          <div key={idx} className="border border-white/10 rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
            <h3 className="mb-2 text-lg text-white font-semibold">{feature.title}</h3>
            <p className="text-sm text-slate-400">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="not-prose mt-10 flex flex-wrap gap-4">
        <Link
          to="/docs/installation"
          className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm text-white font-medium transition-colors"
        >
          <Zap className="h-4 w-4" />
          {t('docs.introduction.getStarted')}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/features"
          className="inline-flex items-center gap-2 border border-white/10 rounded-full bg-white/5 px-6 py-3 text-sm text-white font-medium transition-colors hover:bg-white/10"
        >
          {t('docs.introduction.exploreFeatures')}
        </Link>
      </div>
    </div>
  )
}
