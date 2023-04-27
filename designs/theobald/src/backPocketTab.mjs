import { tab as draftTab } from '@freesewing/weltpocket'
import { backPocketWelt } from './backPocketWelt.mjs'

export const backPocketTab = {
  name: 'theobald.backPocketTab',
  from: draftTab,
  after: backPocketWelt,
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
        nr: 5,
        title: 'Back Pocket Tab',
        at: points.title,
        scale: 0.25,
      })
    }

    return part
  },
}
