import { ipcRenderer } from 'electron'

const header = {
  focusSearch: (callback: any) => {
    ipcRenderer.once('focus-search-reply', (_) => {
      callback()
    })
    ipcRenderer.send('focus-search')
  },
  onFocusSearch: (callback: any) => ipcRenderer.on('focusing-search', callback)
}

export { header }
