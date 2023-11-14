import { BrowserWindow, globalShortcut } from 'electron'
import { getSelectedTab, openInspect } from './tab'
import { getViewById } from './util'

function getWindow() {
  let win = BrowserWindow.getFocusedWindow()
  if (win == null) return
  return win
}

async function getView() {
  let win = getWindow()
  if (win == null) return
  let tab = await getSelectedTab(win)
  if (tab == null) return
  let view = getViewById(tab.id)
  if (view == null) return
  return view
}

export async function registerShortcuts() {
  globalShortcut.register('CommandOrControl+Shift+I', async () => {
    let view = await getView()
    if (view == null) return
    console.log('opening dev tools')
    openInspect(view)
  })
}
