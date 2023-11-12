import { ipcRenderer } from 'electron'

let overlay = {
  openOverlay: (callback: any, type: string, position: { x: number; y: number }) => {
    ipcRenderer.once('open-overlay-reply', (_) => {
      callback()
    })
    ipcRenderer.send('open-overlay', type, position)
  },
  closeOverlay: (callback: any) => {
    ipcRenderer.once('close-overlay-reply', (_) => {
      callback()
    })
    ipcRenderer.send('close-overlay')
  }
}

export { overlay }
