import { pctBasedOn } from '@freesewing/core'
import { beltLoops as draftBeltLoops } from '@freesewing/beltloops'
import { belt } from './belt.mjs'

export const beltLoops = {
  name: 'shannon.beltLoops',
  after: belt,
  options: {
    //Imported
    ...draftBeltLoops.options,
    //Style
    beltLoops: { bool: false, menu: 'style' },
    beltLoopNumber: { count: 4, min: 1, max: 10, menu: 'style' }, //Altered for Shannon
    beltLoopType: { dflt: 'single', list: ['single', 'double'], menu: 'style' }, //Altered for Shannon
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
    store.set('beltLoopLength', store.get('beltWidth') * 2)
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
        cutNr: 1,
        scale: 0.1,
      })
    }

    return part
  },
}
