import { neckband as terryNeckband } from '@freesewing/terry'
import { front } from './front.mjs'

export const neckband = {
  name: 'riley.neckband',
  after: front,
  options: {
    ...terryNeckband.options,
  },
  plugins: [...terryNeckband.plugins, ...terryNeckband.plugins],
  measurements: [...terryNeckband.measurements],
  draft: (sh) => {
    //draft
    const { points, options, complete, macro, utils, part } = sh
    terryNeckband.draft(sh)

    if (complete) {
      //title
      if (options.neckbandStyle == 'hood') {
        macro('title', {
          nr: 4,
          title: 'Hood',
          at: points.title,
          cutNr: 4,
          scale: 0.5,
        })
      } else {
        let titleCutNum = 2
        if (options.neckbandFolded || options.neckbandStyle == 'curved') titleCutNum = 1
        macro('title', {
          nr: 4,
          title: 'Neckband (' + utils.capitalize(options.neckbandStyle) + ')',
          at: points.title,
          cutNr: titleCutNum,
          scale: 0.1,
        })
      }
    }

    return part
  },
}
