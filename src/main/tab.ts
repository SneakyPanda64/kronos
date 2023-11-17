import { BrowserView, BrowserWindow, screen, session } from 'electron'
import path from 'path'
import { getFavicon, getViewById } from './util'
import { encode } from 'js-base64'
import { deleteWindow, getWindowData } from './window'
import { getHeader } from './header'
import { getOverlay, isOverlay } from './overlay'
import { addHistory } from './db'
import { v4 as uuidv4 } from 'uuid'
import { getFaviconData } from './favicon'
import { router } from './url'
import { createContextMenu } from './contexts'
const NAVIGATOR_HEIGHT = 80

export async function selectTab(tabId: number) {
  const view = getViewById(tabId)
  if (view == null) return
  const win = BrowserWindow.fromBrowserView(view)
  if (win == null) return
  const tabs = await getTabs(win.id)

  for (const element of tabs) {
    if (element.id !== tabId) {
      hideTab(element.id)
    } else {
      showTab(tabId)
    }
  }
  const header = getHeader(win)
  if (header == null) return
  header.webContents.send('selected-tab-updated', tabId)
}

export async function deleteTab(tabId: number) {
  const view = getViewById(tabId)
  if (view == null) return
  const win = BrowserWindow.fromBrowserView(view)
  if (win == null) return
  await removeTabListeners(view)
  win.removeBrowserView(view)
  ;(view.webContents as any).destroy()

  const header = getHeader(win)
  if (header != null) {
    const tabs = await getTabs(win.id)
    header.webContents.send('tabs-updated', tabs)
  }
}

export async function removeTabListeners(view: BrowserView) {
  view.webContents.removeAllListeners()
}

export async function applyTabListeners(view: BrowserView) {
  const win = BrowserWindow.fromBrowserView(view)
  if (win === null) return
  const header = getHeader(win)
  if (header != null) {
    view.webContents.setMaxListeners(0)
    view.webContents.on('page-title-updated', async () => {
      const tabs = await getTabs(win!.id)
      header.webContents.send('tabs-updated', tabs)
    })
    view.webContents.on('did-start-loading', async () => {
      const tabs = await getTabs(win!.id)
      console.log('did-start-loading', tabs[0].title)
      header.webContents.send('tabs-updated', tabs)
    })
    view.webContents.once('did-finish-load', async () => {
      const tabs = await getTabs(win!.id)
      header.webContents.send('tabs-updated', tabs)
    })
    view.webContents.once('did-stop-loading', async () => {
      const tabs = await getTabs(win!.id)
      header.webContents.send('tabs-updated', tabs)
    })

    view.webContents.on('context-menu', async (_) => {
      createContextMenu(view, 'body')
    })
    const prevUrls: string[] = []
    view.webContents.on('did-fail-load', async (_, errorCode) => {
      console.log('FAILED', errorCode)
      const tabs = await getTabs(win!.id)
      header.webContents.send('tabs-updated', tabs)
    })
    view.webContents.on('did-navigate', async (_, url) => {
      if (!prevUrls.includes(url)) {
        console.log('new NAVIGATED!')
        if (!getWindowData(win!).private) {
          const favicon_url = await getFavicon(view)
          addHistory({
            id: `${uuidv4()}`,
            favicon: favicon_url ?? 'navigated',
            title: view.webContents.getTitle(),
            url: url,
            timestamp: Date.now()
          })
          prevUrls.push(url)
        }
      }
    })
    view.webContents.on('page-favicon-updated', async (_, favicons) => {
      const tabs = await getTabs(win!.id, favicons[0])
      header.webContents.send('tabs-updated', tabs)
    })
  }
}

export async function createTab(windowId: number, url = '') {
  const win = BrowserWindow.fromId(windowId)
  if (win === null) return
  const isPrivate = getWindowData(win).private
  const privateSession = session.fromPartition('empty-session')
  privateSession.clearStorageData()
  const view = new BrowserView({
    webPreferences: {
      devTools: true,
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      session: isPrivate ? privateSession : session.defaultSession
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
    const urlHash = encode('‎', true)
    router(view, `search?id=none&url=${urlHash}&verify=6713de00-4386-4a9f-aeb9-0949b3e71eb7`)
    focusSearch(windowId)
  } else {
    await view.webContents.loadURL(url)
  }
  // view.webContents.openDevTools({ mode: 'detach' })
  return view.webContents.id
}

export async function getTabs(windowId: number, favicon = '') {
  const tabs: {
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
  const win = BrowserWindow.fromId(windowId)
  if (win === null) return []
  for (const elem of win.getBrowserViews()) {
    if (
      elem != null &&
      elem.webContents != null &&
      elem.webContents.id != getHeader(win!).webContents.id &&
      !(await isOverlay(elem)) &&
      !elem.webContents.getURL().includes('f1f0313f-8a5b-4ffd-b137-167fb439ddb0')
    ) {
      try {
        const favicon_url = await getFavicon(elem)
        let fav: any
        if (elem.webContents !== null) {
          console.log('getting fav data', elem.webContents.getURL())
          fav = await getFaviconData(
            elem.webContents.getURL() === null ? '' : elem.webContents.getURL(),
            favicon !== '' ? favicon : favicon_url
          )
        }
        if (elem.webContents !== null) {
          const tab = {
            id: elem.webContents.id,
            title: elem.webContents.getTitle() ?? 'no title',
            url: elem.webContents.getURL(),
            favicon: fav,
            navigation: {
              isLoading: elem.webContents.isLoading(),
              canGoBack: elem.webContents.canGoBack(),
              canGoForward: elem.webContents.canGoForward()
            }
          }
          if (elem.webContents.getURL().includes('c8c75395-ae19-435d-8683-21109a112d6e')) {
            tab.url = ''
          }
          if (elem.webContents.getURL().includes('6713de00-4386-4a9f-aeb9-0949b3e71eb7')) {
            if (elem.webContents.getURL().includes('search')) {
              tab.favicon =
                'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABd1BMVEUAAADxRznpQzXpRDXqQzXqQzXqQzXqRDbrQzTfQEDpRDbqQzXrQzX/VSvoRjbqQzXqQzXpQzfnQDjqQzTbSSTqQzXqQzXqQjTqQzTqQjTqQzXqQzXpRDT/MzPqQzTrQzb/xgD0khbrSTLqQzXrQzb8vAbqRDT7uwTwbiTtSTf6vAX7vARDhvX7vAX7vAZDhvX7vQZChPT7vARChPTzuwiCsDY3pFtEg/RChPVBhfP8uwY1p1RChfNChfRAivS5tR80qFMyqFRChfVChfRChfQzp1Q0qFM0qFMzmWYAgIA6nYFBh/BChPNAn2A0qFMzqFM0qFQ0p1MzqFMzqVM0qFNChfMA//84p1A0qFNChfRGhPY0qFM0plw9j8Iktkk0p1Q0qFM0qFM0qFIzqlUtpVozqVM0qFM0qFM0qFM0qFMzqFM0qFMzqVI1p0/qQzX7vAX5qgztVy36twdChfTfuRBXq0U0qFM/qU43oXVAieE1pV8+jsj///9xjqGrAAAAbnRSTlMAEmqx4vb022cIgPB9BiHQxhcgtAfP5JJrbOP6dQV6sAns/vtMW4Sx7w7ir2f4hn6Hh7Bw/uQORGhWWoOE/Rju+0wy9cl9+nUFAmXuVQjO5JJraYvbxgEg4eUdz+YyB4Dz+ZgPEWiv4Pb137ZzHX5o7HUAAAABYktHRHzRtiBfAAAAB3RJTUUH5wgWEx0Wl08GfAAAAQJJREFUKM9jYCAAGJmYWVjZ2Jk5GFGEObnY8qCAm4cXIc7Hn4cEBARh4kIsyOJ5wiIwc0TBfDFxCUlxKSRxBh6QsLSMLIjNKycPF1dQVMrLU1bBdKhqfkFhnhoWH6jn5xdpaGKR0MrPz9eGMIvhQAfI0wVK6KFL6EMlDNAlDKFGGaFLGAN5Rvn5JqZmYAlzELAASVgCeVb5JaVl1gjH2ADFbe1AHrQvLytzcISJOzkDJVzATNcyIHBz9wCxPb28QSb5gCV8/UAyZf4BgUHBIWUVlcXFoWEQ3eERZUigqjoyCmZueDSyTEwswiVx8Qkw4cSkZJQQS0lNS8/IzMrOySWUbAAwR2hJPoYcuAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMy0wOC0yMlQxOToyOToyMiswMDowMASADFIAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjMtMDgtMjJUMTk6Mjk6MjIrMDA6MDB13bTuAAAAAElFTkSuQmCC'
            }
            if (elem.webContents.getURL().includes('settings')) {
              tab.favicon =
                'iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAC20lEQVR4nO2av2sUQRTHN+QwaLwTwWjhD4QENBExRtGIpdhor5YG/QMisYsKElA06F+glZ1BLGwVLDRiEW0tRDGHwsVKiyTeJfeRgRdYxs3u/MrtXswXrrq3b+azO2/m7XsbRRv6DwTcA5b5Vw1gLGoXAVVW14eoHQRUgGYKyCJQioouYJhsHcxzgvuAa0BPht2IAciFDB89wCiwNzTEfuCrTKIGnE+xnTQAuZ1y/Rngu9ipWOsLBdGXELwqBh4AXZrtduCNAcgroKxdu0lugh5fs0DvWkDE9REYkLh4DvzBXPPAE+AwcACYSbF1hwH2ZECsqI6f1BNYMLCbBXa7gJgEbat12QVkC/CJ4ugzsNUaRGCOBVg6IdQATjpBxGBu5U0B3PCCEJASMJ0jxFug0xsktg3nscTmvc8QDeQU+WgZOBQS5IXlBFQaMw4MAt3yO6rWuvxno0ehIHbKrmGqp3r6ofkrA1MW/n4Bm13fJ1TKcVXyqfeWEB0GY3RYwrwG7sshfSLtRinndyUNcFUtdYDkGzbnMd43Neckx0v4adwUIjbmTc8xl5Kcpr2emuiIA4jaAHzUXAsQ6zxIAr9wIGUHkEoRQQaLsrTqrU7sAiSk9SSn11XxTOpOrdh+twE/HcdalLmOZWW76j38InDHsJiwoimLA/GZhd+XwIQqIwH9TgU+hxRFwVQynoQNxG+nFCVQ0jgnh92Q2pblNyQxYbucHgeByDmNb4ZO4wcsl1coLaiaVyiILinE5aUZVYUMAfKQ/DXpC3E2wIkfQk3gnCvEDuAHxVEN2OUConohRdOoa2PHpIhtU4H3KWJX1ZysQQzbCu/EZlhOa9e2Qm9GEbDq3fBZBaYhp3QpodEzbVhM0Bs9nVIu0rPwoF2reOvtC3Dac7ueSLn+eKwLEA5Ca/yockx3ht0VA5BLBi2NEafGTovzsv6o6GK9fDCwbj7hiFUt2/+jmg1F7voLIPGx/CY2I0YAAAAASUVORK5CYII='
            }
            if (elem.webContents.getURL().includes('error')) {
              tab.favicon =
                'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAABqElEQVR4nO3YP2oCQRiH4amSPiwIFjYWYjBgY2FjIRELMVjYCNpY2FgIxsJG8BTmBB4ihcewCGyOEDxAhDfsIhNi3Ow/Xb8l88DCwFY/0JdhlTIMwzCMCwAawPvheVRpAtwBH3zbAZZKC+CF31YqDYB74PPEgD3woKQDXvG2UZIBT/hrK4mAG+AtwAAbuFXSAM8EN1XCs+lHVlY5nU0/MrLqlc1sNovz2nlyuRxis4pHNvP5vB5QKBRkZpU/slkqlfSAcrksL6v4ZLNSqegB1WpVXlbxyWatVtMD6vU6orJKgGw2m009oNVqycoqAbLZ6XT0gG63i5is4n3b/KHX6+kBg8EgyIB9Iln1uW1qw+FQDxiNRgS0kXDbdI3HYz1gMpkQQvvat03XbDbTA+bzeZgB9kWyGvK2yWKx0AOWyyUhTa9924xrd9asRrxtxrVKNJvHttst/X7fTahzjmB/lqwGzeaxYrGo/wPOOaJNYtk8ZlmWHuCcY2gnks1j6/WaTCbjPs45BjtSVsNm88KmUQY4H2WlsP/lgMbh93dtduo+zxuGYRgqKV8mBQ5lDblCogAAAABJRU5ErkJggg=='
            }
          }
          tabs.push(tab)
        }
      } catch (e) {
        console.log('error occured', e)
      }
    }
  }
  return tabs
}

export async function hideTab(tabId: number) {
  const view = getViewById(tabId)
  if (view == null) return
  view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
  view.setAutoResize({ width: false, height: false })
}

export async function showTab(tabId: number) {
  const view = getViewById(tabId)
  if (view == null) return
  const win = BrowserWindow.fromBrowserView(view)
  if (win == null) return
  const wb = win.getBounds()
  view.setBounds({
    x: 0,
    y: NAVIGATOR_HEIGHT,
    width: wb.width,
    height: wb.height - NAVIGATOR_HEIGHT
  })
  view.setAutoResize({ width: true, height: true })
}

export function isTabHidden(tabId: number) {
  const view = getViewById(tabId)
  if (view == null) return
  const bounds = view.getBounds()
  if (bounds.width + bounds.height === 0) {
    return true
  }
  return false
}

export async function goBack(tabId: number) {
  const view = getViewById(tabId)
  if (view === null) return
  if (view.webContents.canGoBack()) {
    view.webContents.goBack()
  }
}

export async function goForward(tabId: number) {
  const view = getViewById(tabId)
  if (view === null) return
  if (view.webContents.canGoForward()) {
    view.webContents.goForward()
  }
}

export async function refreshTab(tabId: number) {
  const view = getViewById(tabId)
  if (view === null) return
  view.webContents.reload()
}

export async function focusSearch(windowId: number) {
  const win = BrowserWindow.fromId(windowId)
  if (win == null) return
  const header = getHeader(win)
  if (header == null) return
  header.webContents.focus()
  header.webContents.send('focusing-search')
}

export async function moveTabs(tabIds: number[], newWindowId: number) {
  const newWindow = BrowserWindow.fromId(newWindowId)
  if (newWindow == null) return
  const newTabIds: number[] = []
  tabIds.forEach(async (id) => {
    const view = getViewById(id)
    if (view === null) return
    const oldWindow = BrowserWindow.fromBrowserView(view)
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
  const sourceView = getViewById(tabIds[0])
  if (sourceView == null) return
  const sourceWindow = BrowserWindow.fromBrowserView(sourceView)
  if (sourceWindow == null) return
  for (const win of windows) {
    if (win == null) {
    }
    if (win != null && win.id != sourceWindow.id) {
      const header = getHeader(win)

      const windowBoundsX = {
        left: win.getPosition()[0],
        right: win.getPosition()[0] + header.getBounds().width
      }
      const windowBoundsY = {
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
    const header = getHeader(win)
    const tabs = await getTabs(win.id, '')
    if (tabs.length == 0) {
      deleteWindow(win.id)
    }
    header.webContents.send('tabs-updated', tabs)
  }
}

export async function getSelectedTab(win: BrowserWindow) {
  const tabs = await getTabs(win.id)
  const header = getHeader(win)
  const overlay = getOverlay(win)
  for (const tab of tabs) {
    try {
      if (
        tab.id !== header.webContents.id &&
        overlay !== null &&
        tab.id !== overlay.webContents.id
      ) {
        console.log('TABID is not header/overlay')
        if (!isTabHidden(tab.id)) {
          return tab
        }
      }
    } catch (e) {}
  }
  return null
}

export function openInspect(view: BrowserView) {
  view.webContents.openDevTools({ mode: 'bottom' })
}
