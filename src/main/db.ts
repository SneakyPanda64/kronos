import storage from 'electron-json-storage'
import { HistoryItem, QueryItem } from './interfaces'
import { getFaviconData } from './favicon'

const VERIFY_ID = '6713de00-4386-4a9f-aeb9-0949b3e71eb7'

const searchUrls = ['https://duckduckgo.com/?q=', 'https://www.google.com/search?q=']

export async function saveJWT(jwt: string) {
  storage.set(
    'auth',
    {
      jwt: jwt
    },
    function (error) {
      if (error) throw error
    }
  )
}

export async function getJWT() {
  return new Promise((resolve, reject) => {
    storage.get('auth', async (error, data) => {
      if (error) {
        reject(error)
      } else {
        try {
          resolve(data.jwt ?? '')
        } catch (e) {
          reject(e)
        }
      }
    })
  })
}

export async function addHistory(item: HistoryItem | QueryItem | any) {
  console.log('attempt add history')
  if (item.url === undefined || (!item.url.includes(VERIFY_ID) && item.url.length > 3)) {
    if (
      item.url !== undefined &&
      (item.url.includes(searchUrls[0]) || item.url.includes(searchUrls[1]))
    ) {
      console.log('overriting url with query')
      item.query = item.url
        .replaceAll('%20', ' ')
        .replaceAll('+', ' ')
        .replaceAll(searchUrls[0], '')
        .replaceAll(searchUrls[1], '')
      item.url = undefined
    }
    console.log('adding history', item.id)
    let newHistory: any
    await getHistory()
      .then(async (history) => {
        newHistory = history
        newHistory.push(item)
      })
      .catch(() => {
        newHistory = []
      })
    storage.set(
      'history',
      {
        history: Object.keys(newHistory).length === 0 ? [] : newHistory
      },
      function (error) {
        if (error) throw error
      }
    )
  }
}

export async function getHistory() {
  return new Promise((resolve, reject) => {
    storage.get('history', async (error, data) => {
      if (error) {
        reject(error)
      } else {
        try {
          console.log('history data,', data.history.length)
          if (data === undefined || data.history === undefined) {
            resolve({
              history: []
            })
          } else {
            console.log('data is not undefined')

            const entries = Object.entries(data.history)
            const sortedEntries = entries.sort((a: any, b: any) => b[1].timestamp - a[1].timestamp)
            const promises = sortedEntries.map(async ([id, entry]) => {
              if ((entry as any).url !== undefined && (entry as any).url !== '') {
                const favicon = await getFaviconData((entry as any).url ?? '')
                return { id, url: (entry as any).url, title: (entry as any).title, favicon }
              } else if ((entry as any).query !== undefined && (entry as any).query !== '') {
                return { id, query: (entry as any).query, title: (entry as any).title }
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
        } catch (e) {
          reject(e)
        }
      }
    })
  })
}
