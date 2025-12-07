import { ArrowRight, Braces, Check, Copy, FileCode, Hash } from 'lucide-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/Button'
import { Spotlight } from './ui/Spotlight'

// --- Code Snippet Data (Simulating Shiki Output for reliability) ---
const CODE_FILES = [
  {
    name: 'usePerformance.ts',
    icon: Hash,
    lang: 'typescript',
    tokens: [
      [
        { text: 'import', color: 'text-purple-400' },
        { text: ' { ', color: 'text-slate-100' },
        { text: 'useRef', color: 'text-yellow-300' },
        { text: ', ', color: 'text-slate-100' },
        { text: 'useEffect', color: 'text-yellow-300' },
        { text: ' } ', color: 'text-slate-100' },
        { text: 'from', color: 'text-purple-400' },
        { text: ' ', color: 'text-slate-100' },
        { text: '\'react\'', color: 'text-green-400' },
        { text: ';', color: 'text-slate-400' },
      ],
      [],
      [
        { text: 'export', color: 'text-purple-400' },
        { text: ' ', color: 'text-slate-100' },
        { text: 'const', color: 'text-purple-400' },
        { text: ' ', color: 'text-slate-100' },
        { text: 'usePerformance', color: 'text-blue-400' },
        { text: ' = ', color: 'text-slate-100' },
        { text: '()', color: 'text-slate-100' },
        { text: ' => ', color: 'text-purple-400' },
        { text: '{', color: 'text-yellow-400' },
      ],
      [
        { text: '  const', color: 'text-purple-400' },
        { text: ' ', color: 'text-slate-100' },
        { text: 'renderCount', color: 'text-cyan-300' },
        { text: ' = ', color: 'text-slate-100' },
        { text: 'useRef', color: 'text-yellow-300' },
        { text: '(', color: 'text-purple-300' },
        { text: '0', color: 'text-orange-300' },
        { text: ')', color: 'text-purple-300' },
        { text: ';', color: 'text-slate-400' },
      ],
      [],
      [
        { text: '  useEffect', color: 'text-yellow-300' },
        { text: '(()', color: 'text-purple-300' },
        { text: ' => ', color: 'text-purple-400' },
        { text: '{', color: 'text-blue-400' },
      ],
      [
        { text: '    renderCount.', color: 'text-slate-100' },
        { text: 'current', color: 'text-cyan-300' },
        { text: '++;', color: 'text-slate-100' },
      ],
      [
        { text: '    console.', color: 'text-slate-100' },
        { text: 'log', color: 'text-yellow-300' },
        { text: '(', color: 'text-yellow-400' },
        { text: '"Rendered:"', color: 'text-green-400' },
        { text: ', ', color: 'text-slate-100' },
        { text: 'renderCount.', color: 'text-slate-100' },
        { text: 'current', color: 'text-cyan-300' },
        { text: ')', color: 'text-yellow-400' },
        { text: ';', color: 'text-slate-100' },
      ],
      [
        { text: '  }', color: 'text-blue-400' },
        { text: ' );', color: 'text-purple-300' },
      ],
      [
        { text: '}', color: 'text-yellow-400' },
        { text: ';', color: 'text-slate-400' },
      ],
    ],
  },
  {
    name: 'App.tsx',
    icon: FileCode,
    lang: 'tsx',
    tokens: [
      [
        { text: 'import', color: 'text-purple-400' },
        { text: ' ', color: 'text-slate-100' },
        { text: 'DevTools', color: 'text-yellow-300' },
        { text: ' ', color: 'text-slate-100' },
        { text: 'from', color: 'text-purple-400' },
        { text: ' ', color: 'text-slate-100' },
        { text: '\'devtools-plus\'', color: 'text-green-400' },
        { text: ';', color: 'text-slate-400' },
      ],
      [],
      [
        { text: 'function', color: 'text-purple-400' },
        { text: ' ', color: 'text-slate-100' },
        { text: 'App', color: 'text-blue-400' },
        { text: '()', color: 'text-slate-100' },
        { text: ' {', color: 'text-yellow-400' },
      ],
      [
        { text: '  return', color: 'text-purple-400' },
        { text: ' (', color: 'text-purple-300' },
      ],
      [
        { text: '    <', color: 'text-slate-400' },
        { text: 'div', color: 'text-red-400' },
        { text: '>', color: 'text-slate-400' },
      ],
      [
        { text: '      <', color: 'text-slate-400' },
        { text: 'Hero', color: 'text-yellow-300' },
        { text: ' />', color: 'text-slate-400' },
      ],
      [
        { text: '      <', color: 'text-slate-400' },
        { text: 'DevTools', color: 'text-yellow-300' },
        { text: ' ', color: 'text-slate-100' },
        { text: 'theme', color: 'text-purple-300' },
        { text: '=', color: 'text-blue-400' },
        { text: '"dark"', color: 'text-green-400' },
        { text: ' />', color: 'text-slate-400' },
      ],
      [
        { text: '    </', color: 'text-slate-400' },
        { text: 'div', color: 'text-red-400' },
        { text: '>', color: 'text-slate-400' },
      ],
      [
        { text: '  );', color: 'text-purple-300' },
      ],
      [
        { text: '}', color: 'text-yellow-400' },
      ],
    ],
  },
  {
    name: 'config.json',
    icon: Braces,
    lang: 'json',
    tokens: [
      [
        { text: '{', color: 'text-yellow-400' },
      ],
      [
        { text: '  "theme"', color: 'text-green-400' },
        { text: ': ', color: 'text-slate-100' },
        { text: '"cyberpunk"', color: 'text-orange-300' },
        { text: ',', color: 'text-slate-400' },
      ],
      [
        { text: '  "analytics"', color: 'text-green-400' },
        { text: ': ', color: 'text-slate-100' },
        { text: 'true', color: 'text-blue-400' },
        { text: ',', color: 'text-slate-400' },
      ],
      [
        { text: '  "fpsLimit"', color: 'text-green-400' },
        { text: ': ', color: 'text-slate-100' },
        { text: '60', color: 'text-purple-400' },
      ],
      [
        { text: '}', color: 'text-yellow-400' },
      ],
    ],
  },
]

export const Hero: React.FC = () => {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const { t } = useTranslation()

  const handleCopy = () => {
    navigator.clipboard.writeText('npm install react-devtools-plus')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-950 pb-20 pt-24">
      {/* Background Ambience - Radial Top-Down Light */}
      <div className="absolute inset-0 h-full w-full bg-slate-950">
        <div className="[mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* Spotlight Beam - Top Right shining Bottom Left */}
      <Spotlight className="right-0 scale-x-[-1] opacity-80 -top-40 md:right-0 md:-top-20" fill="#38bdf8" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">

          {/* Left Column: Content */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            {/* Badge */}
            <div
              className="animate-slide-up-fade mb-8 inline-flex items-center gap-2 border border-white/5 rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300 backdrop-blur-xl"
              style={{ animationDelay: '0.1s' }}
            >
              <span className="bg-brand-400 h-2 w-2 flex animate-pulse rounded-full"></span>
              <span>{t('hero.badge')}</span>
            </div>

            {/* Heading */}
            <h1
              className="animate-slide-up-fade text-5xl text-white font-extrabold tracking-tight md:text-7xl"
              style={{ animationDelay: '0.2s' }}
            >
              {t('hero.titleLead')}
              {' '}
              <br />
              <span className="from-brand-300 via-brand-500 to-accent-500 bg-gradient-to-r bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="animate-slide-up-fade mt-6 max-w-2xl text-lg text-slate-400 md:text-xl"
              style={{ animationDelay: '0.4s' }}
            >
              {t('hero.subtitle')}
            </p>

            {/* Buttons */}
            <div
              className="animate-slide-up-fade mt-10 w-full flex flex-col items-center gap-4 sm:w-auto sm:flex-row"
              style={{ animationDelay: '0.6s' }}
            >
              <Button withBeam className="w-full sm:w-auto">
                {t('hero.primaryCta')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div
                className="group relative w-full flex cursor-pointer items-center justify-between gap-2 border border-white/10 rounded-full bg-slate-900/50 px-6 py-3 text-sm text-slate-400 font-mono transition-all sm:w-auto hover:border-white/20 hover:text-white"
                onClick={handleCopy}
              >
                <span>{t('hero.snippet')}</span>
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}

                {/* Subtle glow on hover */}
                <div className="bg-brand-500/10 absolute inset-0 rounded-full opacity-0 blur-lg transition-opacity -z-10 group-hover:opacity-100" />
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Code Block */}
          <div
            className="animate-slide-up-fade relative mx-auto max-w-[600px] w-full"
            style={{ animationDelay: '0.8s' }}
          >
            {/* Abstract Glow behind the card */}
            <div className="from-brand-500 to-accent-600 absolute rounded-2xl bg-gradient-to-r opacity-20 blur transition duration-1000 -inset-1 group-hover:opacity-40"></div>

            {/* The Main Card */}
            <div className="relative overflow-hidden border border-white/10 rounded-2xl bg-[#09090b] shadow-2xl backdrop-blur-sm">

              {/* Toolbar / Header */}
              <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4">
                <div className="flex items-center">
                  <div className="mr-4 flex space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
                  </div>

                  {/* Tabs */}
                  <div className="flex">
                    {CODE_FILES.map((file, idx) => (
                      <button
                        key={file.name}
                        onClick={() => setActiveTab(idx)}
                        className={`flex items-center gap-2 border-r border-white/5 px-4 py-3 text-xs font-medium transition-colors ${
                          activeTab === idx
                            ? 'text-white bg-white/10'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <file.icon className={`h-3.5 w-3.5 ${
                          file.name.endsWith('ts')
                            ? 'text-blue-400'
                            : file.name.endsWith('tsx') ? 'text-yellow-400' : 'text-green-400'
                        }`}
                        />
                        {file.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hidden text-[10px] text-slate-500 font-mono sm:block">
                  Debugging Session:
                  {' '}
                  <span className="text-green-400">Active</span>
                </div>
              </div>

              {/* Code Area */}
              <div className="min-h-[320px] overflow-x-auto bg-[#09090b] p-6">
                <div className="text-sm leading-6 font-mono">
                  {CODE_FILES[activeTab].tokens.map((line, lineIdx) => (
                    <div key={lineIdx} className="flex">
                      <div className="w-10 shrink-0 select-none pr-4 text-right text-slate-700">
                        {lineIdx + 1}
                      </div>
                      <div className="whitespace-pre">
                        {line.map((token, tokenIdx) => (
                          <span key={tokenIdx} className={token.color}>
                            {token.text}
                          </span>
                        ))}
                        {line.length === 0 && <span className="inline-block">&nbsp;</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Status Bar */}
              <div className="flex items-center justify-between border-t border-white/5 bg-white/5 px-4 py-1.5 text-[10px] text-slate-500 font-mono">
                <div className="flex gap-3">
                  <span>UTF-8</span>
                  <span>TypeScript JSX</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-brand-500 h-1.5 w-1.5 animate-pulse rounded-full"></div>
                  <span>Ln 12, Col 34</span>
                </div>
              </div>
            </div>

            {/* Decorative Floating Elements behind/around */}
            <div className="bg-brand-500/20 absolute h-24 w-24 rounded-full blur-3xl -right-12 -top-12"></div>
            <div className="bg-accent-500/20 absolute h-32 w-32 rounded-full blur-3xl -bottom-12 -left-12"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
