import { pctBasedOn } from '@freesewing/core'
import { beltLoops as draftBeltLoops } from '@freesewing/beltloops'
import { back } from './back.mjs'

export const beltLoops = {
  name: 'theobald.beltLoops',
  after: back,
  options: {
    //Imported
    ...draftBeltLoops.options,
    //Style
    beltLoopNumber: { count: 7, min: 1, max: 10, menu: 'style' },
    beltLoops: { bool: true, menu: 'style' },
    beltLoopWidth: {
      pct: 1.1,
      min: 1,
      max: 2,
      snap: 5,
      ...pctBasedOn('waist'),
      menu: 'style',
    },
  },
  draft: (sh) => {
    //draft
    const { macro, points, options, absoluteOptions, store, complete, part } = sh

    store.set('beltLoopLength', absoluteOptions.waistbandWidth * 2)
    store.set('beltLoopWidth', absoluteOptions.beltLoopWidth)

    if (options.beltLoops) {
      draftBeltLoops.draft(sh)
    } else {
      return part
    }

    if (complete) {
      macro('title', {
        nr: 6,
        title: 'Belt Loops',
        at: points.title,
        scale: 0.1,
      })
    }

    return part
  },
}
