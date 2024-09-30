import { pocketFlap as patchPocketFlap } from '@freesewing/patchpocket'
import { pocket } from './pocket.mjs'

export const pocketFlap = {
  name: 'shannon.pocketFlap',
  from: pocket,
  options: {
    //Imported
    ...patchPocketFlap.options,
    //Pockets
    patchPocketFlapsBool: { bool: true, menu: 'pockets' },
    patchPocketFlapPeakDepth: { pct: 100, min: 0, max: 100, menu: 'pockets.patchPocketsFlaps' }, //Altered for Shannon
  },
  plugins: [...patchPocketFlap.plugins],
  draft: (sh) => {
    //draft
    const { points, options, complete, macro, store, part } = sh
    if (
      !options.patchPocketFlapsBool ||
      !options.patchPocketsBool ||
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
        at: points.patchPocketFlapTitle,
        cutNr: 4,
        scale: 1 / 3,
      })
    }

    return part
  },
}
