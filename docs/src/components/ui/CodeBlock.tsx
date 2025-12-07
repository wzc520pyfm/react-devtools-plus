import { Check, Copy } from 'lucide-react'
import React, { useEffect, useState } from 'react'

interface CodeBlockProps {
  code: string
  language?: string
  title?: string
  showLineNumbers?: boolean
  className?: string
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'typescript',
  title,
  showLineNumbers = true,
  className = '',
}) => {
  const [copied, setCopied] = useState(false)
  const [highlightedCode, setHighlightedCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const highlight = async () => {
      try {
        const { codeToHtml } = await import('shiki')
        const html = await codeToHtml(code.trim(), {
          lang: language,
          theme: 'material-theme-ocean',
        })
        if (mounted) {
          setHighlightedCode(html)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Shiki highlighting error:', error)
        if (mounted) {
          // Fallback to plain code
          setHighlightedCode(`<pre><code>${code.trim()}</code></pre>`)
          setIsLoading(false)
        }
      }
    }

    highlight()
    return () => {
      mounted = false
    }
  }, [code, language])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code.trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Add line numbers to the highlighted code
  const addLineNumbers = (html: string) => {
    if (!showLineNumbers) return html

    // Parse the HTML and add line numbers
    const lines = code.trim().split('\n')
    const lineNumbersHtml = lines
      .map(
        (_, idx) =>
          `<span class="line-number">${idx + 1}</span>`
      )
      .join('')

    return `<div class="code-with-line-numbers"><div class="line-numbers">${lineNumbersHtml}</div><div class="code-content">${html}</div></div>`
  }

  return (
    <div className={`not-prose overflow-hidden border border-white/10 rounded-xl bg-[#0F111A] ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2">
          <span className="text-sm text-slate-400">{title}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-white"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      <div className="shiki-wrapper relative overflow-x-auto">
        {!title && (
          <button
            onClick={handleCopy}
            className="absolute right-2 top-2 z-10 flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-xs text-slate-400 opacity-0 transition-all hover:bg-white/20 hover:text-white [.shiki-wrapper:hover_&]:opacity-100"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-slate-300" />
          </div>
        ) : (
          <div
            className="shiki-code p-4 text-sm leading-6"
            dangerouslySetInnerHTML={{ __html: showLineNumbers ? addLineNumbers(highlightedCode) : highlightedCode }}
          />
        )}
      </div>
      <style>{`
        .shiki-code pre {
          background: transparent !important;
          margin: 0;
          padding: 0;
        }
        .shiki-code code {
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
        }
        .code-with-line-numbers {
          display: flex;
        }
        .line-numbers {
          display: flex;
          flex-direction: column;
          padding-right: 1rem;
          text-align: right;
          user-select: none;
          color: #4a5568;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
          font-size: 0.875rem;
          line-height: 1.5rem;
        }
        .line-number {
          min-width: 2rem;
        }
        .code-content {
          flex: 1;
          overflow-x: auto;
        }
        .code-content pre {
          margin: 0;
        }
      `}</style>
    </div>
  )
}

// Simple inline code block without line numbers
export const InlineCode: React.FC<{ children: string }> = ({ children }) => (
  <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-slate-300 font-mono">
    {children}
  </code>
)

