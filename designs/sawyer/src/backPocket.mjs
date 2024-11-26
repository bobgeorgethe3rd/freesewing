import { pluginMirror } from '@freesewing/plugin-mirror'
import { pluginPatchPocket } from '@freesewing/plugin-patchpocket'
import { front } from './front.mjs'

export const backPocket = {
  name: 'sawyer.backPocket',
  after: front,
  options: {
    //Pockets
    backPocketsBool: { bool: true, menu: 'pockets' },
    backPocketWidth: { pct: 20.2, min: 15, max: 25, menu: 'pockets.backPockets' },
    backPocketDepth: { pct: 13.1, min: 10, max: 25, menu: 'pockets.backPockets' },
    backPocketBottomWidth: { pct: 100, min: 80, max: 100, menu: 'pockets.backPockets' },
    backPocketPeakDepth: { pct: 37.5, min: 0, max: 50, menu: 'pockets.backPockets' },
    backPocketFolded: { bool: true, menu: 'pockets.backPockets' },
    backPocketPeakPlateau: { bool: false, menu: 'pockets.backPockets' },
    //Construction
    backPocketTopSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
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
    //measures
    const backPocketDepth = measurements.waistToFloor * options.backPocketDepth
    const backPocketWidth = measurements.waist * options.backPocketWidth
    //macro
    macro('patchpocket', {
      width: backPocketWidth,
      depth: backPocketDepth,
      bottomWidth: options.backPocketBottomWidth,
      peakDepth: options.backPocketPeakDepth,
      peakPlateau: options.backPocketPeakPlateau,
      style: 'straight',
      folded: options.backPocketFolded,
      topSaWidth: options.backPocketTopSaWidth,
      prefix: 'backPocket',
    })

    //stores
    store.set('backPocketDepth', backPocketDepth)
    store.set('backPocketWidth', backPocketWidth)
    const prefixFunction = (string) =>
      'backPocketPatchPocket' + string.charAt(0).toUpperCase() + string.slice(1)

    if (complete) {
      //title
      macro('title', {
        nr: 3,
        title: 'Back Pocket',
        at: points[prefixFunction('title')],
        cutNr: 1,
        scale: 0.5,
      })
    }

    return part
  },
}
