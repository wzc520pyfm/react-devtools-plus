import { Check, Info } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const Assets: React.FC = () => {
  const { t } = useTranslation()

  const supportedTypes = [
    { type: 'Images', extensions: 'PNG, JPG, JPEG, GIF, SVG, WebP, ICO, AVIF, BMP, TIFF' },
    { type: 'Videos', extensions: 'MP4, WebM, MOV, AVI, OGV' },
    { type: 'Audio', extensions: 'MP3, WAV, OGG, FLAC, AAC' },
    { type: 'Fonts', extensions: 'WOFF, WOFF2, TTF, OTF, EOT' },
    { type: 'Documents', extensions: 'PDF, MD' },
    { type: 'Data', extensions: 'JSON, YAML, YML, TOML' },
    { type: 'WebAssembly', extensions: 'WASM' },
  ]

  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="mb-4 text-4xl text-white font-bold">{t('docs.assets.title')}</h1>

      <p className="text-lg text-slate-300 leading-relaxed">
        {t('docs.assets.description')}
      </p>

      {/* Assets Panel Screenshot */}
      <div className="not-prose my-8 overflow-hidden border border-white/10 rounded-2xl">
        <img
          src="/screenshots/assets.png"
          alt="Assets Panel Overview"
          className="w-full"
        />
      </div>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.assets.supported.title')}</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-3 pr-4 text-slate-300 font-semibold">{t('docs.assets.supported.type')}</th>
              <th className="py-3 text-slate-300 font-semibold">{t('docs.assets.supported.extensions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {supportedTypes.map((item, idx) => (
              <tr key={idx}>
                <td className="text-brand-400 py-3 pr-4 font-medium">{item.type}</td>
                <td className="py-3 text-slate-300">{item.extensions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.assets.features.title')}</h2>

      <h3 className="mb-3 mt-6 text-xl text-white font-semibold">{t('docs.assets.features.browser.title')}</h3>
      <ul className="my-4 text-slate-300 space-y-2">
        {(t('docs.assets.features.browser.items', { returnObjects: true }) as string[]).map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <Check className="text-brand-400 h-4 w-4" />
            {item}
          </li>
        ))}
      </ul>

      <h3 className="mb-3 mt-6 text-xl text-white font-semibold">{t('docs.assets.features.details.title')}</h3>
      <ul className="my-4 text-slate-300 space-y-2">
        {(t('docs.assets.features.details.items', { returnObjects: true }) as string[]).map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <Check className="text-brand-400 h-4 w-4" />
            {item}
          </li>
        ))}
      </ul>

      {/* Placeholder for screenshot */}
      <div className="not-prose my-8 h-64 flex items-center justify-center border border-white/20 rounded-2xl border-dashed bg-white/5">
        <div className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 flex items-center justify-center rounded-full bg-white/10">
            <Info className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-400">{t('docs.common.screenshotPlaceholder')}</p>
          <p className="mt-1 text-xs text-slate-500">Asset Details View</p>
        </div>
      </div>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.assets.howTo.title')}</h2>
      <ol className="my-4 text-slate-300 space-y-4">
        {(t('docs.assets.howTo.steps', { returnObjects: true }) as string[]).map((step, idx) => (
          <li key={idx} className="flex gap-4">
            <span className="bg-brand-500/20 text-brand-400 h-7 w-7 flex flex-shrink-0 items-center justify-center rounded-full text-sm font-medium">
              {idx + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>

      <div className="not-prose my-6 border border-green-500/30 rounded-xl bg-green-500/10 p-4">
        <div className="flex items-start gap-3">
          <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
          <div>
            <p className="text-sm text-green-300 font-medium">{t('docs.assets.support.title')}</p>
            <p className="mt-1 text-sm text-green-300/80">{t('docs.assets.support.content')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
