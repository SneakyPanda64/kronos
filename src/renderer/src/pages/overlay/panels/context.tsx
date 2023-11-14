import { useEffect } from 'react'
import { LuInspect } from 'react-icons/lu'
import { FaSave } from 'react-icons/fa'
import { IoMdClose } from 'react-icons/io'
import { BiExpandAlt } from 'react-icons/bi'
interface ContextButton {
  id: string
  title: string
  action: any
  icon: any
}

export default function ContextPanel() {
  const buttons: ContextButton[] = [
    {
      id: 'inspect',
      title: 'Inspect',
      action: () => {},
      icon: <LuInspect />
    },
    {
      id: 'save-page',
      title: 'Save Page As...',
      action: () => {},
      icon: <FaSave />
    },
    {
      id: 'close-window',
      title: 'Close Window',
      action: () => {},
      icon: <IoMdClose />
    },
    {
      id: 'isolate',
      title: 'Isolate Tab',
      action: () => {},
      icon: <BiExpandAlt />
    }
  ]
  const menus = {
    page: {
      buttons: ['inspect', 'isolate', 'close-window']
    }
  }
  const buttonComponent = (btn: ContextButton) => {
    return (
      <div
        className="my-2 text-md bg-s-blue bg-opacity-20 rounded-md hover:bg-opacity-40"
        onClick={btn.action()}
      >
        <div className="flex my-auto">
          <div className="my-auto pl-2 pr-1">{btn.icon}</div>
          <button className="p-1 truncate my-auto">{btn.title}</button>
        </div>
      </div>
    )
  }
  useEffect(() => {
    window.indexBridge?.overlay.openOverlay(
      () => {
        console.log('refreshed size')
      },
      'context',
      { x: 0, y: 0 },
      { width: 175, height: menus.page.buttons.length * 40 + 20 }
    )
  }, [])
  return (
    <div className="p-2">
      {menus.page.buttons.map((btnId) => {
        const btn = buttons.find((button) => button.id === btnId)
        return btn !== undefined ? buttonComponent(btn) : <></>
      })}
    </div>
  )
}
