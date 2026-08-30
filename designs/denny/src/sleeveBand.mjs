import { pctBasedOn } from '@freesewing/core'
import { pluginBandStraight } from '@freesewing/plugin-bandstraight'
import { sleeveBase } from './sleeveBase.mjs'

export const sleeveBand = {
  name: 'denny.sleeveBand',
  after: sleeveBase,
  hide: {
    after: true,
    inherited: true,
  },
  options: {
    sleeveBandFolded: { bool: false, menu: 'sleeves' },
  },
  plugins: [pluginBandStraight],
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    absoluteOptions,
    complete,
    paperless,
    macro,
    measurements,
    part,
    snippets,
    Snippet,
    log,
    utils,
  }) => {
    macro('bandstraight', {
      length: store.get('sleeveBandLength'),
      lengthBack: store.get('sleeveBandBack'),
      width: store.get('sleeveBandWidth'),
      placketWidth: store.get('sleeveBandWidth'),
      // overlap: store.get('neckbandOverlap'),
      overlapSide: 'right',
      folded: options.sleeveBandFolded,
      closurePosition: 'sideRight',
      leftGuide: false,
      rightGuide: false,
      east: 'Vent',
      west: 'Side Seam',
      prefix: 'sleeveBand',
    })

    if (complete) {
      macro('title', {
        at: points.title,
        nr: 11,
        title: 'Sleeve Band',
        cutNr: options.sleeveBandFolded ? 1 : 2,
        scale: 0.25,
      })
    }

    return part
  },
}
