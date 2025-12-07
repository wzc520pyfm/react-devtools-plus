import { Info } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { CodeBlock } from '../../components/ui/CodeBlock'

export const Timeline: React.FC = () => {
  const { t } = useTranslation()

  const apiExample = `import { addComponentEvent, addPerformanceEvent } from '@react-devtools-plus/kit'

// Track component events
const handleSubmit = (data: FormData) => {
  addComponentEvent('MyForm', 'onSubmit', { formData: data })
}

// Track performance
const startTime = performance.now()
// ... your code ...
const duration = performance.now() - startTime
addPerformanceEvent('render', 'MyComponent', 'start')
addPerformanceEvent('render', 'MyComponent', 'end', duration)`

  const layers = [
    { name: 'Mouse', events: 'mousedown, mouseup, click, dblclick' },
    { name: 'Keyboard', events: 'keydown, keyup, keypress' },
    { name: 'Component events', events: 'Custom events emitted by components' },
    { name: 'Performance', events: 'render, mount, update, unmount, patch, init' },
  ]

  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="mb-4 text-4xl text-white font-bold">{t('docs.timeline.title')}</h1>

      <p className="text-lg text-slate-300 leading-relaxed">
        {t('docs.timeline.description')}
      </p>

      {/* Timeline Panel Screenshot */}
      <div className="not-prose my-8 overflow-hidden border border-white/10 rounded-2xl">
        <img
          src="/screenshots/timeline.png"
          alt="Timeline Panel Overview"
          className="w-full"
        />
      </div>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.timeline.layers.title')}</h2>
      <p className="text-slate-300">{t('docs.timeline.layers.description')}</p>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-3 pr-4 text-slate-300 font-semibold">{t('docs.timeline.layers.layer')}</th>
              <th className="py-3 text-slate-300 font-semibold">{t('docs.timeline.layers.events')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {layers.map((layer, idx) => (
              <tr key={idx}>
                <td className="text-brand-400 py-3 pr-4 font-medium">{layer.name}</td>
                <td className="py-3 text-slate-300">{layer.events}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.timeline.howTo.title')}</h2>
      <ol className="my-4 text-slate-300 space-y-4">
        {(t('docs.timeline.howTo.steps', { returnObjects: true }) as string[]).map((step, idx) => (
          <li key={idx} className="flex gap-4">
            <span className="bg-brand-500/20 text-brand-400 h-7 w-7 flex flex-shrink-0 items-center justify-center rounded-full text-sm font-medium">
              {idx + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.timeline.api.title')}</h2>
      <p className="text-slate-300">{t('docs.timeline.api.description')}</p>
      <CodeBlock code={apiExample} language="typescript" title="Timeline API Usage" />

      <div className="not-prose my-6 border border-yellow-500/30 rounded-xl bg-yellow-500/10 p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
          <div>
            <p className="text-sm text-yellow-300 font-medium">{t('docs.timeline.performance.title')}</p>
            <p className="mt-1 text-sm text-yellow-300/80">{t('docs.timeline.performance.content')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
