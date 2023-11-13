import { BrowserView, BrowserWindow, screen } from 'electron'
import path from 'path'
import { getFavicon, getViewById, router } from './util'
import { encode } from 'js-base64'
import { deleteWindow } from './window'
import { getHeader } from './header'
import { isOverlay } from './overlay'

const NAVIGATOR_HEIGHT = 80

export async function selectTab(tabId: number) {
  console.log('SELECTING TAB ID!!!!!!', tabId)
  let view = getViewById(tabId)
  if (view == null) return
  let win = BrowserWindow.fromBrowserView(view)
  if (win == null) return
  const tabs = await getTabs(win.id)

  for (const element of tabs) {
    if (element.id !== tabId) {
      hideTab(element.id)
    } else {
      showTab(tabId)
    }
  }
  const header = await getHeader(win)
  if (header == null) return
  header.webContents.send('selected-tab-updated', tabId)
}

export async function deleteTab(tabId: number) {
  let view = getViewById(tabId)
  if (view == null) return
  let win = BrowserWindow.fromBrowserView(view)
  if (win == null) return
  win.removeBrowserView(view)
  ;(view.webContents as any).destroy()
  const header = await getHeader(win)
  if (header != null) {
    const tabs = await getTabs(win.id)
    header.webContents.send('tabs-updated', tabs)
  }
}

export async function applyTabListeners(view: BrowserView) {
  let win = BrowserWindow.fromBrowserView(view)
  if (win === null) return
  let header = await getHeader(win)
  if (header != null) {
    view.webContents.on('page-title-updated', async () => {
      const tabs = await getTabs(win!.id)
      header.webContents.send('tabs-updated', tabs)
    })
    view.webContents.on('did-start-loading', async () => {
      const tabs = await getTabs(win!.id)
      header.webContents.send('tabs-updated', tabs)
    })
    view.webContents.on('did-stop-loading', async () => {
      const tabs = await getTabs(win!.id)
      header.webContents.send('tabs-updated', tabs)
    })
    view.webContents.on('page-favicon-updated', async (_, favicons) => {
      const tabs = await getTabs(win!.id)
      let newTabs = tabs
      newTabs.forEach((tab) => {
        if (tab.id === view.webContents.id) {
          tab.favicon = favicons.length != 0 ? favicons[0] : ''
        }
      })
      header.webContents.send('tabs-updated', newTabs)
    })
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
  await applyTabListeners(view)
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

export async function getTabs(windowId: number, favicon = '', findFavicon = false) {
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
  if (win === null) return []
  for (const elem of win.getBrowserViews()) {
    if (
      elem != null &&
      elem.webContents != null &&
      elem.webContents.id != (await getHeader(win!)).webContents.id &&
      !(await isOverlay(elem))
    ) {
      try {
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
        if (findFavicon) {
          let favicon = await getFavicon(elem)
          tab.favicon = favicon
        }
        tabs.push(tab)
      } catch (e) {
        console.log('error occured')
      }
    }
  }
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
  const header = await getHeader(win)
  if (header == null) return
  header.webContents.focus()
  header.webContents.send('focusing-search')
}

export async function moveTabs(tabIds: number[], newWindowId: number) {
  let newWindow = BrowserWindow.fromId(newWindowId)
  if (newWindow == null) return
  let newTabIds: number[] = []
  tabIds.forEach(async (id) => {
    let view = getViewById(id)
    if (view === null) return
    let oldWindow = BrowserWindow.fromBrowserView(view)
    if (oldWindow == null) return
    newWindow!.addBrowserView(view)
    await applyTabListeners(view)
    newTabIds.push(view.webContents.id)
  })
  await updateAllWindows()
  await selectTab(newTabIds[0])
}

export async function handleMoveTabs(tabIds: number[]) {
  const { x, y } = screen.getCursorScreenPoint()

  const windows = BrowserWindow.getAllWindows()
  if (tabIds.length == 0) return
  let sourceView = getViewById(tabIds[0])
  if (sourceView == null) return
  let sourceWindow = BrowserWindow.fromBrowserView(sourceView)
  if (sourceWindow == null) return
  for (const win of windows) {
    if (win == null) {
    }
    if (win != null && win.id != sourceWindow.id) {
      const header = await getHeader(win)

      let windowBoundsX = {
        left: win.getPosition()[0],
        right: win.getPosition()[0] + header.getBounds().width
      }
      let windowBoundsY = {
        top: win.getPosition()[1],
        bottom: win.getPosition()[1] + header.getBounds().height
      }
      if (
        x > windowBoundsX.left &&
        x < windowBoundsX.right &&
        y < windowBoundsY.bottom &&
        y > windowBoundsY.top
      ) {
        await moveTabs(tabIds, win.id)
        return false
      }
    }
  }
  return true
}

export async function updateAllWindows() {
  const windows = BrowserWindow.getAllWindows()
  for (const win of windows) {
    if (win == null) return
    const header = await getHeader(win)
    let tabs = await getTabs(win.id, '', true)
    if (tabs.length == 0) {
      deleteWindow(win.id)
    }
    header.webContents.send('tabs-updated', tabs)
  }
}
