export interface Lyric {
  lines:{
    timestamp:number
    time: string
    content: string
  }[]
}

let last: string = ''
/**
 * Creates a lyric object given a LRC
 * @param {string} LRC
 * @returns {Lyric}
 */

// @ts-ignore
// function lrcParse() {
//   TODO: LRC Parser
// }

/**
 * Cue
 * @param {number} time
 * @param {Lyric} lrc
 * @returns {before: string[], current: string, after:string[]}
 */
export function cue (time:number, lrc: Lyric):string {
  for (const value of lrc.lines) {
    if (Math.floor(value.timestamp / 1000) === time) {
      last = value.content
    }
  }
  return last
}
