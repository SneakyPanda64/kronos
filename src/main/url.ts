import { AxiosError, default as axios } from 'axios'
import { getFavicon, getViewById, router } from './util'
import { encode } from 'js-base64'
// import { addHistory } from './db'
import { v4 as uuidv4 } from 'uuid'
import { addHistory, addQueryHistory } from './db'

const VERIFY_ID = '6713de00-4386-4a9f-aeb9-0949b3e71eb7'

export async function resolveUrl(url: string) {
  let res
  try {
    res = await axios.get(url)
    return ''
  } catch (e: any) {
    if (e.response != undefined) {
      return ''
    }
    return (e as AxiosError).code
  }
}

export async function goToUrl(tabId: number, url: string) {
  let view = getViewById(tabId)
  if (view === null) return
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
    }
  } else {
    errorId = await resolveUrl(url)
  }
  if (errorId === '') {
    await view.webContents.loadURL(url)
    if (query != '') {
      addQueryHistory({
        id: `${uuidv4()}`,
        query: query,
        timestamp: Math.floor(Date.now() / 1000)
      })
    }
    // let favicon = await getFavicon(view)
    // addHistory({
    //   id: `${uuidv4()}`,
    //   favicon: favicon,
    //   title: view.webContents.getTitle(),
    //   url: url,
    //   timestamp: Math.floor(Date.now() / 1000)
    // })
  } else {
    const urlHash = encode(url, true)
    await router(view, `error?id=${errorId}&url=${urlHash}&verify=${VERIFY_ID}`)
    // view.webContents.openDevTools({ mode: 'detach' })
  }
}
