import { waistband as waistbandC } from '@freesewing/waistbandcurved'
import { skirtBase } from './skirtBase.mjs'
import { waistbandStraight } from './waistbandStraight.mjs'
import { backPanel } from './backPanel.mjs'
import { placket } from '@freesewing/wanda'

export const waistbandCurved = {
  name: 'fallon.waistbandCurved',
  after: [waistbandStraight, placket, backPanel, skirtBase],
  from: waistbandC,
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
    if (options.waistbandStyle != 'curved' || !measurements.waistToHips || !measurements.hips) {
      part.hide()
      return part
    }

    if (complete) {
      //title
      macro('title', {
        nr: 8,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        at: points.title,
        scale: 0.1,
      })
    }

    return part
  },
}
