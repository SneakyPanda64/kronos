import { BrowserView, BrowserWindow } from 'electron'
import path from 'path'
import { router } from './url'
import { getViewData, setViewData } from './util'

const NAVIGATOR_HEIGHT = 80

export function getHeader(win: BrowserWindow) {
  let header = win.getBrowserViews()[0]

  const browserViews = win.getBrowserViews()
  for (const view of browserViews) {
    if (view !== null && view.webContents !== null && !view.webContents.isDestroyed()) {
      if (getViewData(view, 'type') == 'header') {
        header = view
        break
      }
    }
  }
  return header
}

export async function createHeader(win: BrowserWindow) {
  const view = new BrowserView({
    webPreferences: {
      devTools: true,
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })
  // @ts-ignore
  setViewData(view, 'type', 'header')

  // view.webContents.executeJavaScript("window.tagId = 'header'")
  win.addBrowserView(view)

  view.setBounds({ x: 0, y: 0, width: win.getBounds().width, height: NAVIGATOR_HEIGHT })

  view.setAutoResize({ width: true, height: false })
  const data = (win as any).data
  await router(view, data.private ? '?id=none&private=true' : '')
  win.on('unmaximize', () => {
    console.log('left full screen')
    view.setBounds({
      width: win.getSize()[0],
      height: view.getBounds().height,
      x: 0,
      y: 0
    })
  })
  win.on('maximize', () => {
    console.log('entered full screen')
    view.setBounds({
      width: win.getSize()[0] - 12,
      height: view.getBounds().height,
      x: 0,
      y: 0
    })
  })
  // view.webContents.openDevTools({ mode: 'detach' })
}
