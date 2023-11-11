import { app, BrowserWindow, ipcMain } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import {
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

  ipcMain.on('create-window', async (_, tabIds: string[]) => {
    console.log('creating new window')
    await createWindow(tabIds)
  })

  ipcMain.on('request-tabs', (event) => {
    console.log('requesting tabs')
    let view = getViewById(event.sender.id)
    if (view == null) return
    let win = BrowserWindow.fromBrowserView(view)
    if (win === null) return
    const tabs = getTabs(win.id) // Assuming you have a function that retrieves the tabs as an array, named getTabs()

    event.reply('tabs-reply', tabs)
  })
  ipcMain.on('select-tab', (_, tabId) => {
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
  ipcMain.on('my-window-id', async (event) => {
    event.reply('my-window-id-reply', event.sender.id)
  })

  createWindow([])

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow([])
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
