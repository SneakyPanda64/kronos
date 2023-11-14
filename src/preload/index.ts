const { contextBridge } = require('electron')
import { tabs } from './tabs'
import { header } from './header'
import { navigation } from './navigation'
import { window } from './window'
import { overlay } from './overlay'
import { settings } from './settings'
import { history } from './history'
import { downloads } from './downloads'
console.log('loaded preload')

let indexBridge = {
  tabs,
  header,
  navigation,
  window,
  overlay,
  settings,
  history,
  downloads
}

contextBridge.exposeInMainWorld('indexBridge', indexBridge)
