import { pctBasedOn } from '@freesewing/core'
import { sleeve as ssSleeve } from '@freesewing/simpleshirtsleeve'
import { front } from './front.mjs'

export const sleeve = {
  name: 'darren.sleeve',
  after: front,
  options: {
    //Imported
    ...ssSleeve.options,
    //Constants
    useVoidStores: false, //Locked for Darren
    sleeveTurnoverDoubleFold: false, //Locked for Darren
    //Fit
    //bicepsEase: { pct: 8.7, min: 0, max: 25, menu: 'fit' }, //Altered for Darren
    //Sleeves
    sleevesBool: { bool: true, menu: 'sleeves' },
    fitSleeveWidth: { bool: false, menu: 'sleeves' }, //Altered for Darren
    sleeveHemStyle: { dflt: 'turnover', list: ['cuffed', 'turnover'], menu: 'sleeves' }, //Altered for Darren
    sleeveSideCurve: { pct: 0, min: 0, max: 100, menu: 'sleeves' }, //Altered for Darren
    sleeveBandWidth: {
      pct: 3.5,
      min: 1,
      max: 17,
      snap: 5,
      ...pctBasedOn('shoulderToWrist'),
      menu: 'sleeves',
    }, //Altered for Darren
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
