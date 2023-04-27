import { pocket as draftPocket } from '@freesewing/weltpocket'
import { back } from './back.mjs'

export const backPocketBag = {
  name: 'theobald.backPocketBag',
  from: draftPocket,
  after: back,
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
        nr: 4,
        title: 'Back Pocket Bag',
        at: points.title,
        scale: 0.75,
      })
    }

    return part
  },
}
