import { waistband as waistbandStraight } from '@freesewing/waistbandstraight'
import { waistband as waistbandCurved } from '@freesewing/waistbandcurved'
import { frontBase } from './frontBase.mjs'
import { flyShield } from './flyShield.mjs'

export const waistband = {
  name: 'jackson.waistband',
  options: {
    //Imported
    ...waistbandStraight.options,
    ...waistbandCurved.options,
    //Constants
    closurePosition: 'front', //locked for Jackson
  },
  after: [frontBase, flyShield],
  draft: (sh) => {
    const { macro, points, utils, options, measurements, complete, part } = sh

    if (options.waistbandStyle == 'straight') waistbandStraight.draft(sh)
    else waistbandCurved.draft(sh)

    if (complete) {
      macro('title', {
        nr: 12,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        at: points.title,
        scale: 1 / 3,
      })
    }
    return part
  },
}
