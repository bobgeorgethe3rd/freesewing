import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginMirror } from '@freesewing/plugin-mirror'
import { pluginPatchPocketFlap } from '@freesewing/plugin-patchpocketflap'
import { pocket } from './pocket.mjs'

export const pocketFlap = {
  name: 'patchpocket.pocketFlap',
  from: pocket,
  options: {
    //Pockets
    patchPocketFlapStyle: {
      dflt: 'curved',
      list: ['straight', 'curved'],
      menu: 'pockets.patchPocketsFlaps',
    },
    patchPocketFlapDepth: { pct: 20, min: 0, max: 50, menu: 'pockets.patchPocketsFlaps' },
    patchPocketFlapPeakDepth: { pct: 50, min: 0, max: 100, menu: 'pockets.patchPocketsFlaps' },
    patchPocketFlapBottomWidth: { pct: 100, min: 50, max: 200, menu: 'pockets.patchPocketsFlaps' },
    patchPocketFlapPeakCurve: { pct: 100, min: 0, max: 100, menu: 'pockets.patchPocketsFlaps' },
    patchPocketFlapPeakPlateau: { bool: true, menu: 'pockets.patchPocketsFlaps' },
    independentPatchPocketFlap: { bool: false, menu: 'pockets.patchPocketsFlaps' },
  },
  plugins: [pluginBundle, pluginMirror, pluginPatchPocketFlap],
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
    //options
    let patchPocketFlapPeakDepth
    let patchPocketFlapPeakCurve
    let patchPocketFlapPeakPlateau
    if (!options.independentPatchPocketFlap) {
      options.patchPocketFlapStyle = options.patchPocketStyle
      patchPocketFlapPeakPlateau = options.patchPocketPeakPlateau

      if (options.patchPocketPeakDepth != 0) {
        patchPocketFlapPeakDepth = options.patchPocketPeakDepth
      } else {
        patchPocketFlapPeakDepth = 0
      }

      if (options.patchPocketPeakCurve != 0) {
        patchPocketFlapPeakCurve = options.patchPocketPeakCurve
      } else {
        patchPocketFlapPeakCurve = 0
      }
    } else {
      patchPocketFlapPeakDepth = options.patchPocketFlapPeakDepth
      patchPocketFlapPeakCurve = options.patchPocketFlapPeakCurve
      patchPocketFlapPeakPlateau = options.patchPocketFlapPeakPlateau
    }
    //measures
    macro('patchpocketflap', {
      depth: options.patchPocketFlapDepth,
      bottomWidth: options.patchPocketFlapBottomWidth,
      peakDepth: patchPocketFlapPeakDepth,
      peakCurve: patchPocketFlapPeakCurve,
      peakPlateau: patchPocketFlapPeakPlateau,
      style: options.patchPocketFlapStyle,
      independent: options.independentPatchPocketFlap,
    })

    /* if (complete) {
	//title
      macro('title', {
        nr: 2,
        title: 'Patch Pocket Flap',
        at: points.patchPocketFlaptitle,
        scale: 1 / 3,
      })
} */
    return part
  },
}
