import { ipcRenderer } from 'electron'

let auth = {
  register: (callback: any, email: string, password) => {
    ipcRenderer.once('register-user-reply', (_, error: string) => {
      callback(error)
    })
    ipcRenderer.send('register-user', email, password)
  }
}

export { auth }
