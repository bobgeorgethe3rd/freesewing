import { pocketFlap as patchPocketFlap } from '@freesewing/patchpocket'
import { pocket } from './pocket.mjs'

export const pocketFlap = {
  name: 'shannon.pocketFlap',
  from: pocket,
  options: {
    //Imported
    ...patchPocketFlap.options,
    //Pockets
    frontPocketFlapsBool: { bool: true, menu: 'pockets' },
    patchPocketFlapPeakDepth: { pct: 100, min: 0, max: 100, menu: 'pockets.patchPocketsFlaps' }, //Altered for Shannon
  },
  draft: (sh) => {
    //draft
    const { points, options, complete, macro, store, part } = sh
    if (
      !options.frontPocketFlapsBool ||
      !options.frontPocketsBool ||
      store.get('patchPocketRadius') > store.get('skirtRadius')
    ) {
      part.hide()
      return part
    }

    patchPocketFlap.draft(sh)

    if (complete) {
      //title
      macro('title', {
        nr: 12,
        title: 'Pocket Flap',
        at: points.title,
        scale: 1 / 3,
      })
    }

    return part
  },
}
