import { isBrowser } from '@react-devtools/shared'
import SuperJSON from 'superjson'
import { MergeableChannelOptions } from '../../types/channel'
import { __REACT_DEVTOOLS_KIT_IFRAME_MESSAGING_EVENT_KEY } from './context'

export function createIframeClientChannel(): MergeableChannelOptions {
  if (!isBrowser) {
    return {
      post: () => {},
      on: () => {},
    }
  }

  return {
    post: data => window.parent.postMessage(SuperJSON.stringify({
      event: __REACT_DEVTOOLS_KIT_IFRAME_MESSAGING_EVENT_KEY,
      data,
    }), '*'),
    on: handler => window.addEventListener('message', (event) => {
      try {
        const parsed = SuperJSON.parse<{ event: string, data: unknown }>(event.data)
        if (event.source === window.parent && parsed.event === __REACT_DEVTOOLS_KIT_IFRAME_MESSAGING_EVENT_KEY) {
          handler(parsed.data)
        }
      }
      catch (e) {
        // ignore parsing errors
      }
    }),
  }
}
