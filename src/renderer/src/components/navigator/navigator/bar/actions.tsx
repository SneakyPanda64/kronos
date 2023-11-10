import { Tab } from '@renderer/interfaces'
import { useEffect, useState } from 'react'
import { BiLeftArrow, BiRightArrow, BiRefresh } from 'react-icons/bi'
import { RxCross2 } from 'react-icons/rx'

export default function Actions(props: { selectedTab: any; tabs: Tab[] }) {
  const handleGoBack = () => {
    window.indexBridge?.navigation.goBack(() => {
      console.log('go back')
    }, props.selectedTab)
  }
  const handleGoForward = () => {
    window.indexBridge?.navigation.goForward(() => {
      console.log('go forward')
    }, props.selectedTab)
  }
  const handleRefresh = () => {
    window.indexBridge?.refreshTab(() => {
      console.log('refresh')
    }, props.selectedTab)
  }
  useEffect(() => {
    let currentTab = props.tabs[0]
    props.tabs.forEach((tab) => {
      if (tab.id == props.selectedTab) {
        currentTab = tab
      }
    })
    setTab(currentTab)
  }, [props.tabs])
  const [tab, setTab] = useState<Tab | undefined>(undefined)
  return tab !== undefined ? (
    <div className="flex ml-4">
      <div
        className={
          `my-auto text-s-dark-blue  rounded-md p-2  ` +
          (tab.navigation.canGoBack ? 'text-opacity-100 hover:text-white' : 'text-opacity-20')
        }
        onClick={() => handleGoBack()}
      >
        <BiLeftArrow />
      </div>
      <div
        className={
          `my-auto text-s-dark-blue  rounded-md p-2  ` +
          (tab.navigation.canGoForward ? 'text-opacity-100 hover:text-white' : 'text-opacity-20')
        }
        onClick={() => handleGoForward()}
      >
        <BiRightArrow />
      </div>
      <div className={`my-auto text-s-dark-blue  rounded-md p-2 `} onClick={() => handleRefresh()}>
        {tab.navigation.isLoading ? <RxCross2 size={22} /> : <BiRefresh size={22} />}
      </div>
    </div>
  ) : (
    <></>
  )
}