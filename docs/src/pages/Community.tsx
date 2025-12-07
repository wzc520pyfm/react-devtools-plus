import {
  ArrowRight,
  BookOpen,
  GitFork,
  GitPullRequest,
  Heart,
  MessageCircle,
  Star,
  Users,
} from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { Logo } from '../components/ui/Logo'

export const Community: React.FC = () => {
  const { t, i18n } = useTranslation()

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')
  }

  const contributionSteps = t('communityPage.howTo.steps', { returnObjects: true }) as Array<{
    title: string
    description: string
  }>

  const resources = [
    {
      icon: Star,
      title: t('communityPage.resources.star.title'),
      description: t('communityPage.resources.star.description'),
      href: 'https://github.com/nicepkg/react-devtools-plus',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
    },
    {
      icon: MessageCircle,
      title: t('communityPage.resources.issues.title'),
      description: t('communityPage.resources.issues.description'),
      href: 'https://github.com/nicepkg/react-devtools-plus/issues',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      icon: GitPullRequest,
      title: t('communityPage.resources.pr.title'),
      description: t('communityPage.resources.pr.description'),
      href: 'https://github.com/nicepkg/react-devtools-plus/pulls',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    {
      icon: BookOpen,
      title: t('communityPage.resources.docs.title'),
      description: t('communityPage.resources.docs.description'),
      href: '/docs',
      color: 'text-brand-400',
      bgColor: 'bg-brand-500/20',
    },
  ]

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
                className="rounded-lg px-3 py-2 text-sm text-slate-400 font-medium transition-colors hover:bg-white/5 hover:text-white"
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
                className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white font-medium"
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
              href="https://github.com/nicepkg/react-devtools-plus"
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
              <Users className="text-brand-400 h-4 w-4" />
              {t('communityPage.badge')}
            </div>
            <h1 className="mb-4 text-4xl text-white font-bold md:text-5xl">
              {t('communityPage.title')}
            </h1>
            <p className="text-lg text-slate-400">
              {t('communityPage.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Resource Cards */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 md:grid-cols-2">
              {resources.map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.href}
                  target={resource.href.startsWith('http') ? '_blank' : undefined}
                  rel={resource.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="group relative overflow-hidden border border-white/10 rounded-2xl bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04]"
                >
                  <div className="flex items-start gap-4">
                    <div className={`rounded-xl ${resource.bgColor} p-3`}>
                      <resource.icon className={`h-6 w-6 ${resource.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg text-white font-semibold">{resource.title}</h3>
                      <p className="text-sm text-slate-400">{resource.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-500 transition-colors group-hover:text-white" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How to Contribute */}
      <section className="border-t border-white/5 py-16">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl text-white font-bold">{t('communityPage.howTo.title')}</h2>
              <p className="text-slate-400">{t('communityPage.howTo.subtitle')}</p>
            </div>

            <div className="space-y-6">
              {contributionSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex gap-6 border border-white/10 rounded-xl bg-white/[0.02] p-6"
                >
                  <div className="bg-brand-500/20 text-brand-400 h-10 w-10 flex flex-shrink-0 items-center justify-center rounded-full font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg text-white font-semibold">{step.title}</h3>
                    <p className="text-slate-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Code of Conduct */}
      <section className="border-t border-white/5 py-16">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl">
            <div className="from-brand-500/10 border border-white/10 rounded-2xl to-purple-500/10 bg-gradient-to-br p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-pink-500/20 p-3">
                  <Heart className="h-6 w-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl text-white font-semibold">{t('communityPage.codeOfConduct.title')}</h3>
                  <p className="mb-4 text-slate-300">{t('communityPage.codeOfConduct.description')}</p>
                  <ul className="text-slate-400 space-y-2">
                    {(t('communityPage.codeOfConduct.items', { returnObjects: true }) as string[]).map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="bg-brand-400 h-1.5 w-1.5 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 py-16">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl text-white font-bold">{t('communityPage.cta.title')}</h2>
            <p className="mb-8 text-slate-400">{t('communityPage.cta.description')}</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://github.com/nicepkg/react-devtools-plus"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm text-white font-medium transition-colors"
              >
                <Star className="h-4 w-4" />
                {t('communityPage.cta.star')}
              </a>
              <a
                href="https://github.com/nicepkg/react-devtools-plus/fork"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-white/10 rounded-full bg-white/5 px-6 py-3 text-sm text-white font-medium transition-colors hover:bg-white/10"
              >
                <GitFork className="h-4 w-4" />
                {t('communityPage.cta.fork')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
