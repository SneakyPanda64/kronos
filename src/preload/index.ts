const { ipcRenderer, contextBridge } = require('electron')

console.log('loaded preload')

let indexBridge = {
  tabs: {
    watchTabs: (callback: any) => ipcRenderer.on('tabs-updated', callback),
    requestTabs: (callback: any) => {
      ipcRenderer.once('tabs-reply', (_, tabs) => {
        callback(tabs)
      })
      ipcRenderer.send('request-tabs')
    },
    selectTab: (tabId: number) => {
      ipcRenderer.send('select-tab', tabId)
    },
    newTab: (callback: any) => {
      ipcRenderer.once('new-tab-reply', (_, tabId) => {
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
      ipcRenderer.once('refresh-tab-reply', (_) => {
        callback()
      })
      ipcRenderer.send('refresh-tab', tabId)
    },
    holdingTabs: (callback: any, tabIds: number[]) => {
      ipcRenderer.once('holding-tabs-reply', (_) => {
        callback()
      })
      ipcRenderer.send('holding-tabs', tabIds)
    },
    onHoldingTabs: (callback: any) => ipcRenderer.on('holding-tabs', callback)
  },
  header: {
    focusSearch: (callback: any) => {
      ipcRenderer.once('focus-search-reply', (_) => {
        callback()
      })
      ipcRenderer.send('focus-search')
    },
    onFocusSearch: (callback: any) => ipcRenderer.on('focusing-search', callback)
  },
  navigation: {
    goToUrl: (callback: any, tabId: number, url: string) => {
      ipcRenderer.once('go-to-url-reply', (_) => {
        callback()
      })
      ipcRenderer.send('go-to-url', tabId, url)
    },
    goBack: (callback: any, tabId: number) => {
      ipcRenderer.once('go-back-reply', (_) => {
        callback()
      })
      ipcRenderer.send('go-back', tabId)
    },
    goForward: (callback: any, tabId: number) => {
      ipcRenderer.once('go-forward-reply', (_) => {
        callback()
      })
      ipcRenderer.send('go-forward', tabId)
    }
  },
  window: {
    createWindow: (callback: any, tabIds: number[], onMouse = false, maximised = false) => {
      ipcRenderer.once('create-window-reply', (_) => {
        callback()
      })
      ipcRenderer.send('create-window', tabIds, onMouse, maximised)
    },
    closeWindow: () => {
      ipcRenderer.send('close-window')
    },
    minWindow: () => {
      ipcRenderer.send('min-window')
    },
    toggleMaxWindow: () => {
      ipcRenderer.send('toggle-max-window')
    },
    moveWindow: (callback: any, position: { x: number; y: number }) => {
      ipcRenderer.once('move-window-reply', (_) => {
        callback()
      })
      ipcRenderer.send('move-window', position)
    }
  }
}

contextBridge.exposeInMainWorld('indexBridge', indexBridge)
