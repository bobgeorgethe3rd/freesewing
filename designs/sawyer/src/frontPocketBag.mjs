import { frontPocketBag as frontPocketBagPaul } from '@freesewing/paul'
import { back } from './back.mjs'

export const frontPocketBag = {
  name: 'sawyer.frontPocketBag',
  from: frontPocketBagPaul,
  after: back,
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
    if (!options.frontPocketsBool) {
      part.hide()
      return part
    }

    delete paths.facingLine

    if (complete) {
      macro('title', {
        nr: 4,
        title: 'Front Pocket Bag',
        at: points.title,
        cutNr: 4,
        scale: 0.5,
        rotation: 90 - points.frontPocketBottomRight.angle(points.frontPocketWaist),
      })
    }
    return part
  },
}
