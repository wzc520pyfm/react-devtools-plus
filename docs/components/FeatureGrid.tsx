import { Activity, Layers, Search, Zap } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const iconMap = [Activity, Search, Layers, Zap]

export const FeatureGrid: React.FC = () => {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [cardsAnimated, setCardsAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
          // 卡片滑入动画完成后触发线条动画
          setTimeout(() => {
            setCardsAnimated(true)
          }, 800) // 卡片动画时长 0.8s + 最后一张卡片延迟 0.3s
        }
      },
      { threshold: 0.4 }, // 提高阈值，需要更多内容进入视窗才触发
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  // 根据卡片位置决定滑入方向：第一行左边/第二行左边 从左滑入，其他从右滑入
  const getSlideDirection = (idx: number) => {
    // idx 0: 左侧大卡片, idx 1: 右侧小卡片, idx 2: 左侧小卡片, idx 3: 右侧大卡片
    return idx === 0 || idx === 2 ? 'left' : 'right'
  }

  const features = [
    {
      title: t('features.items.dropIn.title'),
      description: t('features.items.dropIn.description'),
      icon: iconMap[0],
      className: 'md:col-span-2',
      gradient: 'from-brand-500/20 to-brand-900/5',
    },
    {
      title: t('features.items.fiber.title'),
      description: t('features.items.fiber.description'),
      icon: iconMap[1],
      className: 'md:col-span-1',
      gradient: 'from-accent-500/20 to-accent-900/5',
    },
    {
      title: t('features.items.keyboard.title'),
      description: t('features.items.keyboard.description'),
      icon: iconMap[2],
      className: 'md:col-span-1',
      gradient: 'from-blue-500/20 to-blue-900/5',
    },
    {
      title: t('features.items.safe.title'),
      description: t('features.items.safe.description'),
      icon: iconMap[3],
      className: 'md:col-span-2',
      gradient: 'from-cyan-500/20 to-cyan-900/5',
    },
  ]

  return (
    <section ref={sectionRef} id="features" className="relative overflow-hidden from-slate-950 via-slate-950 to-[#050712] bg-gradient-to-b py-24">
      {/* Glows */}
      <div className="bg-brand-500/10 pointer-events-none absolute right-0 top-0 h-1/2 w-1/2 rounded-full blur-[160px]" />
      <div className="bg-accent-500/10 pointer-events-none absolute bottom-0 left-0 h-1/2 w-1/2 rounded-full blur-[160px]" />

      <div className="container mx-auto px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 border border-white/10 rounded-full bg-white/5 px-4 py-2 text-xs text-slate-300 tracking-[0.25em] uppercase">
            {t('features.badge')}
          </div>
          <h2 className="mb-4 mt-4 text-3xl text-white font-bold md:text-5xl">
            {t('features.title')}
          </h2>
          <p className="text-lg text-slate-400">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature, idx) => {
            const slideDirection = getSlideDirection(idx)
            const slideClass = isVisible
              ? 'opacity-100 translate-x-0'
              : slideDirection === 'left'
                ? 'opacity-0 -translate-x-20'
                : 'opacity-0 translate-x-20'

            return (
              <div
                key={idx}
                className={`group relative overflow-hidden border border-white/10 rounded-3xl from-white/[0.02] via-white/[0.03] to-white/[0.01] bg-gradient-to-br p-8 ${feature.className} transition-all duration-700 ease-out ${slideClass}`}
                style={{
                  transitionDelay: `${idx * 0.15}s`,
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                <div className="absolute inset-x-0 top-0 h-px from-transparent via-white/30 to-transparent bg-gradient-to-r opacity-40" />

                <div className="relative z-10 h-full flex flex-col">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="w-fit inline-flex border border-white/10 rounded-2xl bg-white/5 p-3 shadow-[0_10px_40px_-20px_rgba(56,189,248,0.5)]">
                      <feature.icon className="text-brand-300 h-6 w-6" />
                    </div>
                    <span className="text-[10px] text-slate-500 tracking-[0.2em] font-mono uppercase">dx-first</span>
                  </div>

                  <h3 className="mb-3 text-2xl text-white font-bold leading-snug">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>

                  <div className="mt-auto pt-8 opacity-70 transition-opacity duration-500 group-hover:opacity-100">
                    <div
                      className="from-brand-500/70 via-accent-500/40 h-1 w-full origin-right rounded-full to-transparent bg-gradient-to-r"
                      style={{
                        transform: cardsAnimated ? 'scaleX(1)' : 'scaleX(0)',
                        transition: 'transform 0.5s ease-out',
                        transitionDelay: cardsAnimated ? `${idx * 0.12}s` : '0s',
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
