import { BrowserView, BrowserWindow } from 'electron';
import { resolveHtmlPath } from './util';
import path from 'path';
import { getFavicon } from './util';

export async function createTab(win: BrowserWindow, url: string) {
  const view = new BrowserView();
  win.addBrowserView(view);
  view.setBounds({ x: 0, y: 100, width: 800, height: 700 });
  view.setAutoResize({ width: true, height: true });

  const header = findViewById(win, 2);
  if (header != null) {
    view.webContents.on('page-title-updated', () => {
      const tabs = getTabs(win);
      header.webContents.send('tabs-updated', tabs);
    });
    let last_accessed: any = undefined;
    view.webContents.on('page-favicon-updated', async (event, favicons) => {
      const tabs = getTabs(win);
      let newTabs = tabs;
      newTabs.forEach((tab) => {
        if (tab.id === view.webContents.id) {
          tab.favicon = favicons.length != 0 ? favicons[0] : '';
        }
      });
      header.webContents.send('tabs-updated', newTabs);
    });

    // const tabs = getTabs(win);
    // header.webContents.send('tabs-updated', tabs);
  }
  await view.webContents.loadURL(url);

  return view.webContents.id;
}

export function getTabs(win: BrowserWindow, favicon = '') {
  let tabs: {
    id: number;
    title: string;
    url: string;
    favicon: string | undefined;
  }[] = [];
  win.getBrowserViews().forEach((elem) => {
    if (elem.webContents.id === 2) return;
    let tab = {
      id: elem.webContents.id,
      title: elem.webContents.getTitle() ?? 'no title',
      url: elem.webContents.getURL(),
      favicon: '',
    };
    if (favicon !== undefined) tab.favicon = favicon;
    tabs.push(tab);
  });
  return tabs;
}

export async function hideTab(win: BrowserWindow, tabId: number) {
  let view = findViewById(win, tabId);
  if (view == null) return;
  console.log('hidding tab', view.webContents.id, tabId);
  view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
  console.log('hidding tab', view.webContents.id, tabId);
}

export async function showTab(win: BrowserWindow, tabId: number) {
  let view = findViewById(win, tabId);
  if (view == null) return;
  let wb = win.getBounds();
  view.setBounds({ x: 0, y: 100, width: wb.width, height: wb.height - 100 });
}

export function isTabHidden(win: BrowserWindow, tabId: number) {
  let view = findViewById(win, tabId);
  if (view == null) return;
  const bounds = view.getBounds();
  if (bounds.width + bounds.height === 0) {
    return true;
  }
  return false;
}

export async function createHeader(win: BrowserWindow) {
  const view = new BrowserView({
    webPreferences: {
      devTools: true,
      preload: path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });
  win.addBrowserView(view);
  view.setBounds({ x: 0, y: 0, width: 800, height: 100 });
  view.setAutoResize({ width: true });
  view.webContents.closeDevTools();
  view.webContents.openDevTools({ mode: 'detach' });
  await view.webContents.loadURL(resolveHtmlPath('index.html'));
}

function findViewById(win: BrowserWindow, id: number): BrowserView | null {
  let found: BrowserView | boolean = false;
  win.getBrowserViews().forEach((elem) => {
    if (elem.webContents.id == id) {
      console.log('compare: ', elem.webContents.id, id);
      found = elem;
    }
  });
  if (found == false) {
    console.log(id, 'not found');
    return null;
  }
  console.log(id, 'found');
  return found;
}
