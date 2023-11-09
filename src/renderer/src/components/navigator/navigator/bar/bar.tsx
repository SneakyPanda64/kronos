import { Tab } from '@renderer/interfaces'
import Actions from './actions'
import SearchBar from './search_bar'

export default function Bar(props: { selectedTab: any; tabs: Tab[] }) {
  return (
    <div className="flex  h-[50vh] ">
      <Actions />
      <SearchBar selectedTab={props.selectedTab} tabs={props.tabs} />
    </div>
  )
}
