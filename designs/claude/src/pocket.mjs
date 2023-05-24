import { pocket as innseamPocket } from '@freesewing/inseampocket'
import { skirtBase } from './skirtBase.mjs'

export const pocket = {
  name: 'claude.inseamPocket',
  after: skirtBase,
  options: {
    //Imported
    ...innseamPocket.options,
    //Pockets
    pocketsBool: { bool: true, menu: 'pockets' },
    inseamPocketWidth: { pct: 75, min: 40, max: 90, menu: 'pockets.inseamPockets' },
    inseamPocketDepth: { pct: 15, min: 15, max: 40, menu: 'pockets.inseamPockets' },
  },
  draft: (sh) => {
    const { macro, points, options, store, complete, part, log } = sh
    //set Render stroke Draft
    if (options.pocketsBool) {
      innseamPocket.draft(sh)
    } else {
      part.hide()
      return part
    }

    //stores
    store.set('pocketOpening', points.topLeft.dist(points.openingTop))
    store.set('pocketOpeningLength', points.topLeft.dist(points.openingBottom))
    store.set('pocketLength', points.curveBRStart.y - points.pocketTopLeft.y)

    if (store.get('skirtLength') < store.get('pocketLength')) {
      log.warning('Pocket Length is greater than Skirt Length so Pocket has been hidden')
      part.hide()
      return part
    }

    if (complete) {
      //title
      macro('title', {
        nr: 3,
        title: 'Inseam Pocket',
        at: points.title,
        scale: 0.75,
      })
    }

    return part
  },
}
