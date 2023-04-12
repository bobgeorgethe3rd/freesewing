import { pocket as draftPearPocket } from '@freesewing/pearpocket'
import { skirtBase } from './skirtBase.mjs'

export const pearPocket = {
  name: 'wanda.pearPocket',
  from: draftPearPocket,
  after: skirtBase,
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
    if (options.pocketStyle != 'pear' || !options.pocketsBool) {
      part.hide()
      return part
    }

    //stores
    store.set('pocketOpeningLength', points.slitTop.dist(points.slitBottom))

    if (complete) {
      //title
      macro('title', {
        nr: 6,
        title: 'Pear Shaped Pocket',
        at: points.title,
        scale: 0.75,
      })
    }

    return part
  },
}
