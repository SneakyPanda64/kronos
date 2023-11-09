import { useEffect, useRef, useState } from 'react'
import TabBar from './navigator/tab/tab'
import { Tab } from '@renderer/interfaces'
import Actions from './actions'
import Bar from './navigator/bar/bar'
export default function Navigator() {
  const [selectedTab, setSelectedTab] = useState(0)
  const [tabs, setTabs] = useState<Array<Tab>>([])
  const getURL = () => {
    const newTabs = tabs.filter((tab) => tab.id === selectedTab)
    if (newTabs.length == 0) {
      return ''
    }
    if (newTabs[0] === undefined) {
      return ''
    }
    return newTabs[0].url
  }

  return (
    <div className="overflow-hidden">
      <div className="grid grid-rows-2 h-[100vh]">
        {/* <div className="bg-red-500 w-16 h-10 absolute"></div> */}
        <div className="bg-s-dark-gray flex">
          <div className="px-6 draggable"></div>
          <TabBar
            tabs={tabs}
            setTabs={setTabs}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
          <div className="w-full mr-40 draggable bg-red-500"></div>
          <div className="h-[50vh]">
            <Actions />
          </div>
        </div>
        {/* </div> */}
        <div>
          <Bar />
        </div>
      </div>
      <div>{/* <h1>{getURL()}</h1> */}</div>
    </div>
  )
}
