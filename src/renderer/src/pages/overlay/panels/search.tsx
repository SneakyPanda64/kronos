import { useEffect, useState } from 'react'

export default function SearchPanel() {
  const [data, setData] = useState<any>({})
  useEffect(() => {
    window.indexBridge?.overlay.onData((_: any, data: any) => {
      let d = JSON.parse(JSON.stringify(data.data))
      setData(d)
      console.log('smilar', d.similar)
    })
  }, [])
  return (
    <div className="bg-red-500">
      {/* {`${JSON.stringify(data)}`} */}
      {/* {`${data.similar}`} */}
      {data.similar !== undefined ? (
        data.similar.map((item) => {
          return <div>{item.item.title}</div>
        })
      ) : (
        <></>
      )}
    </div>
  )
}
