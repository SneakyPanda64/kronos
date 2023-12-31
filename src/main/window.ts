import { BrowserWindow, screen } from 'electron'
import { createTab, moveTabs, selectTab } from './tab'
import icon from '../../resources/icon.png?asset'
import { createHeader } from './header'
import { getOverlay } from './overlay'
import fetch from 'cross-fetch'

import { ElectronBlocker } from '@cliqz/adblocker-electron'
export async function createWindow(
  tabIds: number[],
  position: { x: number; y: number },
  _ = false,
  privateWindow = false
): Promise<void> {
  console.log(position)
  const size = {
    width: 600,
    height: 600
  }

  const mainWindow = new BrowserWindow({
    width: size.width,
    height: size.height,
    minHeight: 200,
    minWidth: 550,
    x: position.x,
    y: position.y,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    frame: false,
    icon: icon,
    title: 'Kronos',
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  // @ts-ignore
  mainWindow.data = {
    private: privateWindow
  }
  await loadBlocker(mainWindow)
  console.log('CREATING WINDOW WITH', privateWindow)
  await createHeader(mainWindow)

  if (tabIds.length == 0) {
    const tabId = await createTab(mainWindow.id)
    await selectTab(tabId!)
  }

  await moveTabs(tabIds, mainWindow.id)

  mainWindow.show()
  const downloads = { '32423432': { filename: 'test.txt' } }
  mainWindow.webContents.session.on('will-download', async () => {
    const overlay = getOverlay(mainWindow)
    if (overlay == null) return
    console.log('downloads updated')
    overlay.webContents.send('downloads-updated', downloads)
  })
}

export function deleteWindow(windowId: number) {
  const win = BrowserWindow.fromId(windowId)
  if (win == null) return
  console.log('closing window')
  win.close()
}

export function minimiseWindow(windowId: number) {
  const win = BrowserWindow.fromId(windowId)
  if (win == null) return
  console.log('minimising')
  if (win.minimizable) win.minimize()
}

export function toggleMaximiseWindow(windowId: number) {
  const win = BrowserWindow.fromId(windowId)
  if (win == null) return
  console.log('toggle maximise')
  if (win.isMaximized()) {
    win.unmaximize()
  } else {
    win.maximize()
  }
}

export function moveWindow(windowId: number, position: { x: number; y: number }) {
  const { x, y } = screen.getCursorScreenPoint()
  const win = BrowserWindow.fromId(windowId)
  if (win == null) return
  if (position === undefined) {
    const OFFSET = 150
    const Y_OFFSET = 50
    const distScreen = screen.getDisplayNearestPoint({ x: x, y: y })
    const windowBounds = {
      x: {
        left: distScreen.bounds.x + OFFSET,
        right: distScreen.bounds.x + distScreen.bounds.width - OFFSET
      },
      y: {
        top: distScreen.bounds.y + Y_OFFSET,
        bottom: distScreen.bounds.y + distScreen.bounds.height - Y_OFFSET
      }
    }
    const newPosition = { x: x, y: y }
    if (newPosition.x < windowBounds.x.left) {
      newPosition.x = windowBounds.x.left
    }
    if (newPosition.x > windowBounds.x.right) {
      newPosition.x = windowBounds.x.right
    }
    if (newPosition.y < windowBounds.y.top) {
      newPosition.y = windowBounds.y.top
    }
    if (newPosition.y > windowBounds.y.bottom) {
      newPosition.y = windowBounds.y.bottom
    }
    console.log('window bounds', windowBounds, distScreen.bounds.y, 'mouse: x,y :', x, y)
    win.setPosition(newPosition.x, newPosition.y)
  } else {
    win.setPosition(position.x, position.y)
  }
  win.setSize(win.getSize()[0] + 10, win.getSize()[1] + 10)
}

export async function loadBlocker(win: BrowserWindow) {
  const blocker = await ElectronBlocker.fromPrebuiltAdsOnly(
    fetch
    // fullLists,
    // {
    //   enableCompression: true
    // },
    // {
    //   path: 'engine.bin',
    //   read: async (...args) => readFileSync(...args),
    //   write: async (...args) => writeFileSync(...args)
    // }
  )
  blocker.enableBlockingInSession(win.webContents.session)
}

export function getWindowData(win: BrowserWindow) {
  // @ts-ignore
  return win.data
}
