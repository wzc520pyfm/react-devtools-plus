import { ChevronDown, HelpCircle } from 'lucide-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface FAQItemProps {
  question: string
  answer: string
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="not-prose border-b border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-lg text-white font-medium">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="pb-4 text-slate-300 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}

export const FAQ: React.FC = () => {
  const { t } = useTranslation()

  const faqs = t('docs.faq.items', { returnObjects: true }) as Array<{
    question: string
    answer: string
  }>

  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="mb-4 text-4xl text-white font-bold">{t('docs.faq.title')}</h1>

      <p className="text-lg text-slate-300 leading-relaxed">
        {t('docs.faq.description')}
      </p>

      <div className="not-prose my-8 border border-white/10 rounded-2xl bg-white/5 p-6">
        <div className="flex items-start gap-4">
          <div className="bg-brand-500/20 rounded-xl p-3">
            <HelpCircle className="text-brand-400 h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg text-white font-semibold">{t('docs.faq.noAnswer.title')}</h3>
            <p className="mt-2 text-slate-300">
              {t('docs.faq.noAnswer.description')}
              {' '}
              <a
                href="https://github.com/nicepkg/react-devtools-plus/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-400 hover:text-brand-300"
              >
                {t('docs.faq.noAnswer.link')}
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {faqs.map((faq, idx) => (
          <FAQItem key={idx} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  )
}
