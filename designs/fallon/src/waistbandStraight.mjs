import { waistband as waistbandS } from '@freesewing/waistbandstraight'
import { skirtBase } from './skirtBase.mjs'
import { backPanel } from './backPanel.mjs'
import { placket } from '@freesewing/wanda'

export const waistbandStraight = {
  name: 'fallon.waistbandStraight',
  after: [placket, backPanel, skirtBase],
  from: waistbandS,
  hide: {
    from: true,
  },
  options: {
    //Style
    waistbandOverlapSide: {
      dflt: 'right',
      list: ['right', 'left'],
      menu: 'style',
    }, //altered for  Fallon
    waistbandFolded: { bool: true, menu: 'style' }, //altered for Fallon
    //Construction
    waistbandClosurePosition: {
      dflt: 'back',
      list: ['back', 'sideLeft', 'sideRight'],
      menu: 'construction',
    }, //altered for Fallon
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
      (options.waistbandStyle != 'straight' && measurements.waistToHips && measurements.hips) ||
      options.waistbandStyle == 'none'
    ) {
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
      //pleat lines
    }

    return part
  },
}
