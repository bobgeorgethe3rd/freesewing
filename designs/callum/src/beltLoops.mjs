import { pctBasedOn } from '@freesewing/core'
import { beltLoops as draftBeltLoops } from '@freesewing/beltloops'
import { frontBase } from './frontBase.mjs'

export const beltLoops = {
  name: 'callum.beltLoops',
  after: frontBase,
  options: {
    //Imported
    ...draftBeltLoops.options,
    //Constants
    beltLoopNumber: 7, //Locked for Callum
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
    store.set('beltLoopLength', absoluteOptions.waistbandWidth * 2 + beltLoopSa * 2)
    store.set('beltLoopWidth', absoluteOptions.beltLoopWidth)

    draftBeltLoops.draft(sh)

    if (complete) {
      macro('title', {
        nr: 'X',
        title: 'Belt Loops',
        at: points.title,
        cutNr: 1,
        scale: 0.1,
      })
    }

    return part
  },
}
