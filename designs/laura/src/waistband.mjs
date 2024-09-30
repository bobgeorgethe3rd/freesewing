import { waistband as waistbandStraight } from '@freesewing/waistbandstraight'
import { waistband as waistbandCurved } from '@freesewing/waistbandcurved'
import { leg8 } from './leg8.mjs'

export const waistband = {
  name: 'laura.waistband',
  options: {
    //Imported
    ...waistbandStraight.options,
    ...waistbandCurved.options,
    //Constants
    useVoidStores: false, //Altered for Laura
    waistbandOverlapSide: 'left', //Locked for Laura
    waistbandOverlap: 0, //Locked for Laura
    closurePosition: 'back', //Locked for Laura
    //Style
    waistbandFolded: { bool: true, menu: 'style' }, //Altered for Laura
  },
  after: [leg8],
  plugins: [...waistbandStraight.plugins, ...waistbandCurved.plugins],
  draft: (sh) => {
    const { macro, points, utils, options, measurements, complete, part } = sh

    if (options.waistbandStyle == 'none') {
      part.hide()
      return part
    } else {
      if (options.waistbandStyle == 'straight') waistbandStraight.draft(sh)
      else waistbandCurved.draft(sh)
    }

    if (complete) {
      let titleCutNum = 2
      if (options.waistbandFolded || options.waistbandStyle == 'curved') titleCutNum = 1
      macro('title', {
        nr: 2,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        at: points.title,
        cutNr: titleCutNum,
        scale: 0.25,
      })
    }
    return part
  },
}
