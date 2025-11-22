import { defineConfig } from 'unocss'

import config from './packages/react-devtools-client/uno.config'

export default defineConfig({
  ...config,
  configDeps: [
    './packages/react-devtools-client/uno.config.ts',
  ],
})
