import { waistband as waistbandStraight } from '@freesewing/waistbandstraight'
import { waistband as waistbandCurved } from '@freesewing/waistbandcurved'
import { frontBase } from './frontBase.mjs'
import { yokeBack } from './yokeBack.mjs'
// import { flyShield } from './flyShield.mjs'

export const waistband = {
  name: 'jackson.waistband',
  options: {
    //Imported
    ...waistbandStraight.options,
    ...waistbandCurved.options,
    //Constants
    closurePosition: 'front', //locked for Jackson
  },
  after: [yokeBack, frontBase /*,  flyShield */],
  plugins: [...waistbandStraight.plugins, ...waistbandCurved.plugins],
  draft: (sh) => {
    const { macro, store, points, utils, options, measurements, complete, part } = sh
    store.set('waistbandMaxButtons', 1)

    if (options.waistbandStyle == 'straight') waistbandStraight.draft(sh)
    else waistbandCurved.draft(sh)

    if (complete) {
      let titleCutNum = 2
      if (options.waistbandFolded || options.waistbandStyle == 'curved') titleCutNum = 1
      macro('title', {
        nr: 12,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        at: points.title,
        cutNr: titleCutNum,
        scale: 1 / 3,
      })
    }
    return part
  },
}
