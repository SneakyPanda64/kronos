import { Tab } from '../../../../interfaces.ts'
import { RxCross2 } from 'react-icons/rx'

export default function TabButton(props: {
  tab: Tab
  key: number
  selectedTab: number
  setSelectedTab: any
  favicons: any
  handleTab: any
  handleDeleteTab: any
}) {
  console.log(props.tab.favicon)
  return (
    <div className="w-44 min-w-max" key={props.key}>
      <div
        onClick={(e) => {
          e.stopPropagation() // Stop propagation here
          props.handleTab(props.tab.id)
        }}
        className={`h-full text-sm hover:cursor-default`}
      >
        {/* <button onClick={(e) => e.preventDefault()}> */}
        {/* <img src={props.tab.favicon} /> */}
        <div
          className={
            `mx-2 mt-0.5 p-1 bg-s-blue rounded-lg flex ` +
            (props.tab.id === props.selectedTab
              ? ' bg-opacity-50'
              : ' bg-opacity-20 hover:bg-opacity-30')
          }
        >
          <h1 className="py-1 my-auto select-none">
            {props.tab.title.split('').slice(0, 25).join('')}
          </h1>
          <div
            className="my-auto ml-auto"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation() // Stop propagation here
              props.handleDeleteTab(props.tab.id)
            }}
          >
            <div className="ml-2 p-1 hover:bg-s-blue rounded-lg">
              <RxCross2 color={'white'} />
            </div>
          </div>
        </div>
        {/* <h2>{props.favicons[`${props.tab.id}`]}</h2> */}
        {/* </button> */}
        {/* <button
          className="bg-black text-red-500"
          onClick={() => props.handleDeleteTab(props.tab.id)}
        >
          Delete
        </button> */}
      </div>
    </div>
  )
}
