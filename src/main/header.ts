import { BrowserView, BrowserWindow } from 'electron'
import path from 'path'
import { router } from './url'
import { createContextMenu } from './contexts'

const NAVIGATOR_HEIGHT = 80

export async function getHeader(win: BrowserWindow) {
  let header = win.getBrowserViews()[0]

  const browserViews = win.getBrowserViews()
  for (const v of browserViews) {
    if ((await v.webContents.executeJavaScript('window.tagId')) == 'header') {
      header = v
      break
    }
  }
  return header
}

export async function createHeader(win: BrowserWindow) {
  const view = new BrowserView({
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      webSecurity: false,
      preload: path.join(__dirname, '../preload/index.js')
    }
  })

  view.webContents.executeJavaScript("window.tagId = 'header'")
  win.addBrowserView(view)

  view.setBounds({ x: 0, y: 0, width: win.getBounds().width, height: NAVIGATOR_HEIGHT })

  view.setAutoResize({ width: true, height: false })

  await router(view, '')
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
  view.webContents.on('context-menu', async () => {
    await createContextMenu(view, 'tab')
  })
  // view.webContents.openDevTools({ mode: 'detach' })
}
