import { pocket as inseamPocket } from '@freesewing/inseampocket'
import { back } from '@freesewing/sarah'

export const pocket = {
  name: 'antiope.pocket',
  after: back,
  options: {
    //Imported
    ...inseamPocket.options,
    //Pockets
    pocketsBool: { bool: true, menu: 'pockets' },
    pocketOpening: { pct: 7.2, min: 5, max: 15, menu: 'pockets' }, //Altered for Antiope
    inseamPocketWidth: { pct: 75, min: 40, max: 90, menu: 'pockets.inseamPockets' }, //Altered for Antiope
    inseamPocketDepth: { pct: 15, min: 15, max: 40, menu: 'pockets.inseamPockets' }, //Altered for Antiope
  },
  measurements: [...inseamPocket.measurements],
  draft: (sh) => {
    const { macro, points, measurements, options, store, sa, complete, part, log } = sh
    //set stores
    store.set('anchorSeamLength', store.get('styleWaistFront') * 0.5)
    store.set('insertSeamLength', measurements.waistToFloor)
    if (sa) {
      store.set(
        'insertSeamSa',
        options.closurePosition == 'side'
          ? sa * options.closureSaWidth * 100
          : sa * options.sideSeamSaWidth * 100
      )
    }
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
    store.set('pocketLength', points.bottomLeft.y - points.pocketTopLeft.y)

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
