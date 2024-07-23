import { legBand as legBandStraight } from '@freesewing/legbandstraight'
import { legBand as legBandCurved } from '@freesewing/legbandcurved'
import { leg } from './leg.mjs'

export const legBand = {
  name: 'heleanor.legBand',
  options: {
    //Imported
    ...legBandStraight.options,
    ...legBandCurved.options,
    //Constant
    legBandClosurePosition: 'sideRight', //Loced for Heleanor
    //Style
    legBandOverlap: { pct: 0, min: 0, max: 50, menu: 'style' }, //Altered for Heleanor
    legBandFolded: { bool: true, menu: 'style' }, //Altered for Heleanor
  },
  after: [leg],
  plugins: [...legBandStraight.plugins, ...legBandCurved.plugins],
  draft: (sh) => {
    const { macro, store, points, paths, utils, options, measurements, complete, part } = sh

    if (options.legBandStyle == 'none' || store.get('legBandWidth') <= 0) {
      part.hide()
      return part
    } else {
      if (options.legBandStyle == 'straight' || options.legBandStyle == 'straightTube')
        legBandStraight.draft(sh)
      else legBandCurved.draft(sh)
    }

    if (complete) {
      macro('title', {
        nr: 5,
        title: 'Leg band ' + utils.capitalize(options.legBandStyle),
        at: points.title,
        scale: 1 / 3,
      })
      if (paths.legBandLeftEx) paths.legBandLeftEx.attr('data-text', 'Seam - line', true)
      paths.legBandLeft.attr('data-text', '1 / 4 Mark', true)
      paths.legBandMid.attr('data-text', '1 / 4 Mark', true)
      paths.legBandRight.attr('data-text', '1 / 4 Mark', true)
      if (paths.legBandRightEx) paths.legBandRightEx.attr('data-text', 'Seam - line', true)
    }
    return part
  },
}
