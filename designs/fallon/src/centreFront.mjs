import { skirtBase } from './skirtBase'
import { inseamPocket } from '@freesewing/wanda'
import { boxPleatPocket } from '@freesewing/wanda'
import { pearPocket } from '@freesewing/wanda'

export const centreFront = {
  name: 'fallon.centreFront',
  from: skirtBase,
  after: [inseamPocket, boxPleatPocket, pearPocket],
  // hide: {
  // from: true,
  // },
  options: {
    //Construction
    seam: { dflt: 'all', list: ['all', 'sideSeam', 'sideFront', 'none'], menu: 'construction' },
    skirtHemWidth: { pct: 1, min: 0, max: 10, menu: 'construction' },
    waistFacingHemWidth: { pct: 2, min: 1, max: 10, menu: 'construction' },
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
    log,
  }) => {
    //removing paths
    for (let i in paths) delete paths[i]
    //measures
    const skirtHemFacingWidth = store.get('skirtHemFacingWidth')
    //let's begin
    //paths

    if (complete) {
      if (sa) {
      }
    }

    return part
  },
}
