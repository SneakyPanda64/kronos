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
  refreshTab: (callback: any, tabId: number) => {
    ipcRenderer.once('refresh-tab-reply', (event) => {
      callback()
    })
    ipcRenderer.send('refresh-tab', tabId)
  },
  header: {
    focusSearch: (callback: any) => {
      ipcRenderer.once('focus-search-reply', (event) => {
        callback()
      })
      ipcRenderer.send('focus-search')
    },
    onFocusSearch: (callback: any) => ipcRenderer.on('focusing-search', callback)
  },
  navigation: {
    goToUrl: (callback: any, tabId: number, url: string) => {
      ipcRenderer.once('go-to-url-reply', (event, errorId: string) => {
        callback(errorId)
      })
      ipcRenderer.send('go-to-url', tabId, url)
    },
    goBack: (callback: any, tabId: number) => {
      ipcRenderer.once('go-back-reply', (event) => {
        callback()
      })
      ipcRenderer.send('go-back', tabId)
    },
    goForward: (callback: any, tabId: number) => {
      ipcRenderer.once('go-forward-reply', (event) => {
        callback()
      })
      ipcRenderer.send('go-forward', tabId)
    }
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
