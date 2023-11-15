import { useEffect, useState } from 'react'
import { FaBarsStaggered } from 'react-icons/fa6'
import { IoMdClose } from 'react-icons/io'
import { BiCopy, BiExpandAlt, BiSave } from 'react-icons/bi'
interface ContextButton {
  id: string
  title: string
  action: any
  icon: any
}

const buttons: ContextButton[] = [
  {
    id: 'inspect',
    title: 'Inspect',
    action: () => {
      window.indexBridge?.tabs.requestSelectedTab((tabId: number) => {
        window.indexBridge?.tabs.openInspect(() => {}, tabId)
      })
    },
    icon: <FaBarsStaggered />
  },
  {
    id: 'close-window',
    title: 'Close Window',
    action: () => {
      window.indexBridge?.tabs.requestSelectedTab(() => {
        window.indexBridge?.window.closeWindow(() => {})
      })
    },
    icon: <IoMdClose />
  },
  {
    id: 'new-window',
    title: 'New Window',
    action: () => {
      window.indexBridge?.window.createWindow(() => {}, [])
    },
    icon: <BiExpandAlt />
  },
  {
    id: 'new-tab',
    title: 'New Tab',
    action: () => {
      window.indexBridge?.tabs.newTab(() => {})
    },
    icon: <BiExpandAlt />
  },
  {
    id: 'save-image',
    title: 'Save Image',
    action: () => {},
    icon: <BiSave />
  },
  {
    id: 'copy-image',
    title: 'Copy Image',
    action: () => {},
    icon: <BiCopy />
  }
]

export default function ContextPanel() {
  const [data, setData] = useState<any>({})
  useEffect(() => {
    window.indexBridge?.overlay.onData((_: any, data: any) => {
      let d = JSON.parse(data)
      setData(d.data)
      console.log('data2', d.data)
    })
  }, [])
  const buttonComponent = (btn: ContextButton) => {
    return (
      <div
        className="my-2 text-md bg-s-blue bg-opacity-20 rounded-md hover:bg-opacity-40 "
        onClick={() => btn.action()}
      >
        <div className="flex my-auto">
          <div className="my-auto pl-2 pr-1">{btn.icon}</div>
          <button className="p-1 truncate my-auto">{btn.title}</button>
        </div>
      </div>
    )
  }
  const [showContext, setShowContext] = useState(false)
  useEffect(() => {
    if (data.buttons !== undefined) {
      window.indexBridge?.overlay.openOverlay(
        () => {
          setShowContext(true)
        },
        'context',
        { x: 0, y: 0 },
        { width: 175, height: data.buttons.length * 40 + 20 }
      )
    }
  }, [data])
  return showContext ? (
    <div className="p-2 ">
      {data.buttons.map((btnId) => {
        const btn = buttons.find((button) => button.id === btnId)
        return btn !== undefined ? buttonComponent(btn) : <></>
      })}
    </div>
  ) : (
    <></>
  )
}
