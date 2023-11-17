import storage from 'electron-json-storage'
import { HistoryItem, QueryItem } from './interfaces'
import { getFaviconData } from './favicon'
import axios from 'axios'
import { getJWT } from './auth'

const VERIFY_ID = '6713de00-4386-4a9f-aeb9-0949b3e71eb7'

const searchUrls = ['https://duckduckgo.com/?q=', 'https://www.google.com/search?q=']

export async function addHistory(item: HistoryItem | QueryItem | any) {
  console.log('attempt add history id:', item.id)
  if (
    item.url === undefined ||
    item.url === '' ||
    (!item.url.includes(VERIFY_ID) && item.url.length > 3)
  ) {
    if (
      item.url !== undefined &&
      item.url !== '' &&
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
    await addHistorySync([item], true)
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
                return {
                  id: (entry as any).id,
                  url: (entry as any).url,
                  title: (entry as any).title,
                  favicon
                }
              } else if ((entry as any).query !== undefined && (entry as any).query !== '') {
                return {
                  id: (entry as any).id,
                  query: (entry as any).query,
                  title: (entry as any).title
                }
              }
              return null
            })

            try {
              const result = (await Promise.all(promises)).filter(Boolean) // Filter out null entries
              resolve(result)
            } catch (error) {
              resolve([])
            }
          }
        } catch (e) {
          resolve([])
        }
      }
    })
  })
}

export async function syncHistory() {
  console.log('[Sync] Syncing history')
  let jwt = await getJWT()
  if (jwt != '') {
    storage.set(
      'sync',
      {
        lastSynced: Date.now()
      },
      () => {}
    )
    let myHistory: any = await getHistory()
    console.log('SENDING', myHistory.slice(0, 1000))
    await axios
      .post(
        'https://kronos.atlasservers.net/api/sync/v1/sync_history',
        {
          history: myHistory.slice(0, 1000)
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        }
      )
      .then(async (response) => {
        console.log('RESP', response.data['history'])
        await addHistorySync(response.data['history'], false)
      })
      .catch((err) => {
        console.log('SYNC error', err)
      })
  }
}

export async function clearHistory() {
  storage.set(
    'history',
    {
      history: []
    },
    () => {}
  )
}

export async function addHistorySync(items: HistoryItem[], sync: boolean) {
  let newHistory: any = []
  await getHistory()
    .then((history: any) => {
      newHistory = history
      newHistory.push(...items)
      storage.set(
        'history',
        {
          history: newHistory
        },
        () => {
          console.log('added new history!!! _------------')
        }
      )
    })
    .catch(() => {
      newHistory = []
    })
  let jwt = await getJWT()
  if (jwt != '' && sync) {
    for (let item of items) {
      await axios
        .post('https://kronos.atlasservers.net/api/sync/v1/add_history', item, {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        })
        .then((response) => {
          // console.log('RESP', response.data)
          console.log('RESPONSE!!!!!!!', response.data['id'])
          item.id = response.data['id']
        })
        .catch((err) => {
          console.log('SYNC error', err)
        })
    }
  }
}
