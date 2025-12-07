import { ArrowRight, Code2, Download, Keyboard } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/Button'

export const Integration: React.FC = () => {
  const { t } = useTranslation()
  const highlights = t('integration.highlights', { returnObjects: true }) as string[]
  const steps = [
    {
      title: t('integration.steps.0.title'),
      description: t('integration.steps.0.description'),
      icon: Download,
      badge: t('integration.steps.0.badge'),
    },
    {
      title: t('integration.steps.1.title'),
      description: t('integration.steps.1.description'),
      icon: Code2,
      badge: t('integration.steps.1.badge'),
    },
    {
      title: t('integration.steps.2.title'),
      description: t('integration.steps.2.description'),
      icon: Keyboard,
      badge: t('integration.steps.2.badge'),
    },
  ]

  return (
    <section id="integration" className="relative overflow-hidden from-slate-950 via-slate-950 to-slate-900 bg-gradient-to-b py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(139,92,246,0.06),transparent_30%)]" />
      <div className="container relative mx-auto px-6">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
          <div className="lg:w-1/2 space-y-6">
            <div className="w-fit inline-flex items-center gap-2 border border-white/10 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
              <span className="h-2 w-2 flex animate-pulse rounded-full bg-green-400" />
              <span>{t('integration.badge')}</span>
            </div>
            <h2 className="text-3xl text-white font-bold md:text-4xl">
              {t('integration.title')}
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              {t('integration.subtitle')}
            </p>
            <ul className="grid gap-3">
              {highlights.map(item => (
                <li key={item} className="flex items-start gap-3 text-slate-300">
                  <div className="bg-brand-400 mt-1 h-2.5 w-2.5 rounded-full shadow-[0_0_0_6px_rgba(14,165,233,0.1)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button withBeam className="w-full sm:w-auto">
                {t('integration.primaryCta')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="secondary" className="w-full sm:w-auto">
                {t('integration.secondaryCta')}
              </Button>
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="grid gap-4">
              {steps.map((step, idx) => (
                <div
                  key={step.title}
                  className="group relative overflow-hidden border border-white/10 rounded-3xl bg-white/[0.03] px-6 py-5"
                >
                  <div className="from-brand-500/5 to-accent-600/5 absolute inset-0 via-white/0 bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="border border-white/10 rounded-full bg-white/5 px-3 py-1 text-[11px] text-slate-400 tracking-[0.2em] uppercase">
                        {step.badge}
                      </div>
                      {idx < steps.length - 1 && (
                        <div className="mt-2 h-full w-px from-white/20 via-white/5 to-transparent bg-gradient-to-b" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="border border-white/10 rounded-2xl bg-white/5 p-3">
                          <step.icon className="text-brand-300 h-5 w-5" />
                        </div>
                        <h3 className="text-xl text-white font-semibold">{step.title}</h3>
                      </div>
                      <p className="text-slate-400 leading-relaxed">{step.description}</p>
                    </div>
                    <Code2 className="group-hover:text-brand-300 h-5 w-5 text-slate-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
