import { pocket as pearPocket } from '@freesewing/pearpocket'
import { front } from './front.mjs'

export const pocket = {
  name: 'bernice.pocket',
  after: front,
  options: {
    //Imported
    ...pearPocket.options,
    //Pockets
    pocketsBool: { bool: true, menu: 'pockets' },
    pearPocketWidth: { pct: 80, min: 60, max: 85, menu: 'pockets.pearPockets' },
  },
  draft: (sh) => {
    const { macro, points, options, store, complete, part, log } = sh
    //set Render stroke Draft
    if (options.pocketsBool) {
      pearPocket.draft(sh)
    } else {
      part.hide()
      return part
    }

    if (complete) {
      //title
      macro('title', {
        nr: 3,
        title: 'Pocket',
        at: points.title,
        scale: 0.75,
      })
    }

    return part
  },
}
