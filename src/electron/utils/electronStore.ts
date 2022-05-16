import Store from 'electron-store'

const store = new Store()

interface ISettings {
  default:string,
  onlineFeatures: boolean,
  showLyrics: boolean
  downloadEnabled: boolean,
  settingsMade: boolean,
  fadeLength: number,
  lang: 'en_us' | 'en_uk'
}

export { store }
export type { ISettings }
