/**
 * Network Plugin Types
 * 网络插件类型定义
 */

/**
 * Plugin options
 * 插件选项
 */
export interface NetworkPluginOptions {
  /**
   * URL patterns to ignore
   * 忽略的 URL 模式
   */
  ignore?: (string | RegExp)[]

  /**
   * Maximum number of requests to store
   * 最大存储请求数量
   * @default 500
   */
  maxRequests?: number

  /**
   * Whether to record request/response body
   * 是否记录请求/响应体
   * @default true
   */
  recordBody?: boolean
}

/**
 * Network request record
 * 网络请求记录
 */
export interface NetworkRequest {
  /** Unique request ID */
  id: string
  /** Request URL */
  url: string
  /** HTTP method */
  method: string
  /** HTTP status code */
  status?: number
  /** Status text */
  statusText?: string
  /** Request start time (timestamp) */
  startTime: number
  /** Request end time (timestamp) */
  endTime?: number
  /** Request duration (ms) */
  duration?: number
  /** Request type */
  type: 'fetch' | 'xhr' | 'resource'
  /** Request headers */
  requestHeaders?: Record<string, string>
  /** Response headers */
  responseHeaders?: Record<string, string>
  /** Request body */
  requestBody?: unknown
  /** Response body */
  responseBody?: unknown
  /** Error message if failed */
  error?: string
}

/**
 * Network statistics
 * 网络统计
 */
export interface NetworkStats {
  /** Total requests */
  total: number
  /** Successful requests (status < 400) */
  success: number
  /** Failed requests (status >= 400 or error) */
  error: number
  /** Pending requests */
  pending: number
}
