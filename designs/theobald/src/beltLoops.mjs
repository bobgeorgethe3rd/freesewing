import { beltLoops as draftBeltLoops } from '@freesewing/beltloops'
import { flyShield } from './flyShield.mjs'

export const beltLoops = {
  name: 'theobald.beltLoops',
  from: draftBeltLoops,
  after: flyShield,
  hide: {
    from: true,
  },
  options: {
    beltLoopNumber: 7, //locked for Theobald
  },
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    complete,
    paperless,
    macro,
    utils,
    measurements,
    part,
    snippets,
    log,
    absoluteOptions,
  }) => {
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
