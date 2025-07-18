import { waistband as waistbandStraight } from '@freesewing/waistbandstraight'
import { waistband as waistbandCurved } from '@freesewing/waistbandcurved'
import { back } from './back.mjs'
import { placket } from './placket.mjs'

export const waistband = {
  name: 'penny.waistband',
  options: {
    //Imported
    ...waistbandStraight.options,
    ...waistbandCurved.options,
    //Style
    waistbandFolded: { bool: true, menu: 'style' }, //Altered for Penny
    waistbandOverlapSide: { dflt: 'right', list: ['left', 'right'], menu: 'style' }, //Altered for Penny
  },
  after: [back, placket],
  plugins: [...waistbandStraight.plugins, ...waistbandCurved.plugins],
  draft: (sh) => {
    const { macro, points, utils, options, measurements, complete, part } = sh

    if (options.waistbandStyle == 'none') {
      part.hide()
      return part
    } else {
      if (options.waistbandStyle == 'straight' || !measurements.waistToHips || !measurements.hips)
        waistbandStraight.draft(sh)
      else waistbandCurved.draft(sh)
    }

    if (complete) {
      let titleCutNum = 2
      if (options.waistbandFolded || options.waistbandStyle == 'curved') titleCutNum = 1
      macro('title', {
        nr: 5,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        at: points.title,
        cutNr: titleCutNum,
        scale: 0.25,
      })
    }
    return part
  },
}
