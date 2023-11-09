import { BrowserWindow } from 'electron'
import { findViewById } from './util'
export function deleteWindow(win: BrowserWindow, windowId: number) {
  console.log('closing window')
  win.close()
}

export function minimiseWindow(win: BrowserWindow, windowId: number) {
  console.log('minimising')
  if (win.minimizable) win.minimize()
}

export function toggleMaximiseWindow(win: BrowserWindow, windowId: number) {
  console.log('toggle maximise')
  if (win.isMaximized()) {
    win.setResizable(true)
    win.unmaximize()
  } else {
    win.maximize()
    let header = findViewById(win, 2)

    if (header != null) {
      console.log(win.getSize()[0], win.getSize()[1])
      header?.setBounds({
        width: win.getSize()[0] - 12,
        height: header.getBounds().height,
        x: 0,
        y: 0
      })
    }
  }
}
