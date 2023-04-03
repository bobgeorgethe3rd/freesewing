import { beltLoops as blBeltLoops } from '@freesewing/beltloops'
import { flyShield } from './flyShield.mjs'

export const beltLoops = {
  name: 'jackson.beltLoops',
  from: blBeltLoops,
  after: flyShield,
  hide: {
    from: true,
  },
  options: {
    beltLoopNumber: 5, //locked for Jackson
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
        nr: 11,
        title: 'Belt Loops ',
        at: points.title,
        scale: 0.1,
      })
    }

    return part
  },
}
