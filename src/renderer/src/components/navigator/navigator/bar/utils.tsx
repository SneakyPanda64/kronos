import { BiDownload } from 'react-icons/bi'
import { GiHamburgerMenu } from 'react-icons/gi'

export default function Utils() {
  const icons = [
    {
      icon: GiHamburgerMenu,
      type: 'menu'
    },
    {
      icon: BiDownload,
      type: 'downloads'
    }
  ]
  const handleOpenOverlay = (type: string, position: { x: number; y: number }) => {
    console.log('POS', position)
    window.indexBridge?.overlay.openOverlay(
      () => {
        console.log('response from overlay!')
      },

      type,
      position
    )
  }
  return (
    <div className="w-full h-fit">
      <div className="flex flex-row-reverse gap-x-6 absolute right-0 mr-4">
        {icons.map((item) => {
          return (
            <div
              className="mt-1 hover:bg-s-light-gray p-1 rounded-lg hover:text-white"
              onClick={(e) =>
                handleOpenOverlay(item.type, {
                  x: e.currentTarget.getBoundingClientRect().right,
                  y: e.currentTarget.getBoundingClientRect().bottom
                })
              }
            >
              <item.icon size={20} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
