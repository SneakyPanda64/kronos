import { Tab } from '@renderer/interfaces'
import Actions from './actions'
import SearchBar from './search_bar'
import Utils from './utils'

export default function Bar(props: { selectedTab: any; tabs: Tab[] }) {
  return (
    <div className="flex h-[50vh] ">
      <Actions selectedTab={props.selectedTab} tabs={props.tabs} />
      <SearchBar selectedTab={props.selectedTab} tabs={props.tabs} />
      <Utils />
    </div>
  )
}
