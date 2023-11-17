import { ipcRenderer } from 'electron'

const downloads = {
  watchDownloads: (callback: any) => ipcRenderer.on('download-update', callback)
}

export { downloads }
