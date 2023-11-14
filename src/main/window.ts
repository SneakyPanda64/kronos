import { BrowserWindow, shell, screen } from 'electron'
import { createTab, moveTabs, selectTab, updateAllWindows } from './tab'
import icon from '../../resources/icon.png?asset'
import { createHeader } from './header'
import { getViewById } from './util'
import { closeOverlay, getOverlay } from './overlay'

export async function createWindow(
  tabIds: number[],
  position: { x: number; y: number },
  maximised = false
): Promise<void> {
  console.log(position)
  let size = {
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

    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      sandbox: true
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

  await moveTabs(tabIds, mainWindow.id)

  mainWindow.show()
  let downloads = { '32423432': { filename: 'test.txt' } }
  mainWindow.webContents.session.on('will-download', async () => {
    let overlay = await getOverlay(mainWindow)
    if (overlay == null) return
    console.log('downloads updated')
    overlay.webContents.send('downloads-updated', downloads)
  })
  // mainWindow.on('will-move', () => {
  //   closeOverlay(mainWindow)
  // })
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
  const { x, y } = screen.getCursorScreenPoint()
  let win = BrowserWindow.fromId(windowId)
  if (win == null) return
  if (position === undefined) {
    const OFFSET = 150
    const Y_OFFSET = 50
    let distScreen = screen.getDisplayNearestPoint({ x: x, y: y })
    let windowBounds = {
      x: {
        left: distScreen.bounds.x + OFFSET,
        right: distScreen.bounds.x + distScreen.bounds.width - OFFSET
      },
      y: {
        top: distScreen.bounds.y + Y_OFFSET,
        bottom: distScreen.bounds.y + distScreen.bounds.height - Y_OFFSET
      }
    }
    let newPosition = { x: x, y: y }
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
