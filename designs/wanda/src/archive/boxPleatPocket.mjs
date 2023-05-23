import { pocket as draftBoxPleatPocket } from '@freesewing/boxpleatpocket'
import { skirtBase } from './skirtBase.mjs'

export const boxPleatPocket = {
  name: 'wanda.boxPleatPocket',
  from: draftBoxPleatPocket,
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
    if (options.pocketStyle != 'boxPleat' || !options.pocketsBool) {
      part.hide()
      return part
    }

    //stores
    store.set(
      'pocketOpeningLength',
      store.get('pocketOpening') + points.openingTop.dist(points.openingBottom)
    )

    if (complete) {
      //title
      macro('title', {
        nr: 6,
        title: 'Box Pleat Pocket',
        at: points.title,
        scale: 0.75,
      })
    }

    return part
  },
}
