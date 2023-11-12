import { ipcRenderer } from 'electron'

let header = {
  focusSearch: (callback: any) => {
    ipcRenderer.once('focus-search-reply', (_) => {
      callback()
    })
    ipcRenderer.send('focus-search')
  },
  onFocusSearch: (callback: any) => ipcRenderer.on('focusing-search', callback),
  proxyHeader: (callback: any, channel: string) => {
    console.log('QWDQWDWQDQWD')
    ipcRenderer.once('proxy-header-reply', (_) => {
      callback()
    })
    ipcRenderer.send('proxy-header', channel)
  },
  onProxyHeader: (callback: any) => ipcRenderer.on('proxying-header', callback)
}

export { header }
