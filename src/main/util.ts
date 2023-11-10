/* eslint import/prefer-default-export: off */
import { URL } from 'url'
import path from 'path'
import { BrowserView, BrowserWindow } from 'electron'
import { is } from '@electron-toolkit/utils'

// export function resolveHtmlPath(htmlFileName: string) {
//   if (process.env.NODE_ENV === 'development') {
//     const port = process.env.PORT || 1212;
//     const url = new URL(`http://localhost:${port}`);
//     url.pathname = htmlFileName;
//     return url.href;
//   }
//   return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
// }

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
  // let win = BrowserWindow.fromBrowserView(findViewById(event.sender.id))
  // if (win === null) return
  // await focusSearch(win)
}

export async function router(view: BrowserView, subPath: string) {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    await view.webContents.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#' + subPath, {})
  } else {
    await view.webContents.loadURL(
      'file://' + path.join(__dirname, `../renderer/index.html#${subPath}`)
    )
  }
}
