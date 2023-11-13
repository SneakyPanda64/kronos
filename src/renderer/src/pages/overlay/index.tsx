import { useSearchParams } from 'react-router-dom'
import MenuPanel from './panels/menu'
import DownloadsPanel from './panels/downloads'

export default function Overlay() {
  const panels = {
    menu: <MenuPanel />,
    downloads: <DownloadsPanel />
  }
  const [searchParams] = useSearchParams()
  let type = searchParams.get('type') ?? 'menu'
  console.log(searchParams)
  return (
    <div className="bg-s-gray select-none text-white font-normal rounded-sm h-screen w-screen overflow-hidden">
      {panels[type]}
    </div>
  )
}
