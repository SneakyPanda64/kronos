import { app, BrowserWindow, ipcMain, screen } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import {
  createTab,
  deleteTab,
  focusSearch,
  getSelectedTab,
  getTabs,
  goBack,
  goForward,
  handleMoveTabs,
  openInspect,
  refreshTab,
  selectTab,
  updateAllWindows
} from './tab'
import {
  createWindow,
  deleteWindow,
  minimiseWindow,
  moveWindow,
  toggleMaximiseWindow
} from './window'
import { goToUrl, router } from './url'
import { getViewById, windowFromViewId } from './util'
import { closeOverlay, getOverlay, openOverlay } from './overlay'
import { encode } from 'js-base64'
import { getHistory } from './db'
import { registerShortcuts } from './shortcuts'
// import { addHistory, getHistory } from './db'
// import { createCollection, createDatabase, insertHistory } from './db'

const VERIFY_ID = '6713de00-4386-4a9f-aeb9-0949b3e71eb7'

app.whenReady().then(() => {
  // const db = new sqlite3.Database('./databases/history.db')
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('web-contents-created', (_, contents) => {
    contents.setWindowOpenHandler((details) => {
      let view = getViewById(contents.id)
      let win = BrowserWindow.fromBrowserView(view!)
      createTab(win!.id, details.url).then((tabId) => {
        if (tabId !== undefined) selectTab(tabId)
      })
      return { action: 'deny' }
    })
  })

  app.on('browser-window-created', (_, window) => {
    console.log('WINDOW CREATED ID: ', window.id)
  })

  ipcMain.on(
    'create-window',
    async (event, tabIds: number[], onMouse = false, maximised = false, privateWindow = false) => {
      console.log('creating new window')
      let pos = {
        x: 0,
        y: 0
      }
      if (onMouse) {
        const { x, y } = screen.getCursorScreenPoint()
        pos.x = x - 100
        pos.y = y - 100
      }
      await createWindow(tabIds, pos, maximised, privateWindow)
      event.reply('create-window-reply')
    }
  )

  ipcMain.on('request-tabs', async (event) => {
    console.log('requesting tabs')
    let view = getViewById(event.sender.id)
    if (view == null) return
    let win = BrowserWindow.fromBrowserView(view)
    if (win === null) return
    const tabs = await getTabs(win.id)

    event.reply('tabs-reply', tabs)
  })
  ipcMain.on('move-tabs', async (event, tabIds) => {
    console.log('holding tabs', tabIds)
    let moved = await handleMoveTabs(tabIds)
    await updateAllWindows()
    event.reply('move-tabs-reply', moved)
  })
  ipcMain.on('select-tab', async (_, tabId) => {
    console.log('selecting tabid: ', tabId)
    await selectTab(tabId)
  })
  ipcMain.on('new-tab', async (event, url: string) => {
    let win = windowFromViewId(event.sender.id)
    if (win === null) return
    let tabId = await createTab(win.id)
    if (url != '') {
      await goToUrl(tabId!, url)
    }
    await selectTab(tabId!)
    event.reply('new-tab-reply', tabId)

    focusSearch(win.id)
  })
  ipcMain.on('delete-tab', async (event, tabId: number) => {
    await deleteTab(tabId)
    event.reply('delete-tab-reply')
  })
  ipcMain.on('refresh-tab', async (event, tabId: number) => {
    await refreshTab(tabId)
    event.reply('refresh-tab-reply')
  })
  ipcMain.on('request-selected-tab', async (event) => {
    let win = BrowserWindow.getFocusedWindow()
    if (win === null) return
    let tab = await getSelectedTab(win)
    if (tab === null) return
    event.reply('request-selected-tab-reply', tab.id)
  })
  ipcMain.on('open-inspect', async (event, tabId: number) => {
    let view = getViewById(tabId)
    if (view == null) return
    openInspect(view)
    event.reply('open-inspect-reply')
  })
  ipcMain.on('close-window', async (event) => {
    let win = windowFromViewId(event.sender.id)
    if (win === null) return
    deleteWindow(win.id)
  })
  ipcMain.on('min-window', async (event) => {
    let win = windowFromViewId(event.sender.id)
    if (win === null) return
    minimiseWindow(win.id)
  })
  ipcMain.on('toggle-max-window', async (event) => {
    let win = windowFromViewId(event.sender.id)
    if (win === null) return
    toggleMaximiseWindow(win.id)
  })
  ipcMain.on('go-to-url', async (event, tabId: number, url: string) => {
    console.log('going to url!', url)
    await goToUrl(tabId, url)
    await updateAllWindows()
    await updateAllWindows()
    console.log('went to url')

    event.reply('go-to-url-reply')
  })
  ipcMain.on('open-settings', async (event, type: string) => {
    console.log('opening settings')
    let win = windowFromViewId(event.sender.id)
    if (win === null) return
    let tab = await getSelectedTab(win)
    if (tab == null) return
    let view = getViewById(tab.id)
    if (view == null) return
    console.log('opening settings: ', type)
    const urlHash = encode(`amenoi://settings/${type}`, true)
    await router(view, `settings?id=none&url=${urlHash}&verify=${VERIFY_ID}&type=${type}`)
    event.reply('open-settings-reply')
  })
  ipcMain.on('go-back', async (event, tabId: number) => {
    await goBack(tabId)
    event.reply('go-back-reply')
  })
  ipcMain.on('go-forward', async (event, tabId: number) => {
    await goForward(tabId)
    event.reply('go-forward-reply')
  })
  ipcMain.on('focus-search', async (event) => {
    let win = windowFromViewId(event.sender.id)
    if (win === null) return
    await focusSearch(win.id)
    event.reply('focus-search-reply')
  })
  ipcMain.on('move-window', async (event, position: { x: number; y: number }) => {
    console.log('move window')
    let win = windowFromViewId(event.sender.id)
    if (win === null) return
    moveWindow(win.id, position)
    event.reply('move-window-reply', event.sender.id)
  })
  ipcMain.on(
    'open-overlay',
    async (
      event,
      type: string,
      position: { x: number; y: number },
      size: { width: number; height: number },
      focus: boolean
    ) => {
      let win = windowFromViewId(event.sender.id)
      if (win === null) return
      await openOverlay(win, type, position, size, focus)
      event.reply('open-overlay-reply')
    }
  )
  ipcMain.on('close-overlay', async (event) => {
    let win = windowFromViewId(event.sender.id)
    if (win === null) return
    await closeOverlay(win)
    event.reply('close-overlay-reply')
  })
  ipcMain.on('send-overlay-data', async (event, data: any) => {
    let win = windowFromViewId(event.sender.id)
    if (win === null) return
    let overlay = await getOverlay(win)
    if (overlay == null) return
    overlay.webContents.send('sending-overlay-data', data)
    event.reply('send-overlay-data-reply')
  })
  ipcMain.on('get-history', async (event) => {
    let history = await getHistory()
    event.reply('get-history-reply', history)
  })
  createWindow([], { x: 100, y: 100 })
  registerShortcuts()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow([], { x: 0, y: 0 }, false)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
