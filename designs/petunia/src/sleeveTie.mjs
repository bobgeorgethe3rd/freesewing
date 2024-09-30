import { sleeveTie as rbSleeveTie } from '@freesewing/rufflebutterflysleeve'
import { sleeve } from './sleeve.mjs'

export const sleeveTie = {
  name: 'petunia.sleeveTie',
  after: sleeve,
  options: {
    //Imported
    ...rbSleeveTie.options,
  },
  draft: (sh) => {
    const { macro, points, options, store, complete, part, log } = sh
    //set Render stroke Draft
    if (options.sleevesBool) {
      rbSleeveTie.draft(sh)
    } else {
      part.hide()
      return part
    }

    if (complete) {
      // title
      macro('title', {
        nr: 12,
        title: 'Sleeve Tie',
        at: points.title,
        cutNr: 4,
        scale: 0.1,
      })
    }

    return part
  },
}
