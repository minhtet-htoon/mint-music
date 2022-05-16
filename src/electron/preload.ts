import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  getLib: () => ipcRenderer.invoke('get:lib'),
  sort: () => ipcRenderer.invoke('action:sort'),
  reload: () => ipcRenderer.invoke('action:reload'),
  updateRPC: (title:string, details:string, lgKey:string, smKey:string, dur:number) => ipcRenderer.invoke('update:RPC', {
    title,
    details,
    lgKey,
    smKey,
    dur
  }),
  openMp3DL: () => ipcRenderer.invoke('open:Mp3DL'),
  openDeemix: () => ipcRenderer.invoke('open:deemix')
})
export {}
