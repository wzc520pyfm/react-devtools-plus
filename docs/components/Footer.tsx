import { Github, Linkedin, Twitter } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const Footer: React.FC = () => {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-white/10 bg-slate-950 pb-8 pt-16">
      <div className="container mx-auto px-6">
        <div className="mb-12 flex flex-col items-center justify-between gap-8 md:flex-row">
          <div>
            <h4 className="mb-2 text-2xl text-white font-bold">{t('footer.title')}</h4>
            <p className="max-w-sm text-slate-400">
              {t('footer.desc')}
            </p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 transition-colors hover:text-white"><Github className="h-6 w-6" /></a>
            <a href="#" className="text-slate-400 transition-colors hover:text-white"><Twitter className="h-6 w-6" /></a>
            <a href="#" className="text-slate-400 transition-colors hover:text-white"><Linkedin className="h-6 w-6" /></a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between border-t border-white/5 pt-8 text-sm text-slate-500 md:flex-row">
          <p>
            &copy;
            {new Date().getFullYear()}
            {' '}
            {t('footer.copyright')}
            . All rights reserved.
          </p>
          <div className="mt-4 flex gap-6 md:mt-0">
            <a href="#" className="hover:text-slate-300">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-slate-300">{t('footer.terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
