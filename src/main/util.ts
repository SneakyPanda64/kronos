/* eslint import/prefer-default-export: off */
import { BrowserView, BrowserWindow } from 'electron'

export function windowFromViewId(viewId: number) {
  const view = getViewById(viewId)
  if (view == null) return null
  const win = BrowserWindow.fromBrowserView(view)
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
    return null
  }
}

export function getViewById(id: number): BrowserView | null {
  let found: any = false
  BrowserWindow.getAllWindows().forEach((win) => {
    win.getBrowserViews().forEach((elem) => {
      if (elem.webContents.id == id) {
        found = elem
      }
    })
  })
  if (found == false) {
    return null
  }
  return found
}

export function setViewData(view: BrowserView, key: string, value: any) {
  // @ts-ignore
  if (view.data === undefined) {
    // @ts-ignore
    view.data = {}
  }
  // @ts-ignore
  view.data[key] = value
}

export function getViewData(view: BrowserView, key: string) {
  // @ts-ignore
  if (view.data === undefined) return null
  // @ts-ignore
  return view.data[key]
}
