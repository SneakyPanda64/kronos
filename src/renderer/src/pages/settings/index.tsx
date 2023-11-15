import { useSearchParams } from 'react-router-dom'
import DownloadsPage from './pages/downloads'
import HistoryPage from './pages/history'
import SyncPage from './pages/sync/sync'
import Sidebar from './sidebar/sidebar'
import SettingsPage from './pages/settings'
import Helmet from 'react-helmet'

export default function Settings() {
  const pages = {
    settings: <SettingsPage />,
    sync: <SyncPage />,
    history: <HistoryPage />,
    downloads: <DownloadsPage />
  }
  const [searchParams] = useSearchParams()

  return (
    <div className="grid grid-cols-5 lg:grid-cols-5 overflow-hidden">
      <Helmet>
        <title>Settings</title>
      </Helmet>
      <div className="h-screen hidden sm:block">
        <Sidebar />
      </div>
      <div className="col-span-4 h-screen text-white overflow-x-hidden overflow-y-auto pr-12">
        {pages[searchParams.get('type') ?? 'settings']}
      </div>
    </div>
  )
}
