# Mint Music

A custom Electron based music player with support for YT streaming, and downloading from Deezer.
## Setup
To get started, clone or download this repository. Once downloaded, use `yarn` to install dependencies as shown.
```shell
corepack enable #if you don't have yarn already
yarn
```
Once dependencies are in place, start the app as so
```shell
yarn start
```
Open your favorite editor
```shell
code .
```
have fun

Unfortunately, the application can not have live reload as it messes with it whenever a file is loaded via electron.

## Plans/TODO
### Happening
1. Functional player ✔
2. Queue shuffling ✔ Unshuffling... kinda
3. YT & Deezer
4. Playlist files
5. Library ✔
6. Indexing and sorting ✔
7. Lyrics via LRC file ✔

### Not Happening
1. DRM support (Fundamentally disagree with idea)
2. Spotify (API is much more stupid than the other 2)

### Maybe

1. FFMPEG transcoding (not sure how useful it would be)
2. Change to Tauri (Probably will once I learn Rust)
3. Tag editor and auto-tagging (not sure how useful it will be)
4. P2P streaming with E2EE
5. Sharing files among devices
6. Skins as Tailwind config or plain CSS

## Known Problems/Pre-emptive Q&A
**Q. Where to download?**

A. Options are listed below. Choose which ever suits you
1. Linux: ~~AUR, Flathub~~ (coming on main release), or Releases tab for deb, rpm, AppImage, and snap
2. Windows: Releases tab of this repo
3. Mac: Build and run from source `¯\_(ツ)_/¯`

**Q. The CSS sucks/the app is ugly**

A. Tell me something I didn't know. I do plan on working on it but this is still very early so not gonna be pretty

**Q. Plugins and skins**

A. It's an open-source project. Code your own plugin loader and SDK if you want. Skins are literally just a CSS file or

a TailwindCSS config

**Q. Deezer doesn't work**

A. The deemix library is used and it isn't perfect

**Q. ETA?**

A. Soon™ 

**Q. Mac edition... ever?**

A. No. I don't have a Mac to debug or build on and CI doesn't grow on trees. Also, I'd need a $100 certificate from 

Apple which I can't afford. This doesn't mean the app won't work on Mac, simply follow the above instructions. 

It just means there is no official support

**Q. Mobile?**

A. Maybe and if I did, it would be an APK for sideloading and not released to app stores. 

I don't want to pay fees, and I fundamentally disagree with how Apple and Google do business 
