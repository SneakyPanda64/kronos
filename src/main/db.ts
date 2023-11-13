import storage from 'electron-json-storage'
import { HistoryItem, QueryItem } from './interfaces'
import { getFaviconData } from './favicon'

const VERIFY_ID = '6713de00-4386-4a9f-aeb9-0949b3e71eb7'

export async function addHistory(item: HistoryItem) {
  if (!item.url.includes(VERIFY_ID) && item.url.length > 3) {
    console.log('adding history', item)
    storage.set(
      `history.${item.id}`,
      { url: item.url, favicon: item.favicon, title: item.title, timestamp: item.timestamp },
      function (error) {
        if (error) throw error
      }
    )
  }
}

export async function addQueryHistory(item: QueryItem) {
  console.log('adding query history', item)
  storage.set(
    `queries.${item.id}`,
    { query: item.query, timestamp: item.timestamp },
    function (error) {
      if (error) throw error
    }
  )
}
export async function getHistory() {
  return new Promise((resolve, reject) => {
    storage.get('history', async (error, data) => {
      if (error) {
        reject(error)
      } else {
        const entries = Object.entries(data)
        const sortedEntries = entries.sort((a: any, b: any) => b[1].timestamp - a[1].timestamp)

        const promises = sortedEntries.map(async ([id, entry]) => {
          if ((entry as any).url !== undefined && (entry as any).url !== '') {
            const favicon = await getFaviconData((entry as any).url ?? '')
            return { id, url: (entry as any).url, title: (entry as any).title, favicon }
          }
          return null
        })

        try {
          const result = (await Promise.all(promises)).filter(Boolean) // Filter out null entries
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }
    })
  })
}
