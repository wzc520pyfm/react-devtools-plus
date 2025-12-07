import { Gauge, ShieldCheck, Sparkles, Timer } from 'lucide-react'
import React from 'react'

const stats = [
  {
    label: 'Engineering teams',
    value: '12k+',
    detail: 'Using DevTools+ weekly',
    icon: Sparkles,
  },
  {
    label: 'Render insight speed',
    value: '24ms',
    detail: 'Avg. time-to-signal',
    icon: Timer,
  },
  {
    label: 'Fewer production bugs',
    value: '38%',
    detail: 'Reported after 30 days',
    icon: Gauge,
  },
  {
    label: 'Enterprise ready',
    value: 'SOC2',
    detail: 'Security by default',
    icon: ShieldCheck,
  },
]

export const Stats: React.FC = () => {
  return (
    <section className="relative bg-slate-950 py-16 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.07),_transparent_45%)]" />
      <div className="container relative mx-auto px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 sm:grid-cols-2">
          {stats.map(stat => (
            <div
              key={stat.label}
              className="group relative overflow-hidden border border-white/10 rounded-3xl bg-white/[0.02] px-6 py-6 backdrop-blur-sm"
            >
              <div className="absolute inset-0 from-white/0 via-white/5 to-white/0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 tracking-[0.2em] uppercase">{stat.label}</p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-4xl text-white font-bold">{stat.value}</span>
                    <span className="text-sm text-slate-400">{stat.detail}</span>
                  </div>
                </div>
                <div className="border border-white/10 rounded-2xl bg-white/5 p-3">
                  <stat.icon className="text-brand-300 h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
