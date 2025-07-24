import { pocket as weltPocket } from '@freesewing/weltpocket'
import { back } from './back.mjs'

export const backPocketBag = {
  name: 'callum.backPocketBag',
  after: back,
  options: {
    //Imported
    ...weltPocket.options,
    //Pockets
    weltPocketCurve: { pct: 0, min: 0, max: 100, menu: 'pockets.weltPockets' }, //Altered for Callum
  },
  draft: (sh) => {
    const { macro, points, options, complete, part } = sh
    //set Draft stroke Render
    if (options.backPocketStyle == 'welt') {
      weltPocket.draft(sh)
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
        cutNr: 2,
        scale: 0.5,
      })
    }

    return part
  },
}
