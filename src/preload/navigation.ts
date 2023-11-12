import { ipcRenderer } from 'electron'

let navigation = {
  goToUrl: (callback: any, tabId: number, url: string) => {
    ipcRenderer.once('go-to-url-reply', (_) => {
      callback()
    })
    ipcRenderer.send('go-to-url', tabId, url)
  },
  goBack: (callback: any, tabId: number) => {
    ipcRenderer.once('go-back-reply', (_) => {
      callback()
    })
    ipcRenderer.send('go-back', tabId)
  },
  goForward: (callback: any, tabId: number) => {
    ipcRenderer.once('go-forward-reply', (_) => {
      callback()
    })
    ipcRenderer.send('go-forward', tabId)
  }
}

export { navigation }
