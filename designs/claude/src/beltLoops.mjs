import { pctBasedOn } from '@freesewing/core'
import { beltLoops as draftBeltLoops } from '@freesewing/beltloops'
import { skirtBase } from './skirtBase.mjs'

export const beltLoops = {
  name: 'claude.beltLoops',
  after: skirtBase,
  options: {
    //Imported
    ...draftBeltLoops.options,
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
  },
  draft: (sh) => {
    //draft
    const { macro, points, options, absoluteOptions, sa, store, complete, part } = sh

    let beltLoopSa = sa
    if (sa == 0) {
      beltLoopSa = 10
    }
    store.set('beltLoopLength', absoluteOptions.waistbandWidth * 2 + beltLoopSa)
    store.set('beltLoopWidth', absoluteOptions.beltLoopWidth)

    if (options.beltLoops) {
      draftBeltLoops.draft(sh)
    } else {
      part.hide()
      return part
    }
    if (complete) {
      macro('title', {
        nr: 8,
        title: 'Belt Loops',
        at: points.title,
        scale: 0.1,
      })
    }

    return part
  },
}
