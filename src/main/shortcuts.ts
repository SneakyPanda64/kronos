import { BrowserWindow, globalShortcut } from 'electron'
import { createTab, getSelectedTab, openInspect, selectTab } from './tab'
import { getViewById } from './util'
import { createWindow } from './window'

function getWindow() {
  const win = BrowserWindow.getFocusedWindow()
  if (win == null) return
  return win
}

async function getView() {
  const win = getWindow()
  if (win == null) return
  const tab = await getSelectedTab(win)
  if (tab == null) return
  const view = getViewById(tab.id)
  if (view == null) return
  return view
}

export async function registerShortcuts() {
  globalShortcut.register('CommandOrControl+I', async () => {
    const view = await getView()
    if (view == null) return
    console.log('opening dev tools')
    openInspect(view)
  })
  globalShortcut.register('CommandOrControl+T', async () => {
    const view = await getView()
    if (view == null) return
    const win = getWindow()
    if (win == null) return
    const tabId = await createTab(win.id)
    await selectTab(tabId!)
  })
  globalShortcut.register('CommandOrControl+N', async () => {
    const view = await getView()
    if (view == null) return
    const win = getWindow()
    if (win == null) return
    await createWindow([], { x: 100, y: 100 })
  })
  globalShortcut.register('CommandOrControl+Shift+A', async () => {
    const view = await getView()
    if (view == null) return
    const win = getWindow()
    if (win == null) return
    await createWindow([], { x: 100, y: 100 }, false, true)
  })
}
