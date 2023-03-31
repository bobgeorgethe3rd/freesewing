import { waistband as waistbandC } from '@freesewing/waistbandcurved'
import { flyShield } from './flyShield.mjs'

export const waistbandCurved = {
  name: 'jackson.waistbandCurved',
  from: waistbandC,
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

    return part
  },
}
