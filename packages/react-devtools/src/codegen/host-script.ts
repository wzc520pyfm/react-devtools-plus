/**
 * Host script injection code generation
 * 宿主脚本注入代码生成
 */

import type { ResolvedPluginConfig } from '../config/types'

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
): Array<{
  tag: string
  attrs?: Record<string, string | boolean>
  children?: string
  injectTo?: 'body' | 'head' | 'head-prepend' | 'body-prepend'
}> {
  const tags: Array<{
    tag: string
    attrs?: Record<string, string | boolean>
    children?: string
    injectTo?: 'body' | 'head' | 'head-prepend' | 'body-prepend'
  }> = []

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
    // Determine injection position:
    // - 'head' -> 'head-prepend' for earliest execution (network interception)
    // - 'body' -> 'body' for DOM access
    // - 'idle' -> 'body' with requestIdleCallback
    const injectTo = hostPlugin.inject === 'head'
      ? 'head-prepend' as const // Use head-prepend for earliest execution
      : hostPlugin.inject === 'body'
        ? 'body' as const
        : 'body' as const // 'idle' also goes to body

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
      })
    }
    else {
      // Development: load via Vite's module system
      const scriptSrc = `${base}@id/__plugin-host__/${hostPlugin.name}`

      if (hostPlugin.inject === 'idle') {
        // Idle injection: use requestIdleCallback
        tags.push({
          tag: 'script',
          children: generateIdleLoaderCode(scriptSrc, hostPlugin.name),
          injectTo: 'body',
        })
      }
      else {
        // Direct injection with module type
        // Note: type="module" scripts are deferred, so for network interception
        // we also inject a synchronous loader that patches fetch/XHR immediately
        if (hostPlugin.inject === 'head') {
          // For head injection, add early network patch script
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
