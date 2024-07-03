import { waistband as waistbandStraight } from '@freesewing/waistbandstraight'
import { waistband as waistbandCurved } from '@freesewing/waistbandcurved'
import { leg } from './leg.mjs'

export const waistband = {
  name: 'heleanor.waistband',
  options: {
    //Imported
    ...waistbandStraight.options,
    ...waistbandCurved.options,
    //Constants
    useVoidStores: false,
    closurePosition: 'front',
    //Style
    waistbandPlacketWidth: { pct: (1 / 3) * 100, min: 10, max: 50, menu: 'style' },
    waistbandFolded: { bool: true, menu: 'style' },
    waistbandPlacket: { bool: false, menu: 'style' },
  },
  after: [leg],
  plugins: [...waistbandStraight.plugins, ...waistbandCurved.plugins],
  draft: (sh) => {
    const { macro, points, paths, snippets, utils, options, measurements, store, complete, part } =
      sh

    if (!options.fitWaist && !options.waistbandPlacket) {
      store.set('waistbandOverlap', 0)
      options.closurePosition = 'back'
    } else
      store.set(
        'waistbandPlacketWidth',
        store.get('seatGussetTopWidth') * options.waistbandPlacketWidth
      )
    store.set('waistbandMaxButtons', 1)
    if (options.waistbandStyle == 'straight' || !measurements.waistToHips || !measurements.hips)
      waistbandStraight.draft(sh)
    else waistbandCurved.draft(sh)

    const deletePaths = ['waistbandLeft', 'waistbandRight']
    for (const name in paths) {
      if (deletePaths.indexOf(name) >= 0) delete paths[name]
    }
    const keepSnippets = [
      'waistbandButtonPlacket',
      'waistbandButtonPlacketF',
      'waistbandButtonholePlacket',
      'waistbandButtonholePlacketF',
      'waistbandButtonholeOverlap0',
      'waistbandButtonholeOverlapF0',
      'waistbandButtonOverlap0',
      'waistbandButtonOverlapF0',
    ]
    for (const name in snippets) {
      if (keepSnippets.indexOf(name) === -1) delete snippets[name]
    }

    if (complete) {
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['waistbandTopMidNotch', 'waistbandBottomMidNotch'],
      })
      if (points.waistbandTopLeftEx.dist(points.waistbandTopLeft) > 0) {
        macro('sprinkle', {
          snippet: 'notch',
          on: ['waistbandTopLeft', 'waistbandBottomLeft'],
        })
      }
      if (points.waistbandTopRightEx.dist(points.waistbandTopRight) > 0) {
        macro('sprinkle', {
          snippet: 'notch',
          on: ['waistbandTopRight', 'waistbandBottomRight'],
        })
      }
      //title
      macro('title', {
        nr: 4,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        at: points.title,
        scale: 1 / 3,
      })
      if (paths.waistbandLeftEx) paths.waistbandLeftEx.attr('data-text', 'Seam - line', true)
      if (paths.waistbandRightEx) paths.waistbandRightEx.attr('data-text', 'Seam - line', true)
    }
    return part
  },
}
