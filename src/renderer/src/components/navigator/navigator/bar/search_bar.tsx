import { Tab } from '@renderer/interfaces'
import Fuse from 'fuse.js'
import { FaSearch } from 'react-icons/fa'
import { useEffect, useRef, useState } from 'react'

export default function SearchBar(props: { selectedTab: any; tabs: Tab[] }) {
  const [history, setHistory] = useState<Array<any>>([])
  const [urlHistory, setUrlHistory] = useState<Array<any>>([])
  const [searchResults, setSearchResults] = useState(history)
  const [urlSearchResults, setUrlSearchResults] = useState(urlHistory)
  const options = {
    keys: ['query', 'title']
  }
  const removeProtocol = (url: string) => {
    return url.replace(/https?:\/\//g, '')
  }
  const formatUrlHistory = (items: any[]) => {
    return items
      .map((item) =>
        item.url !== undefined
          ? {
              ...item,
              url: removeProtocol(item.url ?? '')
            }
          : {
              ...item,
              query: removeProtocol(item.query ?? '')
            }
      )
      .filter((item) =>
        item.url !== undefined ? !item.url.includes('google.com/search') : item.query
      )
  }
  const fuse = new Fuse(history, options)
  const urlFuse = new Fuse(urlHistory, {
    shouldSort: true,
    threshold: 0,
    keys: ['url']
  })
  const getURL = () => {
    const tab = props.tabs[props.selectedTab]
    if (props.tabs.length == 0) {
      return ''
    }
    if (tab === undefined) {
      return ''
    }
    return tab.url
  }
  const searchRef = useRef(null)
  useEffect(() => {
    document.title = 'New Tab'
    window.indexBridge?.header.onFocusSearch(() => {
      if (searchRef.current != null) {
        ;(searchRef.current as any).focus()
        setIsFocused(true)
        setIsSelected(true)
      }
    })
    window.indexBridge?.history.getHistory((items) => {
      console.log('getting qeury history', items)
      setHistory(items)
      setUrlHistory(formatUrlHistory(items))
    }, true)
    window.indexBridge?.history.getHistory((items) => {
      console.log('getting history', items)
      setUrlHistory(formatUrlHistory(items))
    }, false)
  }, [])

  useEffect(() => {
    let newUrl = getURL()
    if (newUrl !== url && newUrl != '') {
      setUrl(newUrl.replaceAll('‎', ''))
    }
  }, [props.tabs, props.selectedTab])
  const goToUrl = () => {
    window.indexBridge?.overlay.closeOverlay(() => {
      let newUrl = url
      if (urlSearchResults.length != 0) {
        newUrl = urlSearchResults[0].item.url
      }
      setUrl(newUrl.replaceAll('‎', ''))
      window.indexBridge?.navigation.goToUrl(() => {}, props.selectedTab, newUrl)
    })
  }
  const [url, setUrl] = useState(getURL())
  const [isSelected, setIsSelected] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {}, [searchResults])
  useEffect(() => {
    if (isFocused && url.length > 1) {
      const { x, y, height, width } = (searchRef.current as any).getBoundingClientRect()
      if (searchResults !== undefined) {
        window.indexBridge?.overlay.openOverlay(
          () => {
            window.indexBridge?.overlay.sendData(
              () => {
                console.log('data sent')
              },
              {
                data: {
                  tabId: props.tabs[props.selectedTab].id,
                  query: url,
                  url: urlSearchResults.slice(0, 1),
                  similar: searchResults.slice(0, 3)
                }
              }
            )
          },

          'search',
          { x: x, y: y + height + 5 },
          { width: width, height: searchResults.slice(0, 3).length * 40 + 50 },
          false
        )
      }
    } else {
      window.indexBridge?.overlay.closeOverlay(() => {})
    }
  }, [url])
  useEffect(() => {
    if (!isFocused) {
      window.indexBridge?.overlay.closeOverlay(() => {})
    }
  }, [isFocused])
  const handleValueChange = (e: any) => {
    setUrl(e.target.value.replaceAll('‎', ''))
    const { value } = e.target
    let results = fuse.search(value).filter((item) => item.item.query !== undefined)
    setSearchResults(results)
    results = urlFuse.search(removeProtocol(e.target.value)) // e.target.value.includes(' ') ? [] : urlFuse.search(removeProtocol(value))
    setUrlSearchResults(results)
  }
  const urlComponent = (url: string) => {
    let protocol = url.split('://')[0] + '://'
    if (url.split('://').length < 2) protocol = ''
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
      <div className="flex bg-s-dark-gray rounded-xl">
        <div className="my-auto pl-3 pr-2">
          <FaSearch size={12} />
        </div>
        <div
          onMouseEnter={() => setIsSelected(true)}
          className={
            `w-[50vw] select-none  pr-2 py-1 whitespace-nowrap text-white border-transparent  outline-none ` +
            (!isSelected && url.length != 0 ? 'block' : 'hidden')
          }
        >
          {urlComponent(url)}
        </div>
        <div>
          <input
            ref={searchRef}
            onMouseLeave={() => (!isFocused ? setIsSelected(false) : null)}
            onChange={handleValueChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false)
              setIsSelected(false)
            }}
            autoCorrect="off"
            autoCapitalize="off"
            onKeyDown={(e) => {
              if (e.key == 'Enter') {
                e.currentTarget.blur()
                goToUrl()
              }
            }}
            className={
              `w-[50vw] bg-s-dark-gray pr-2 py-1 rounded-lg text-white border-transparent outline-none ` +
              (!isSelected && url.length != 0 ? 'hidden' : 'block')
            }
            value={url}
          />
        </div>
      </div>
    </div>
  )
}
