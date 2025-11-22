import { isBrowser } from '@react-devtools/shared'
import SuperJSON from 'superjson'
import { MergeableChannelOptions } from '../../types/channel'

const __REACT_DEVTOOLS_KIT_BROADCAST_MESSAGING_EVENT_KEY = '__REACT_DEVTOOLS_KIT_BROADCAST_MESSAGE__'

export function createBroadcastClientChannel(): MergeableChannelOptions {
  if (!isBrowser) {
    return {
      post: () => {},
      on: () => {},
    }
  }

  const channel = new BroadcastChannel(__REACT_DEVTOOLS_KIT_BROADCAST_MESSAGING_EVENT_KEY)

  return {
    post: data => channel.postMessage(SuperJSON.stringify(data)),
    on: handler => channel.addEventListener('message', (event) => {
      try {
        handler(SuperJSON.parse(event.data))
      }
      catch (e) {
        // ignore parsing errors
      }
    }),
  }
}
