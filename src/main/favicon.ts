import { encode } from 'js-base64'
import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import axios from 'axios'

export async function getFaviconData(url: string, faviconUrl = '') {
  console.log('getting favicon data')
  if (url === null) return ''
  let domain = url.split('/')[2]
  if (url.includes('6713de00-4386-4a9f-aeb9-0949b3e71eb7')) {
    domain = domain + '/' + url.split('#')[1].split('?')[0]
  }
  let urlHash = encode(domain)

  //   console.log('HASH', urlHash)
  const rootPath = path.join(app.getPath('userData'), 'favicons')
  let filePath = path.join(rootPath, `${urlHash}.png`)
  console.log('FULL URL', url, 'domain', domain)
  if (faviconUrl != '' && !fs.existsSync(filePath)) {
    if (!fs.existsSync(rootPath)) {
      fs.mkdirSync(rootPath)
    }
    try {
      const response = await axios.get(faviconUrl, { responseType: 'arraybuffer' })
      fs.writeFileSync(filePath, Buffer.from(response.data))
      console.log('Image downloaded and saved successfully:', filePath)
    } catch (error: any) {
      console.error('Error downloading image:', error.message)
    }
  }
  return imageToBase64(filePath)
}

function imageToBase64(imagePath: string) {
  // Ensure the 'userData' directory exists

  try {
    const imageBuffer = fs.readFileSync(imagePath)
    const base64Image = imageBuffer.toString('base64')
    return base64Image
  } catch (error: any) {
    console.error('Error converting image to base64:', error.message)
    return ''
  }
}
