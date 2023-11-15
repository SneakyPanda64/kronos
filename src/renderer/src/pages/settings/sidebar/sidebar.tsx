import { useLocation, useSearchParams, useNavigate } from 'react-router-dom'
import HistoryPage from '../pages/history'
export default function Sidebar() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const navItems = [
    {
      title: 'Settings',
      type: 'settings'
    },
    {
      title: 'Sync',
      type: 'sync'
    },
    {
      title: 'History',
      type: 'history'
    }
  ]
  const handleTypeChange = (newType: string) => {
    searchParams.set('verify', searchParams.get('verify') ?? '')
    searchParams.set('url', searchParams.get('url') ?? '')
    searchParams.set('type', newType)
    navigate(`?${searchParams}`)
  }
  const navComponent = (item: any) => {
    return (
      <div>
        <div
          onClick={() => handleTypeChange(item.type)}
          className={
            `bg-s-gray rounded-xl text-s-blue text-2xl p-4 hover:text-white hover:cursor-pointer select-none ` +
            (searchParams.get('type') === item.type
              ? 'border-l-s-blue border-l-4'
              : 'hover:border-l-s-blue hover:border-l-4 hover:border-opacity-40')
          }
        >
          <div className="flex no-underline">
            <h1>{item.title}</h1>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="">
      <div className="bg-s-dark-gray h-screen pt-12">
        {navItems.map((item, index) => {
          return (
            <div key={index} className="my-8 mx-4">
              {navComponent(item)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
