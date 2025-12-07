import { GitBranch, MessageSquare, Sparkles, Star } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/Button'

const icons = [Star, MessageSquare, GitBranch, Sparkles]

export const Testimonials: React.FC = () => {
  const { t } = useTranslation()
  const actions = t('testimonials.actions', { returnObjects: true }) as Array<{
    title: string
    description: string
  }>

  return (
    <section id="testimonials" className="relative bg-slate-950 py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.05),_transparent_50%)]" />
      <div className="container relative mx-auto px-6">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="text-3xl text-white font-bold md:text-4xl">
            {t('testimonials.title')}
          </h2>
          <p className="mt-4 text-slate-400">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid items-center gap-4 md:grid-cols-[1.1fr_1fr]">
          <div className="border border-white/10 rounded-3xl bg-white/[0.02] p-8 backdrop-blur-sm">
            <p className="text-brand-200 mb-3 text-sm tracking-[0.25em] uppercase">early stage</p>
            <h3 className="mb-3 text-2xl text-white font-semibold">
              Help us prioritize what matters for your stack.
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Share your framework versions, routing setup, Suspense usage, or perf blockers. We’ll tailor
              the roadmap around real-world needs—not vanity features.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                withBeam
                className="w-full sm:w-auto"
                onClick={() => window.open('https://github.com/vuejs/devtools', '_blank')}
              >
                {t('testimonials.ctaPrimary')}
              </Button>
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => window.open('https://github.com/vuejs/devtools/issues/new', '_blank')}
              >
                {t('testimonials.ctaSecondary')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {actions.map((action, idx) => {
              const Icon = icons[idx % icons.length]
              return (
                <div
                  key={action.title}
                  className="relative overflow-hidden border border-white/10 rounded-2xl bg-white/[0.02] p-5 backdrop-blur-sm"
                >
                  <div className="absolute inset-0 from-white/0 via-white/5 to-white/0 bg-gradient-to-br opacity-0 transition-opacity duration-500 hover:opacity-100" />
                  <div className="mb-3 flex items-center gap-3">
                    <div className="border border-white/10 rounded-xl bg-white/5 p-2.5">
                      <Icon className="text-brand-300 h-4 w-4" />
                    </div>
                    <h4 className="text-sm text-white font-semibold">{action.title}</h4>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{action.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
