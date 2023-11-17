import { ipcRenderer } from 'electron'

const auth = {
  logout: (callback: any) => {
    ipcRenderer.once('logout-reply', (_) => {
      callback()
    })
    ipcRenderer.send('logout')
  },
  register: (callback: any, email: string, password: string) => {
    ipcRenderer.once('register-user-reply', (_, error: string) => {
      callback(error)
    })
    ipcRenderer.send('register-user', email, password)
  },
  login: (callback: any, email: string, password: string) => {
    ipcRenderer.once('login-user-reply', (_, error: string) => {
      callback(error)
    })
    ipcRenderer.send('login-user', email, password)
  },
  getJWT: (callback: any) => {
    ipcRenderer.once('get-jwt-reply', (_, jwt: string) => {
      callback(jwt)
    })
    ipcRenderer.send('get-jwt')
  },
  onAuthUpdate: (callback: any) => ipcRenderer.on('auth-update', callback)
}

export { auth }
