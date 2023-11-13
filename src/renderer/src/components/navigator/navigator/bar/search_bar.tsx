import { Tab } from '@renderer/interfaces'
import Fuse from 'fuse.js'
import { useEffect, useRef, useState } from 'react'

export default function SearchBar(props: { selectedTab: any; tabs: Tab[] }) {
  const [history, setHistory] = useState<Array<any>>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState(history)
  const options = {
    keys: ['title', 'url']
  }
  const fuse = new Fuse(history, options)
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
      console.log('focus', searchRef.current)
      if (searchRef.current != null) {
        ;(searchRef.current as any).focus()
        setIsFocused(true)
        setIsSelected(true)
      }
    })
    window.indexBridge?.history.getHistory((items) => {
      console.log(items)
      setHistory(items)
    })
  }, [])

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

  useEffect(() => {
    console.log('attempt data sent')
  }, [searchResults])
  useEffect(() => {
    if (isFocused && url.length > 1) {
      const { x, y, height } = (searchRef.current as any).getBoundingClientRect()
      if (searchResults !== undefined) {
        window.indexBridge?.overlay.openOverlay(
          () => {
            window.indexBridge?.overlay.sendData(
              () => {
                console.log('data sent')
              },
              {
                data: {
                  similar: searchResults.slice(0, 3)
                }
              }
            )
          },

          'search',
          { x: x, y: y + height + 5 },
          false
        )
      }
    } else {
      window.indexBridge?.overlay.closeOverlay(() => {
        console.log('closed overlay')
      })
    }
  }, [url])
  useEffect(() => {
    if (!isFocused) {
      window.indexBridge?.overlay.closeOverlay(() => {
        console.log('closed overlay')
      })
    }
  }, [isFocused])
  const handleValueChange = (e: any) => {
    setUrl(e.target.value)
    const { value } = e.target
    setSearchTerm(value)
    let results = fuse.search(value)
    setSearchResults(results)
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
      <div
        onMouseEnter={() => setIsSelected(true)}
        className={
          `w-[50vw] select-none bg-s-dark-gray px-4 py-1 whitespace-nowrap rounded-lg text-white border-transparent focus:border-transparent focus:ring-0 outline-none ` +
          (!isSelected && url.length != 0 ? 'block' : 'hidden')
        }
      >
        {urlComponent(url)}
      </div>
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
            goToUrl()
            e.currentTarget.blur()
          }
        }}
        className={
          `w-[50vw] bg-s-dark-gray px-4 py-1 rounded-lg text-white border-transparent focus:border-transparent focus:ring-0 outline-none ` +
          (!isSelected && url.length != 0 ? 'hidden' : 'block')
        }
        value={url}
      />
    </div>
  )
}
