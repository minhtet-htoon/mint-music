import { BrowserWindow, app, ipcMain, dialog, session } from 'electron'
import { makeQueue } from './utils/metaManager'
import * as path from 'path'
import { add, ILib, libInit, readDir } from './utils/libraryManager'
import { readFileSync } from 'fs'
import { sort } from './utils/sorter'
import { ElectronBlocker } from '@cliqz/adblocker-electron'
import fetch from 'cross-fetch'
const client = require('discord-rich-presence')('823667639548903454')

let mainWindow: BrowserWindow
let dir: string = '~/music'
let lib: ILib

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      devTools: true,
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
}
app.on('ready', async () => {
  ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
    blocker.enableBlockingInSession(session.defaultSession)
  })
  createWindow()
  console.log(__dirname)
  await mainWindow.loadFile('public/index.html')
  mainWindow.webContents.openDevTools()
  client.updatePresence({
    state: 'Idle'
  })
})

// @ts-ignore
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(
    {
      filters:
                [
                  { name: 'audio', extensions: ['mp3', 'flac'] },
                  { name: 'library', extensions: ['json'] },
                  { name: 'playlist', extensions: ['m3u', 'm3u8'] }
                ],
      properties: ['openFile', 'multiSelections']
    })
  if (!canceled) {
    if (lib) {
      filePaths.forEach((path) => {
        add(path, lib, 'song', 'song')
      })
    }
    return await makeQueue(filePaths)
  }
})
ipcMain.handle('dialog:openFolder', async () => {
  const folder = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })
  dir = folder.filePaths[0]
  const ret = makeQueue(await readDir(folder.filePaths[0]))
  lib = JSON.parse(readFileSync(path.join(dir, 'library.json'), 'utf8'))
  return ret
})
ipcMain.handle('get:lib', () => {
  return JSON.parse(readFileSync(path.join(dir, 'library.json'), 'utf8'))
})
ipcMain.handle('action:reload', async () => {
  await libInit(lib.settings.dir)
  const ret = makeQueue(await readDir(lib.settings.dir))
  lib = JSON.parse(readFileSync(path.join(dir, 'library.json'), 'utf8'))
  return ret
})
ipcMain.handle('action:sort', () => {
  sort(lib)
})
ipcMain.handle('update:RPC', (_event, args) => {
  client.updatePresence({
    state: args.title,
    details: args.details,
    largeImageKey: args.lgKey,
    smallImageKey: args.smKey,
    startTimestamp: Date.now(),
    endTimestamp: Date.now() + (args.dur * 1000)
  })
  console.log({
    state: args.title,
    details: args.details,
    largeImageKey: args.lgKey,
    smallImageKey: args.smKey,
    startTimestamp: Date.now(),
    endTimestamp: Date.now() + args.dur
  })
})
ipcMain.handle('open:Mp3DL', () => {
  const window = new BrowserWindow(
    {
      width: 900,
      height: 680,
      webPreferences: {
        devTools: true
      }
    }
  )
  window.loadURL('https://free-mp3-download.net/')
})
ipcMain.handle('open:deemix', () => {
  const window = new BrowserWindow(
    {
      width: 900,
      height: 680,
      webPreferences: {
        devTools: true
      }
    }
  )
  window.loadURL('https://deemix.app/')
})
