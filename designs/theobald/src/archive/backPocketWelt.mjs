import { welt } from '@freesewing/weltpocket'
import { backPocketBag } from './backPocketBag.mjs'

export const backPocketWelt = {
  name: 'theobald.backPocketWelt',
  from: backPocketBag,
  options: {
    //Imported
    ...welt.options,
  },
  draft: (sh) => {
    const { macro, points, options, complete, part } = sh
    //set Render stroek Draft
    if (options.backPocketsBool) {
      welt.draft(sh)
    } else {
      part.hide()
      return part
    }

    if (complete) {
      //title
      macro('title', {
        nr: 3,
        title: 'Back Pocket Welt',
        at: points.title,
        scale: 0.25,
      })
    }

    return part
  },
}
