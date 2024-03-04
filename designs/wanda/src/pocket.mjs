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
    pocketOpeningLength: { pct: 100, min: 40, max: 100, menu: 'pockets' }, //Altered for Wanda
    pocketStyle: { dflt: 'inseam', list: ['inseam', 'boxPleat', 'pear'], menu: 'pockets' },
    inseamPocketAngle: { deg: 0, min: 0, max: 15, menu: 'pockets.inseamPockets' }, //Altered for Wanda
    inseamPocketCurveLeft: { pct: 0, min: 0, max: 100, menu: 'pockets.inseamPockets' }, //Altered for Wanda
    inseamPocketCurveRight: { pct: 100, min: 0, max: 100, menu: 'pockets.inseamPockets' }, //Altered for Wanda
    inseamPocketToAnchor: { pct: 100 / 3, min: 0, max: 100, menu: 'pockets.inseamPockets' }, //Altered for Wanda
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
    if (complete) {
      //title
      macro('title', {
        nr: 4,
        title: utils.capitalize(options.pocketStyle) + ' Pocket',
        at: points.title,
        scale: 0.5,
      })
    }
    return part
  },
}
