import { Menu, X, Zap } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/Button'

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: t('common.nav.features'), href: '#features' },
    { name: t('common.nav.integration'), href: '#integration' },
    { name: t('common.nav.community'), href: '#community' },
    { name: t('common.nav.docs'), href: '#docs' },
  ]

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')
  }

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-slate-950/70 backdrop-blur-md transition-all duration-300 ${
        isScrolled ? 'py-4 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.8)]' : 'py-6'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6">
        <div className="group flex cursor-pointer items-center gap-2">
          <div className="from-brand-400 to-accent-600 group-hover:shadow-brand-500/50 relative h-8 w-8 flex items-center justify-center rounded-lg bg-gradient-to-br shadow-lg transition-all duration-300">
            <Zap className="h-5 w-5 fill-white text-white" />
          </div>
          <span className="from-white to-slate-400 bg-gradient-to-r bg-clip-text text-xl text-transparent font-bold">
            DevTools+
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map(link => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm text-slate-400 font-medium transition-colors hover:text-white"
            >
              {link.name}
            </a>
          ))}
          <Button
            variant="ghost"
            className="text-xs !px-3 !py-2"
            onClick={toggleLanguage}
          >
            {i18n.language === 'en' ? '中文' : 'EN'}
          </Button>
          <Button
            variant="secondary"
            className="text-xs !px-4 !py-2"
            onClick={() => window.open('https://github.com/vuejs/devtools', '_blank')}
          >
            {t('common.github.view')}
          </Button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="animate-slide-up-fade absolute left-0 right-0 top-full border-b border-white/10 bg-slate-950 p-6 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map(link => (
              <a
                key={link.name}
                href={link.href}
                className="text-lg text-slate-300 font-medium hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                toggleLanguage()
                setMobileMenuOpen(false)
              }}
            >
              {i18n.language === 'en' ? '中文' : 'EN'}
            </Button>
            <Button
              className="mt-4 w-full"
              onClick={() => window.open('https://github.com/vuejs/devtools', '_blank')}
            >
              {t('common.github.view')}
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}
