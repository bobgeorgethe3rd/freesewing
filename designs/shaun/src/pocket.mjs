import { pocket as patchPocket } from '@freesewing/patchpocket'
import { frontBase } from './frontBase.mjs'

export const pocket = {
  name: 'shaun.pocket',
  after: frontBase,
  options: {
    //Imported
    ...patchPocket.options,
    //Constant
    patchPocketBottomWidth: 1, //Locked for Shaun
    //Pockets
    pockets: { bool: true, menu: 'pockets' },
    patchPocketPeakPlateau: { bool: false, menu: 'pockets.patchPockets' }, //Altered for Shaun
    patchPocketStyle: {
      dflt: 'straight',
      list: ['straight', 'curved'],
      menu: 'pockets.patchPockets',
    }, //Altered for Shaun
  },
  plugins: [...patchPocket.plugins],
  draft: (sh) => {
    //draft
    const { points, options, complete, macro, part } = sh
    if (!options.pockets) {
      part.hide()
      return part
    }

    patchPocket.draft(sh)

    if (complete) {
      //title
      macro('title', {
        nr: 2,
        title: 'Pocket',
        at: points.patchPocketTitle,
        scale: 1 / 3,
      })
    }

    return part
  },
}
