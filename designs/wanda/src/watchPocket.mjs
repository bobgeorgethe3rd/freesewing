import { pocket as draftWatchPocket } from '@freesewing/watchpocket'
import { skirtBase } from './skirtBase.mjs'

export const watchPocket = {
  name: 'wanda.watchPocket',
  options: {
    //Imported
    ...draftWatchPocket.options,
    //Pockets
    watchPocket: { bool: true, menu: 'pockets.watchPockets' },
    //Advanced
    scalePockets: { bool: true, menu: 'advanced.pockets' },
  },
  after: skirtBase,
  draft: (sh) => {
    //set Render
    const { macro, points, options, complete, part } = sh

    if (options.watchPocket && options.pocketsBool) {
      draftWatchPocket.draft(sh)
    } else {
      part.hide()
      return part
    }

    if (complete) {
      //title
      macro('title', {
        nr: 7,
        title: 'Watch Pocket',
        at: points.title,
        scale: 0.25,
      })
    }

    return part
  },
}
