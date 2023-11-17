import { BrowserView, BrowserWindow } from 'electron'
import path from 'path'
import { router } from './url'
import { getViewData, setViewData } from './util'

let LAST_OVERLAY = ''
let LAST_WINDOW = -1

export function closeOverlay(win: BrowserWindow) {
  LAST_OVERLAY = ''
  LAST_WINDOW = -1
  const view = getOverlay(win)
  if (view !== null) {
    setViewData(view, 'type', '')
    try {
      if (BrowserWindow.fromBrowserView(view) === win) {
        win.removeBrowserView(view)
      }
    } catch (e) {}
    ;((view as any).webContents as any).destroy()
  }
}

export async function openOverlay(
  win: BrowserWindow,
  type: string,
  position: { x: number; y: number },
  size: { width: number; height: number },
  focus: boolean
) {
  if (LAST_OVERLAY === type && LAST_WINDOW === win.id) {
    const overlay = getOverlay(win)
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
  const view = new BrowserView({
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      webSecurity: false,
      preload: path.join(__dirname, '../preload/index.js')
    }
  })
  setViewData(view, 'type', 'overlay')
  view.webContents.on('blur', async () => {
    closeOverlay(win)
  })
  win.addBrowserView(view)
  const pos = {
    x: Math.round(position.x),
    y: Math.round(position.y)
  }
  if ((pos.x -= size.width) < 0) {
    pos.x += size.width
  }
  try {
    await router(view, `overlay?id=none&type=${type}&verify=f1f0313f-8a5b-4ffd-b137-167fb439ddb0`)
  } catch (e) {
    return
  }
  view.setBounds({ width: size.width, height: size.height, x: pos.x, y: pos.y })
  if (focus) {
    view.webContents.focus()
  }
  // view.webContents.openDevTools({ mode: 'detach' })
}

export function isOverlay(view: BrowserView) {
  try {
    if (view === null || view.webContents === null || view.webContents.isDestroyed()) return
    return getViewData(view, 'type') == 'overlay'
  } catch (e) {
    return null
  }
}

export function getOverlay(win: BrowserWindow) {
  const webContents = win.webContents
  if (!webContents) {
    return null
  }
  const browserViews = win.getBrowserViews()
  for (const view of browserViews) {
    try {
      if (isOverlay(view)) {
        return view
      }
    } catch (e) {
      console.error('getOverlay', e)
    }
  }
  return null
}
