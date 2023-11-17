import { encode } from 'js-base64'
import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import axios from 'axios'

export async function getFaviconData(url: string, faviconUrl = '') {
  if (url === null) return ''
  let domain = url.split('/')[2]
  if (url.includes('6713de00-4386-4a9f-aeb9-0949b3e71eb7')) {
    domain = domain + '/' + url.split('#')[1].split('?')[0]
  }
  const urlHash = encode(domain, true)
  const rootPath = path.join(app.getPath('userData'), 'favicons')
  const filePath = path.join(rootPath, `${urlHash}.png`)
  if (faviconUrl != '' && !fs.existsSync(filePath)) {
    if (!fs.existsSync(rootPath)) {
      fs.mkdirSync(rootPath)
    }
    try {
      const response = await axios.get(faviconUrl, { responseType: 'arraybuffer' })
      fs.writeFileSync(filePath, Buffer.from(response.data))
    } catch (error: any) {}
  }
  return imageToBase64(filePath)
}

function imageToBase64(imagePath: string) {
  try {
    const imageBuffer = fs.readFileSync(imagePath)
    const base64Image = imageBuffer.toString('base64')
    return base64Image
  } catch (error: any) {
    return ''
  }
}
