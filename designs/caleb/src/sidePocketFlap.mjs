import { pluginMirror } from '@freesewing/plugin-mirror'
import { pluginPatchPocket } from '@freesewing/plugin-patchpocket'
import { pluginPatchPocketFlap } from '@freesewing/plugin-patchpocketflap'
import { back } from './back.mjs'
import { sidePocket } from './sidePocket.mjs'

export const sidePocketFlap = {
  name: 'caleb.sidePocketFlap',
  after: [back, sidePocket],
  options: {
    //Pockets
    sidePocketFlapsBool: { bool: true, menu: 'pockets.sidePockets' },
    sidePocketFlapStyle: {
      dflt: 'straight',
      list: ['straight', 'curved'],
      menu: 'pockets.sidePocketsFlaps',
    },
    sidePocketFlapDepth: { pct: 35.2, min: 0, max: 50, menu: 'pockets.sidePocketsFlaps' },
    sidePocketFlapPeakDepth: { pct: 30.8, min: 0, max: 100, menu: 'pockets.sidePocketsFlaps' },
    sidePocketFlapPeakCurve: { pct: 100, min: 0, max: 100, menu: 'pockets.sidePocketsFlaps' },
    sidePocketFlapPeakPlateau: { bool: true, menu: 'pockets.sidePocketsFlaps' },
  },
  plugins: [pluginMirror, pluginPatchPocket, pluginPatchPocketFlap],
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
    if (!options.sidePocketsBool || !options.sidePocketFlapsBool) {
      part.hide()
      return part
    }

    macro('patchpocket', {
      width: store.get('sidePocketWidth'),
      depth: store.get('sidePocketDepth'),
      peakDepth: 0,
      style: 'straight',
      topSaWidth: options.sidePocketTopSaWidth,
      prefix: 'sidePocket',
    })

    macro('patchpocketflap', {
      depth: options.sidePocketFlapDepth,
      peakDepth: options.sidePocketFlapPeakDepth,
      peakCurve: options.sidePocketFlapPeakCurve,
      style: options.sidePocketFlapStyle,
      peakPlateau: options.sidePocketFlapPeakPlateau,
      independent: true,
      prefix: 'sidePocket',
    })

    if (complete) {
      //title
      macro('title', {
        nr: 10,
        title: 'Side Pocket Flap',
        at: points.sidePocketPatchPocketFlapTitle,
        scale: 0.5,
      })
    }

    return part
  },
}
