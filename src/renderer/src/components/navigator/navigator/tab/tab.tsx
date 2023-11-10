import { useEffect, useRef, useState } from 'react'
import { Tab } from '../../../../interfaces.ts'
import TabButton from './tab_button.tsx'
import { IoMdAdd } from 'react-icons/io'
import { BiSolidLeftArrow, BiSolidRightArrow } from 'react-icons/bi'
import { decode, encode } from 'js-base64'
export default function TabBar(props: {
  tabs: Tab[]
  setTabs: any
  selectedTab: number
  setSelectedTab: any
}) {
  const [favicons, setFavicons] = useState<any>({})

  const newTabButton = () => {
    return (
      <div
        className="py-2 px-2 hover:bg-s-blue hover:bg-opacity-30 rounded-lg m-1"
        onClick={handleNewTab}
      >
        <IoMdAdd size={25} />
      </div>
    )
  }

  const handleTab = (id: number) => {
    window.indexBridge?.selectTab(id)
    props.setSelectedTab(id)
  }
  const handleDeleteTab = async (tabId: number) => {
    let newTab: Tab, newTabIndex: number
    if (tabId == props.selectedTab) {
      newTabIndex = -2
      if (props.tabs.length == 1) {
        window.indexBridge?.window.closeWindow(324)
      } else {
        props.tabs.forEach((tab, index) => {
          if (tab.id == tabId) {
            if (props.tabs.length < index + 2) {
              newTabIndex = index - 1
            } else {
              newTabIndex = index + 1
            }
          }
        })
      }

      newTab = props.tabs[newTabIndex]
    }

    // console.log('prev', newTabIndex)
    window.indexBridge?.deleteTab(() => {
      if (tabId == props.selectedTab) {
        console.log('switching tab to', newTabIndex)
        handleTab(newTab.id)
      }
    }, tabId)
  }
  useEffect(() => {
    console.log('tab selected: ', props.selectedTab)
  }, [props.selectedTab])
  useEffect(() => {
    console.log('requesting tabs')
    window.indexBridge?.requestTabs((tabs: any) => {
      console.log('tabs: ', tabs, tabs[0].id)
      handleUpdateTabs(tabs)
      props.setSelectedTab(tabs[0].id)
    })
    window.indexBridge?.watchTabs((_: any, tabs: any) => {
      // console.log('tabs', tabs)
      handleUpdateTabs(tabs)
      if (props.selectedTab == -1) {
        console.log('props is -1', props.selectedTab)
        // props.setSelectedTab(tabs[0].id)
      }
    })
  }, [])
  const handleNewTab = async () => {
    window.indexBridge?.newTab((tabId: number) => {
      console.log('new tab: ', tabId)
      props.setSelectedTab(tabId)
      scrollOffset(100000)
    })
  }

  const handleUpdateTabs = (tabs: Tab[]) => {
    let newFavicons = favicons
    tabs.forEach((tab) => {
      if (tab.favicon != '') {
        newFavicons[`${tab.id}`] = tab.favicon
      }
      if (tab.url.includes('6713de00-4386-4a9f-aeb9-0949b3e71eb7')) {
        const hashIndex = tab.url.indexOf('#')
        const hashString = hashIndex !== -1 ? tab.url.slice(hashIndex) : ''
        const queryParams = new URLSearchParams(hashString.substring(1))
        console.log('has', queryParams.get('url'))

        let decodedUrl = decode(queryParams.get('url') ?? '')
        tab.url = decodedUrl
        tab.favicon = 'WARNING'
      }
    })
    setFavicons(newFavicons)
    props.setTabs(tabs)
  }
  const containerRef = useRef(null)
  const [isOverflow, setIsOverflow] = useState(false)
  const scrollOffset = (offset: number) => {
    ;(containerRef.current as any).scrollLeft += offset
  }
  useEffect(() => {
    // try {
    if (containerRef.current == null) return
    const handleMouseWheel = (event) => {
      scrollOffset((event.deltaY + 1) * 0.5)
      event.preventDefault()
    }
    ;(containerRef.current as any).addEventListener('wheel', handleMouseWheel)
  }, [])

  useEffect(() => {
    try {
      setIsOverflow(
        ((containerRef.current as any).scrollWidth ?? 0) > (containerRef.current as any).clientWidth
      )
    } catch (e) {}
  }, [props.tabs])

  return (
    <div className="flex h-[50vh]">
      {isOverflow ? (
        <div
          className="my-auto mr-2 hidden md:block"
          onClick={() => {
            ;(containerRef.current! as any).scrollLeft -= 100
          }}
        >
          <BiSolidLeftArrow size={20} />
        </div>
      ) : (
        <></>
      )}

      <div ref={containerRef} className=" overflow-x-hidden  w-[70vw] overflow-y-hidden flex">
        <div className="flex">
          {props.tabs.map((item: Tab, index: number) =>
            TabButton({
              tab: item,
              favicons: favicons,
              key: index,
              selectedTab: props.selectedTab,
              setSelectedTab: props.setSelectedTab,
              handleTab: handleTab,
              handleDeleteTab: handleDeleteTab
            })
          )}

          {!isOverflow ? (
            <div className="">{newTabButton()}</div>
          ) : (
            <div className="block mr-5 md:hidden md:mr-0">{newTabButton()}</div>
          )}
        </div>
        <div className="w-full draggable"></div>
      </div>
      {isOverflow ? (
        <div className="my-auto ml-2 hidden md:block">
          <BiSolidRightArrow
            onClick={() => {
              ;(containerRef.current! as any).scrollLeft += 100
            }}
            size={20}
          />
        </div>
      ) : (
        <></>
      )}
      {isOverflow ? <div className="hidden md:block">{newTabButton()}</div> : <></>}
    </div>
  )
}
