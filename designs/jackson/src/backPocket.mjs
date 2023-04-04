import { pocket } from '@freesewing/patchpocket'
import { back } from './back.mjs'

export const backPocket = {
  name: 'jackson.backPocket',
  from: pocket,
  after: back,
  hide: {
    from: true,
  },
  options: {
    //Constants
    patchPocketPeakPlateau: false, //locked for Jackson
    patchPocketPeakCurve: 1, //locked for Jackson
    patchPocketStyle: 'straight', //locked for Jackson
    patchPocketGrainlineBias: false, //locked for Jackson
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
        nr: 3,
        title: 'Back Pocket',
        at: points.title,
        scale: 0.5,
      })
    }

    return part
  },
}
