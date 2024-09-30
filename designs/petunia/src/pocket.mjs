import { pocket as inseamPocket } from '@freesewing/inseampocket'
import { frontBase } from './frontBase.mjs'

export const pocket = {
  name: 'petunia.pocket',
  after: frontBase,
  options: {
    //Imported
    ...inseamPocket.options,
    //Constants
    useVoidStores: false, //Locked for Petunia
    //Pockets
    pocketsBool: { bool: true, menu: 'pockets' },
    inseamPocketWidth: { pct: 75, min: 40, max: 90, menu: 'pockets.inseamPockets' }, //Altered For Petunia
    inseamPocketAngle: { deg: 0, min: 0, max: 15, menu: 'pockets.inseamPockets' }, //Altered For Petunia
    inseamPocketCurveLeft: { pct: 0, min: 0, max: 100, menu: 'pockets.inseamPockets' }, //Altered For Petunia
    inseamPocketToAnchor: { pct: (1 / 3) * 100, min: 0, max: 100, menu: 'pockets.inseamPockets' }, //Altered For Petunia
  },
  measurements: ['wrist'],
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
    store.set('pocketOpening', points.topLeft.dist(points.openingTop))
    store.set('pocketOpeningLength', points.topLeft.dist(points.openingBottom))
    store.set('pocketLength', points.curveBRStart.y - points.pocketTopLeft.y)

    if (store.get('sideSkirtLength') < store.get('pocketLength')) {
      log.warning('Pocket Length is greater than Dress Length so Pocket has been hidden')
      part.hide()
      return part
    }

    if (complete) {
      //title
      macro('title', {
        nr: 6,
        title: 'Pocket',
        at: points.title,
        cutNr: 4,
        scale: 0.5,
      })
    }

    return part
  },
}
