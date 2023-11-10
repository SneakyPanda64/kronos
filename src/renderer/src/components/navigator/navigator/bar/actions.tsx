import { Tab } from '@renderer/interfaces'
import { BiLeftArrow, BiRightArrow, BiRefresh } from 'react-icons/bi'

export default function Actions(props: { selectedTab: any; tabs: Tab[] }) {
  const handleGoBack = () => {
    let id = 0
    props.tabs.forEach((tab) => {
      if (tab.id == props.selectedTab) {
        id = tab.id
      }
    })
    window.indexBridge?.navigation.goBack(() => {
      console.log('go back')
    }, id)
  }
  return (
    <div className="flex ml-4">
      <div
        className="my-auto hover:bg-s-light-gray rounded-md p-2 hover:text-white"
        onClick={() => handleGoBack()}
      >
        <BiLeftArrow />
      </div>
      <div className="my-auto ml-2 hover:bg-s-light-gray rounded-md p-2 hover:text-white">
        <BiRightArrow />
      </div>
      <div className="my-auto ml-2 hover:bg-s-light-gray p-1 rounded-md hover:text-white">
        <BiRefresh size={22} />
      </div>
    </div>
  )
}
