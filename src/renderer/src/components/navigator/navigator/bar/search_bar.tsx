import { Tab } from '@renderer/interfaces'
import { useEffect, useState } from 'react'

export default function SearchBar(props: { selectedTab: any; tabs: Tab[] }) {
  const getURL = () => {
    const newTabs = props.tabs.filter((tab) => tab.id === props.selectedTab)
    if (newTabs.length == 0) {
      return ''
    }
    if (newTabs[0] === undefined) {
      return ''
    }
    return newTabs[0].url
  }
  useEffect(() => {
    let newUrl = getURL()
    if (newUrl !== url) {
      setUrl(newUrl)
    }
  }, [props.tabs, props.selectedTab])
  const [url, setUrl] = useState(getURL())
  return (
    <div className="my-auto ml-4 ">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-[50vw] bg-s-dark-gray px-4 py-1 rounded-lg text-white border-transparent focus:border-transparent focus:ring-0 outline-none"
        autoCorrect="off"
      ></input>
    </div>
  )
}
