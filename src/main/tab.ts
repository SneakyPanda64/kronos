import { BrowserView, BrowserWindow } from 'electron'
// import { resolveHtmlPath } from './util'
import path from 'path'
import { getViewById, getFavicon, router } from './util'
import { is } from '@electron-toolkit/utils'
import { encode } from 'js-base64'

const NAVIGATOR_HEIGHT = 80
const WINDOW_WIDTH = 600

export function getHeader(win: BrowserWindow) {
  let header = win.getBrowserViews()[0]
  return header
}

export async function selectTab(tabId: number) {
  let view = getViewById(tabId)
  if (view == null) return
  let win = BrowserWindow.fromBrowserView(view)
  if (win == null) return
  getTabs(win.id).forEach((element) => {
    if (element.id !== tabId) {
      hideTab(element.id)
    } else {
      showTab(tabId)
    }
  })
}

export async function deleteTab(tabId: number) {
  let view = getViewById(tabId)
  if (view == null) return
  let win = BrowserWindow.fromBrowserView(view)
  if (win == null) return
  win.removeBrowserView(view)
  ;(view.webContents as any).destroy()
  const header = getHeader(win)
  if (header != null) {
    const tabs = getTabs(win.id)
    header.webContents.send('tabs-updated', tabs)
  }
}

export async function createTab(windowId: number, url = '') {
  let win = BrowserWindow.fromId(windowId)
  if (win === null) return
  const view = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js')
    }
  })
  win.addBrowserView(view)
  view.setBounds({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  })
  view.setAutoResize({ width: false, height: false })
  // view.webContents.openDevTools({ mode: 'detach' })
  const header = getHeader(win)
  if (header != null) {
    view.webContents.on('page-title-updated', () => {
      const tabs = getTabs(windowId)
      header.webContents.send('tabs-updated', tabs)
    })
    view.webContents.on('did-start-loading', () => {
      const tabs = getTabs(windowId)
      header.webContents.send('tabs-updated', tabs)
    })
    view.webContents.on('did-stop-loading', () => {
      const tabs = getTabs(windowId)
      header.webContents.send('tabs-updated', tabs)
    })
    view.webContents.on('page-favicon-updated', async (event, favicons) => {
      const tabs = getTabs(windowId)
      let newTabs = tabs
      newTabs.forEach((tab) => {
        if (tab.id === view.webContents.id) {
          tab.favicon = favicons.length != 0 ? favicons[0] : ''
        }
      })
      header.webContents.send('tabs-updated', newTabs)
    })
  }
  if (url === '') {
    let urlHash = encode('‎', true)
    console.log(urlHash)
    await router(view, `search?id=none&url=${urlHash}&verify=6713de00-4386-4a9f-aeb9-0949b3e71eb7`)
    focusSearch(windowId)
  } else {
    console.log('loading url')
    await view.webContents.loadURL(url)
  }

  return view.webContents.id
}

export function getTabs(windowId: number, favicon = '') {
  let tabs: {
    id: number
    title: string
    url: string
    favicon: string
    navigation: {
      isLoading: boolean
      canGoBack: boolean
      canGoForward: boolean
    }
  }[] = []
  let win = BrowserWindow.fromId(windowId)
  if (win == null) return []
  win.getBrowserViews().forEach((elem, index) => {
    if (index != 0) {
      let tab = {
        id: elem.webContents.id,
        title: elem.webContents.getTitle() ?? 'no title',
        url: elem.webContents.getURL(),
        favicon: '',
        navigation: {
          isLoading: elem.webContents.isLoading(),
          canGoBack: elem.webContents.canGoBack(),
          canGoForward: elem.webContents.canGoForward()
        }
      }
      if (elem.webContents.getURL().includes('c8c75395-ae19-435d-8683-21109a112d6e')) {
        tab.url = ''
      }
      if (favicon !== undefined) tab.favicon = favicon
      tabs.push(tab)
    }
  })
  return tabs
}

export async function hideTab(tabId: number) {
  let view = getViewById(tabId)
  if (view == null) return
  view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
  view.setAutoResize({ width: false, height: false })
}

export async function showTab(tabId: number) {
  let view = getViewById(tabId)
  if (view == null) return
  let win = BrowserWindow.fromBrowserView(view)
  if (win == null) return
  let wb = win.getBounds()
  view.setBounds({
    x: 0,
    y: NAVIGATOR_HEIGHT,
    width: wb.width,
    height: wb.height - NAVIGATOR_HEIGHT
  })
  view.setAutoResize({ width: true, height: true })
}

export function isTabHidden(tabId: number) {
  let view = getViewById(tabId)
  if (view == null) return
  const bounds = view.getBounds()
  if (bounds.width + bounds.height === 0) {
    return true
  }
  return false
}

export async function goBack(tabId: number) {
  let view = getViewById(tabId)
  if (view === null) return
  if (view.webContents.canGoBack()) {
    view.webContents.goBack()
  }
}

export async function goForward(tabId: number) {
  let view = getViewById(tabId)
  if (view === null) return
  if (view.webContents.canGoForward()) {
    view.webContents.goForward()
  }
}

export async function refreshTab(tabId: number) {
  let view = getViewById(tabId)
  if (view === null) return
  view.webContents.reload()
}

export async function focusSearch(windowId: number) {
  let win = BrowserWindow.fromId(windowId)
  if (win == null) return
  const header = getHeader(win)
  if (header == null) return
  header.webContents.focus()
  header.webContents.send('focusing-search')
}

export async function createHeader(win: BrowserWindow) {
  const view = new BrowserView({
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      webSecurity: false,
      preload: path.join(__dirname, '../preload/index.js')
    }
  })
  win.addBrowserView(view)
  view.setBounds({ x: 0, y: 0, width: WINDOW_WIDTH, height: NAVIGATOR_HEIGHT })
  view.setAutoResize({ width: true, height: false })
  await router(view, '')
  // if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
  //   await view.webContents.loadURL(process.env['ELECTRON_RENDERER_URL'])
  // } else {
  //   await view.webContents.loadURL('file://' + path.join(__dirname, '../renderer/index.html'))
  // }
  win.on('unmaximize', () => {
    console.log('left full screen')
    view.setBounds({
      width: win.getSize()[0],
      height: view.getBounds().height,
      x: 0,
      y: 0
    })
  })
  win.on('maximize', () => {
    console.log('entered full screen')
    view.setBounds({
      width: win.getSize()[0] - 12,
      height: view.getBounds().height,
      x: 0,
      y: 0
    })
  })
  // view.webContents.closeDevTools()
  view.webContents.openDevTools({ mode: 'detach' })
}
