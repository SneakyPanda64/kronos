import { useEffect, useState } from 'react';
import { Tab } from './interfaces';
import TabButton from './tab_button';

export default function TabBar(props: {
  tabs: Tab[];
  setTabs: any;
  selectedTab: number;
  setSelectedTab: any;
}) {
  const [favicons, setFavicons] = useState<any>({});

  const handleTab = (id: number) => {
    window.indexBridge?.selectTab(id);
    props.setSelectedTab(id);
  };
  const handleDeleteTab = async (tabId: number) => {
    window.indexBridge?.deleteTab(() => {}, tabId);
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
  const handleNewTab = async () => {
    window.indexBridge?.newTab((tabId: number) => {
      console.log('new tab: ', tabId);
      props.setSelectedTab(tabId);
    });
  };

  const handleUpdateTabs = (tabs: Tab[]) => {
    let newFavicons = favicons;
    tabs.forEach((tab) => {
      if (tab.favicon != '') {
        newFavicons[`${tab.id}`] = tab.favicon;
      }
    });
    setFavicons(newFavicons);
    props.setTabs(tabs);
  };
  return (
    <div className="flex">
      {props.tabs.map((item: Tab, index: number) =>
        TabButton({
          tab: item,
          favicons: favicons,
          key: index,
          selectedTab: props.selectedTab,
          setSelectedTab: props.setSelectedTab,
          handleTab: handleTab,
          handleDeleteTab: handleDeleteTab,
        }),
      )}
      <div className="p-6">
        <button className="px-6 py-2 bg-blue-500" onClick={handleNewTab}>
          New Tab
        </button>
      </div>
    </div>
  );
}
