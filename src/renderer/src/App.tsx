import { MemoryRouter as Router, Routes, Route } from 'react-router-dom'
import icon from '../../assets/icon.svg'
import './App.css'
import { useEffect, useState } from 'react'
import { Tab, Favicon } from './interfaces.ts'
import Navigator from './components/navigator/navigator.tsx'
import TabBar from './components/navigator/navigator/tab/tab.tsx'
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
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </Router>
  )
}
