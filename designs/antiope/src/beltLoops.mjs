import { pctBasedOn } from '@freesewing/core'
import { beltLoops as draftBeltLoops } from '@freesewing/beltloops'
import { back } from './back.mjs'

export const beltLoops = {
  name: 'antiope.beltLoops',
  after: back,
  options: {
    //Imported
    ...draftBeltLoops.options,
    //Constants
    //Style
    beltLoops: { bool: false, menu: 'style' },
    beltLoopWidth: {
      pct: 1.3,
      min: 1,
      max: 2,
      snap: 5,
      ...pctBasedOn('waist'),
      menu: 'style',
    },
    beltLoopLength: { pct: 4, min: 0.5, max: 10, menu: 'style' },
  },
  draft: (sh) => {
    //draft
    const { macro, points, options, absoluteOptions, sa, store, complete, part } = sh

    if (!options.beltLoops) {
      part.hide()
      return part
    }

    let beltLoopSa = sa
    if (sa == 0) {
      beltLoopSa = 10
    }
    store.set(
      'beltLoopLength',
      absoluteOptions.waistbandWidth * options.beltLoopLength * 100 + beltLoopSa
    )
    store.set('beltLoopWidth', absoluteOptions.beltLoopWidth)

    draftBeltLoops.draft(sh)

    if (complete) {
      macro('title', {
        nr: 10,
        title: 'Belt Loops',
        at: points.title,
        cutNr: 1,
        scale: 0.1,
      })
    }

    return part
  },
}
