import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import {
  createHeader,
  createTab,
  deleteTab,
  focusSearch,
  getTabs,
  goBack,
  goForward,
  refreshTab,
  selectTab
} from './tab'
import { createWindow, deleteWindow, minimiseWindow, toggleMaximiseWindow } from './window'
import { goToUrl, resolveUrl } from './url'
import { getViewById, router } from './util'

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('browser-window-created', (event, window) => {
    console.log('WINDOW CREATED ID: ', window.id)
  })

  ipcMain.on('create-window', async (event, tabIds: string[]) => {
    console.log('creating new window')
    await createWindow(tabIds)
  })

  ipcMain.on('request-tabs', (event) => {
    console.log('')
    let view = getViewById(event.sender.id)
    if (view == null) return
    let win = BrowserWindow.fromBrowserView(view)
    if (win === null) return
    console.log('REQUESTING TABS FROM ID: ', win.webContents.id, event.sender.id)
    const tabs = getTabs(win.id) // Assuming you have a function that retrieves the tabs as an array, named getTabs()

    event.reply('tabs-reply', tabs)
  })
  ipcMain.on('select-tab', (event, tabId) => {
    console.log('selecting tabid: ', tabId)
    selectTab(tabId)
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
  ipcMain.on('toggle-max-window', async (event, windowId: number) => {
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
  ipcMain.on('my-window-id', async (event) => {
    event.reply('my-window-id-reply', event.sender.id)
  })

  createWindow([])
  // createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow([])
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
