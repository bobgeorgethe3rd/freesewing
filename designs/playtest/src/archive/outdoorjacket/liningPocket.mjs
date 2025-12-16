import { pocket as patchPocket } from '@freesewing/patchpocket'
import { frontBase } from './frontBase.mjs'

export const liningPocket = {
  name: 'playtest.liningpocket',
  after: frontBase,
  options: {
    //Imported
    ...patchPocket.options,
    //Constant
    patchPocketBottomWidth: 1, //Locked for Playtest
    patchPocketDepth: 0, //Locked for Playtest
    patchPocketWidth: 0, //Locked for Playtest
    //Pockets
    liningPocketDepth: { pct: 39.2, min: 10, max: 50, menu: 'pockets.patchPockets' },
    patchPocketPeakPlateau: { bool: false, menu: 'pockets.patchPockets' }, //Altered for Playtest
    patchPocketStyle: {
      dflt: 'straight',
      list: ['straight', 'curved'],
      menu: 'pockets.patchPockets',
    }, //Altered for Playtest
    patchPocketCurve: { pct: 0, min: 0, max: 100, menu: 'pockets.patchPockets' },
    patchPocketPeakDepth: { pct: 0, min: 0, max: 100, menu: 'pockets.patchPockets' },
    //Construction
    patchPocketTopFoldWidth: { pct: 13.9, min: 10, max: 50, menu: 'construction' }, //Altered for Playtest
  },
  plugins: [...patchPocket.plugins],
  draft: (sh) => {
    //draft
    const { points, options, store, measurements, complete, macro, part } = sh
    store.set('patchPocketDepth', measurements.hpsToWaistBack * options.liningPocketDepth)
    if (!options.liningPocketsBool) {
      part.hide()
      return part
    }

    patchPocket.draft(sh)

    if (complete) {
      //title
      macro('title', {
        nr: 3,
        title: 'Lining Pocket',
        at: points.patchPocketTitle,
        cutNr: 1,
        scale: 1 / 3,
      })
    }

    return part
  },
}
