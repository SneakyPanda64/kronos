import { BrowserView, BrowserWindow, shell, screen } from 'electron'
import {
  applyTabListeners,
  createHeader,
  createTab,
  getHeader,
  getTabs,
  isTabHidden,
  selectTab,
  showTab
} from './tab'
import icon from '../../resources/icon.png?asset'
import { getViewById } from './util'

export async function createWindow(
  tabIds: number[],
  position: { x: number; y: number },
  maximised = false
): Promise<void> {
  // Create the browser window.
  console.log(position)
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 600,
    minHeight: 200,
    minWidth: 500,
    x: position.x,
    y: position.y,
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
  if (maximised) {
    mainWindow.maximize()
  }
  await createHeader(mainWindow)
  if (tabIds.length == 0) {
    let tabId = await createTab(mainWindow.id)

    await selectTab(tabId!)
  }

  tabIds.forEach(async (id) => {
    let view = getViewById(id)
    console.log(view)
    if (view === null) return
    let oldWindow = BrowserWindow.fromBrowserView(view)
    if (oldWindow == null) return
    console.log('moving id: ', id)
    // oldWindow.removeBrowserView(view)
    mainWindow.addBrowserView(view)
    await applyTabListeners(view)
    console.log('moved id: ', view.webContents.id)

    let header = await getHeader(oldWindow)
    console.log('FUCK! OLDWINDOW', view.webContents.id, header.webContents.id)
    await selectTab(view.webContents.id)
    if (header != null) {
      let tabs = await getTabs(oldWindow.id)
      header.webContents.send('tabs-updated', tabs)
    }
    header = await getHeader(mainWindow)
    console.log(
      'FUCK! MAINWINDOW',
      view.webContents.id,
      header.webContents.id,
      view.webContents.getTitle(),
      header.webContents.getTitle()
    )
    if (header != null) {
      let tabs = await getTabs(mainWindow.id)
      header.webContents.send('tabs-updated', tabs)
    }
  })

  // console.log(
  //   '_>>>> NEW WINDOW TAB',
  //   mainWindow.id,
  //   'has headerid',
  //   await getHeader(mainWindow).webContents.id,
  //   'IS HIDDEN',
  //   isTabHidden(await getHeader(mainWindow).webContents.id)
  // )

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

export function moveWindow(windowId: number, position: { x: number; y: number }) {
  let win = BrowserWindow.fromId(windowId)
  if (win == null) return
  if (position === undefined) {
    const { x, y } = screen.getCursorScreenPoint()
    win.setPosition(x - 100, y - 100)
  } else {
    win.setPosition(position.x, position.y)
  }
}
