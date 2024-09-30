import { sleeveBand as rbSleeveBand } from '@freesewing/rufflebutterflysleeve'
import { sleeve } from './sleeve.mjs'

export const sleeveBand = {
  name: 'petunia.sleeveBand',
  after: sleeve,
  options: {
    //Imported
    ...rbSleeveBand.options,
  },
  draft: (sh) => {
    const { macro, points, options, store, complete, part, log } = sh
    //set Render stroke Draft
    if (options.sleevesBool) {
      rbSleeveBand.draft(sh)
    } else {
      part.hide()
      return part
    }

    if (complete && options.sleeveTieChannel == 'band') {
      // title
      macro('title', {
        nr: 13,
        title: 'Sleeve Band',
        at: points.title,
        cutNr: 2,
        scale: 0.1,
      })
    }

    return part
  },
}
