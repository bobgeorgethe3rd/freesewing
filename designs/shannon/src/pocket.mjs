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
  plugins: [...patchPocket.plugins],
  draft: (sh) => {
    //draft
    const { points, options, complete, macro, store, part } = sh
    if (!options.patchPocketsBool || store.get('patchPocketRadius') > store.get('skirtRadius')) {
      part.hide()
      return part
    }

    patchPocket.draft(sh)

    if (complete) {
      //title
      macro('title', {
        nr: 11,
        title: 'Pocket',
        at: points.patchPocketTitle,
        cutNr: 2,
        scale: 1 / 3,
      })
    }

    return part
  },
}
