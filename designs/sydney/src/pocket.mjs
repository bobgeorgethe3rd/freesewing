import { pocket as patchPocket } from '@freesewing/patchpocket'
import { front } from './front.mjs'

export const pocket = {
  name: 'sydney.pocket',
  after: front,
  options: {
    //Imported
    ...patchPocket.options,
    ...front.options,
    //Constant
    patchPocketBottomWidth: 1, //Locked for Sydney
    //Pockets
    patchPocketPeakDepth: { pct: 0, min: 0, max: 100, menu: 'pockets.patchPockets' }, //Altered for Sydney
    patchPocketPeakCurve: { pct: 0, min: 0, max: 100, menu: 'pockets.patchPockets' }, //Altered for Sydney
    patchPocketStyle: {
      dflt: 'straight',
      list: ['straight', 'curved'],
      menu: 'pockets.patchPockets',
    }, //Altered for Sydney
    //Construction
    patchPocketFolded: { bool: true, menu: 'construction' }, //Altered for Sydney
    patchPocketTopFoldWidth: { pct: 21.1, min: 10, max: 50, menu: 'construction' }, //Altered for Sydney
  },
  plugins: [...patchPocket.plugins],
  draft: (sh) => {
    //draft
    const { points, options, complete, macro, part } = sh
    if (!options.pocketsBool) {
      part.hide()
      return part
    }

    patchPocket.draft(sh)

    if (complete) {
      //title
      macro('title', {
        nr: 5,
        title: 'Pocket',
        at: points.patchPocketTitle,
        cutNr: 1,
        scale: 1 / 3,
      })
    }

    return part
  },
}
