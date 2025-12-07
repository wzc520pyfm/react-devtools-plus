import {
  Activity,
  ArrowRight,
  Eye,
  FileCode,
  Keyboard,
  Layers,
  Settings,
  Timer,
  Zap,
} from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { Logo } from '../components/ui/Logo'

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>
  preview?: string
  title: string
  description: string
  href: string
  badge?: string
  gradient: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, preview, title, description, href, badge, gradient }) => (
  <Link
    to={href}
    className="group hover:border-brand-500/30 relative overflow-hidden border border-white/10 rounded-2xl bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04]"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity group-hover:opacity-100`} />
    <div className="absolute inset-x-0 top-0 h-px from-transparent via-white/20 to-transparent bg-gradient-to-r" />

    <div className="relative">
      {badge && (
        <span className="bg-brand-500/20 text-brand-400 mb-3 inline-block rounded-full px-3 py-1 text-xs font-medium">
          {badge}
        </span>
      )}
      <div className="mb-4 w-fit border border-white/10 rounded-xl bg-white/5 p-3">
        <Icon className="text-brand-400 h-6 w-6" />
      </div>
      <h3 className="mb-2 text-xl text-white font-semibold">{title}</h3>
      <p className="mb-4 text-sm text-slate-400 leading-relaxed">{description}</p>

      {/* Placeholder for screenshot */}
      <div className="mb-4 h-40 flex items-center justify-center border border-white/10 rounded-xl border-dashed bg-white/5">
        {preview
          ? (
              <img
                src={preview}
                alt="Assets Panel Overview"
                className="h-full w-auto rounded-2xl"
              />
            )
          : <span className="text-xs text-slate-500">Screenshot Placeholder</span>}
      </div>

      <span className="text-brand-400 group-hover:text-brand-300 inline-flex items-center gap-1 text-sm font-medium transition-colors">
        Learn more
        {' '}
        <ArrowRight className="h-4 w-4" />
      </span>
    </div>
  </Link>
)

export const Features: React.FC = () => {
  const { t, i18n } = useTranslation()

  const features: FeatureCardProps[] = [
    {
      icon: Layers,
      preview: '/screenshots/component-tree.png',
      title: t('featuresPage.items.componentTree.title'),
      description: t('featuresPage.items.componentTree.description'),
      href: '/docs/features/component-tree',
      badge: 'Core',
      gradient: 'from-brand-500/10 to-transparent',
    },
    {
      icon: Timer,
      preview: '/screenshots/timeline-detail.png',
      title: t('featuresPage.items.timeline.title'),
      description: t('featuresPage.items.timeline.description'),
      href: '/docs/features/timeline',
      badge: 'Performance',
      gradient: 'from-purple-500/10 to-transparent',
    },
    {
      icon: FileCode,
      preview: '/screenshots/assets.png',
      title: t('featuresPage.items.assets.title'),
      description: t('featuresPage.items.assets.description'),
      href: '/docs/features/assets',
      badge: 'DX',
      gradient: 'from-cyan-500/10 to-transparent',
    },
    {
      icon: Keyboard,
      preview: '/screenshots/inspector.png',
      title: t('featuresPage.items.openInEditor.title'),
      description: t('featuresPage.items.openInEditor.description'),
      href: '/docs/features/open-in-editor',
      badge: 'DX',
      gradient: 'from-green-500/10 to-transparent',
    },
    {
      icon: Eye,
      preview: '/screenshots/scan-detail.png',
      title: t('featuresPage.items.scan.title'),
      description: t('featuresPage.items.scan.description'),
      href: '/docs/features/scan',
      badge: 'Performance',
      gradient: 'from-orange-500/10 to-transparent',
    },
    {
      icon: Settings,
      preview: '/screenshots/modules.png',
      title: t('featuresPage.items.moduleGraph.title'),
      description: t('featuresPage.items.moduleGraph.description'),
      href: '/docs/features/module-graph',
      badge: 'DX',
      gradient: 'from-blue-500/10 to-transparent',
    },
  ]

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link to="/" className="group flex items-center gap-2.5">
              <Logo size={32} className="transition-transform duration-300 group-hover:scale-105" />
              <span className="from-white to-slate-400 bg-gradient-to-r bg-clip-text text-lg text-transparent font-bold">
                DevTools
                <sup className="text-brand-400 relative text-xs -top-2">+</sup>
              </span>
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              <Link
                to="/docs"
                className="rounded-lg px-3 py-2 text-sm text-slate-400 font-medium transition-colors hover:bg-white/5 hover:text-white"
              >
                {t('common.nav.docs')}
              </Link>
              <Link
                to="/features"
                className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white font-medium"
              >
                {t('common.nav.features')}
              </Link>
              <Link
                to="/integration"
                className="rounded-lg px-3 py-2 text-sm text-slate-400 font-medium transition-colors hover:bg-white/5 hover:text-white"
              >
                {t('common.nav.integration')}
              </Link>
              <Link
                to="/community"
                className="rounded-lg px-3 py-2 text-sm text-slate-400 font-medium transition-colors hover:bg-white/5 hover:text-white"
              >
                {t('common.nav.community')}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="rounded-lg px-3 py-2 text-sm text-slate-400 font-medium transition-colors hover:bg-white/5 hover:text-white"
            >
              {i18n.language === 'en' ? '中文' : 'EN'}
            </button>
            <a
              href="https://github.com/wzc520pyfm/react-devtools-plus"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden border border-white/10 rounded-lg bg-white/5 px-4 py-2 text-sm text-white font-medium transition-colors sm:inline-flex hover:bg-white/10"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pb-16 pt-32">
        <div className="bg-brand-500/10 pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" />

        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 border border-white/10 rounded-full bg-white/5 px-4 py-2 text-xs text-slate-300 tracking-wider uppercase">
              <Activity className="text-brand-400 h-4 w-4" />
              {t('featuresPage.badge')}
            </div>
            <h1 className="mb-4 text-4xl text-white font-bold md:text-5xl">
              {t('featuresPage.title')}
            </h1>
            <p className="text-lg text-slate-400">
              {t('featuresPage.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="pb-24">
        <div className="container mx-auto px-6">
          <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-white/5 py-16">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl text-white font-bold">{t('featuresPage.cta.title')}</h2>
            <p className="mb-8 text-slate-400">{t('featuresPage.cta.description')}</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/docs/installation"
                className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm text-white font-medium transition-colors"
              >
                <Zap className="h-4 w-4" />
                {t('featuresPage.cta.primary')}
              </Link>
              <Link
                to="/docs"
                className="inline-flex items-center gap-2 border border-white/10 rounded-full bg-white/5 px-6 py-3 text-sm text-white font-medium transition-colors hover:bg-white/10"
              >
                {t('featuresPage.cta.secondary')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
