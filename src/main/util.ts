/* eslint import/prefer-default-export: off */
import path from 'path'
import { BrowserView, BrowserWindow } from 'electron'
import { is } from '@electron-toolkit/utils'

export function windowFromViewId(viewId: number) {
  let view = getViewById(viewId)
  if (view == null) return null
  let win = BrowserWindow.fromBrowserView(view)
  if (win === null) return null
  return win
}

export async function getFavicon(browserView: BrowserView) {
  if (!(browserView instanceof BrowserView)) {
    throw new Error('Invalid argument. Expected a BrowserView instance.')
  }

  try {
    const favicon = await browserView.webContents.executeJavaScript(`
      new Promise((resolve) => {
        const link = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
        if (link) {
          resolve(link.href);
        } else {
          // If the direct link is not found, try to find the favicon from the favicon service
          const faviconService = document.querySelector('link[rel="apple-touch-icon-precomposed"]') || document.querySelector('link[rel="apple-touch-icon"]');
          if (faviconService) {
            resolve(faviconService.href);
          } else {
            resolve(null);
          }
        }
      });
    `)

    return favicon
  } catch (error) {
    // console.error('Error getting favicon:', error)
    return null
  }
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
    return null
  }
  return found
}

export async function router(view: BrowserView | BrowserWindow, subPath: string) {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    // await view.webContents.loadURL('https://google.com/')
    console.log('URL', process.env['ELECTRON_RENDERER_URL'])
    try {
      await view.webContents.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#' + subPath, {}) // + '#' + subPath)
    } catch (e) {
      console.log('ERROR!!!!!!', e)
    }
  } else {
    await view.webContents.loadURL(
      'file://' + path.join(__dirname, `../renderer/index.html#${subPath}`)
    )
  }
}
