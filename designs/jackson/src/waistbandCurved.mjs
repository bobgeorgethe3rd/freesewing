import { waistband as draftWaistbandCurved } from '@freesewing/waistbandcurved'
import { flyShield } from './flyShield.mjs'

export const waistbandCurved = {
  name: 'jackson.waistbandCurved',
  from: draftWaistbandCurved,
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
    //set render
    if (options.waistbandStyle != 'curved') {
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
