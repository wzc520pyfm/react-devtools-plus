/**
 * React Global Code Generation
 *
 * Handles generation of code that exposes React and ReactDOM to window
 * for overlay compatibility, especially in CDN-loaded React scenarios (singleSpa).
 */

/**
 * Options for React globals initialization
 */
export interface ReactGlobalsOptions {
  /** Whether to try loading react-dom/client for React 18+ */
  tryReactDOMClient?: boolean
  /** Whether to dispatch a ready event */
  dispatchReadyEvent?: boolean
}

/**
 * Generate React globals initialization code for Vite virtual module
 *
 * NOTE: Uses dynamic imports and try-catch to support CDN-loaded React scenarios
 */
export function generateReactGlobalsESMCode(options: ReactGlobalsOptions = {}): string {
  const { dispatchReadyEvent = true } = options

  // Use a more robust approach that works with both npm and CDN React
  let code = `
// React DevTools: Setup React globals for overlay
// Supports both npm-installed React and CDN-loaded React (like singleSpa)
(async function() {
  if (typeof window === 'undefined') return;

  // Check if React is already available on window (CDN scenario)
  let React = window.React;
  let ReactDOM = window.ReactDOM;

  // If not found, try to import from node_modules
  if (!React) {
    try {
      const reactModule = await import('react');
      React = reactModule.default || reactModule;
      window.React = React;
    } catch (e) {
      // React not available via import, must be loaded via CDN
      console.debug('[React DevTools] React not found in node_modules, using window.React');
    }
  }

  if (!ReactDOM) {
    try {
      const reactDomModule = await import('react-dom');
      // In React 19, the module exports are at the top level, not under .default
      ReactDOM = reactDomModule.default || reactDomModule;
      window.ReactDOM = ReactDOM;
    } catch (e) {
      // ReactDOM not available via import, must be loaded via CDN
    }
  }

  // Try to add createRoot support for React 18+ (optional)
  // IMPORTANT: For React 18, createRoot is in react-dom/client
  // For React 19, createRoot is exported from both react-dom and react-dom/client
  if (ReactDOM && !ReactDOM.createRoot) {
    try {
      // Import react-dom/client - Vite will transform this to the correct URL
      const reactDomClientModule = await import('react-dom/client');
      // Get createRoot from the module - it's a named export, not default
      const createRoot = reactDomClientModule.createRoot;
      const hydrateRoot = reactDomClientModule.hydrateRoot;
      if (createRoot) {
        // Merge createRoot and hydrateRoot into ReactDOM
        window.ReactDOM = { ...ReactDOM, createRoot, hydrateRoot };
      }
    } catch (e) {
      // react-dom/client not available, which is fine for React 17 or CDN
    }
  }
`

  if (dispatchReadyEvent) {
    code += `
  // Signal that React globals are ready
  window.__REACT_DEVTOOLS_GLOBALS_READY__ = true;
  // Dispatch event for waiting scripts
  window.dispatchEvent(new CustomEvent('react-devtools-globals-ready'));
`
  }

  code += `})();
`

  return code.trim()
}

/**
 * Generate React globals initialization code for Webpack (CommonJS)
 *
 * NOTE: All requires are wrapped in try-catch to support CDN-loaded React
 */
export function generateReactGlobalsCJSCode(options: ReactGlobalsOptions = {}): string {
  const { tryReactDOMClient = true } = options

  let code = `
// React DevTools: Setup React globals for overlay
// Supports both npm-installed React and CDN-loaded React (like singleSpa)

if (typeof window !== 'undefined') {
  // Check if React is already available on window (CDN scenario)
  var React = window.React;
  var ReactDOM = window.ReactDOM;

  // If not found, try to require from node_modules
  if (!React) {
    try {
      React = require('react');
      window.React = React;
    } catch (e) {
      // React not available via require, must be loaded via CDN
    }
  }

  if (!ReactDOM) {
    try {
      ReactDOM = require('react-dom');
      window.ReactDOM = ReactDOM;
    } catch (e) {
      // ReactDOM not available via require, must be loaded via CDN
    }
  }
`
  if (tryReactDOMClient) {
    code += `
  // Try to add createRoot support for React 18+ (optional)
  if (ReactDOM && !ReactDOM.createRoot) {
    try {
      var ReactDOMClient = require('react-dom/client');
      if (ReactDOMClient && ReactDOMClient.createRoot) {
        window.ReactDOM = Object.assign({}, ReactDOM, ReactDOMClient);
      }
    } catch (e) {
      // react-dom/client not available, which is fine for React 17 or CDN
    }
  }
`
  }

  code += `}
`

  return code.trim()
}

/**
 * Generate the code that loads overlay with globals ready check
 */
export function generateOverlayLoaderCode(scriptSrc: string): string {
  return `
function loadOverlay() {
  import('${scriptSrc}').catch(err => {
    console.warn('[React DevTools] Failed to load overlay:', err);
  });
}
if (window.__REACT_DEVTOOLS_GLOBALS_READY__) {
  loadOverlay();
} else {
  window.addEventListener('react-devtools-globals-ready', loadOverlay, { once: true });
  // Fallback timeout in case event was missed
  setTimeout(() => {
    if (!window.__REACT_DEVTOOLS_OVERLAY_LOADED__) {
      window.__REACT_DEVTOOLS_OVERLAY_LOADED__ = true;
      loadOverlay();
    }
  }, 1000);
}
`.trim()
}

/**
 * Generate script tags for React globals and overlay loading
 */
export function generateReactGlobalsScriptTags(
  base: string,
  overlayScriptSrc: string,
): Array<{
  tag: string
  attrs?: Record<string, string | boolean>
  children?: string
  injectTo?: 'body' | 'head' | 'head-prepend' | 'body-prepend'
}> {
  return [
    // React globals setup via virtual module
    {
      tag: 'script',
      attrs: {
        type: 'module',
        src: `${base}@id/__react-devtools-globals__`,
      },
      injectTo: 'head',
    },
    // Overlay loader with globals ready check
    {
      tag: 'script',
      attrs: {
        type: 'module',
      },
      children: generateOverlayLoaderCode(overlayScriptSrc),
      injectTo: 'body',
    },
  ]
}
