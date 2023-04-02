import { base } from './base.mjs'

export const centreFront = {
  name: 'calanthe.centreFront',
  options: {},
  measurements: ['buskLength'],
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
  }) => {
    //removing paths and snippets not required from Dalton
    for (let i in paths) delete paths[i]
    //let's begin

    return part
  },
}
