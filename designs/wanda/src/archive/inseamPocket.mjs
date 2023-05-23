import { pocket as draftInseamPocket } from '@freesewing/inseampocket'
import { skirtBase } from './skirtBase.mjs'

export const inseamPocket = {
  name: 'wanda.inseamPocket',
  from: draftInseamPocket,
  after: skirtBase,
  hide: {
    from: true,
  },
  options: {
    //Pockets
    pocketsBool: { bool: true, menu: 'pockets' },
    pocketStyle: { dflt: 'inseam', list: ['inseam', 'boxPleat', 'pear'], menu: 'pockets' },
    inseamPocketAngle: { deg: 0, min: 0, max: 15, menu: 'pockets.inseamPockets' }, //altered for Wanda
    inseamPocketCurveLeft: { pct: 0, min: 0, max: 100, menu: 'pockets.inseamPockets' }, //altered for Wanda
    inseamPocketCurveRight: { pct: 100, min: 0, max: 100, menu: 'pockets.inseamPockets' }, //altered for Wanda
    inseamPocketToAnchor: { pct: 100 / 3, min: 0, max: 100, menu: 'pockets.inseamPockets' }, //altered for Wanda
    //Advanced
    scalePockets: { bool: true, menu: 'advanced.pockets' },
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
    if (options.pocketStyle != 'inseam' || !options.pocketsBool) {
      part.hide()
      return part
    }

    //stores
    store.set('pocketOpening', points.topLeft.dist(points.openingTop))
    store.set('pocketOpeningLength', points.topLeft.dist(points.openingBottom))

    if (complete) {
      //title
      macro('title', {
        nr: 6,
        title: 'Inseam Pocket',
        at: points.title,
        scale: 0.75,
      })
    }

    return part
  },
}
