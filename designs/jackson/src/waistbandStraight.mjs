import { waistband as draftWaistbandStraight } from '@freesewing/waistbandstraight'
import { flyShield } from './flyShield.mjs'

export const waistbandStraight = {
  name: 'jackson.waistbandStraight',
  from: draftWaistbandStraight,
  after: flyShield,
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
    if (options.waistbandStyle != 'straight') {
      part.hide()
      return part
    }

    if (complete) {
      //title
      macro('title', {
        nr: 12,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        at: points.title,
        scale: 1 / 3,
      })
    }

    return part
  },
}
