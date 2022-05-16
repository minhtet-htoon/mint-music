import glob from 'glob'
import { makeSong, parseListS } from './metaManager'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import path from 'path'
import * as semver from 'semver'

const ver: string = '3.0.0'

export interface ILib {
  settings: {
    dir: string
    ver: string
    fadeLen: number
  }
  artists: {
    name: string,
    albums:{
      name: string,
      songs: {
        path: string,
        name?: string
      }[]
    }[],
  }[],
  playlists: {
    name: string
    paths: string[]
  }[]
}

export async function add (path: string, lib:ILib, type:'song'|'playlist', name?:string) {
  switch (type) {
    case 'song':
    {
      await addSong(path, lib)
      break
    }
    case 'playlist': {
      if (!lib.playlists.some(l => l.name === name) && name) {
        lib.playlists.push({
          paths: await parseListS(readFileSync(path, 'utf8')),
          name
        })
      }
    }
  }
  writeFileSync(lib.settings.dir + '/library.json', JSON.stringify(lib, null, 2))
  console.log('File Written')
}

async function addSong (path: string, lib: ILib) {
  const song = await makeSong(path)
  if (song.data.common.albumartist && song.data.common.album) {
    // Check for artist. Add artist if not already in array
    if (lib.artists.filter(artist => artist.name === song.data.common.albumartist).length <= 0) {
      lib.artists.push({
        name: song.data.common.albumartist,
        albums: [
          {
            name: song.data.common.album,
            songs: [{ path: song.path, name: song.data.common.title }]
          }
        ]
      })
      lib.artists.sort(comp2)
    } else {
      // Check for album, add album if not already in array
      if (lib.artists[lib.artists.findIndex(artist => artist.name === song.data.common.albumartist)].albums.filter(album => album.name === song.data.common.album).length <= 0) {
        lib.artists[lib.artists.findIndex(artist => artist.name === song.data.common.albumartist)].albums.push({
          name: song.data.common.album,
          songs: [{ path: song.path, name: song.data.common.title }]
        })
        lib.artists[lib.artists.findIndex(artist => artist.name === song.data.common.albumartist)].albums.sort(comp2)
        // Artist and album already exist
      } else {
        lib.artists[lib.artists.findIndex(artist => artist.name === song.data.common.albumartist)].albums[lib.artists[lib.artists.findIndex(artist => artist.name === song.data.common.albumartist)].albums.findIndex(album => album.name === song.data.common.album)].songs.push({ path: song.path, name: song.data.common.title })
        lib.artists[lib.artists.findIndex(artist => artist.name === song.data.common.albumartist)].albums[lib.artists[lib.artists.findIndex(artist => artist.name === song.data.common.albumartist)].albums.findIndex(album => album.name === song.data.common.album)].songs.sort(comp2)
      }
    }
  }
}

async function readDir (dir: string) {
  if (!existsSync(dir + '/library.json') || !semver.satisfies(JSON.parse(readFileSync(path.join(dir, 'library.json'), 'utf8')).settings.ver, '3.x')) {
    console.warn('Library not present. Generating library...')
    await libInit(dir)
  }
  if (!semver.satisfies(JSON.parse(readFileSync(path.join(dir, 'library.json'), 'utf8')).settings.ver, '3.x')){
    console.warn('Library format outdated. Regenerating Library...')
    await libInit(dir)
  }
  let ret: string[] = []
  const lib: ILib = JSON.parse(readFileSync(dir + '/library.json', 'utf8'))
  lib.artists.forEach((artist) => {
    artist.albums.forEach((album) => {
      album.songs.forEach((song) => {
        ret = [...ret, song.path]
      })
    })
  })
  return ret
}
async function libInit (dir: string) {
  const lib: ILib = {
    settings: {
      dir,
      ver,
      fadeLen: 500
    },
    artists: [],
    playlists: []
  }
  const files = glob.sync(dir + '/**/*')
  console.log(files)
  for (const val of files) {
    if (val.endsWith('.mp3') || val.endsWith('.flac')){
      await addSong(val, lib)
    }
  }
  writeFileSync(dir + '/library.json', JSON.stringify(lib, null, 2))
  console.log('File Written')
}

function comp2 (a:{name?:string}, b:{name?:string}):number {
  if (a.name?.toLowerCase() && b.name?.toLowerCase()) {
    if (a.name?.toLowerCase() < b.name?.toLowerCase()) {
      return -1
    }
    if (a.name?.toLowerCase() > b.name?.toLowerCase()) {
      return 1
    }
    return 0
  } else {
    return 0
  }
}

export { readDir, libInit }
