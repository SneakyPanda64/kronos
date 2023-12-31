import { AxiosError, default as axios } from 'axios'
import { getViewById } from './util'
import { encode } from 'js-base64'
import { v4 as uuidv4 } from 'uuid'
import { addHistory } from './db'
import { BrowserView, BrowserWindow } from 'electron'
import { is } from '@electron-toolkit/utils'
import path from 'path'
import { getWindowData } from './window'

const VERIFY_ID = '6713de00-4386-4a9f-aeb9-0949b3e71eb7'

export async function resolveUrl(url: string) {
  try {
    await axios.get(url)
    return ''
  } catch (e: any) {
    if (e.response != undefined) {
      return ''
    }
    return (e as AxiosError).code
  }
}

export async function goToUrl(tabId: number, url: string) {
  const view = getViewById(tabId)
  if (view === null) return
  const win = BrowserWindow.fromBrowserView(view)
  const protocols = ['http', 'https']
  const regex = /^(\w+\.\w+(\.\w+)*)/
  url = url.replaceAll('‎', '')
  let query = ''
  const match = regex.exec(url)
  let errorId: string | undefined = ''
  if (!protocols.includes(url.split('://')[0])) {
    if (match) {
      url = `https://${url}`
      errorId = await resolveUrl(url)
    } else {
      query = url
      url = `https://google.com/search?q=${url}`
      // url = `https://duckduckgo.com/?q=${url}`
    }
  } else {
    errorId = await resolveUrl(url)
  }
  if (errorId === '') {
    await view.webContents.loadURL(url)
    console.log('IS PRIVATE', getWindowData(win!).private, win)
    if (query != '' && getWindowData(win!).private == false) {
      console.log('adding query history!')
      addHistory({
        id: uuidv4(),
        query: query,
        timestamp: Math.floor(Date.now() / 1000)
      })
    }
  } else {
    const urlHash = encode(url, true)
    await router(view, `error?id=${errorId}&url=${urlHash}&verify=${VERIFY_ID}`)
    // view.webContents.openDevTools({ mode: 'detach' })
  }
}

export async function router(view: BrowserView | BrowserWindow, subPath: string) {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    await view.webContents.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#' + subPath) // + '#' + subPath)
  } else {
    await view.webContents.loadURL(
      'file://' + path.join(__dirname, `../renderer/index.html#${subPath}`)
    )
  }
}
