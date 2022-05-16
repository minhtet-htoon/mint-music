import { IAudioMetadata, parseFile } from 'music-metadata'
import * as fs from 'fs'

interface ISong{
    path: string,
    data: IAudioMetadata
    URL: string,
    lyrics?:string
}

async function makeSong (path:string):Promise<ISong> {
  const data = await parseFile(path)
  return {
    path,
    data,
    URL: data.common.picture !== undefined ? `data:${data.common.picture[0].format};base64,${data.common.picture[0].data.toString('base64')}` : 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Juvenile_Ragdoll.jpg/1920px-Juvenile_Ragdoll.jpg',
    lyrics: getLRC(path)
  }
}

function getLRC (filePath:string):string|undefined {
  if (fs.existsSync(filePath.replace(/mp3|flac|wav/, 'lrc'))){
    return fs.readFileSync(filePath.replace(/mp3|flac|wav/, 'lrc'), 'utf-8')
  }
  console.log(`No LRC file for ${filePath}`)
  return undefined
}

async function makeQueue (paths:string[]) {
  const temp: ISong[] = []
  for (let i = 0; i < paths.length; i++) {
    await makeSong(paths[i]).then((res) => temp.push(res))
  }
  return temp
}

export async function parseListS (data:string):Promise<string[]> {
  const arr = data.split('\n')
  const ret:string[] = []
  arr.forEach((line) => {
    if (line.split('')[0] !== '#') {
      ret.push(line)
    }
  })
  return ret
}

export { makeSong, makeQueue }
export type { ISong }
