import { pctBasedOn } from '@freesewing/core'
import { sleeve as srsSleeve } from '@freesewing/simpleraglanshirtsleeve'
import { front } from './front.mjs'

export const sleeve = {
  name: 'riley.sleeve',
  after: front,
  options: {
    //Imported
    ...srsSleeve.options,
    //Constants
    useVoidStores: false, //Locked for Terry
    sleeveTurnoverDoubleFold: false, //Locked for Terry
    //Sleeves
    sleevesBool: { bool: true, menu: 'sleeves' },
    sleeveHemStyle: { dflt: 'turnover', list: ['cuffed', 'turnover'], menu: 'sleeves' }, //Altered for Terry
    sleeveSideCurve: { pct: 0, min: 0, max: 100, menu: 'sleeves' }, //Altered for Terry
    sleeveBandWidth: {
      pct: 3.5,
      min: 1,
      max: 17,
      snap: 5,
      ...pctBasedOn('shoulderToWrist'),
      menu: 'sleeves',
    }, //Altered for terry
  },
  measurements: srsSleeve.measurements,
  draft: (sh) => {
    const { macro, points, options, store, complete, part, log } = sh
    //set Render stroke Draft
    if (options.sleevesBool) {
      srsSleeve.draft(sh)
    } else {
      part.hide()
      return part
    }

    if (complete) {
      // title
      macro('title', {
        nr: 3,
        title: 'Sleeve',
        at: points.title,
        scale: 0.5,
      })
    }

    return part
  },
}
