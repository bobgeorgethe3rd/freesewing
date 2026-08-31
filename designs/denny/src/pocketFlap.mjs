import { pluginPatchPocketFlap } from '@freesewing/plugin-patchpocketflap'
import { pocket } from './pocket.mjs'

export const pocketFlap = {
  name: 'denny.pocketFlap',
  from: pocket,
  options: {
    //Constants
    frontPocketFlapTopSaWidth: 0.01, //Locked for Denny,
    frontPocketFlapSaWidth: 0.01, //Locked for Denny,
    //Pockets
    independentFrontPocketFlap: { bool: false, menu: 'pockets.frontPocketsFlaps' },
    frontPocketFlapPeakDepth: { pct: 50, min: 0, max: 100, menu: 'pockets.frontPocketsFlaps' },
    frontPocketFlapBottomWidth: { pct: 100, min: 50, max: 200, menu: 'pockets.frontPocketsFlaps' },
    frontPocketFlapPeakCurve: { pct: 100, min: 0, max: 100, menu: 'pockets.frontPocketsFlaps' },
    frontPocketFlapPeakPlateau: { bool: false, menu: 'pockets.frontPocketsFlaps' },
    frontPocketFlapStyle: {
      dflt: 'straight',
      list: ['straight', 'curved'],
      menu: 'pockets.frontPocketsFlaps',
    },
    frontPocketFlapDepth: { pct: 25, min: 10, max: 50, menu: 'pockets.frontPocketsFlaps' },
  },
  plugins: [pluginPatchPocketFlap],
  draft: (sh) => {
    //draft
    const { points, options, complete, macro, sa, store, part } = sh
    if (!options.frontPocketsBool) {
      part.hide()
      return part
    }

    void store.setIfUnset(
      'frontPocketFlapBottomWidth',
      store.get('frontPocketWidth') * options.frontPocketFlapBottomWidth
    )

    macro('patchpocketflap', {
      depth: options.frontPocketFlapDepth,
      bottomWidth: store.get('frontPocketFlapBottomWidth') / store.get('frontPocketWidth'),
      peakDepth: options.independentFrontPocketFlap
        ? options.frontPocketFlapPeakDepth
        : options.frontPocketPeakDepth,
      peakCurve: options.independentFrontPocketFlap ? options.frontPocketFlapPeakCurve : 1,
      peakPlateau: options.independentFrontPocketFlap ? options.frontPocketFlapPeakPlateau : false,
      style: options.independentFrontPocketFlap ? options.frontPocketFlapStyle : 'straight',
      independent: options.independentFrontPocketFlap,
      topSaWidth: sa * options.frontPanelSaWidth * 100,
      saWidth: sa,
      prefix: 'front',
    })

    if (complete) {
      //title
      macro('title', {
        nr: 17,
        title: 'Pocket Flap',
        at: points.frontPatchPocketFlapTitle,
        cutNr: 4,
        scale: 1 / 3,
      })
    }

    return part
  },
}
