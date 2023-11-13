import { ipcRenderer } from 'electron'

let overlay = {
  openOverlay: (callback: any, type: string, position: { x: number; y: number }, focus = true) => {
    ipcRenderer.once('open-overlay-reply', (_) => {
      callback()
    })
    ipcRenderer.send('open-overlay', type, position, focus)
  },
  closeOverlay: (callback: any) => {
    ipcRenderer.once('close-overlay-reply', (_) => {
      callback()
    })
    ipcRenderer.send('close-overlay')
  },
  sendData: (callback: any, data: any) => {
    ipcRenderer.once('send-overlay-data-reply', (_) => {
      callback()
    })
    ipcRenderer.send('send-overlay-data', data)
  },
  onData: (callback: any) => ipcRenderer.on('sending-overlay-data', callback)
}

export { overlay }
