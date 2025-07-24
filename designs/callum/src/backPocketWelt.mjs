import { welt as weltPocketWelt } from '@freesewing/weltpocket'
import { backPocketBag } from './backPocketBag.mjs'

export const backPocketWelt = {
  name: 'callum.backPocketWelt',
  from: backPocketBag,
  options: {
    //Imported
    ...weltPocketWelt.options,
  },
  draft: (sh) => {
    const { macro, points, options, complete, part } = sh
    //set Render stroek Draft
    if (options.backPocketStyle == 'welt') {
      weltPocketWelt.draft(sh)
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
        cutNr: 2,
        scale: 0.25,
      })
    }

    return part
  },
}
