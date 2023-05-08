import { waistband as draftWaistbandStraight } from '@freesewing/waistbandstraight'
import { skirtBase } from './skirtBase.mjs'
import { placket } from './placket.mjs'

export const waistbandStraight = {
  name: 'claude.waistbandStraight',
  from: draftWaistbandStraight,
  after: [skirtBase, placket],
  options: {
    //Style
    waistbandOverlapSide: { dflt: 'right', list: ['left', 'right'], menu: 'style' },
  },
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
        nr: 4,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        at: points.title,
        scale: 1 / 3,
      })
    }

    return part
  },
}
