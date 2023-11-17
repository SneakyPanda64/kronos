import { BrowserView, BrowserWindow, screen } from 'electron'
import { getOverlay, openOverlay } from './overlay'

export async function createContextMenu(view: BrowserView, type: string) {
  const menus = {
    body: {
      buttons: ['new-window', 'inspect', 'close-window']
    },
    tab: {
      buttons: ['new-tab']
    },
    img: {
      buttons: ['save-image', 'copy-image', 'new-window', 'inspect', 'close-window']
    }
  }
  const win = BrowserWindow.fromBrowserView(view)
  if (win == null) return
  const { x, y } = screen.getCursorScreenPoint()
  const pos = {
    x: x - win!.getPosition()[0],
    y: y - win!.getPosition()[1]
  }
  await openOverlay(win!, 'context', { x: pos.x, y: pos.y }, { width: 175, height: 100 }, true)
  const overlay = await getOverlay(win)
  if (overlay == null) return
  const data = JSON.stringify({
    data: { buttons: menus[type]['buttons'] }
  })
  overlay.webContents.send('sending-overlay-data', data)
}
