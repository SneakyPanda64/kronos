const { ipcRenderer } = require('electron')

let tabs = {
  watchTabs: (callback: any) => ipcRenderer.on('tabs-updated', callback),
  watchSelectedTab: (callback: any) => ipcRenderer.on('selected-tab-updated', callback),
  requestTabs: (callback: any) => {
    ipcRenderer.once('tabs-reply', (_, tabs) => {
      callback(tabs)
    })
    ipcRenderer.send('request-tabs')
  },
  selectTab: (tabId: number) => {
    ipcRenderer.send('select-tab', tabId)
  },
  newTab: (callback: any, url = '') => {
    ipcRenderer.once('new-tab-reply', (_, tabId) => {
      callback(tabId)
    })
    ipcRenderer.send('new-tab', url)
  },
  deleteTab: (callback: any, tabId: number) => {
    ipcRenderer.once('delete-tab-reply', (_) => {
      callback()
    })
    ipcRenderer.send('delete-tab', tabId)
  },
  refreshTab: (callback: any, tabId: number) => {
    ipcRenderer.once('refresh-tab-reply', (_) => {
      callback()
    })
    ipcRenderer.send('refresh-tab', tabId)
  },
  moveTabs: (callback: any, tabIds: number[]) => {
    ipcRenderer.once('move-tabs-reply', (_, moved: boolean) => {
      callback(moved)
    })
    ipcRenderer.send('move-tabs', tabIds)
  }
}
// module.exports = tabs

export { tabs }
