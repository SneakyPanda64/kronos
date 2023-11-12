const { contextBridge } = require('electron')
import { tabs } from './tabs'
import { header } from './header'
import { navigation } from './navigation'
import { window } from './window'
import { overlay } from './overlay'
console.log('loaded preload')

let indexBridge = {
  tabs,
  header,
  navigation,
  window,
  overlay
}

contextBridge.exposeInMainWorld('indexBridge', indexBridge)
