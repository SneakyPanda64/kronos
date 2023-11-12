import { useEffect, useRef, useState } from 'react'
import { Tab } from '../../../../interfaces.ts'
import TabButton from './tab_button.tsx'
import { IoMdAdd } from 'react-icons/io'
import { BiSolidLeftArrow, BiSolidRightArrow } from 'react-icons/bi'
import { decode } from 'js-base64'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

export default function TabBar(props: {
  tabs: Tab[]
  setTabs: any
  selectedTab: number
  setSelectedTab: any
}) {
  const [favicons, setFavicons] = useState<any>({})
  // const [currentTabs, setCurrentTabs] = useState<Tab[]>([])
  const [posMap, setPosMap] = useState<Array<number>>([])
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

  const handleTab = async (id: number) => {
    await window.indexBridge?.tabs.selectTab(id)
    props.setSelectedTab(id)
  }
  const handleDeleteTab = async (tabId: number) => {
    let newTab: Tab, newTabIndex: number
    if (tabId == props.selectedTab) {
      newTabIndex = -2
      if (Object.keys(props.tabs).length == 1) {
        window.indexBridge?.window.closeWindow()
      } else {
        Object.keys(props.tabs).forEach((key, index) => {
          if (key == `${tabId}`) {
            if (Object.keys(props.tabs).length < index + 2) {
              newTabIndex = index - 1
            } else {
              newTabIndex = index + 1
            }
          }
        })
      }
      let validPos: number[] = []
      posMap.forEach((pos) => {
        if (Object.keys(props.tabs).includes(`${pos}`)) {
          validPos.push(pos)
        }
      })
      newTab = props.tabs[validPos[newTabIndex]]
    }
    window.indexBridge?.tabs.deleteTab(() => {
      if (tabId == props.selectedTab) {
        console.log('switching tab to', newTabIndex, props.tabs)
        handleTab(newTab.id)
      }
    }, tabId)
  }

  useEffect(() => {
    console.log('tab selected: ', props.selectedTab)
  }, [props.selectedTab])
  useEffect(() => {
    console.log('requesting tabs')
    window.indexBridge?.tabs.requestTabs((tabs: any) => {
      console.log('tabs: ', tabs, tabs[0].id)
      handleUpdateTabs(tabs)
      props.setSelectedTab(tabs[0].id)
    })
    window.indexBridge?.tabs.watchTabs((_: any, tabs: any) => {
      handleUpdateTabs(tabs)
      console.log('tabs: ', tabs, tabs[0].id)
      if (props.selectedTab == -1) {
        props.setSelectedTab(tabs[0].id)
      }
    })
    window.indexBridge?.tabs.watchSelectedTab((_: any, tabId: number) => {
      props.setSelectedTab(tabId)
    })
  }, [])
  const handleNewTab = async () => {
    window.indexBridge?.tabs.newTab((tabId: number) => {
      console.log('new tab: ', tabId)
      props.setSelectedTab(tabId)
      scrollOffset(100000)
    })
  }

  const handleUpdateTabs = (tabs: Tab[]) => {
    let newFavicons = favicons
    // let newCurrentTabs = currentTabs
    let newPosMap: number[] = posMap
    let newTabList = {}
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
      newTabList[tab.id] = tab
      if (!posMap.includes(tab.id)) {
        newPosMap.push(tab.id)
      }

      // if (newCurrentTabs.includes(tab))
    })
    setFavicons(newFavicons)
    setPosMap(newPosMap)
    props.setTabs(newTabList)
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
  async function handleOnDragEnd(result) {
    if (!result.destination) {
      console.log('attemp create window', result.draggableId)
      await window.indexBridge?.tabs.moveTabs(
        (moved: boolean) => {
          console.log('moving tabs')
          if (moved) {
            if (Object.keys(props.tabs).length == 1) {
              window.indexBridge?.window.moveWindow(() => {
                console.log('moved window')
              })
            } else {
              window.indexBridge?.window.createWindow(
                () => {
                  console.log('created', result.draggableId, posMap)
                },
                [result.draggableId],
                true
              )
              let newTabIndex = 0

              if (props.selectedTab == result.draggableId) {
                Object.keys(props.tabs).forEach((key, index) => {
                  if (key == `${result.draggableId}`) {
                    if (Object.keys(props.tabs).length < index + 2) {
                      newTabIndex = index - 1
                    } else {
                      newTabIndex = index + 1
                    }
                  }
                })
                console.log('NEW TAB INDEX!!!', newTabIndex)
                let validPos: number[] = []
                posMap.forEach((pos) => {
                  if (Object.keys(props.tabs).includes(`${pos}`)) {
                    validPos.push(pos)
                  }
                })

                let newTab = props.tabs[validPos[newTabIndex]]
                window.indexBridge?.tabs.selectTab(newTab.id ?? props.tabs[0])
                props.setSelectedTab(newTab.id ?? props.tabs[0])
              }
            }
          }
        },
        [result.draggableId]
      )
    } else {
      const items = posMap
      const [reorderedItem] = items.splice(result.source.index, 1)
      items.splice(result.destination.index, 0, reorderedItem)
    }
  }
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
          <DragDropContext direction="horizontal" onDragEnd={handleOnDragEnd}>
            <Droppable direction="horizontal" droppableId="characters">
              {(provided) => (
                <ul className=" flex" {...provided.droppableProps} ref={provided.innerRef}>
                  {posMap.map((id, index) => {
                    let item = props.tabs[id]
                    if (item == undefined) return
                    // let id = posMap[index]
                    console.log('ID', id)
                    // let id = `${item.id}`
                    return (
                      <Draggable key={id} draggableId={`${id}`} index={index}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={'outline-none ring-0'}
                          >
                            {TabButton({
                              tab: item,
                              favicons: favicons,
                              key: index,
                              selectedTab: props.selectedTab,
                              setSelectedTab: props.setSelectedTab,
                              handleTab: handleTab,
                              handleDeleteTab: handleDeleteTab
                            })}
                          </li>
                        )}
                      </Draggable>
                    )
                  })}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
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
