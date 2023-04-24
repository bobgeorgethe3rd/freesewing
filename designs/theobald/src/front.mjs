import { front as daltonFront } from '@freesewing/dalton'
import { backBase } from './backBase.mjs'

export const frontBase = {
  name: 'theobald.frontBase',
  from: daltonFront,
  after: backBase,
  hide: {
    from: true,
  },
  options: {
    //Style
    frontPleats: { bool: true, menu: 'style' },
    //Pockets
    frontPocketsBool: { bool: true, menu: 'pockets' },
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
    Snippet,
    absoluteOptions,
  }) => {
    //removing paths and snippets not required from Dalton
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //measurements

    //let's begin

    if (complete) {
      if (sa) {
      }
    }

    return part
  },
}
