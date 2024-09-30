import { sleeve as rbSleeve } from '@freesewing/rufflebutterflysleeve'
import { backBase } from './backBase.mjs'

export const sleeve = {
  name: 'petunia.sleeve',
  after: backBase,
  options: {
    //Imported
    ...rbSleeve.options,
    //Constants
    useVoidStores: false, //Locked for Petunia
    //Sleeves
    sleevesBool: { bool: false, menu: 'sleeves' },
  },
  measurements: rbSleeve.measurements,
  draft: (sh) => {
    const { macro, points, options, store, complete, part, log } = sh
    //set Render stroke Draft
    if (options.sleevesBool) {
      rbSleeve.draft(sh)
    } else {
      part.hide()
      return part
    }

    if (complete) {
      // title
      macro('title', {
        nr: 9,
        title: 'Sleeve',
        at: points.title,
        cutNr: 2,
        scale: 0.5,
      })
    }

    return part
  },
}
