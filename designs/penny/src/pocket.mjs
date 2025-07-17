import { pocket as inseamPocket } from '@freesewing/inseampocket'
import { back } from './back.mjs'

export const pocket = {
  name: 'penny.pocket',
  after: back,
  draft: (sh) => {
    const { macro, points, measurements, options, store, sa, complete, part, log } = sh
    //set stores
    store.set('anchorSeamLength', store.get('styleWaistFront') * 0.5)
    if (sa) {
      store.set(
        'insertSeamSa',
        options.closurePosition == 'side'
          ? sa * options.closureSaWidth * 100
          : sa * options.sideSeamSaWidth * 100
      )
    }
    //set Render stroke Draft
    if (
      options.pocketsBool &&
      store.get('pocketOpening') + store.get('pocketOpeningLength') + store.get('pocketDepth') <
        store.get('pocketMaxLength')
    ) {
      inseamPocket.draft(sh)
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
        cutNr: 4,
        scale: 0.75,
      })
    }

    return part
  },
}
