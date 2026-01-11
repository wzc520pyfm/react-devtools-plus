/**
 * Configuration Injection Code Generation
 *
 * Generates code to inject DevTools configuration into the page.
 * Useful for micro-frontend scenarios (singleSpa) where config needs
 * to be passed from the build tool to the overlay at runtime.
 */

export interface DevToolsRuntimeConfig {
  /** Custom URL for DevTools client panel */
  clientUrl?: string
  /** CSS selector for the root container of the React app to inspect */
  rootSelector?: string
  /**
   * Micro-frontend mode
   * - 'auto': Automatically detect if DevTools is already initialized
   * - 'host': This is the host app, always initialize
   * - 'child': This is a child app, skip if DevTools exists
   * - 'standalone': Always initialize regardless of other instances
   */
  microFrontend?: 'auto' | 'host' | 'child' | 'standalone'
  /** Theme configuration */
  theme?: {
    mode?: 'auto' | 'light' | 'dark'
    primaryColor?: string
  }
  /** Assets panel configuration */
  assets?: {
    files?: string[]
  }
  /** Editor to launch when clicking on source locations */
  launchEditor?: string
}

/**
 * Generate code to inject DevTools runtime configuration
 */
export function generateConfigInjectionCode(config: DevToolsRuntimeConfig): string {
  if (!config.clientUrl && !config.rootSelector && !config.microFrontend && !config.theme && !config.assets && !config.launchEditor) {
    return ''
  }

  const configParts: string[] = []
  if (config.clientUrl) {
    configParts.push(`window.__REACT_DEVTOOLS_CONFIG__.clientUrl = ${JSON.stringify(config.clientUrl)};`)
  }
  if (config.rootSelector) {
    configParts.push(`window.__REACT_DEVTOOLS_CONFIG__.rootSelector = ${JSON.stringify(config.rootSelector)};`)
  }
  if (config.microFrontend) {
    configParts.push(`window.__REACT_DEVTOOLS_CONFIG__.microFrontend = ${JSON.stringify(config.microFrontend)};`)
  }
  if (config.theme) {
    configParts.push(`window.__REACT_DEVTOOLS_CONFIG__.theme = ${JSON.stringify(config.theme)};`)
  }
  if (config.assets) {
    configParts.push(`window.__REACT_DEVTOOLS_CONFIG__.assets = ${JSON.stringify(config.assets)};`)
  }
  if (config.launchEditor) {
    configParts.push(`window.__REACT_DEVTOOLS_CONFIG__.launchEditor = ${JSON.stringify(config.launchEditor)};`)
  }

  return `
if (typeof window !== 'undefined') {
  window.__REACT_DEVTOOLS_CONFIG__ = window.__REACT_DEVTOOLS_CONFIG__ || {};
  ${configParts.join('\n  ')}
}
`.trim()
}

/**
 * Generate script tag for config injection
 */
export function generateConfigScriptTag(config: DevToolsRuntimeConfig): {
  tag: 'script'
  attrs: Record<string, string | boolean>
  children: string
  injectTo: 'head-prepend'
} | null {
  const code = generateConfigInjectionCode(config)
  if (!code) {
    return null
  }

  return {
    tag: 'script',
    attrs: { },
    children: code,
    injectTo: 'head-prepend',
  }
}
