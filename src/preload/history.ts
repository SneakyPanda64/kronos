import { ipcRenderer } from 'electron'
import { HistoryItem } from '../main/interfaces'

let history = {
  getHistory: (callback: any, allowQueries = false) => {
    ipcRenderer.once('get-history-reply', (_, history: HistoryItem[]) => {
      callback(history)
    })
    ipcRenderer.send('get-history', allowQueries)
  }
}

export { history }
