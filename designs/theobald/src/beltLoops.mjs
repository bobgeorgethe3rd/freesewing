import { pctBasedOn } from '@freesewing/core'
import { beltLoops as draftBeltLoops } from '@freesewing/beltloops'
import { flyShield } from './flyShield.mjs'

export const beltLoops = {
  name: 'theobald.beltLoops',
  after: flyShield,
  options: {
    //Imported
    ...draftBeltLoops.options,
    //Constants
    beltLoopNumber: 7, //locked for Theobald
    //Style
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
    const { macro, points, absoluteOptions, store, complete, part } = sh

    store.set('beltLoopLength', absoluteOptions.waistbandWidth * 2)
    store.set('beltLoopWidth', absoluteOptions.beltLoopWidth)

    draftBeltLoops.draft(sh)

    if (complete) {
      macro('title', {
        nr: 14,
        title: 'Belt Loops ',
        at: points.title,
        scale: 0.1,
      })
    }

    return part
  },
}
