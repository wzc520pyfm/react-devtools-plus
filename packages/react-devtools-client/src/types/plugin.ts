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
 * Renderer metadata for component plugins loaded from npm packages
 * 从 npm 包加载的组件插件的渲染器元数据
 */
export interface RendererMeta {
  packageName: string
  exportName: string
  bundlePath: string
}

/**
 * Serialized component plugin (from server)
 * 序列化的组件插件（来自服务器）
 */
export interface SerializedComponentPlugin {
  id: string
  type: 'component'
  title: string
  icon?: string
  renderer: RendererMeta | string
}

/**
 * Serialized iframe plugin (from server)
 * 序列化的 iframe 插件（来自服务器）
 */
export interface SerializedIframePlugin {
  id: string
  type: 'iframe'
  title: string
  icon?: string
  url: string
}

/**
 * Serialized plugin union type
 * 序列化插件联合类型
 */
export type SerializedPlugin = SerializedComponentPlugin | SerializedIframePlugin

// ============================================================================
// Loaded Plugin Types (after dynamic import)
// 加载后的插件类型（动态导入后）
// ============================================================================

/**
 * Loaded component plugin with the actual React component
 * 加载后的组件插件，包含实际的 React 组件
 */
export interface LoadedComponentPlugin {
  id: string
  type: 'component'
  title: string
  icon?: string
  component?: React.ComponentType<DevToolsPluginContext>
}

/**
 * Loaded iframe plugin (same as serialized)
 * 加载后的 iframe 插件（与序列化相同）
 */
export interface LoadedIframePlugin {
  id: string
  type: 'iframe'
  title: string
  icon?: string
  url: string
}

/**
 * Loaded plugin union type
 * 加载后的插件联合类型
 */
export type LoadedPlugin = LoadedComponentPlugin | LoadedIframePlugin

// ============================================================================
// Legacy Types (for backward compatibility)
// 旧类型（向后兼容）
// ============================================================================

/**
 * @deprecated Use SerializedComponentPlugin instead
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
