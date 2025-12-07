import { Github, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/Button'

export const OpenSource: React.FC = () => {
  const { t } = useTranslation()
  const pillars = (t('openSource.pillars', { returnObjects: true }) as Array<{
    title: string
    description: string
  }>).map((item, idx) => ({
    ...item,
    icon: [ShieldCheck, HeartHandshake, Sparkles][idx],
  }))

  return (
    <section id="community" className="relative overflow-hidden bg-slate-950 py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(14,165,233,0.08),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(139,92,246,0.08),transparent_35%)]" />
      <div className="container relative mx-auto px-6">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 border border-white/10 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
            <Github className="h-4 w-4" />
            {t('openSource.badge')}
          </p>
          <h2 className="mt-4 text-3xl text-white font-bold md:text-4xl">
            {t('openSource.title')}
          </h2>
          <p className="mt-3 text-lg text-slate-400">
            {t('openSource.subtitle')}
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button
              withBeam
              className="w-full sm:w-auto"
              onClick={() => window.open('https://github.com/vuejs/devtools', '_blank')}
            >
              {t('openSource.primary')}
            </Button>
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => window.open('https://github.com/vuejs/devtools/issues', '_blank')}
            >
              {t('openSource.secondary')}
            </Button>
          </div>
        </div>

        <div className="grid mt-12 gap-6 md:grid-cols-3">
          {pillars.map(pillar => (
            <div
              key={pillar.title}
              className="group relative overflow-hidden border border-white/10 rounded-3xl bg-white/[0.02] p-6 backdrop-blur-sm"
            >
              <div className="absolute inset-0 from-white/0 via-white/5 to-white/0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="mb-4 w-fit border border-white/10 rounded-2xl bg-white/5 p-3">
                <pillar.icon className="text-brand-300 h-5 w-5" />
              </div>
              <h3 className="text-xl text-white font-semibold">{pillar.title}</h3>
              <p className="mt-2 text-slate-400 leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
