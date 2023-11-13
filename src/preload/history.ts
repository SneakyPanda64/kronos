import { ipcRenderer } from 'electron'
import { HistoryItem } from '../main/interfaces'

let history = {
  getHistory: (callback: any) => {
    ipcRenderer.once('get-history-reply', (_, history: HistoryItem[]) => {
      callback(history)
    })
    ipcRenderer.send('get-history')
  }
}

export { history }
