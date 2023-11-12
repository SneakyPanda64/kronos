import { ipcRenderer } from 'electron'

let window = {
  createWindow: (callback: any, tabIds: number[], onMouse = false, maximised = false) => {
    ipcRenderer.once('create-window-reply', (_) => {
      callback()
    })
    ipcRenderer.send('create-window', tabIds, onMouse, maximised)
  },
  closeWindow: () => {
    ipcRenderer.send('close-window')
  },
  minWindow: () => {
    ipcRenderer.send('min-window')
  },
  toggleMaxWindow: () => {
    ipcRenderer.send('toggle-max-window')
  },
  moveWindow: (callback: any, position: { x: number; y: number }) => {
    ipcRenderer.once('move-window-reply', (_) => {
      callback()
    })
    ipcRenderer.send('move-window', position)
  }
}

export { window }
