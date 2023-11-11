import { BrowserWindow, shell } from 'electron'
import { createHeader, createTab, selectTab } from './tab'
import icon from '../../resources/icon.png?asset'

export async function createWindow(tabIds: string[]): Promise<void> {
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
  let tabId = await createTab(mainWindow.id)
  console.log('WINDOW TAB', mainWindow.id, 'has header id: ', tabId)
  await selectTab(tabId!)

  mainWindow.show()

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
}

export function deleteWindow(windowId: number) {
  let win = BrowserWindow.fromId(windowId)
  if (win == null) return
  console.log('closing window')
  win.close()
}

export function minimiseWindow(windowId: number) {
  let win = BrowserWindow.fromId(windowId)
  if (win == null) return
  console.log('minimising')
  if (win.minimizable) win.minimize()
}

export function toggleMaximiseWindow(windowId: number) {
  let win = BrowserWindow.fromId(windowId)
  if (win == null) return
  console.log('toggle maximise')
  if (win.isMaximized()) {
    win.unmaximize()
  } else {
    win.maximize()
  }
}
