import { waistband as waistbandS } from '@freesewing/waistbandstraight'
import { skirtBase } from './skirtBase.mjs'
import { placket } from './placket.mjs'

export const waistbandStraight = {
  name: 'wanda.waistbandStraight',
  after: [placket, skirtBase],
  from: waistbandS,
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
    log,
    absoluteOptions,
  }) => {
    //set Render
    if (
      (options.waistbandStyle != 'straight' && options.calculateWaistbandDiff) ||
      !options.waistband
    ) {
      part.hide()
      return part
    }

    if (complete) {
      //title
      macro('title', {
        nr: 6,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        at: points.title,
        scale: 0.1,
      })
    }

    return part
  },
}
