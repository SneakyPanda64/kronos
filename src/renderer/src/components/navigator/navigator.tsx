import { useEffect, useRef, useState } from 'react'
import TabBar from './navigator/tab/tab'
import { Tab } from '@renderer/interfaces'
import Actions from './actions'
import Bar from './navigator/bar/bar'
export default function Navigator() {
  const [selectedTab, setSelectedTab] = useState(4)
  const [tabs, setTabs] = useState<Array<Tab>>([])

  return (
    <div className="bg-s-dark-gray">
      <div className="overflow-hidden bg-s-blue bg-opacity-20">
        <div className="grid grid-rows-2 h-[100vh] ">
          <div className="bg-s-dark-gray flex">
            <div className="px-6 draggable"></div>
            <TabBar
              tabs={tabs}
              setTabs={setTabs}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />
            <div className="w-full mr-40 draggable "></div>
            <div className="h-[50vh]">
              <Actions />
            </div>
          </div>

          {/* </div> */}
          <div>
            <Bar selectedTab={selectedTab} tabs={tabs} />
          </div>
        </div>
        <div>{/* <h1>{getURL()}</h1> */}</div>
      </div>
    </div>
  )
}
