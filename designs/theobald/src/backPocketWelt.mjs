import { welt as draftWelt } from '@freesewing/weltpocket'
import { backPocketBag } from './backPocketBag.mjs'

export const backPocketWelt = {
  name: 'theobald.backPocketWelt',
  from: draftWelt,
  after: backPocketBag,
  hide: {
    from: true,
  },
  options: {},
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
    //set Render
    if (!options.backPocketsBool) {
      part.hide()
      return part
    }

    if (complete) {
      //title
      macro('title', {
        nr: 3,
        title: 'Back Pocket Welt',
        at: points.title,
        scale: 0.25,
      })
    }

    return part
  },
}
