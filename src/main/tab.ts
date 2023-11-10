import { BrowserView, BrowserWindow } from 'electron'
// import { resolveHtmlPath } from './util'
import path from 'path'
import { findViewById, getFavicon, router } from './util'
import { is } from '@electron-toolkit/utils'
import { encode } from 'js-base64'

const NAVIGATOR_HEIGHT = 80
const WINDOW_WIDTH = 600

export async function selectTab(win: BrowserWindow, tabId: number) {
  getTabs(win).forEach((element) => {
    if (element.id !== tabId) {
      hideTab(win, element.id)
    } else {
      showTab(win, tabId)
    }
  })
}

export async function deleteTab(win: BrowserWindow, tabId: number) {
  let view = findViewById(win, tabId)
  if (view == null) return
  console.log('deleting tab:', tabId)
  win.removeBrowserView(view)
  ;(view.webContents as any).destroy()
  const header = findViewById(win, 2)
  if (header != null) {
    const tabs = getTabs(win)
    header.webContents.send('tabs-updated', tabs)
  }
}

export async function createTab(win: BrowserWindow, url = '') {
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
  view.webContents.openDevTools({ mode: 'detach' })
  const header = findViewById(win, 2)
  if (header != null) {
    view.webContents.on('page-title-updated', () => {
      const tabs = getTabs(win)
      header.webContents.send('tabs-updated', tabs)
    })
    view.webContents.on('did-start-loading', () => {
      const tabs = getTabs(win)
      header.webContents.send('tabs-updated', tabs)
    })
    view.webContents.on('did-stop-loading', () => {
      const tabs = getTabs(win)
      header.webContents.send('tabs-updated', tabs)
    })
    view.webContents.on('page-favicon-updated', async (event, favicons) => {
      const tabs = getTabs(win)
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
    focusSearch(win)
  } else {
    console.log('loading url')
    await view.webContents.loadURL(url)
  }

  return view.webContents.id
}

export function getTabs(win: BrowserWindow, favicon = '') {
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
  win.getBrowserViews().forEach((elem) => {
    if (elem.webContents.id === 2) return
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
    console.log(tab)
    if (favicon !== undefined) tab.favicon = favicon
    tabs.push(tab)
  })
  return tabs
}

export async function hideTab(win: BrowserWindow, tabId: number) {
  let view = findViewById(win, tabId)
  if (view == null) return
  console.log('hidding tab', view.webContents.id, tabId)
  view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
  console.log('hidding tab', view.webContents.id, tabId)
  view.setAutoResize({ width: false, height: false })
}

export async function showTab(win: BrowserWindow, tabId: number) {
  let view = findViewById(win, tabId)
  if (view == null) return
  let wb = win.getBounds()
  view.setBounds({
    x: 0,
    y: NAVIGATOR_HEIGHT,
    width: wb.width,
    height: wb.height - NAVIGATOR_HEIGHT
  })
  view.setAutoResize({ width: true, height: true })
}

export function isTabHidden(win: BrowserWindow, tabId: number) {
  let view = findViewById(win, tabId)
  if (view == null) return
  const bounds = view.getBounds()
  if (bounds.width + bounds.height === 0) {
    return true
  }
  return false
}

export async function goBack(win: BrowserWindow, tabId: number) {
  let view = findViewById(win, tabId)
  if (view === null) return
  if (view.webContents.canGoBack()) {
    view.webContents.goBack()
  }
}

export async function goForward(win: BrowserWindow, tabId: number) {
  let view = findViewById(win, tabId)
  if (view === null) return
  if (view.webContents.canGoForward()) {
    view.webContents.goForward()
  }
}

export async function refreshTab(win: BrowserWindow, tabId: number) {
  let view = findViewById(win, tabId)
  if (view === null) return
  view.webContents.reload()
}

export async function focusSearch(win: BrowserWindow) {
  console.log('FOCUSING SEARCH!')
  const header = findViewById(win, 2)
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
  view.webContents.closeDevTools()
  view.webContents.openDevTools({ mode: 'detach' })
}
