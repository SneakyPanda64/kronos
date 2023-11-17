import { ipcRenderer } from 'electron'
import { HistoryItem } from '../main/interfaces'

const history = {
  getHistory: (callback: any, allowQueries = false) => {
    ipcRenderer.once('get-history-reply', (_, history: HistoryItem[]) => {
      callback(history)
    })
    ipcRenderer.send('get-history', allowQueries)
  },
  clearHistory: (callback: any) => {
    ipcRenderer.once('clear-history-reply', (_) => {
      callback()
    })
    ipcRenderer.send('clear-history')
  }
}

export { history }
