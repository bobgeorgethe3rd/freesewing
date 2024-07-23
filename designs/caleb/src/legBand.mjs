import { legBand as legBandStraight } from '@freesewing/legbandstraight'
import { legBand as legBandCurved } from '@freesewing/legbandcurved'
import { front } from './front.mjs'

export const legBand = {
  name: 'caleb.legBand',
  options: {
    //Imported
    ...legBandStraight.options,
    ...legBandCurved.options,
    //Style
    legBandFolded: { bool: true, menu: 'style' }, //Altered for Caleb
  },
  after: [front],
  plugins: [...legBandStraight.plugins, ...legBandCurved.plugins],
  draft: (sh) => {
    const { macro, store, points, utils, options, measurements, complete, part } = sh
    store.set('legBandMaxButtons', 1)

    if (options.legBandStyle != 'bandStraight' && options.legBandStyle != 'bandCurved') {
      part.hide()
      return part
    } else {
      if (options.legBandStyle == 'bandStraight') legBandStraight.draft(sh)
      else legBandCurved.draft(sh)
    }

    if (complete) {
      macro('title', {
        nr: 13,
        title: 'Leg band ' + utils.capitalize(options.legBandStyle),
        at: points.title,
        scale: 1 / 3,
      })
    }
    return part
  },
}
