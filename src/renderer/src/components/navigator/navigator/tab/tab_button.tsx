import { useRef, useState } from 'react'
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
    <div className="w-16 min-w-max flex" key={props.key}>
      <div
        onClick={(e) => {
          e.stopPropagation() // Stop propagation here
          props.handleTab(props.tab.id)
          // if ((e.currentTarget.scrollWidth ?? 0) > e.currentTarget.clientWidth) {
          // (containerRef.current as any).scrollWidth ?? 0) > (containerRef.current as any).clientWidth
          e.currentTarget.scrollIntoView({ behavior: 'smooth' })
        }}
        className={`h-full text-sm hover:cursor-default`}
      >
        {/* <button onClick={(e) => e.preventDefault()}> */}
        {/* <img src={props.tab.favicon} /> */}
        <div className="pt-1 mb-4">
          <div
            className={
              `mx-1 p-1 bg-s-blue  rounded-tl-lg rounded-tr-lg flex ` +
              (props.tab.id === props.selectedTab ? ' bg-opacity-20' : ' bg-opacity-5')
            }
          >
            {props.favicons[props.tab.id] != '' ? (
              <img
                className={`w-4 h-4 ml-1 mr-2 my-auto select-none`}
                src={props.favicons[props.tab.id]}
                style={{ display: 'none' }}
                width={15}
                height={15}
                onLoad={(e) => (e.currentTarget.style.display = 'block')}
                onLoadStart={(e) => (e.currentTarget.style.display = 'none')}
                onError={(e) => {
                  console.log('error with loading favicon!')
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <></>
            )}
            <h1 className="py-1 my-auto select-none truncate max-w-[12rem]">{props.tab.title}</h1>
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
        </div>
      </div>
    </div>
  )
}
