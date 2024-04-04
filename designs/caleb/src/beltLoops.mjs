import { pctBasedOn } from '@freesewing/core'
import { beltLoops as draftBeltLoops } from '@freesewing/beltloops'
import { frontBase } from './frontBase.mjs'

export const beltLoops = {
  name: 'caleb.beltLoops',
  after: frontBase,
  options: {
    //Imported
    ...draftBeltLoops.options,
    //Constants
    beltLoopNumber: 7, //Locked for Caleb
    //Style
    beltLoopWidth: {
      pct: 1.9,
      min: 1,
      max: 2.5,
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

    draftBeltLoops.draft(sh)

    if (complete) {
      macro('title', {
        nr: 11,
        title: 'Belt Loops',
        at: points.title,
        scale: 0.1,
      })
    }

    return part
  },
}
