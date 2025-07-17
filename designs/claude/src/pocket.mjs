import { pocket as inseamPocket } from '@freesewing/inseampocket'
import { skirtBase } from './skirtBase.mjs'

export const pocket = {
  name: 'claude.pocket',
  after: skirtBase,
  options: {
    //Imported
    ...inseamPocket.options,
    //Constants
    sideSkirtFraction: 1,
    //Pockets
    pocketsBool: { bool: true, menu: 'pockets' },
    inseamPocketWidth: { pct: 75, min: 40, max: 90, menu: 'pockets.inseamPockets' },
    inseamPocketDepth: { pct: 15, min: 15, max: 40, menu: 'pockets.inseamPockets' },
  },
  measurements: [...inseamPocket.measurements],
  draft: (sh) => {
    const { macro, points, options, store, complete, part, log } = sh
    //set Render stroke Draft
    if (options.pocketsBool) {
      inseamPocket.draft(sh)
    } else {
      part.hide()
      return part
    }

    //stores
    store.set('pocketDepth', points.bottomLeft.y - points.openingBottom.y)

    let pocketMaxLength
    if (options.highLow) {
      pocketMaxLength =
        store.get('skirtHighLength') +
        (store.get('skirtLength') - store.get('skirtHighLength')) * options.sideSkirtFraction
    } else {
      pocketMaxLength = store.get('skirtLength')
    }

    if (
      pocketMaxLength <
      store.get('pocketOpening') + store.get('pocketOpeningLength') + store.get('pocketDepth')
    ) {
      log.warning('Pocket Length is greater than Skirt Length so Pocket has been hidden')
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
