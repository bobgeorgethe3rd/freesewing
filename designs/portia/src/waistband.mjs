import { waistband as waistbandStraight } from '@freesewing/waistbandstraight'
import { waistband as waistbandCurved } from '@freesewing/waistbandcurved'
import { skirtFront } from './skirtFront.mjs'

export const waistband = {
  name: 'portia.waistband',
  options: {
    //Imported
    ...waistbandStraight.options,
    ...waistbandCurved.options,
    //Style
    waistbandFolded: { bool: true, menu: 'style' }, //Altered for Portia
    waistbandOverlapSide: { dflt: 'right', list: ['left', 'right'], menu: 'style' }, //Altered for Portia
  },
  after: [skirtFront],
  plugins: [...waistbandStraight.plugins, ...waistbandCurved.plugins],
  draft: (sh) => {
    const { macro, store, points, utils, options, measurements, complete, part } = sh

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
        nr: 4,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        at: points.title,
        cutNr: titleCutNum,
        scale: 0.25,
      })
    }

    return part
  },
}
