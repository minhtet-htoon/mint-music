// @ts-ignore
import albumArt from 'album-art'

function shuffle (array: any[]):any[] {
  const ret = array
  let currentIndex = ret.length; let randomIndex

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--;

    // And swap it with the current element.
    [ret[currentIndex], ret[randomIndex]] = [
      ret[randomIndex], ret[currentIndex]]
  }

  return ret
}

function time (s:number):string {
  // Hours, minutes and seconds
  const hrs = ~~(s / 3600)
  const mins = ~~((s % 3600) / 60)
  const secs = ~~s % 60

  // Output like "1:01" or "4:03:59" or "123:03:59"
  let ret = ''

  if (hrs > 0) {
    ret += '' + hrs + ':' + (mins < 10 ? '0' : '')
  }

  ret += '' + mins + ':' + (secs < 10 ? '0' : '')
  ret += '' + secs
  return ret
}

function getArt (name:string):string {
  let ret:string
  albumArt(name).then((val: string) => { ret = val })
  // @ts-ignore
  return ret
}

export { shuffle, time, getArt }
