import { isBrowser } from '@react-devtools/shared'
import SuperJSON from 'superjson'
import { MergeableChannelOptions } from '../../types/channel'
import { __REACT_DEVTOOLS_KIT_IFRAME_MESSAGING_EVENT_KEY, getIframeServerContext } from './context'

export function createIframeServerChannel(): MergeableChannelOptions {
  if (!isBrowser) {
    return {
      post: () => {},
      on: () => {},
    }
  }

  return {
    post: (data) => {
      const iframe = getIframeServerContext()
      iframe?.contentWindow?.postMessage(SuperJSON.stringify({
        event: __REACT_DEVTOOLS_KIT_IFRAME_MESSAGING_EVENT_KEY,
        data,
      }), '*')
    },
    on: (handler) => {
      window.addEventListener('message', (event) => {
        const iframe = getIframeServerContext()
        try {
          const parsed = SuperJSON.parse<{ event: string, data: unknown }>(event.data)
          if (event.source === iframe?.contentWindow && parsed.event === __REACT_DEVTOOLS_KIT_IFRAME_MESSAGING_EVENT_KEY) {
            handler(parsed.data)
          }
        }
        catch (e) {
          // ignore parsing errors
        }
      })
    },
  }
}
