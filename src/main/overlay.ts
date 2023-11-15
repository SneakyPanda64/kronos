import { BrowserView, BrowserWindow } from 'electron'
import path from 'path'
import { router } from './url'

let LAST_OVERLAY = ''
let LAST_WINDOW = -1

export async function closeOverlay(win: BrowserWindow) {
  LAST_OVERLAY = ''
  LAST_WINDOW = -1
  let view: BrowserView | null = await getOverlay(win)
  if (view == null) {
    return
  }
  win.removeBrowserView(view)
  ;((view as any).webContents as any).destroy()
  console.log('CLOSED OVERLAY')
}

export async function openOverlay(
  win: BrowserWindow,
  type: string,
  position: { x: number; y: number },
  size: { width: number; height: number },
  focus: boolean
) {
  if (LAST_OVERLAY === type && LAST_WINDOW === win.id) {
    let overlay = await getOverlay(win)
    if (overlay == null) return
    overlay.setBounds({
      width: size.width,
      height: size.height,
      x: overlay.getBounds().x,
      y: overlay.getBounds().y
    })
    return
  }
  LAST_OVERLAY = type
  LAST_WINDOW = win.id
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
  let pos = {
    x: Math.round(position.x),
    y: Math.round(position.y)
  }
  if ((pos.x -= size.width) < 0) {
    pos.x += size.width
  }
  try {
    await router(view, `overlay?id=none&type=${type}`)
  } catch (e) {
    return
  }
  await view.webContents.executeJavaScript("window.tagId = 'overlay'")

  console.log('size:', size, 'Pos', pos)
  view.setBounds({ width: size.width, height: size.height, x: pos.x, y: pos.y })
  if (focus) {
    view.webContents.focus()
  }
  // view.webContents.openDevTools({ mode: 'detach' })
}

export async function isOverlay(view: BrowserView) {
  try {
    if (view == null || view.webContents == null || view.webContents.isDestroyed()) return
    return (await view.webContents.executeJavaScript('window.tagId')) == 'overlay'
  } catch (e) {
    return null
  }
}

export async function getOverlay(win: BrowserWindow) {
  const browserViews = win.getBrowserViews()
  for (const v of browserViews) {
    try {
      if (
        !v.webContents.isDestroyed() &&
        (await v.webContents.executeJavaScript('window.tagId')) == 'overlay'
      ) {
        return v
      }
    } catch (e) {}
  }
  return null
}
