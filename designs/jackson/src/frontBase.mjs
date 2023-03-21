import { front as daltonFront } from '@freesewing/dalton'
import { backBase } from './backBase.mjs'

export const frontBase = {
  name: 'jackson.frontBase',
  from: daltonFront,
  after: backBase,
  hide: {
    from: true,
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
  }) => {
    //removing paths and snippets not required from Titan
    // for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Titan
    macro('title', false)
    macro('scalebox', false)

    return part
  },
}
