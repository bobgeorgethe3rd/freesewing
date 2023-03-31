import { waistband as waistbandS } from '@freesewing/waistbandstraight'
import { flyShield } from './flyShield.mjs'

export const waistbandStraight = {
  name: 'jackson.waistbandStraight',
  from: waistbandS,
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

    return part
  },
}
