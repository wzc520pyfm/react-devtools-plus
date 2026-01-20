/**
 * Context passed to plugin components
 * 传递给插件组件的上下文
 */
export interface DevToolsPluginContext {
  tree: any
  selectedNodeId: string | null
  theme: any
  // We can add more RPC-like helpers here later if needed
}

// ============================================================================
// Serialized Plugin Types (received from server)
// 序列化插件类型（从服务器接收）
// ============================================================================

/**
 * View source metadata for component plugins loaded from npm packages
 * 从 npm 包加载的组件插件的视图源元数据
 */
export interface ViewMeta {
  packageName: string
  exportName: string
  bundlePath: string
}

/**
 * Serialized component view (from server)
 * 序列化的组件视图（来自服务器）
 */
export interface SerializedComponentView {
  type: 'component'
  src: ViewMeta | string
}

/**
 * Serialized iframe view (from server)
 * 序列化的 iframe 视图（来自服务器）
 */
export interface SerializedIframeView {
  type: 'iframe'
  src: string
}

/**
 * Serialized view union type
 * 序列化视图联合类型
 */
export type SerializedView = SerializedComponentView | SerializedIframeView

/**
 * Serialized plugin (from server)
 * 序列化插件（来自服务器）
 */
export interface SerializedPlugin {
  name: string
  title: string
  icon?: string
  view: SerializedView
}

// ============================================================================
// Loaded Plugin Types (after dynamic import)
// 加载后的插件类型（动态导入后）
// ============================================================================

/**
 * Loaded component view with the actual React component
 * 加载后的组件视图，包含实际的 React 组件
 */
export interface LoadedComponentView {
  type: 'component'
  component?: React.ComponentType<DevToolsPluginContext>
}

/**
 * Loaded iframe view (same as serialized)
 * 加载后的 iframe 视图（与序列化相同）
 */
export interface LoadedIframeView {
  type: 'iframe'
  src: string
}

/**
 * Loaded view union type
 * 加载后的视图联合类型
 */
export type LoadedView = LoadedComponentView | LoadedIframeView

/**
 * Loaded plugin with resolved view
 * 加载后的插件，包含已解析的视图
 */
export interface LoadedPlugin {
  name: string
  title: string
  icon?: string
  view: LoadedView
}

// ============================================================================
// Legacy Types (for backward compatibility)
// 旧类型（向后兼容）
// ============================================================================

/**
 * @deprecated Use SerializedPlugin instead
 */
export interface UserPluginView {
  title: string
  icon: string
  src: string
}

/**
 * @deprecated Use SerializedPlugin instead
 */
export interface UserPlugin {
  name: string
  view?: UserPluginView
}
