import { ipcRenderer } from 'electron'

let downloads = {
  watchDownloads: (callback: any) => ipcRenderer.on('download-update', callback)
}

export { downloads }
