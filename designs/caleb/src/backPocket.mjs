import { pluginMirror } from '@freesewing/plugin-mirror'
import { pluginPatchPocket } from '@freesewing/plugin-patchpocket'
import { back } from './back.mjs'

export const backPocket = {
  name: 'caleb.backPocket',
  after: back,
  options: {
    //Pockets
    backPocketDepth: { pct: 12.6, min: 10, max: 20, menu: 'pockets.backPockets' }, //Altered for Caleb
    backPocketStyle: {
      dflt: 'straight',
      list: ['straight', 'curved'],
      menu: 'pockets.backPockets',
    }, //Altered for Caleb
    backPocketPeakCurve: { pct: 100, min: 0, max: 100, menu: 'pockets.backPockets' }, //Moved for Caleb
    backPocketPeakDepth: { pct: 50, min: 0, max: 100, menu: 'pockets.backPockets' }, //Moved for Caleb
    backPocketPeakPlateau: { bool: false, menu: 'pockets.backPockets' }, //Altered for Caleb
    //Construction
    backPocketFolded: { bool: false, menu: 'construction' }, //Altered for Caleb
    backPocketGrainlineBias: { bool: false, menu: 'construction' }, //Altered for Caleb
    backPocketTopSaWidth: { pct: 3.3, min: 1, max: 4, menu: 'construction' }, //Altered for Caleb
  },
  plugins: [pluginMirror, pluginPatchPocket],
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
    Snippet,
    log,
    absoluteOptions,
  }) => {
    //draft
    if (!options.backPocketsBool) {
      part.hide()
      return part
    }

    macro('patchpocket', {
      width: store.get('backPocketWidth'),
      depth: measurements.waistToFloor * options.backPocketDepth,
      peakDepth: options.backPocketPeakDepth,
      peakCurve: options.backPocketPeakCurve,
      peakPlateau: options.backPocketPeakPlateau,
      style: options.backPocketStyle,
      folded: options.backPocketFolded,
      grainlineBias: options.backPocketGrainlineBias,
      topSaWidth: options.backPocketTopSaWidth,
      prefix: 'backPocket',
    })

    if (complete) {
      //title
      macro('title', {
        nr: 2,
        title: 'Back Pocket',
        at: points.backPocketPatchPocketTitle,
        scale: 0.5,
      })
    }

    return part
  },
}
