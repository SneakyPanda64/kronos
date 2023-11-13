import { ipcRenderer } from 'electron'

let header = {
  focusSearch: (callback: any) => {
    ipcRenderer.once('focus-search-reply', (_) => {
      callback()
    })
    ipcRenderer.send('focus-search')
  },
  onFocusSearch: (callback: any) => ipcRenderer.on('focusing-search', callback)
}

export { header }
