import { useState } from 'react'
import TabBar from './navigator/tab/tab'
import Actions from './actions'
import Bar from './navigator/bar/bar'
import { useSearchParams } from 'react-router-dom'
import { AiFillEye, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
export default function Navigator() {
  const [selectedTab, setSelectedTab] = useState(4)
  const [tabs, setTabs] = useState<any>({})
  const [searchParams] = useSearchParams()
  const isPrivate = searchParams.get('private') !== null
  return (
    <div className="bg-s-dark-gray">
      <div className="overflow-hidden bg-s-blue bg-opacity-20">
        <div className="grid grid-rows-2 h-[100vh] ">
          <div className="bg-s-dark-gray flex">
            <div className={` draggable ` + (isPrivate ? 'px-14' : 'px-6')}>
              {isPrivate ? (
                <div className="draggable absolute pt-2 left-4 text-s-blue flex">
                  <AiOutlineEyeInvisible size={25} />
                  <h1 className="pl-2 font-semibold">Private</h1>
                </div>
              ) : (
                ''
              )}
            </div>
            <TabBar
              tabs={tabs}
              setTabs={setTabs}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />
            <div className="w-full mr-40 draggable "></div>
            <div className="h-[50vh] flex">
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
