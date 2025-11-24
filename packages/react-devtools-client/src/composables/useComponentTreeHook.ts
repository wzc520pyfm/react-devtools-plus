import type { InstallComponentTreeHookMessage } from '~/types/messages'
import { useEffect, useRef } from 'react'

/**
 * Custom hook to ensure component tree hook is installed
 * Only sends the installation request once when tree is not available
 */
export function useComponentTreeHook(tree: any) {
  const installRequestedRef = useRef(false)

  useEffect(() => {
    // Only request installation once and only if tree is not available
    if (!installRequestedRef.current && !tree) {
      installRequestedRef.current = true

      // Request the overlay (parent window) to install the component tree hook
      // Since we're in an iframe, we need to send message to parent
      const message: InstallComponentTreeHookMessage = {
        type: '__REACT_DEVTOOLS_INSTALL_COMPONENT_TREE_HOOK__',
      }
      window.parent.postMessage(message, '*')
    }
  }, [tree])
}
