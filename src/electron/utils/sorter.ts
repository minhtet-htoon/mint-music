import * as fs from 'fs'
import { ILib } from './libraryManager'
import path from 'path'

export function sort (lib: ILib) {
  lib.artists.forEach((artist) => {
    if (!fs.existsSync(path.join(lib.settings.dir, artist.name))) {
      fs.mkdirSync(path.join(lib.settings.dir, validFile(artist.name)))
    }
    artist.albums.forEach((album) => {
      if (!fs.existsSync(path.join(lib.settings.dir, artist.name, album.name))) {
        fs.mkdirSync(path.join(lib.settings.dir, validFile(artist.name), validFile(album.name)))
      }
      album.songs.forEach((song) => {
        const ext = getExt(song.path)
        fs.renameSync(song.path, path.join(lib.settings.dir, validFile(artist.name), validFile(album.name), <string>song.name + '.' + ext))
      })
    })
  })
}

export function getExt (file: string) {
  return file.substring(file.lastIndexOf('.') + 1, file.length) || file
}

export function validFile (path: string):string {
  if (path.indexOf('/') !== -1) {
    console.warn(`${path} is not a valid file path or name`)
  }
  return path.replaceAll('/', ' ')
}
