import { Rocket, ShieldCheck, Sparkles, Terminal } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { GlowCard, GlowCardGrid } from './ui/GlowCard'

export const ValueProps: React.FC = () => {
  const { t } = useTranslation()
  const valueProps = (t('valueProps.items', { returnObjects: true }) as Array<{
    title: string
    description: string
  }>).map((item, idx) => ({
    ...item,
    icon: [ShieldCheck, Rocket, Terminal, Sparkles][idx],
  }))

  return (
    <section className="relative overflow-hidden from-[#050712] via-slate-950 to-slate-950 bg-gradient-to-b py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.08),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.07),transparent_40%)]" />
      <div className="container relative mx-auto px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 border border-white/10 rounded-full bg-white/5 px-4 py-2 text-xs text-slate-300 tracking-[0.25em] uppercase">
            {t('valueProps.badge')}
          </div>
          <h2 className="mt-4 text-3xl text-white font-bold md:text-4xl">
            {t('valueProps.title')}
          </h2>
          <p className="mt-3 text-slate-400">
            {t('valueProps.subtitle')}
          </p>
        </div>

        <GlowCardGrid className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {mousePosition => (
            <>
              {valueProps.map(item => (
                <GlowCard key={item.title} mousePosition={mousePosition}>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="border border-white/10 rounded-2xl bg-white/5 p-3">
                      <item.icon className="text-brand-300 h-5 w-5" />
                    </div>
                    <h3 className="text-xl text-white font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-slate-400 leading-relaxed">{item.description}</p>
                </GlowCard>
              ))}
            </>
          )}
        </GlowCardGrid>
      </div>
    </section>
  )
}
