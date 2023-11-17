import axios from 'axios'
import { getJWT, resetJWT, saveJWT } from './db'
import { HistoryItem } from './interfaces'

export async function addHistorySync(item: HistoryItem) {
  let jwt = await getJWT()
  if (jwt != '') {
    await axios
      .post('https://kronos.atlasservers.net/api/sync/v1/add_history', item, {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      })
      .then((response) => {
        console.log('RESP', response.statusText)
      })
      .catch((err) => {
        console.log('SYNC error', err)
      })
  }
}

export async function logoutUser() {
  await resetJWT()
}

export async function registerUser(email: string, password: string) {
  console.log('URL', import.meta.env['MAIN_VITE_API_ENDPOINT'])
  return await axios
    .post(`${import.meta.env['MAIN_VITE_API_ENDPOINT']}/account/v1/register`, {
      email: email,
      password: password
    })
    .then(async (response) => {
      await saveJWT(response.data['jwt'])
      return ''
    })
    .catch((_) => {
      return `Invalid email/password`
    })
}

export async function loginUser(email: string, password: string) {
  console.log('URL', import.meta.env['MAIN_VITE_API_ENDPOINT'])
  try {
    const response = await axios.post(
      `${import.meta.env['MAIN_VITE_API_ENDPOINT']}/account/v1/login`,
      {
        email: email,
        password: password
      }
    )

    await saveJWT(response.data['jwt'])
    return '' // Or you can return any other data indicating success
  } catch (error) {
    // console.error('Login Error:', error)
    return 'Invalid email/password'
  }
}
