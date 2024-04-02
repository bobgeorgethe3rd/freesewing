import { pocket } from '@freesewing/patchpocket'
import { pluginMirror } from '@freesewing/plugin-mirror'
import { back } from './back.mjs'

export const backPocket = {
  name: 'caleb.backPocket',
  after: back,
  options: {
    //Imported
    ...pocket.options,
    //Constants
    patchPocketBottomWidth: 1, //Locked for Caleb
    //Pockets
    patchPocketDepth: { pct: 12.6, min: 10, max: 20, menu: 'pockets.backPockets' }, //Altered for Caleb
    patchPocketStyle: {
      dflt: 'straight',
      list: ['straight', 'curved'],
      menu: 'pockets.backPockets',
    }, //Altered for Caleb
    patchPocketPeakCurve: { pct: 100, min: 0, max: 100, menu: 'pockets.backPockets' }, //Moved for Caleb
    patchPocketPeakDepth: { pct: 50, min: 0, max: 100, menu: 'pockets.backPockets' }, //Moved for Caleb
    patchPocketPeakPlateau: { bool: false, menu: 'pockets.backPockets' }, //Altered for Caleb
    //Construction
    patchPocketTopSaWidth: { pct: 3.3, min: 1, max: 4, menu: 'construction' }, //Altered for Caleb
  },
  plugins: [pluginMirror],
  draft: (sh) => {
    const {
      store,
      sa,
      Point,
      points,
      Path,
      paths,
      options,
      measurements,
      complete,
      macro,
      utils,
      part,
    } = sh
    //store set
    store.set('patchPocketDepth', measurements.waistToFloor * options.patchPocketDepth)
    //draft
    if (options.backPocketsBool) {
      pocket.draft(sh)
    } else {
      part.hide()
      return part
    }
    if (complete) {
      //title
      macro('title', {
        nr: 2,
        title: 'Back Pocket',
        at: points.title,
        scale: 0.5,
      })
    }

    return part
  },
}
