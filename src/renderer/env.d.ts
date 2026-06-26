/// <reference types="vite/client" />

import type { DesktoyApi } from '../shared/api'

declare global {
  interface Window {
    api: DesktoyApi
  }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

export {}
