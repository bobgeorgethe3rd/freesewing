import { neckband as neckbandStraight } from '@freesewing/neckbandstraight'
import { neckband as neckbandCurved } from '@freesewing/neckbandcurved'
import { hood } from '@freesewing/hood'
import { front } from './front.mjs'

export const neckband = {
  name: 'terry.neckband',
  options: {
    //Imported
    ...neckbandStraight.options,
    ...neckbandCurved.options,
    ...hood.options,
    //Constants
    useVoidStores: false, //Altered for Laura
    neckbandOverlapSide: 'left', //Locked for Laura
    neckbandOverlap: 0, //Locked for Laura
    //Style
    neckbandStyle: { dflt: 'straight', list: ['straight', 'curved', 'hood'], menu: 'style' },
  },
  after: [front],
  plugins: [...neckbandStraight.plugins, ...neckbandCurved.plugins],
  draft: (sh) => {
    const { macro, points, utils, options, measurements, complete, part } = sh

    if (options.neckbandStyle == 'hood') {
      hood.draft(sh)
    } else {
      if (options.neckbandStyle == 'straight') neckbandStraight.draft(sh)
      else neckbandCurved.draft(sh)
    }

    if (complete) {
      if (options.neckbandStyle == 'hood') {
        macro('title', {
          nr: 3,
          title: 'Hood',
          at: points.title,
          scale: 0.5,
        })
      } else {
        macro('title', {
          nr: 3,
          title: 'Neckband (' + utils.capitalize(options.neckbandStyle) + ')',
          at: points.title,
          scale: 0.1,
        })
      }
    }
    return part
  },
}
