import { app, BrowserWindow, ipcMain, screen } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import {
  createTab,
  deleteTab,
  focusSearch,
  getTabs,
  goBack,
  goForward,
  handleMoveTabs,
  refreshTab,
  selectTab
} from './tab'
import {
  createWindow,
  deleteWindow,
  minimiseWindow,
  moveWindow,
  toggleMaximiseWindow
} from './window'
import { goToUrl } from './url'
import { getViewById } from './util'

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('browser-window-created', (_, window) => {
    console.log('WINDOW CREATED ID: ', window.id)
  })

  ipcMain.on(
    'create-window',
    async (event, tabIds: number[], onMouse = false, maximised = false) => {
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
      await createWindow(tabIds, pos, maximised)
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
    console.log('fn move window')

    event.reply('move-tabs-reply', moved)
  })
  ipcMain.on('select-tab', async (_, tabId) => {
    console.log('selecting tabid: ', tabId)
    await selectTab(tabId)
  })
  ipcMain.on('new-tab', async (event) => {
    let view = getViewById(event.sender.id)
    if (view == null) return
    let win = BrowserWindow.fromBrowserView(view)
    if (win === null) return
    let tabId = await createTab(win.id)
    event.reply('new-tab-reply', tabId)
    await selectTab(tabId!)
    focusSearch(win.id)
  })
  ipcMain.on('delete-tab', async (event, tabId: number) => {
    await deleteTab(tabId)
    console.log('DONE DELETING!!!')
    event.reply('delete-tab-reply')
  })
  ipcMain.on('refresh-tab', async (event, tabId: number) => {
    await refreshTab(tabId)
    event.reply('refresh-tab-reply')
  })
  ipcMain.on('close-window', async (event) => {
    let view = getViewById(event.sender.id)
    if (view == null) return
    let win = BrowserWindow.fromBrowserView(view)
    if (win === null) return
    deleteWindow(win.id)
  })
  ipcMain.on('min-window', async (event) => {
    let view = getViewById(event.sender.id)
    if (view == null) return
    let win = BrowserWindow.fromBrowserView(view)
    if (win === null) return
    minimiseWindow(win.id)
  })
  ipcMain.on('toggle-max-window', async (event) => {
    let view = getViewById(event.sender.id)
    if (view == null) return
    let win = BrowserWindow.fromBrowserView(view)
    if (win === null) return
    toggleMaximiseWindow(win.id)
  })
  ipcMain.on('go-to-url', async (event, tabId: number, url: string) => {
    console.log('going to url!', url)
    await goToUrl(tabId, url)
    event.reply('go-to-url-reply')
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
    let view = getViewById(event.sender.id)
    if (view == null) return
    let win = BrowserWindow.fromBrowserView(view)
    if (win == null) return
    await focusSearch(win.id)
    event.reply('focus-search-reply')
  })
  ipcMain.on('move-window', async (event, position: { x: number; y: number }) => {
    console.log('REVIED MOVE WINDOW')
    let view = getViewById(event.sender.id)
    if (view == null) return
    let win = BrowserWindow.fromBrowserView(view)
    if (win == null) return
    moveWindow(win.id, position)
    event.reply('move-window-reply', event.sender.id)
  })

  createWindow([], { x: 0, y: 0 })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow([], { x: 0, y: 0 }, false)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
