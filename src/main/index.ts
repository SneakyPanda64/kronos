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
import { clearHistory, getHistory, syncHistory } from './db'
import { registerShortcuts } from './shortcuts'
import { getJWT, loginUser, logoutUser, registerUser } from './auth'

const VERIFY_ID = '6713de00-4386-4a9f-aeb9-0949b3e71eb7'
app.setName('Kronos')
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('web-contents-created', (_, contents) => {
    contents.setWindowOpenHandler((details) => {
      const view = getViewById(contents.id)
      const win = BrowserWindow.fromBrowserView(view!)
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
      const pos = {
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
    const view = getViewById(event.sender.id)
    if (view == null) return
    const win = BrowserWindow.fromBrowserView(view)
    if (win === null) return
    const tabs = await getTabs(win.id)

    event.reply('tabs-reply', tabs)
  })
  ipcMain.on('move-tabs', async (event, tabIds) => {
    console.log('holding tabs', tabIds)
    const moved = await handleMoveTabs(tabIds)
    await updateAllWindows()
    event.reply('move-tabs-reply', moved)
  })
  ipcMain.on('select-tab', async (_, tabId) => {
    console.log('selecting tabid: ', tabId)
    await selectTab(tabId)
  })
  ipcMain.on('new-tab', async (event, url: string) => {
    const win = windowFromViewId(event.sender.id)
    if (win === null) return
    const tabId = await createTab(win.id)
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
    const win = BrowserWindow.getFocusedWindow()
    if (win === null) return
    const tab = await getSelectedTab(win)
    if (tab === null) return
    event.reply('request-selected-tab-reply', tab.id)
  })
  ipcMain.on('open-inspect', async (event, tabId: number) => {
    const view = getViewById(tabId)
    if (view == null) return
    openInspect(view)
    event.reply('open-inspect-reply')
  })
  ipcMain.on('close-window', async (event) => {
    const win = windowFromViewId(event.sender.id)
    if (win === null) return
    deleteWindow(win.id)
  })
  ipcMain.on('min-window', async (event) => {
    const win = windowFromViewId(event.sender.id)
    if (win === null) return
    minimiseWindow(win.id)
  })
  ipcMain.on('toggle-max-window', async (event) => {
    const win = windowFromViewId(event.sender.id)
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
    const win = windowFromViewId(event.sender.id)
    if (win === null) return
    const tab = await getSelectedTab(win)
    if (tab == null) return
    const view = getViewById(tab.id)
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
    const win = windowFromViewId(event.sender.id)
    if (win === null) return
    await focusSearch(win.id)
    event.reply('focus-search-reply')
  })
  ipcMain.on('move-window', async (event, position: { x: number; y: number }) => {
    console.log('move window')
    const win = windowFromViewId(event.sender.id)
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
      const win = windowFromViewId(event.sender.id)
      if (win === null) return
      await openOverlay(win, type, position, size, focus)

      event.reply('open-overlay-reply')
    }
  )
  ipcMain.on('close-overlay', async (event) => {
    const win = windowFromViewId(event.sender.id)
    if (win === null) return
    closeOverlay(win)
    event.reply('close-overlay-reply')
  })
  ipcMain.on('send-overlay-data', async (event, data: any) => {
    const win = windowFromViewId(event.sender.id)
    if (win === null) return
    const overlay = getOverlay(win)
    if (overlay == null) return
    overlay.webContents.send('sending-overlay-data', data)
    event.reply('send-overlay-data-reply')
  })
  ipcMain.on('get-history', async (event) => {
    const history = await getHistory()
    event.reply('get-history-reply', history)
  })
  ipcMain.on('clear-history', async (event) => {
    await clearHistory()
    event.reply('clear-history-reply')
  })
  ipcMain.on('logout', async (event) => {
    await logoutUser()
    event.reply('logout-reply')
  })
  ipcMain.on('register-user', async (event, email: string, password: string) => {
    console.log(email, password)
    const error = await registerUser(email, password)
    event.reply('register-user-reply', error)
  })
  ipcMain.on('login-user', async (event, email: string, password: string) => {
    console.log(email, password)
    const error = await loginUser(email, password)
    console.log('ERROR?', error)
    event.reply('login-user-reply', error)
  })
  ipcMain.on('get-jwt', async (event) => {
    const jwt = await getJWT()
    event.reply('get-jwt-reply', jwt)
  })
  createWindow([], { x: 100, y: 100 })
  registerShortcuts()
  syncHistory()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow([], { x: 0, y: 0 }, false)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
