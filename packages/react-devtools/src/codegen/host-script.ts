/**
 * Host script injection code generation
 * 宿主脚本注入代码生成
 */

import type { ResolvedPluginConfig } from '../config/types'

// Type definitions (inline to avoid circular dependency during build)
type InjectFunction = (html: string, content: string) => string

interface NormalizedInjectConfig {
  target: 'head' | 'body'
  position: 'before' | 'after' | 'prepend' | 'append'
  selector?: string
  selectLast?: boolean
  idle?: boolean
  fallback: 'prepend' | 'append'
  injectFn?: InjectFunction
}

/**
 * Vite HTML tag descriptor with extended inject options
 * Vite HTML 标签描述符（扩展注入选项）
 */
export interface HtmlTagDescriptor {
  tag: string
  attrs?: Record<string, string | boolean>
  children?: string
  /**
   * Basic injection position (for Vite's transformIndexHtml)
   * 基础注入位置（用于 Vite 的 transformIndexHtml）
   */
  injectTo?: 'body' | 'head' | 'head-prepend' | 'body-prepend'
  /**
   * Advanced injection config (for custom HTML processing)
   * 高级注入配置（用于自定义 HTML 处理）
   */
  injectConfig?: NormalizedInjectConfig
}

/**
 * Convert NormalizedInjectConfig to Vite's injectTo format
 * 将 NormalizedInjectConfig 转换为 Vite 的 injectTo 格式
 *
 * Note: Vite's injectTo only supports basic positions.
 * For advanced positioning (with selectors), we need custom HTML processing.
 * 注意：Vite 的 injectTo 只支持基本位置。
 * 对于高级定位（带选择器），需要自定义 HTML 处理。
 */
function toViteInjectTo(config: NormalizedInjectConfig): 'body' | 'head' | 'head-prepend' | 'body-prepend' {
  const { target, position } = config

  if (target === 'head') {
    return position === 'prepend' ? 'head-prepend' : 'head'
  }
  else {
    return position === 'prepend' ? 'body-prepend' : 'body'
  }
}

/**
 * Generate script tag for host plugin injection
 * 生成宿主插件注入的 script 标签
 *
 * For network interception to work properly, host scripts need to be injected
 * as early as possible. We use 'head-prepend' for 'head' inject mode to ensure
 * the script runs before other scripts and network requests.
 */
export function generateHostScriptTags(
  config: ResolvedPluginConfig,
  base: string,
  isProduction: boolean,
): HtmlTagDescriptor[] {
  const tags: HtmlTagDescriptor[] = []

  if (config.hostPlugins.length === 0) {
    return tags
  }

  // Generate plugin options injection script (must be first)
  const optionsScript = generatePluginOptionsScript(config)
  if (optionsScript) {
    tags.push({
      tag: 'script',
      children: optionsScript,
      injectTo: 'head-prepend',
    })
  }

  // Generate host script loaders for each plugin
  for (const hostPlugin of config.hostPlugins) {
    const injectConfig = hostPlugin.injectConfig
    const isIdle = injectConfig.idle

    // Convert to Vite's injectTo for basic positioning
    // For advanced positioning with selectors, the injectConfig is preserved
    const injectTo = toViteInjectTo(injectConfig)

    if (isProduction) {
      // Production: load from bundled assets
      // Host scripts should be bundled separately during build
      tags.push({
        tag: 'script',
        attrs: {
          'type': 'module',
          'src': `${base}assets/plugin-host-${hostPlugin.name}.js`,
          'data-plugin': hostPlugin.name,
        },
        injectTo,
        injectConfig,
      })
    }
    else {
      // Development: load via Vite's module system
      const scriptSrc = `${base}@id/__plugin-host__/${hostPlugin.name}`

      if (isIdle) {
        // Idle injection: use requestIdleCallback
        tags.push({
          tag: 'script',
          children: generateIdleLoaderCode(scriptSrc, hostPlugin.name),
          injectTo: 'body',
          injectConfig,
        })
      }
      else {
        // Direct injection with module type
        // Note: type="module" scripts are deferred, so for network interception
        // we also inject a synchronous loader that patches fetch/XHR immediately
        if (injectConfig.target === 'head' && injectConfig.position === 'prepend') {
          // For head-prepend injection, add early network patch script
          tags.push({
            tag: 'script',
            children: generateEarlyNetworkPatchScript(),
            injectTo: 'head-prepend',
          })
        }

        tags.push({
          tag: 'script',
          attrs: {
            'type': 'module',
            'src': scriptSrc,
            'data-plugin': hostPlugin.name,
          },
          injectTo,
          injectConfig,
        })
      }
    }
  }

  return tags
}

/**
 * Generate early network patch script
 * 生成早期网络补丁脚本
 *
 * This script patches fetch and XHR immediately (synchronously) to ensure
 * no requests are missed before the module-based host script loads.
 */
function generateEarlyNetworkPatchScript(): string {
  return `
(function() {
  // Store original functions for later use by host scripts
  if (typeof window !== 'undefined') {
    window.__DEVTOOLS_ORIGINAL_FETCH__ = window.fetch;
    window.__DEVTOOLS_ORIGINAL_XHR__ = window.XMLHttpRequest;

    // Queue to store early requests before host script initializes
    window.__DEVTOOLS_EARLY_REQUESTS__ = [];

    // Patch fetch early
    var originalFetch = window.fetch;
    window.fetch = function(input, init) {
      var request = { input: input, init: init, time: Date.now(), type: 'fetch' };
      window.__DEVTOOLS_EARLY_REQUESTS__.push(request);
      return originalFetch.apply(this, arguments);
    };

    // Patch XHR early
    var OriginalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
      var xhr = new OriginalXHR();
      var originalOpen = xhr.open;
      xhr.open = function(method, url) {
        window.__DEVTOOLS_EARLY_REQUESTS__.push({
          method: method,
          url: url,
          time: Date.now(),
          type: 'xhr',
          xhr: xhr
        });
        return originalOpen.apply(this, arguments);
      };
      return xhr;
    };
    // Copy static properties
    for (var prop in OriginalXHR) {
      if (OriginalXHR.hasOwnProperty(prop)) {
        try { window.XMLHttpRequest[prop] = OriginalXHR[prop]; } catch(e) {}
      }
    }
    window.XMLHttpRequest.prototype = OriginalXHR.prototype;
  }
})();
`.trim()
}

/**
 * Generate plugin options injection script
 * 生成插件选项注入脚本
 */
function generatePluginOptionsScript(config: ResolvedPluginConfig): string | null {
  const optionsMap: Record<string, any> = {}

  for (const plugin of config.hostPlugins) {
    if (plugin.options) {
      optionsMap[plugin.name] = plugin.options
    }
  }

  if (Object.keys(optionsMap).length === 0) {
    return null
  }

  return `
(function() {
  window.__REACT_DEVTOOLS_PLUGIN_OPTIONS__ = ${JSON.stringify(optionsMap)};
})();
`.trim()
}

/**
 * Generate idle loader code for a plugin
 * 生成插件的空闲加载代码
 */
function generateIdleLoaderCode(scriptSrc: string, pluginName: string): string {
  return `
(function() {
  function loadPlugin() {
    var script = document.createElement('script');
    script.type = 'module';
    script.src = ${JSON.stringify(scriptSrc)};
    script.dataset.plugin = ${JSON.stringify(pluginName)};
    document.body.appendChild(script);
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadPlugin);
  } else {
    setTimeout(loadPlugin, 1);
  }
})();
`.trim()
}

/**
 * Virtual module prefix for host scripts
 * 宿主脚本的虚拟模块前缀
 */
export const HOST_SCRIPT_PREFIX = '__plugin-host__/'

/**
 * Check if a module ID is a host script request
 * 检查模块 ID 是否为宿主脚本请求
 */
export function isHostScriptRequest(id: string): boolean {
  return id.includes(HOST_SCRIPT_PREFIX)
}

/**
 * Extract plugin name from host script request
 * 从宿主脚本请求中提取插件名称
 */
export function extractPluginNameFromHostRequest(id: string): string | null {
  const match = id.match(new RegExp(`${HOST_SCRIPT_PREFIX}([^/]+)`))
  return match ? match[1] : null
}

/**
 * Generate host script wrapper code
 * 生成宿主脚本包装代码
 *
 * This wraps the actual host script with initialization logic
 */
export function generateHostScriptWrapper(
  pluginName: string,
  hostScriptPath: string,
): string {
  return `
// Host script wrapper for plugin: ${pluginName}
import hostModule from ${JSON.stringify(hostScriptPath)};

// The host script should call defineHostPlugin internally
// If it exports a default, it's already registered
if (typeof hostModule === 'function') {
  // If the module exports a function, call it
  hostModule();
}

console.log('[DevTools Plugin] Host script loaded: ${pluginName}');
`.trim()
}

/**
 * Generate Webpack entry code for host scripts
 * 生成 Webpack 宿主脚本入口代码
 */
export function generateHostScriptEntryCode(
  hostPlugins: ResolvedPluginConfig['hostPlugins'],
): string {
  if (hostPlugins.length === 0) {
    return ''
  }

  const imports = hostPlugins.map(
    (plugin, index) => `import host${index} from ${JSON.stringify(plugin.src)};`,
  )

  const registrations = hostPlugins.map(
    (plugin, index) => `
// Register plugin: ${plugin.name}
if (typeof host${index} === 'function') {
  host${index}();
}
`,
  )

  return `
// DevTools Plugin Host Scripts
// Generated automatically - do not edit

${imports.join('\n')}

// Initialize host plugins
(function() {
  ${registrations.join('\n')}
  console.log('[DevTools] Host scripts initialized');
})();
`.trim()
}

/**
 * Serialize HtmlTagDescriptor to HTML string
 * 将 HtmlTagDescriptor 序列化为 HTML 字符串
 */
export function serializeTag(tag: HtmlTagDescriptor): string {
  const attrs = tag.attrs
    ? Object.entries(tag.attrs)
        .filter(([_, value]) => value !== false && value !== undefined)
        .map(([key, value]) => (value === true ? key : `${key}="${escapeHtml(String(value))}"`))
        .join(' ')
    : ''

  const openTag = attrs ? `<${tag.tag} ${attrs}>` : `<${tag.tag}>`
  const closeTag = `</${tag.tag}>`

  if (tag.children) {
    return `${openTag}${tag.children}${closeTag}`
  }

  return `${openTag}${closeTag}`
}

/**
 * Escape HTML special characters
 * 转义 HTML 特殊字符
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Insert tag into HTML at specified position
 * 在指定位置将标签插入 HTML
 *
 * This function handles both function-based and position-based injection.
 * For basic injection, use Vite's transformIndexHtml.
 *
 * @param html - The HTML string to modify
 * @param tag - The tag descriptor to insert
 * @returns Modified HTML string
 */
export function insertTagIntoHtml(html: string, tag: HtmlTagDescriptor): string {
  const config = tag.injectConfig
  const serializedTag = serializeTag(tag)

  // If config has a custom inject function, use it
  if (config?.injectFn) {
    try {
      return config.injectFn(html, serializedTag)
    }
    catch (error) {
      console.warn(`[DevTools] Custom inject function failed, falling back to basic injection:`, error)
      return insertTagBasic(html, tag)
    }
  }

  // If no advanced config, fall back to basic injection
  if (!config) {
    return insertTagBasic(html, tag)
  }

  // Use basic position-based injection
  return insertTagBasic(html, tag, config.fallback)
}

/**
 * Basic tag insertion (prepend/append to container)
 * 基础标签插入（在容器前置/后置）
 */
function insertTagBasic(
  html: string,
  tag: HtmlTagDescriptor,
  fallbackPosition?: 'prepend' | 'append',
): string {
  const config = tag.injectConfig
  const position = fallbackPosition || config?.position || 'append'
  const target = config?.target || (tag.injectTo?.includes('head') ? 'head' : 'body')
  const serializedTag = serializeTag(tag)

  if (position === 'prepend') {
    // Insert after opening tag
    const openTagRegex = target === 'head' ? /<head[^>]*>/i : /<body[^>]*>/i
    const match = html.match(openTagRegex)
    if (match) {
      const insertPos = match.index! + match[0].length
      return `${html.slice(0, insertPos)}\n${serializedTag}${html.slice(insertPos)}`
    }
  }
  else {
    // Insert before closing tag
    const closeTagRegex = target === 'head' ? /<\/head>/i : /<\/body>/i
    const match = html.match(closeTagRegex)
    if (match) {
      return `${html.slice(0, match.index!)}${serializedTag}\n${html.slice(match.index!)}`
    }
  }

  return html
}

/**
 * Generate HTML inject tags from plugin config
 * 从插件配置生成 HTML 注入标签
 */
export function generateHtmlInjectTags(
  config: ResolvedPluginConfig,
): HtmlTagDescriptor[] {
  const tags: HtmlTagDescriptor[] = []

  for (const plugin of config.plugins) {
    if (!plugin.htmlInject || plugin.htmlInject.length === 0) {
      continue
    }

    for (const htmlInject of plugin.htmlInject) {
      const injectConfig = normalizeHtmlInjectPosition(htmlInject.inject)

      tags.push({
        tag: htmlInject.tag,
        attrs: htmlInject.attrs,
        children: htmlInject.children,
        injectTo: toViteInjectTo(injectConfig),
        injectConfig,
      })
    }
  }

  return tags
}

type InjectPosition = 'head' | 'head-prepend' | 'body' | 'body-prepend' | 'idle' | InjectFunction

/**
 * Normalize HTML inject position
 * 规范化 HTML 注入位置
 */
function normalizeHtmlInjectPosition(inject: InjectPosition | undefined): NormalizedInjectConfig {
  if (!inject) {
    return {
      target: 'head',
      position: 'append',
      fallback: 'append',
    }
  }

  if (typeof inject === 'function') {
    return {
      target: 'head',
      position: 'append',
      fallback: 'append',
      injectFn: inject,
    }
  }

  switch (inject) {
    case 'head':
      return { target: 'head', position: 'append', fallback: 'append' }
    case 'head-prepend':
      return { target: 'head', position: 'prepend', fallback: 'prepend' }
    case 'body':
      return { target: 'body', position: 'append', fallback: 'append' }
    case 'body-prepend':
      return { target: 'body', position: 'prepend', fallback: 'prepend' }
    case 'idle':
      return { target: 'body', position: 'append', idle: true, fallback: 'append' }
    default:
      return { target: 'head', position: 'append', fallback: 'append' }
  }
}
