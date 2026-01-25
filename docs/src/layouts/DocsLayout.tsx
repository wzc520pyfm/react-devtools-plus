import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Code2,
  Eye,
  FileCode,
  GitBranch,
  GitFork,
  HelpCircle,
  Home,
  Keyboard,
  Layers,
  Menu,
  Puzzle,
  Settings,
  Timer,
  X,
  Zap,
} from 'lucide-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Logo } from '../components/ui/Logo'

interface NavItem {
  title: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  children?: NavItem[]
}

interface NavSection {
  title: string
  items: NavItem[]
}

export const DocsLayout: React.FC = () => {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started', 'features', 'integration', 'help'])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section],
    )
  }

  const navigation: NavSection[] = [
    {
      title: t('docs.nav.gettingStarted'),
      items: [
        { title: t('docs.nav.introduction'), href: '/docs', icon: BookOpen },
        { title: t('docs.nav.installation'), href: '/docs/installation', icon: Code2 },
        { title: t('docs.nav.quickStart'), href: '/docs/quick-start', icon: Zap },
      ],
    },
    {
      title: t('docs.nav.features'),
      items: [
        { title: t('docs.nav.componentTree'), href: '/docs/features/component-tree', icon: Layers },
        { title: t('docs.nav.timeline'), href: '/docs/features/timeline', icon: Timer },
        { title: t('docs.nav.assets'), href: '/docs/features/assets', icon: FileCode },
        { title: t('docs.nav.openInEditor'), href: '/docs/features/open-in-editor', icon: Keyboard },
        { title: t('docs.nav.scan'), href: '/docs/features/scan', icon: Eye },
        { title: t('docs.nav.moduleGraph'), href: '/docs/features/module-graph', icon: GitBranch },
        { title: t('docs.nav.plugins'), href: '/docs/features/plugins', icon: Puzzle },
      ],
    },
    {
      title: t('docs.nav.integration'),
      items: [
        { title: t('docs.nav.viteSetup'), href: '/docs/integration/vite', icon: Zap },
        { title: t('docs.nav.webpackSetup'), href: '/docs/integration/webpack', icon: Settings },
        { title: t('docs.nav.configuration'), href: '/docs/integration/configuration', icon: Settings },
      ],
    },
    {
      title: t('docs.nav.help'),
      items: [
        { title: t('docs.nav.contributing'), href: '/docs/contributing', icon: GitFork },
        { title: t('docs.nav.faq'), href: '/docs/faq', icon: HelpCircle },
        { title: t('docs.nav.troubleshooting'), href: '/docs/troubleshooting', icon: HelpCircle },
      ],
    },
  ]

  const sectionIds: Record<string, string> = {
    [t('docs.nav.gettingStarted')]: 'getting-started',
    [t('docs.nav.features')]: 'features',
    [t('docs.nav.integration')]: 'integration',
    [t('docs.nav.help')]: 'help',
  }

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top navigation bar */}
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
              <NavLink
                to="/docs"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive || location.pathname.startsWith('/docs')
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                {t('common.nav.docs')}
              </NavLink>
              <NavLink
                to="/features"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                {t('common.nav.features')}
              </NavLink>
              <NavLink
                to="/integration"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                {t('common.nav.integration')}
              </NavLink>
              <NavLink
                to="/community"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                {t('common.nav.community')}
              </NavLink>
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
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-400 md:hidden hover:bg-white/5 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed bottom-0 left-0 top-16 w-72 overflow-y-auto border-r border-white/5 bg-slate-950 p-6">
            <nav className="space-y-6">
              {navigation.map(section => (
                <div key={section.title}>
                  <button
                    onClick={() => toggleSection(sectionIds[section.title] || section.title)}
                    className="mb-2 w-full flex items-center justify-between text-xs text-slate-500 tracking-wider uppercase"
                  >
                    {section.title}
                    {expandedSections.includes(sectionIds[section.title] || section.title)
                      ? (
                          <ChevronDown className="h-4 w-4" />
                        )
                      : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                  </button>
                  {expandedSections.includes(sectionIds[section.title] || section.title) && (
                    <ul className="space-y-1">
                      {section.items.map(item => (
                        <li key={item.title}>
                          <NavLink
                            to={item.href || '#'}
                            onClick={() => setMobileMenuOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                isActive
                                  ? 'bg-brand-500/10 text-brand-400 font-medium'
                                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                              }`}
                          >
                            {item.icon && <item.icon className="h-4 w-4" />}
                            {item.title}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main content area with sidebar */}
      <div className="flex pt-16">
        {/* Desktop Sidebar */}
        <aside className="fixed bottom-0 left-0 top-16 hidden w-72 overflow-y-auto border-r border-white/5 bg-slate-950/50 p-6 md:block">
          <nav className="space-y-6">
            {navigation.map(section => (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(sectionIds[section.title] || section.title)}
                  className="mb-2 w-full flex items-center justify-between text-xs text-slate-500 tracking-wider uppercase"
                >
                  {section.title}
                  {expandedSections.includes(sectionIds[section.title] || section.title)
                    ? (
                        <ChevronDown className="h-4 w-4" />
                      )
                    : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                </button>
                {expandedSections.includes(sectionIds[section.title] || section.title) && (
                  <ul className="space-y-1">
                    {section.items.map(item => (
                      <li key={item.title}>
                        <NavLink
                          to={item.href || '#'}
                          end={item.href === '/docs'}
                          className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                              isActive
                                ? 'bg-brand-500/10 text-brand-400 font-medium'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                          {item.icon && <item.icon className="h-4 w-4" />}
                          {item.title}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
          <div className="mt-8 border-t border-white/5 pt-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
            >
              <Home className="h-4 w-4" />
              {t('docs.backToHome')}
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-h-screen flex-1 md:ml-72">
          <div className="mx-auto max-w-4xl px-6 py-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
