import { waistband as waistbandStraight } from '@freesewing/waistbandstraight'
import { waistband as waistbandCurved } from '@freesewing/waistbandcurved'
import { frontBase } from './frontBase.mjs'

export const waistband = {
  name: 'callum.waistband',
  options: {
    //Imported
    ...waistbandStraight.options,
    ...waistbandCurved.options,
    //Constants
    closurePosition: 'front', //Locked for Callum
    //Style
  },
  after: [frontBase],
  plugins: [...waistbandStraight.plugins, ...waistbandCurved.plugins],
  draft: (sh) => {
    const { macro, store, points, utils, options, measurements, complete, part } = sh
    store.set('waistbandMaxButtons', 1)

    if (options.waistbandStyle == 'straight') waistbandStraight.draft(sh)
    else waistbandCurved.draft(sh)

    if (complete) {
      let titleCutNum = 2
      if (options.waistbandFolded) titleCutNum = 1
      macro('title', {
        nr: 'X',
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        at: points.title,
        cutNr: titleCutNum,
        scale: 0.25,
      })
    }
    return part
  },
}
