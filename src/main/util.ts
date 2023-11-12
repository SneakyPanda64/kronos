/* eslint import/prefer-default-export: off */
import path from 'path'
import { BrowserView, BrowserWindow } from 'electron'
import { is } from '@electron-toolkit/utils'

export async function getFavicon(browserView: BrowserView) {
  if (!(browserView instanceof BrowserView)) {
    throw new Error('Invalid argument. Expected a BrowserView instance.')
  }

  return await browserView.webContents.executeJavaScript(
    `
    (function() {
      console.log("attemp");
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        return favicon.href;
      } else {
        return null;
      }
    })();
  `,
    true
  )
}

export function getViewById(id: number): BrowserView | null {
  let found: any = false
  BrowserWindow.getAllWindows().forEach((win) => {
    win.getBrowserViews().forEach((elem) => {
      if (elem.webContents.id == id) {
        console.log('compare: ', elem.webContents.id, id)
        found = elem
      }
    })
  })
  if (found == false) {
    console.log(id, 'new not found')
    return null
  }
  console.log(id, 'new found')
  return found
}

export async function router(view: BrowserView | BrowserWindow, subPath: string) {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    await view.webContents.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#' + subPath, {})
  } else {
    await view.webContents.loadURL(
      'file://' + path.join(__dirname, `../renderer/index.html#${subPath}`)
    )
  }
}
