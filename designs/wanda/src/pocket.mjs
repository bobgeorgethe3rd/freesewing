import { pocket as inseamPocket } from '@freesewing/inseampocket'
import { pocket as boxPleatPocket } from '@freesewing/boxpleatpocket'
import { pocket as pearPocket } from '@freesewing/pearpocket'
import { skirtBase } from './skirtBase.mjs'

export const pocket = {
  name: 'wanda.pocket',
  options: {
    //Imported
    ...inseamPocket.options,
    ...boxPleatPocket.options,
    ...pearPocket.options,

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
  after: [skirtBase],
  draft: (sh) => {
    const { macro, points, utils, options, complete, store, part } = sh
    if (options.pocketsBool) {
      if (options.pocketStyle == 'inseam') inseamPocket.draft(sh)
      if (options.pocketStyle == 'boxPleat') boxPleatPocket.draft(sh)
      if (options.pocketStyle == 'pear') pearPocket.draft(sh)
    } else {
      part.hide()
      return part
    }

    //stores
    if (options.pocketStyle == 'inseam') {
      store.set('pocketOpening', points.topLeft.dist(points.openingTop))
      store.set('pocketOpeningLength', points.topLeft.dist(points.openingBottom))
    }

    if (options.pocketStyle == 'boxPleat') {
      store.set(
        'pocketOpeningLength',
        store.get('pocketOpening') + points.openingTop.dist(points.openingBottom)
      )
    }

    if (options.pocketStyle == 'pear') {
      store.set('pocketOpeningLength', points.slitTop.dist(points.slitBottom))
    }

    if (complete) {
      //title
      macro('title', {
        nr: 6,
        title: utils.capitalize(options.pocketStyle) + ' Pocket',
        at: points.title,
        scale: 0.75,
      })
    }
    return part
  },
}
