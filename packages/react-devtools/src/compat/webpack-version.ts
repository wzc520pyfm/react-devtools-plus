/**
 * Webpack Version Detection
 *
 * Provides utilities for detecting Webpack version and adapting behavior accordingly.
 */

// Use 'any' for Compiler to support both webpack 4 and 5 types
type Compiler = any

/**
 * Webpack version information
 */
export interface WebpackVersionInfo {
  /** Major version number (4 or 5) */
  major: number
  /** Full version string */
  version: string
  /** Whether this is Webpack v4.x */
  isWebpack4: boolean
  /** Whether this is Webpack v5.x */
  isWebpack5: boolean
}

/**
 * Detect Webpack version from compiler instance
 *
 * Detection strategy (ordered by reliability):
 * 1. compiler.webpack.version (Webpack 5+)
 * 2. Check for Webpack 4-specific APIs that don't exist in Webpack 5
 * 3. Presence of compiler.webpack property (Webpack 5 indicator)
 * 4. Default to Webpack 4 for safety
 */
export function detectWebpackVersion(compiler: Compiler): WebpackVersionInfo {
  let version = ''
  let major = 4

  // Method 1: Check webpack.version directly (Webpack 5+)
  const webpackVersion = compiler.webpack?.version || ''
  if (webpackVersion) {
    version = webpackVersion
    major = Number.parseInt(version.split('.')[0], 10) || 4
  }
  // Method 2: Check for Webpack 4-specific behavior
  // In Webpack 4, compiler.webpack doesn't exist
  // In Webpack 5, compiler.webpack is the webpack namespace object
  else if (compiler.webpack === undefined) {
    // No compiler.webpack means Webpack 4
    major = 4
    version = '4.x (detected by missing compiler.webpack)'
  }
  // Method 3: Check if compiler has webpack property (Webpack 5 indicator)
  else if (compiler.webpack) {
    major = 5
    version = '5.x'
  }
  // Method 4: Default to Webpack 4 for safety (more compatible)
  else {
    major = 4
    version = '4.x (assumed)'
  }

  return {
    major,
    version,
    isWebpack4: major === 4,
    isWebpack5: major >= 5,
  }
}

/**
 * Check if webpack version is 4.x
 */
export function isWebpack4(compiler: Compiler): boolean {
  return detectWebpackVersion(compiler).isWebpack4
}

/**
 * Check if webpack version is 5.x or newer
 */
export function isWebpack5(compiler: Compiler): boolean {
  return detectWebpackVersion(compiler).isWebpack5
}

/**
 * Entry format adapter for different webpack versions
 */
export const WebpackEntryAdapter = {
  /**
   * Format entry for Webpack 4 (array format)
   */
  webpack4(files: string[]): string[] {
    return files
  },

  /**
   * Format entry for Webpack 5 (descriptor object format)
   */
  webpack5(files: string[], descriptor: Record<string, any> = {}): { import: string[], [key: string]: any } {
    return {
      ...descriptor,
      import: files,
    }
  },

  /**
   * Format entry based on detected version
   */
  adapt(
    compiler: Compiler,
    files: string[],
    descriptor?: Record<string, any>,
  ): string[] | { import: string[], [key: string]: any } {
    if (isWebpack4(compiler)) {
      return this.webpack4(files)
    }
    return this.webpack5(files, descriptor)
  },
}
