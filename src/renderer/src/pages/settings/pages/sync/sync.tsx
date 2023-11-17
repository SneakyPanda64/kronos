import { useEffect, useState } from 'react'
import Form from './form'
import { Dashboard } from './dashboard'

export default function SyncPage() {
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [login, setLogin] = useState(true)

  useEffect(() => {
    window.indexBridge?.auth.getJWT((jwt: string) => {
      console.log('jwt', jwt)
      if (jwt !== '') {
        setIsLoggedIn(true)
      }
      setLoading(false)
    })
  }, [])
  return loading ? (
    <div>Loading</div>
  ) : (
    <div>
      {isLoggedIn ? (
        <Dashboard setIsLoggedIn={setIsLoggedIn} />
      ) : (
        <Form login={login} setLogin={setLogin} setIsLoggedIn={setIsLoggedIn} />
      )}
    </div>
  )
}
