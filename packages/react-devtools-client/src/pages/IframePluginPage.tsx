/**
 * Iframe Plugin Page
 * iframe 插件页面
 *
 * Renders an external application in an iframe for DevTools plugins
 * 在 iframe 中渲染外部应用作为 DevTools 插件
 */

interface IframePluginPageProps {
  url: string
  title: string
}

export function IframePluginPage({ url, title }: IframePluginPageProps) {
  return (
    <div className="h-full w-full">
      <iframe
        src={url}
        title={title}
        className="h-full w-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  )
}
