import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
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
import { deleteWindow, minimiseWindow, toggleMaximiseWindow } from './window'
import { goToUrl, resolveUrl } from './url'
import { findViewById, router } from './util'
async function createWindow(): Promise<void> {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 600,
    minHeight: 200,
    minWidth: 500,
    show: false,
    // useContentSize: true,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    frame: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      webSecurity: false
    }
  })

  await createHeader(mainWindow)

  let tabId = await createTab(mainWindow)
  await selectTab(mainWindow, tabId)
  ipcMain.on('request-tabs', (event) => {
    const tabs = getTabs(mainWindow) // Assuming you have a function that retrieves the tabs as an array, named getTabs()
    event.reply('tabs-reply', tabs)
  })
  ipcMain.on('select-tab', (event, tabId) => {
    console.log('selecting tabid: ', tabId)
    selectTab(mainWindow, tabId)
  })
  ipcMain.on('new-tab', async (event) => {
    let tabId = await createTab(mainWindow)
    event.reply('new-tab-reply', tabId)
    await selectTab(mainWindow, tabId)
  })
  ipcMain.on('delete-tab', async (event, tabId: number) => {
    await deleteTab(mainWindow, tabId)
    event.reply('delete-tab-reply')
  })
  ipcMain.on('refresh-tab', async (event, tabId: number) => {
    await refreshTab(mainWindow, tabId)
    event.reply('refresh-tab-reply')
  })
  ipcMain.on('close-window', async (event, windowId: number) => {
    deleteWindow(mainWindow, windowId)
  })
  ipcMain.on('min-window', async (event, windowId: number) => {
    minimiseWindow(mainWindow, windowId)
  })
  ipcMain.on('toggle-max-window', async (event, windowId: number) => {
    toggleMaximiseWindow(mainWindow, windowId)
  })
  ipcMain.on('go-to-url', async (event, tabId: number, url: string) => {
    await goToUrl(mainWindow, tabId, url)
    event.reply('go-to-url-reply', '')
  })
  ipcMain.on('go-back', async (event, tabId: number) => {
    await goBack(mainWindow, tabId)
    event.reply('go-back-reply')
  })
  ipcMain.on('go-forward', async (event, tabId: number) => {
    await goForward(mainWindow, tabId)
    event.reply('go-forward-reply')
  })
  ipcMain.on('focus-search', async (event) => {
    console.log('FOCUSING SEARCH21321312!')
    await focusSearch(mainWindow)
    event.reply('focus-search-reply')
  })
  mainWindow.show()

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  // if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
  //   mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  // } else {
  //   mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  // }
}

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

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
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
