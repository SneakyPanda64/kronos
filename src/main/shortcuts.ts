import { BrowserWindow, globalShortcut } from 'electron'
import { createTab, getSelectedTab, openInspect } from './tab'
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
  globalShortcut.register('CommandOrControl+I', async () => {
    let view = await getView()
    if (view == null) return
    console.log('opening dev tools')
    openInspect(view)
  })
  globalShortcut.register('CommandOrControl+T', async () => {
    let view = await getView()
    if (view == null) return
    let win = getWindow()
    if (win == null) return
    await createTab(win.id)
  })
}
