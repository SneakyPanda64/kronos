import { useEffect } from 'react'
import { ReactSVG } from 'react-svg'
import googleSvg from '../assets/google.svg'

export default function SearchPage() {
  const handleFocus = (e) => {
    e.preventDefault()
    window.indexBridge?.header.focusSearch(() => {
      console.log('focused')
    })
  }
  return (
    <div className="flex w-screen h-screen">
      <div className="mx-auto pt-60 text-center justify-center w-1/2">
        <h1 className="text-6xl pb-12">Amenoi</h1>
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
