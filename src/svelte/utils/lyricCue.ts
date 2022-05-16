export interface Lyric {
  lines:{
    timestamp:number
    time: string
    content: string
  }[]
}

let last: string = ''
let lastIndex:number = 0

// @ts-ignore
// function lrcParse() {
//   TODO: LRC Parser
// }

/**
 * Get a number of lines before the current
 * @param {number} lines
 * @param {Lyric} lrc
 * @returns string[]
 */
export function getLinesBefore (lines:number, lrc:Lyric):string[] {
  const ret:string[] = []
  for (let i = 1; i <= lines; i++) {
    ret.push(lastIndex - i < 0 ? '' : lrc.lines[lastIndex - i].content)
  }
  return ret.reverse()
}

/**
 * @param {number} lines
 * @param {Lyric} lrc
 * @returns string[]
 */
export function getLinesAfter (lines: number, lrc:Lyric) {
  const ret:string[] = []
  for (let i = 1; i <= lines; i++) {
    ret.push(lastIndex + i >= lrc.lines.length ? '' : lrc.lines[lastIndex + i].content)
  }
  return ret
}

/**
 * Cue
 * @param {number} time
 * @param {Lyric} lrc
 * @returns {before: string[], current: string, after:string[]}
 */
export function cue (time:number, lrc: Lyric):string {
  for (const value of lrc.lines) {
    if (Math.floor(value.timestamp / 1000) === time) {
      // lastIndex = index
      last = value.content
    }
  }
  return last
}
