import { BrowserView, BrowserWindow } from 'electron'
import path from 'path'
import { router } from './util'

export async function closeOverlay(win: BrowserWindow) {
  console.log('closing overlay')
  let view: BrowserView | null = await getOverlay(win)
  if (view == null) return
  win.removeBrowserView(view)
  ;((view as any).webContents as any).destroy()
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
  // view.webContents.openDevTools({ mode: 'detach' })
}

export async function isOverlay(view: BrowserView) {
  if (view == null || view.webContents == null) return
  return (await view.webContents.executeJavaScript('window.tagId')) == 'overlay'
}

export async function getOverlay(win: BrowserWindow) {
  const browserViews = win.getBrowserViews()
  for (const v of browserViews) {
    try {
      if ((await v.webContents.executeJavaScript('window.tagId')) == 'overlay') {
        return v
      }
    } catch (e) {}
  }
  return null
}
