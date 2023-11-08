import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { Tab, Favicon } from './interfaces';
import TabBar from './tab';
// import { ipcRenderer, ipcMain } from 'electron'; // Use `require` here
function Navigator() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [tabs, setTabs] = useState<Array<Tab>>([]);
  const getURL = () => {
    const newTabs = tabs.filter((tab) => tab.id === selectedTab);
    if (newTabs.length == 0) {
      return '';
    }
    if (newTabs[0] === undefined) {
      return '';
    }
    return newTabs[0].url;
  };
  return (
    <div className="grid grid-rows-2">
      <TabBar
        tabs={tabs}
        setTabs={setTabs}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
      <div>
        <h1>{getURL()}</h1>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigator />} />
      </Routes>
    </Router>
  );
}
