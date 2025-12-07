import { ArrowRight, BookOpen } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/Button'

export const DocsCTA: React.FC = () => {
  const { t } = useTranslation()
  return (
    <section id="docs" className="relative overflow-hidden py-20">
      <div className="from-brand-500/10 via-accent-500/10 pointer-events-none absolute inset-0 to-transparent bg-gradient-to-r" />
      <div className="container relative mx-auto px-6">
        <div className="overflow-hidden border border-white/10 rounded-3xl bg-white/[0.03] p-10 md:p-14">
          <div className="bg-brand-500/20 absolute h-64 w-64 blur-3xl -right-24 -top-24" />
          <div className="bg-accent-500/20 absolute h-64 w-64 blur-3xl -bottom-24 -left-24" />
          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 border border-white/10 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                <BookOpen className="text-brand-200 h-4 w-4" />
                {t('docsCTA.badge')}
              </div>
              <h2 className="text-3xl text-white font-bold md:text-4xl">
                {t('docsCTA.title')}
              </h2>
              <p className="mt-4 max-w-2xl text-slate-300">
                {t('docsCTA.subtitle')}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button withBeam className="w-full sm:w-auto">
                  {t('docsCTA.primary')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="secondary" className="w-full sm:w-auto">
                  {t('docsCTA.secondary')}
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-4 rounded-3xl from-white/5 to-white/0 bg-gradient-to-br blur-2xl" />
              <div className="relative border border-white/10 rounded-3xl bg-slate-950/80 p-6 shadow-2xl">
                <div className="mb-3 flex items-center gap-2 text-xs text-slate-400 tracking-[0.2em] uppercase">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                  Live playground
                </div>
                <div className="text-sm text-slate-200 font-mono space-y-3">
                  <div className="flex items-center justify-between border border-white/5 rounded-2xl bg-white/5 px-4 py-3">
                    <span className="text-slate-300">{t('docsCTA.snippets.install')}</span>
                    <span className="text-brand-300">✔</span>
                  </div>
                  <div className="border border-white/5 rounded-2xl bg-white/5 px-4 py-3">
                    <p className="text-brand-200">{t('docsCTA.snippets.configTitle')}</p>
                    <p className="text-slate-300">{t('docsCTA.snippets.configMode')}</p>
                    <p className="text-slate-300">{t('docsCTA.snippets.configCapture')}</p>
                  </div>
                  <div className="border border-white/5 rounded-2xl bg-white/5 px-4 py-3">
                    <p className="text-slate-300">{t('docsCTA.snippets.run')}</p>
                    <p className="mt-1 text-xs text-slate-400">{t('docsCTA.snippets.runDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
