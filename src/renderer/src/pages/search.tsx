import { useEffect } from 'react'
import { ReactSVG } from 'react-svg'
import googleSvg from '../assets/google.svg'
import { Helmet } from 'react-helmet'

export default function SearchPage() {
  const handleFocus = (e) => {
    e.preventDefault()
    window.indexBridge?.header.focusSearch(() => {
      console.log('focused')
    })
  }
  useEffect(() => {
    document.title = 'New Tab'
  })
  return (
    <div className="flex w-screen h-screen select-none cursor-text overflow-clip">
      <Helmet>
        <link rel="icon" href="./src/assets/google.png" />
      </Helmet>
      <link rel="icon" href="./src/assets/google.png" />
      <div className="mx-auto pt-40 text-center justify-center w-3/4 md:w-1/2 lg:w-1/3">
        <h1 className="text-6xl pb-12">Kronos</h1>
        <div
          className="w-full h-12 px-4 bg-s-blue bg-opacity-20 rounded-xl flex"
          onClick={handleFocus}
        >
          <div className="my-auto pr-4">
            <ReactSVG src={googleSvg} />
          </div>
          <p className="my-auto">Search with Google or enter address</p>
        </div>
      </div>
    </div>
  )
}
