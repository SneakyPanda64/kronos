import { ipcRenderer } from 'electron'

let settings = {
  openSettings: (callback: any, type: string) => {
    ipcRenderer.once('open-settings-reply', (_) => {
      callback()
    })
    ipcRenderer.send('open-settings', type)
  }
}

export { settings }
