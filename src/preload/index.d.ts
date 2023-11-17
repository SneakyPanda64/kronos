import { indexBridge } from '.'

declare global {
  interface Window {
    indexBridge?: typeof indexBridge
  }
}
