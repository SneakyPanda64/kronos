import axios from 'axios'

export async function registerUser(email: string, password: string) {
  console.log('URL', import.meta.env['MAIN_VITE_API_ENDPOINT'])
  await axios
    .post(`${import.meta.env['MAIN_VITE_API_ENDPOINT']}/account/v1/register`, {
      email: email,
      password: password
    })
    .then((response) => {
      console.log('Response:', response.data)
      return ''
    })
    .catch((error) => {
      console.error('Error:', error)
      return `${error}`
    })
}
