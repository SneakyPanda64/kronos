import { BrowserView, BrowserWindow } from 'electron'
// import { resolveHtmlPath } from './util'
import path from 'path'
import { getFavicon } from './util'
import { is } from '@electron-toolkit/utils'

const NAVIGATOR_HEIGHT = 80

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

export async function createTab(win: BrowserWindow, url: string) {
  const view = new BrowserView()
  win.addBrowserView(view)
  view.setBounds({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  })
  view.setAutoResize({ width: false, height: false })

  const header = findViewById(win, 2)
  if (header != null) {
    view.webContents.on('page-title-updated', () => {
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
  await view.webContents.loadURL(url)

  return view.webContents.id
}

export function getTabs(win: BrowserWindow, favicon = '') {
  let tabs: {
    id: number
    title: string
    url: string
    favicon: string | undefined
  }[] = []
  win.getBrowserViews().forEach((elem) => {
    if (elem.webContents.id === 2) return
    let tab = {
      id: elem.webContents.id,
      title: elem.webContents.getTitle() ?? 'no title',
      url: elem.webContents.getURL(),
      favicon: ''
    }
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

export async function createHeader(win: BrowserWindow) {
  const view = new BrowserView({
    webPreferences: {
      devTools: true,
      nodeIntegration: true,

      preload: path.join(__dirname, '../preload/index.js')
    }
  })
  win.addBrowserView(view)
  view.setBounds({ x: 0, y: 0, width: 800, height: NAVIGATOR_HEIGHT })
  view.setAutoResize({ width: true })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    await view.webContents.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    await view.webContents.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
  view.webContents.closeDevTools()
  view.webContents.openDevTools({ mode: 'detach' })
}

function findViewById(win: BrowserWindow, id: number): BrowserView | null {
  let found: BrowserView | boolean = false
  win.getBrowserViews().forEach((elem) => {
    if (elem.webContents.id == id) {
      console.log('compare: ', elem.webContents.id, id)
      found = elem
    }
  })
  if (found == false) {
    console.log(id, 'not found')
    return null
  }
  console.log(id, 'found')
  return found
}
