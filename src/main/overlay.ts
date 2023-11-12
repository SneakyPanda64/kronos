import { BrowserView, BrowserWindow, screen } from 'electron'
import path from 'path'
import { router } from './util'
import { overlay } from '../preload/overlay'

let OVERLAY_ID = 0
let LAST_TYPE = ''

// export default async function createOverlay(win: BrowserWindow) {

// }

export async function closeOverlay(win: BrowserWindow) {
  console.log('closing overlay')
  let view: BrowserView | null = await getOverlay(win)
  if (view == null) return
  win.removeBrowserView(view)
  ;((view as any).webContents as any).destroy()
  //   let overlayWindow = BrowserWindow.fromId(OVERLAY_ID)
  //   if (overlayWindow == null) return
  //   if (!overlayWindow.isVisible()) return
  //   overlayWindow.hide()
}

export async function openOverlay(
  win: BrowserWindow,
  type: string,
  position: { x: number; y: number }
) {
  let view = new BrowserView({
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      webSecurity: false,
      preload: path.join(__dirname, '../preload/index.js')
    }
  })
  view.webContents.on('blur', async () => {
    await closeOverlay(win)
  })
  win.addBrowserView(view)
  let types = {
    menu: {
      size: {
        width: 250,
        height: 500
      }
    },
    downloads: {
      size: {
        width: 100,
        height: 500
      }
    }
  }
  let size = { width: types[type].size.width, height: types[type].size.height }
  let pos = {
    x: Math.round(position.x - size.width),
    y: Math.round(position.y)
  }
  await router(view, `overlay?id=none&type=${type}`)
  await view.webContents.executeJavaScript("window.tagId = 'overlay'")

  console.log('size:', size, 'Pos', pos)
  view.setBounds({ width: size.width, height: size.height, x: pos.x, y: pos.y })
  view.webContents.focus()

  //   view.webContents.openDevTools({ mode: 'detach' })
}

export async function isOverlay(view: BrowserView) {
  if (view == null || view.webContents == null) return
  return (await view.webContents.executeJavaScript('window.tagId')) == 'overlay'
}

export async function getOverlay(win: BrowserWindow) {
  let overlay = null

  const browserViews = win.getBrowserViews()
  for (const v of browserViews) {
    if ((await v.webContents.executeJavaScript('window.tagId')) == 'overlay') {
      ;(overlay as any) = v
      break
    }
  }
  return overlay
}
