import { pocket } from '@freesewing/weltpocket'
import { back } from './back.mjs'

export const backPocketBag = {
  name: 'theobald.backPocketBag',
  after: back,
  options: {
    //Imported
    ...pocket.options,
  },
  draft: (sh) => {
    const { macro, points, options, complete, part } = sh
    //set Draft stroke Render
    if (options.backPocketsBool) {
      pocket.draft(sh)
    } else {
      part.hide()
      return part
    }

    if (complete) {
      //title
      macro('title', {
        nr: 2,
        title: 'Back Pocket Bag',
        at: points.title,
        cutNr: 4,
        scale: 0.5,
      })
    }

    return part
  },
}
