import { Tab } from '../../../../interfaces.ts'
import { RxCross2 } from 'react-icons/rx'
import { Tooltip } from 'react-tooltip'
import ReactDOMServer from 'react-dom/server'

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
        <a
          data-tooltip-id="my-tooltip-data-html"
          data-tooltip-html={ReactDOMServer.renderToStaticMarkup(
            <>
              {props.tab.title.length > 25 ? (
                <div className="bg-s-gray z-50 flex px-4 py-2 rounded-lg">
                  <h1>{props.tab.title}</h1>
                </div>
              ) : (
                <></>
              )}
            </>
          )}
        >
          <div className="pt-1 mb-4 ">
            <div
              className={
                `mx-1 p-1 pb-10 bg-s-blue hover:bg-opacity-10  rounded-tl-lg rounded-tr-lg flex ` +
                (props.tab.id === props.selectedTab ? ' bg-opacity-20' : ' bg-opacity-5')
              }
            >
              {props.tab.navigation.isLoading ? (
                <div
                  className={'w-4 h-4 ml-1 mr-2 my-auto ' + (props.tab.title == '' ? 'mt-1.5' : '')}
                >
                  <svg
                    className="animate-spin"
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 1024 1024"
                    height="1.2em"
                    width="1.2em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M909.1 209.3l-56.4 44.1C775.8 155.1 656.2 92 521.9 92 290 92 102.3 279.5 102 511.5 101.7 743.7 289.8 932 521.9 932c181.3 0 335.8-115 394.6-276.1 1.5-4.2-.7-8.9-4.9-10.3l-56.7-19.5a8 8 0 0 0-10.1 4.8c-1.8 5-3.8 10-5.9 14.9-17.3 41-42.1 77.8-73.7 109.4A344.77 344.77 0 0 1 655.9 829c-42.3 17.9-87.4 27-133.8 27-46.5 0-91.5-9.1-133.8-27A341.5 341.5 0 0 1 279 755.2a342.16 342.16 0 0 1-73.7-109.4c-17.9-42.4-27-87.4-27-133.9s9.1-91.5 27-133.9c17.3-41 42.1-77.8 73.7-109.4 31.6-31.6 68.4-56.4 109.3-73.8 42.3-17.9 87.4-27 133.8-27 46.5 0 91.5 9.1 133.8 27a341.5 341.5 0 0 1 109.3 73.8c9.9 9.9 19.2 20.4 27.8 31.4l-60.2 47a8 8 0 0 0 3 14.1l175.6 43c5 1.2 9.9-2.6 9.9-7.7l.8-180.9c-.1-6.6-7.8-10.3-13-6.2z"></path>
                  </svg>
                </div>
              ) : props.favicons[props.tab.id] != '' ? (
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

              {props.tab.title !== '' ? (
                <>
                  <h1 className="py-1 my-auto select-none truncate max-w-[12rem]">
                    {props.tab.title}
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
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        </a>
      </div>
      <Tooltip
        style={{ padding: '0px' }}
        noArrow
        id="my-tooltip-data-html"
        delayShow={1000}
        float={true}
      />
    </div>
  )
}
