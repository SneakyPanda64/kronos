const { ipcRenderer, contextBridge } = require('electron');

console.log('loaded preload');

let indexBridge = {
  watchTabs: (callback: any) => ipcRenderer.on('tabs-updated', callback),
  requestTabs: (callback: any) => {
    ipcRenderer.once('tabs-reply', (event, tabs) => {
      callback(tabs);
    });
    ipcRenderer.send('request-tabs');
  },
  selectTab: (tabId: number) => {
    ipcRenderer.send('select-tab', tabId);
  },
  newTab: (callback: any) => {
    ipcRenderer.once('new-tab-reply', (event, tabId) => {
      callback(tabId);
    });
    ipcRenderer.send('new-tab');
  },
};

contextBridge.exposeInMainWorld('indexBridge', indexBridge);

// window.addEventListener('DOMContentLoaded', () => {
//   console.log('LOADED');
// });

// console.log('PRELOADED');

// const WINDOW_API = {
//   greet: (message: any) => ipcRenderer.send('greet', message),
// };

// contextBridge.exposeInMainWorld('api', WINDOW_API);

// // // Disable no-unused-vars, broken for spread args
// // /* eslint no-unused-vars: off */
// // import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// // contextBridge.exposeInMainWorld('api', {
// //   tabs: (channel: string, func: any) => {
// //     let validChannels = ['tabs-updated'];
// //     if (validChannels.includes(channel)) {
// //       // Deliberately strip event as it includes `sender`
// //       ipcRenderer.on(channel, (event, ...args) => func(...args));
// //     }
// //   },
// // });

// // // export type Channels = 'ipc-example';

// // // const electronHandler = {
// // //   ipcRenderer: {
// // //     sendMessage(channel: Channels, ...args: unknown[]) {
// // //       ipcRenderer.send(channel, ...args);
// // //     },
// // //     on(channel: Channels, func: (...args: unknown[]) => void) {
// // //       const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
// // //         func(...args);
// // //       ipcRenderer.on(channel, subscription);

// // //       return () => {
// // //         ipcRenderer.removeListener(channel, subscription);
// // //       };
// // //     },
// // //     once(channel: Channels, func: (...args: unknown[]) => void) {
// // //       ipcRenderer.once(channel, (_event, ...args) => func(...args));
// // //     },
// // //   },
// // // };

// // // contextBridge.exposeInMainWorld('electron', electronHandler);

// // // export type ElectronHandler = typeof electronHandler;
