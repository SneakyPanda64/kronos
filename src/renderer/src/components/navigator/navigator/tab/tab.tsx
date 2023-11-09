import { useEffect, useRef, useState } from 'react'
import { Tab } from '../../../../interfaces.ts'
import TabButton from './tab_button.tsx'
import { IoMdAdd } from 'react-icons/io'
import { BiSolidLeftArrow, BiSolidRightArrow } from 'react-icons/bi'
import DetectableOverflow from 'react-detectable-overflow'

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
        className="py-2 px-2 hover:bg-s-blue hover:bg-opacity-30 rounded-lg"
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
    window.indexBridge?.deleteTab(() => {}, tabId)
  }
  useEffect(() => {
    console.log('requesting tabs')
    window.indexBridge?.requestTabs((tabs: any) => {
      console.log(tabs)
      handleUpdateTabs(tabs)
      handleTab(tabs[0].id)
    })
    window.indexBridge?.watchTabs((event: any, tabs: any) => {
      // console.log('tabs', tabs)
      handleUpdateTabs(tabs)
    })
  }, [])
  const handleNewTab = async () => {
    window.indexBridge?.newTab((tabId: number) => {
      console.log('new tab: ', tabId)
      props.setSelectedTab(tabId)
    })
  }

  const handleUpdateTabs = (tabs: Tab[]) => {
    let newFavicons = favicons
    tabs.forEach((tab) => {
      if (tab.favicon != '') {
        newFavicons[`${tab.id}`] = tab.favicon
      }
    })
    setFavicons(newFavicons)
    props.setTabs(tabs)
  }
  const containerRef = useRef(null)
  const [isOverflow, setIsOverflow] = useState(false)
  useEffect(() => {
    // try {
    if (containerRef.current == null) return () => {}
    const handleMouseWheel = (event) => {
      ;(containerRef.current as any).scrollLeft +=
        (event.deltaY + 1) * (props.tabs.length + 1) * 0.2
      console.log('scroll!', event.deltaY, containerRef.current as any)

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
          onClick={(e) => {
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
            <div className="block md:hidden">{newTabButton()}</div>
          )}
        </div>
        <div className="w-full draggable bg-red-500"></div>
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
