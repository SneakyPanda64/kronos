import axios from 'axios'
import { resetJWT, saveJWT } from './db'

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
