import axios from 'axios'
import storage from 'electron-json-storage'

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

export async function resetJWT() {
  storage.set(
    'auth',
    {
      jwt: ''
    },
    () => {}
  )
}

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
    storage.get('auth', async (error, data: any) => {
      if (error) {
        reject(error)
      } else {
        try {
          console.log('???', data.jwt)

          resolve(data.jwt ?? '')
        } catch (e) {
          reject(e)
        }
      }
    })
  })
}
