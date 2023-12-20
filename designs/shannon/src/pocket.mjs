import { pocket as patchPocket } from '@freesewing/patchpocket'
import { front } from './front.mjs'

export const pocket = {
  name: 'shannon.pocket',
  after: front,
  options: {
    //Imported
    ...patchPocket.options,
    //Constant
    patchPocketGrainlineBias: false, //Locked for Shannon
  },
  draft: (sh) => {
    //draft
    const { points, options, complete, macro, store, part } = sh
    if (!options.frontPocketsBool || store.get('patchPocketRadius') > store.get('skirtRadius')) {
      part.hide()
      return part
    }

    patchPocket.draft(sh)

    if (complete) {
      //title
      macro('title', {
        nr: 11,
        title: 'Pocket',
        at: points.title,
        scale: 1 / 3,
      })
    }

    return part
  },
}
