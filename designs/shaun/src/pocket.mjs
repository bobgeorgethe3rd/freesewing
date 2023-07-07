import { pocket as patchPocket } from '@freesewing/patchpocket'
import { frontBase } from './frontBase.mjs'

export const pocket = {
  name: 'shaun.pocket',
  after: frontBase,
  options: {
    //Imported
    ...patchPocket.options,
    //Pockets
    pockets: { bool: true, menu: 'pockets' },
    patchPocketPeakPlateau: { bool: false, menu: 'pockets' }, //Altered for Shaun
    patchPocketStyle: { dflt: 'straight', list: ['straight', 'curved'], menu: 'pockets' }, //Altered for Shaun
  },
  draft: (sh) => {
    //draft
    const { points, options, complete, macro, part } = sh
    if (!options.pockets) {
      part.hide()
      return part
    }

    patchPocket.draft(sh)

    if (complete) {
      //notches
      //title
      macro('title', {
        nr: 2,
        title: 'Pocket',
        at: points.title,
        scale: 1 / 3,
      })
    }

    return part
  },
}
