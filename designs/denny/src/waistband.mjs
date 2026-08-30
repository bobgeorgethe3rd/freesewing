import { waistband as waistbandStraight } from '@freesewing/waistbandstraight'
import { frontBase } from './frontBase.mjs'
import { backBase } from './backBase.mjs'

export const waistband = {
  name: 'denny.waistband',
  options: {
    //Imported
    ...waistbandStraight.options,
    //Constants
    waistbandDoublePlacket: true, //Altered for Denny
  },
  after: [frontBase, backBase],
  hide: {
    after: true,
    inherited: true,
  },
  plugins: [...waistbandStraight.plugins],
  draft: (sh) => {
    const { macro, store, points, utils, options, measurements, complete, part } = sh

    waistbandStraight.draft(sh)

    if (complete) {
      macro('title', {
        nr: 12,
        title: 'Waistband ',
        at: points.title,
        cutNr: options.waistbandFolded ? 1 : 2,
        scale: 0.25,
      })
    }
    return part
  },
}
