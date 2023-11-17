import { useState } from 'react'

export default function Form(props: { login: boolean; setLogin: any; setIsLoggedIn: any }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const handleRegister = async () => {
    if (email.length <= 5) {
      setError('Email is too short')
    } else if (email.length >= 50) {
      setError('Email is too long')
    } else if (password.length <= 8) {
      setError('Password is too short')
    } else if (password.length >= 50) {
      setError('Password is too long')
    } else {
      setError('')
      if (props.login) {
        postLogin(email, password)
      } else {
        postRegister(email, password)
      }
    }
  }
  const postRegister = (email: string, password: string) => {
    window.indexBridge?.auth.register(
      (error: string) => {
        console.log('registered', error)
        setError(error)
        if (error == '') {
          props.setIsLoggedIn(true)
        }
      },
      email,
      password
    )
  }
  const postLogin = (email: string, password: string) => {
    console.log('Post login')
    window.indexBridge?.auth.login(
      (error: string) => {
        console.log('logged in', error)
        setError(error)
        if (error == '') {
          props.setIsLoggedIn(true)
        }
      },
      email,
      password
    )
  }
  return (
    <div className="w-full h-full">
      <div className=" ">
        <div className="my-auto mx-auto text-center pt-32">
          <div className="text-5xl bg-s-dark-gray w-1/3 mx-auto py-6 px-4 rounded-xl shadow-xl">
            <h1 className="px-12 font-semibold text-left">
              Kronos {props.login ? 'Login' : 'Sign up'}
            </h1>
            <div className="text-left pt-8 text-3xl mx-auto px-12">
              <div className="text-2xl">
                <h2 className="pb-2">Email</h2>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  placeholder="example@email.com"
                  className="w-full bg-s-blue bg-opacity-20 rounded-lg p-2 text-lg focus:outline-none focus:ring-s-blue focus:ring-1"
                />
              </div>
              <div className="text-2xl">
                <h2 className="pb-2 pt-6">Password</h2>
                <input
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  placeholder="*******"
                  className="w-full bg-s-blue bg-opacity-20 rounded-lg p-2 text-lg focus:outline-none focus:ring-s-blue focus:ring-1"
                />
              </div>
              <button
                onClick={handleRegister}
                className="mt-8 bg-s-blue w-full py-3 px-2 font-semibold rounded-lg"
              >
                {props.login ? 'Login' : 'Register'}
              </button>
              <div className="text-sm pt-2">
                Already have an account?{' '}
                <span
                  onClick={() => props.setLogin(!props.login)}
                  className="text-s-blue underline hover:cursor-pointer"
                >
                  {props.login ? 'Register' : 'Login'}
                </span>
              </div>
              <div className="pt-4 text-lg text-red-500">
                {error !== '' ? <h1>Error - {error}</h1> : <div></div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
