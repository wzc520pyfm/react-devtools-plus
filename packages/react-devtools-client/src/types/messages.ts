/**
 * Message types for communication between client iframe and overlay
 */

export interface InstallComponentTreeHookMessage {
  type: '__REACT_DEVTOOLS_INSTALL_COMPONENT_TREE_HOOK__'
}

export type DevToolsMessage = InstallComponentTreeHookMessage

/**
 * Type guard to check if a message is a valid DevTools message
 */
export function isDevToolsMessage(data: any): data is DevToolsMessage {
  return data && typeof data.type === 'string' && data.type.startsWith('__REACT_DEVTOOLS_')
}
