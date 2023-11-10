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
    if (newUrl !== url && newUrl != '') {
      setUrl(newUrl)
    }
  }, [props.tabs, props.selectedTab])
  const goToUrl = () => {
    window.indexBridge?.navigation.goToUrl(
      () => {
        console.log('navigated')
      },
      props.selectedTab,
      url
    )
  }
  const [url, setUrl] = useState(getURL())
  const [isSelected, setIsSelected] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const urlComponent = (url: string) => {
    let protocol = url.split('://')[0] + '://'
    let path = url.replace(protocol, '')
    let domain = path.split('/')[0]
    path = path.replace(domain, '')
    return (
      <p className="text-s-light-gray whitespace-nowrap overflow-hidden">
        {protocol}
        <span className="text-white">{domain}</span>
        {path}
      </p>
    )
  }
  return (
    <div className="my-auto ml-4 ">
      {!isSelected ? (
        <div
          onMouseEnter={() => setIsSelected(true)}
          className="w-[50vw] bg-s-dark-gray px-4 py-1 whitespace-nowrap rounded-lg text-white border-transparent focus:border-transparent focus:ring-0 outline-none"
        >
          {urlComponent(url)}
        </div>
      ) : (
        <input
          onMouseLeave={() => (!isFocused ? setIsSelected(false) : null)}
          onChange={(e) => setUrl(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            setIsSelected(false)
          }}
          autoCorrect="off"
          onKeyDown={(e) => {
            if (e.key == 'Enter') {
              goToUrl()
              e.currentTarget.blur()
            }
          }}
          className="w-[50vw] bg-s-dark-gray px-4 py-1 rounded-lg text-white border-transparent focus:border-transparent focus:ring-0 outline-none"
          value={url}
        />
      )}
    </div>
  )
}
