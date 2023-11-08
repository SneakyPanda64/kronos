import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { Tab, Favicon } from './interfaces';
// import { ipcRenderer, ipcMain } from 'electron'; // Use `require` here
function Navigator() {
  const [favicons, setFavicons] = useState<any>({});
  const [selectedTab, setSelectedTab] = useState(0);
  const handleTab = (id: number) => {
    window.indexBridge?.selectTab(id);
    setSelectedTab(id);
  };
  const handleNewTab = async () => {
    window.indexBridge?.newTab((tabId: number) => {
      console.log('new tab: ', tabId);
      setSelectedTab(tabId);
    });
  };
  const tabButton = (tab: Tab, key: number) => {
    return (
      <div className="p-6 px-2" key={key}>
        <button
          className={
            `p-2 ` + (tab.id === selectedTab ? 'bg-red-500' : 'bg-red-300')
          }
          onClick={() => handleTab(tab.id)}
        >
          <h1>{tab.title.split('').slice(0, 15).join('')}</h1>
          <h2>{favicons[`${tab.id}`]}</h2>
        </button>
      </div>
    );
  };

  const [tabs, setTabs] = useState<Array<Tab>>([]);
  const handleUpdateTabs = (tabs: Tab[]) => {
    let newFavicons = favicons;
    tabs.forEach((tab) => {
      if (tab.favicon != '') {
        newFavicons[`${tab.id}`] = tab.favicon;
      }
    });
    setFavicons(newFavicons);
    setTabs(tabs);
  };
  useEffect(() => {
    indexBridge.requestTabs((tabs: any) => {
      console.log(tabs);
      handleUpdateTabs(tabs);
      handleTab(tabs[0].id);
    });
    window.indexBridge?.watchTabs((event: any, tabs: any) => {
      console.log('tabs', tabs);
      handleUpdateTabs(tabs);
    });
  }, []);
  return (
    <div className="grid grid-rows-2">
      <div className="flex">
        {tabs.map((item: Tab, index: number) => tabButton(item, index))}
        <div className="p-6">
          <button className="px-6 py-2 bg-blue-500" onClick={handleNewTab}>
            New Tab
          </button>
        </div>
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
