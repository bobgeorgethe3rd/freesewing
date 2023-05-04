import { pocket as draftInseamPocket } from '@freesewing/inseampocket'
import { skirtBase } from './skirtBase.mjs'

export const pocket = {
  name: 'claude.inseamPocket',
  from: draftInseamPocket,
  after: skirtBase,
  hide: {
    from: true,
  },
  options: {
    //Pockets
    pocketsBool: { bool: true, menu: 'pockets' },
    inseamPocketWidth: { pct: 75, min: 40, max: 90, menu: 'pockets.inseamPockets' },
    inseamPocketDepth: { pct: 15, min: 15, max: 40, menu: 'pockets.inseamPockets' },
  },
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    complete,
    paperless,
    macro,
    utils,
    measurements,
    part,
    snippets,
    log,
    absoluteOptions,
  }) => {
    //set Render
    if (!options.pocketsBool) {
      part.hide()
      return part
    }

    //stores
    store.set('pocketOpening', points.topLeft.dist(points.openingTop))
    store.set('pocketOpeningLength', points.topLeft.dist(points.openingBottom))

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
