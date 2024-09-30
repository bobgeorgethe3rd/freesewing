import { pctBasedOn } from '@freesewing/core'
import { sleeve as ssSleeve } from '@freesewing/simpleshirtsleeve'
import { front } from './front.mjs'

export const sleeve = {
  name: 'terry.sleeve',
  after: front,
  options: {
    //Imported
    ...ssSleeve.options,
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
    }, //Altered for Terry
  },
  measurements: ssSleeve.measurements,
  draft: (sh) => {
    const { macro, points, options, store, complete, part, log } = sh
    //set Render stroke Draft
    if (options.sleevesBool) {
      ssSleeve.draft(sh)
    } else {
      part.hide()
      return part
    }

    if (complete) {
      // title
      macro('title', {
        nr: 4,
        title: 'Sleeve',
        at: points.title,
        cutNr: 2,
        scale: 0.5,
      })
    }

    return part
  },
}
