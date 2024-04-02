import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginMirror } from '@freesewing/plugin-mirror'
import { pluginPatchPocket } from '@freesewing/plugin-patchpocket'

export const pocket = {
  name: 'patchpocket.pocket',
  options: {
    //Constants
    useVoidStores: true,
    //Pocket
    patchPocketStyle: {
      dflt: 'curved',
      list: ['straight', 'curved'],
      menu: 'pockets.patchPockets',
    },
    patchPocketDepth: { pct: 0, min: -50, max: 200, menu: 'pockets.patchPockets' },
    patchPocketWidth: { pct: 0, min: -50, max: 200, menu: 'pockets.patchPockets' },
    patchPocketBottomWidth: { pct: 100, min: 50, max: 200, menu: 'pockets.patchPockets' },
    patchPocketPeakDepth: { pct: 50, min: 0, max: 100, menu: 'pockets.patchPockets' },
    patchPocketPeakCurve: { pct: 100, min: 0, max: 100, menu: 'pockets.patchPockets' },
    patchPocketPeakPlateau: { bool: true, menu: 'pockets.patchPockets' },
    //Construction
    patchPocketFolded: { bool: false, menu: 'construction' },
    patchPocketTopSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
    patchPocketGrainlineBias: { bool: false, menu: 'construction' },
  },
  plugins: [pluginBundle, pluginMirror, pluginPatchPocket],
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
  }) => {
    //measures
    if (options.useVoidStores) {
      void store.setIfUnset('patchPocketDepth', 150 * (1 + options.patchPocketDepth))
      void store.setIfUnset('patchPocketWidth', 150 * (1 + options.patchPocketWidth))
    }

    macro('patchpocket', {
      width: store.get('patchPocketWidth'),
      depth: store.get('patchPocketWidth'),
      bottomWidth: options.patchPocketBottomWidth,
      peakDepth: options.patchPocketPeakDepth,
      peakCurve: options.patchPocketPeakCurve,
      peakPlateau: options.patchPocketPeakPlateau,
      style: options.patchPocketStyle,
      folded: options.patchPocketFolded,
      grainlineBias: options.patchPocketGrainlineBias,
      topSaWidth: options.patchPocketTopSaWidth,
    })

    if (complete) {
      //title
      macro('title', {
        nr: 1,
        title: 'Patch Pocket',
        at: points.patchPocketTitle,
        scale: 0.5,
      })
    }

    return part
  },
}
