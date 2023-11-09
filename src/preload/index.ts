const { ipcRenderer, contextBridge } = require('electron')

console.log('loaded preload')

let indexBridge = {
  watchTabs: (callback: any) => ipcRenderer.on('tabs-updated', callback),
  requestTabs: (callback: any) => {
    ipcRenderer.once('tabs-reply', (event, tabs) => {
      callback(tabs)
    })
    ipcRenderer.send('request-tabs')
  },
  selectTab: (tabId: number) => {
    ipcRenderer.send('select-tab', tabId)
  },
  newTab: (callback: any) => {
    ipcRenderer.once('new-tab-reply', (event, tabId) => {
      callback(tabId)
    })
    ipcRenderer.send('new-tab')
  },
  deleteTab: (callback: any, tabId: number) => {
    ipcRenderer.once('delete-tab-reply', (event) => {
      callback()
    })
    ipcRenderer.send('delete-tab', tabId)
  },
  window: {
    closeWindow: (windowId: number) => {
      ipcRenderer.send('close-window', windowId)
    },
    minWindow: (windowId: number) => {
      ipcRenderer.send('min-window', windowId)
    },
    toggleMaxWindow: (windowId: number) => {
      ipcRenderer.send('toggle-max-window', windowId)
    }
  }
}

contextBridge.exposeInMainWorld('indexBridge', indexBridge)
