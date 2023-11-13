import { Tab } from '@renderer/interfaces'
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
    window.indexBridge?.tabs.refreshTab(() => {
      console.log('refresh')
    }, props.selectedTab)
  }
  return (
    <div className="flex ml-4">
      <div
        className={
          `my-auto text-s-dark-blue  rounded-md p-2  ` +
          (props.tabs[props.selectedTab] === undefined
            ? ''
            : props.tabs[props.selectedTab].navigation.canGoBack
            ? 'text-opacity-100 hover:text-white'
            : 'text-opacity-20')
        }
        onClick={() => handleGoBack()}
      >
        <BiLeftArrow />
      </div>
      <div
        className={
          `my-auto text-s-dark-blue  rounded-md p-2  ` +
          (props.tabs[props.selectedTab] === undefined
            ? ''
            : props.tabs[props.selectedTab].navigation.canGoForward
            ? 'text-opacity-100 hover:text-white'
            : 'text-opacity-20')
        }
        onClick={() => handleGoForward()}
      >
        <BiRightArrow />
      </div>
      <div className={`my-auto text-s-dark-blue  rounded-md p-2 `} onClick={() => handleRefresh()}>
        {props.tabs[props.selectedTab] === undefined ? (
          <RxCross2 size={22} />
        ) : props.tabs[props.selectedTab].navigation.isLoading ? (
          <RxCross2 size={22} />
        ) : (
          <BiRefresh size={22} />
        )}
      </div>
    </div>
  )
}
