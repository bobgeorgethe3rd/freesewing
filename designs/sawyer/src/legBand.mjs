import { legBand as legBandStraight } from '@freesewing/legbandstraight'
import { back } from './back.mjs'

export const legBand = {
  name: 'sawyer.legBand',
  after: [back],
  options: {
    //Imported
    ...legBandStraight.options,
    //Constant
    useVoidStores: false, //Locked for Saywer
    legBandClosurePosition: 'sideRight', //Locked for Saywer
    legBandOverlap: 0, //Locked for Saywer
    legBandOverlapSide: 'left', //Locked for Saywer
    //Style
    legBandFolded: { bool: true, menu: 'style' }, //Altered for Saywer
  },
  plugins: [...legBandStraight.plugins],
  draft: (sh) => {
    const { macro, store, points, paths, utils, options, measurements, complete, part } = sh
    legBandStraight.draft(sh)

    if (complete) {
      let titleCutNum = 4
      if (options.legBandFolded) titleCutNum = 2
      macro('title', {
        nr: 5,
        title: 'Leg band ',
        at: points.title,
        cutNr: titleCutNum,
        scale: 0.25,
      })
    }
    return part
  },
}
