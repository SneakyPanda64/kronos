import { Routes, Route, HashRouter } from 'react-router-dom'
import './App.css'
import Navigator from './components/navigator/navigator.tsx'
import ErrorPage from './pages/error.tsx'
import SearchPage from './pages/search.tsx'
import Overlay from './pages/overlay/index.tsx'
import Settings from './pages/settings/index.tsx'
// import { ipcRenderer, ipcMain } from 'electron'; // Use `require` here
function Main() {
  return (
    <>
      <Navigator />
    </>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" Component={Main} />
        <Route path="/error" Component={ErrorPage} />
        <Route path="/search" Component={SearchPage} />
        <Route path="/overlay" Component={Overlay} />
        <Route path="/settings" Component={Settings} />
      </Routes>
    </HashRouter>
  )
}
