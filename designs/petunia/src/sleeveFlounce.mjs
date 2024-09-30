import { sleeveFlounce as rbSleeveFlounce } from '@freesewing/rufflebutterflysleeve'
import { sleeve } from './sleeve.mjs'

export const sleeveFlounce = {
  name: 'petunia.sleeveFlounce',
  after: sleeve,
  options: {
    //Imported
    ...rbSleeveFlounce.options,
  },
  draft: (sh) => {
    const { macro, points, options, store, complete, part, log } = sh
    //set Render stroke Draft
    if (options.sleevesBool) {
      rbSleeveFlounce.draft(sh)
    } else {
      part.hide()
      return part
    }

    if (complete) {
      // title
      macro('title', {
        nr: 10,
        title: 'Sleeve Flounce',
        at: points.title,
        cutNr: 2,
        scale: 0.5,
      })
    }

    return part
  },
}
