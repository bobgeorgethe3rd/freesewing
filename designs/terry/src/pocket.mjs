import { pocket as patchPocket } from '@freesewing/patchpocket'
import { front } from './front.mjs'

export const pocket = {
  name: 'terry.pocket',
  after: front,
  options: {
    //Imported
    ...patchPocket.options,
    ...front.options,
    //Constant
    patchPocketBottomWidth: 1, //Locked for Terry
    //Pockets
    patchPocketPeakPlateau: { bool: false, menu: 'pockets.patchPockets' }, //Altered for Terry
    patchPocketStyle: {
      dflt: 'straight',
      list: ['straight', 'curved'],
      menu: 'pockets.patchPockets',
    }, //Altered for Terry
    //Construction
    patchPocketFolded: { bool: true, menu: 'construction' }, //Altered for Terry
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
