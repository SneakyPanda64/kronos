import React from 'react'
import ReactDOM from 'react-dom/client'
import { useSearchParams } from 'react-router-dom'
import '../assets/index.css'
import { errors } from './errors.json'
import { decode } from 'url-safe-base64'
import { Base64 } from 'js-base64'
export default function ErrorPage() {
  const [searchParams] = useSearchParams()
  console.log(searchParams) // ▶ URLSearchParams {}
  let error = errors[searchParams.get('id') ?? 'DEFAULT'] ?? errors.DEFAULT
  console.log('ERROR', error)
  const parseText = (text: string): string => {
    let newText = text
    let decodedUrl = decode(searchParams.get('url') ?? '')
    decodedUrl = Base64.decode(decodedUrl)
    let vars = {
      URL: decodedUrl,
      ERROR_CODE: searchParams.get('id') ?? ''
    }
    Object.keys(vars).forEach((key, index) => {
      newText = newText.replaceAll('{{' + key + '}}', vars[key])
    })
    return newText
  }
  const errorComponent = (error) => {
    return (
      <div className="flex h-screen w-screen text-xl text-white font-normal relative p-8">
        <div className="m-auto justify-center items-center ">
          <h1 className="text-4xl pb-6 font-thin">{parseText(error.title)}</h1>
          <h2 className="text-xl pb-2">{parseText(error.subtitle ?? '')}</h2>
          {error.support !== undefined ? (
            <div>
              <h1>{parseText(error.support.title)}</h1>
              <ul className="list-disc ml-12 pt-4">
                {error.support.list.map((title: string, index: number) => (
                  <li key={index} className="font-light text-lg">
                    {parseText(title)}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <></>
          )}
          <div className="text-sm mt-24 font-thin">
            <p>ERROR CODE: {searchParams.get('id')}</p>
            <p>URL HASH: {searchParams.get('url')}</p>
            <p>VERIFY: {searchParams.get('verify')}</p>
          </div>
        </div>
      </div>
    )
  }
  return <div className="w-screen h-screen">{errorComponent(error)}</div>
}
