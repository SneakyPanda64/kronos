import { useEffect, useState } from 'react'
import { FaHistory } from 'react-icons/fa'
import googleSvg from '../../../assets/google-small.svg'
import { ReactSVG } from 'react-svg'

export default function SearchPanel() {
  const [data, setData] = useState<any>({})
  useEffect(() => {
    window.indexBridge?.overlay.onData((_: any, data: any) => {
      let d = JSON.parse(JSON.stringify(data.data))
      setData(d)
      console.log('smilar', d.similar)
    })
  }, [])
  const searchWithComponent = (query: string, url: any) => {
    const searchResult = (url) => {
      let item
      let searchString = <h1>{query} - Search with Google</h1>
      let favicon = ''
      if (url !== undefined && url.length !== 0) {
        item = url[0].item
        searchString = item.url
        favicon = item.favicon
      }
      return (
        <div className="flex bg-s-dark-gray text-white p-1">
          <div className="my-auto pr-1 py-1 pl-1">
            {favicon === '' ? (
              <ReactSVG src={googleSvg} />
            ) : (
              <img
                className={`inmy-auto select-none`}
                src={`data:image/jpeg;charset=utf-8;base64,${item.favicon}`}
                style={{ display: 'none' }}
                width={15}
                height={15}
                onLoad={(e) => (e.currentTarget.style.display = 'block')}
                onLoadStart={(e) => (e.currentTarget.style.display = 'none')}
                onError={(e) => {
                  console.log('error with loading favicon!')
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
          </div>
          <h1 className="truncate my-auto">{searchString}</h1>
        </div>
      )
    }
    return <div>{searchResult(url)}</div>
  }
  const queryComponent = (query: string) => {
    return (
      <div className="flex py-2 hover:bg-s-dark-gray hover:cursor-pointer">
        <div className="my-auto px-2">
          <FaHistory />
        </div>
        <h1 className="my-auto truncate">{query}</h1>
      </div>
    )
  }
  return (
    <div className="ring-s-blue ring-2">
      {searchWithComponent(data.query, data.url)}
      {data.similar !== undefined ? (
        data.similar.map((item: any) => {
          return item.item.query !== undefined ? (
            <div>{queryComponent(item.item.query)}</div>
          ) : (
            <></>
          )
        })
      ) : (
        <></>
      )}
    </div>
  )
}
