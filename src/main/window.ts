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
    win.unmaximize()
  } else {
    win.maximize()
  }
}
