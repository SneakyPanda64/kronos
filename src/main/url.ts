import { AxiosError, default as axios } from 'axios'
import { getViewById, router } from './util'
import { encode } from 'url-safe-base64'
const VERIFY_ID = '6713de00-4386-4a9f-aeb9-0949b3e71eb7'

export async function resolveUrl(url: string) {
  let res
  try {
    res = await axios.get(url)
    return ''
    // console.log(res)
  } catch (e: any) {
    if (e.response != undefined) {
      return ''
    }
    // console.log('ERROR', ')
    return (e as AxiosError).code
  }
}

export async function goToUrl(tabId: number, url: string) {
  let view = getViewById(tabId)
  console.log('GO TO', tabId)
  if (view === null) return
  const protocols = ['http', 'https']
  const regex = /^(\w+\.\w+(\.\w+)*)/
  url = url.replaceAll('‎', '')
  const match = regex.exec(url)
  let errorId: string | undefined = ''
  if (!protocols.includes(url.split('://')[0])) {
    if (match) {
      url = `https://${url}`
      errorId = await resolveUrl(url)
    } else {
      url = `https://google.com/search?q=${url}`
    }
  } else {
    errorId = await resolveUrl(url)
  }
  if (errorId === '') {
    await view.webContents.loadURL(url)
  } else {
    const urlHash = encode(Buffer.from(url).toString('base64'))
    await router(view, `error?id=${errorId}&url=${urlHash}&verify=${VERIFY_ID}`)
    // view.webContents.openDevTools({ mode: 'detach' })
  }
}
