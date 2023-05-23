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
  options: {
    //Style
    waistbandOverlapSide: {
      dflt: 'right',
      list: ['right', 'left'],
      menu: 'style',
    }, //altered for Wanda
    waistbandFolded: { bool: true, menu: 'style' }, //altered for Wanda
    //Construction
    waistbandClosurePosition: {
      dflt: 'back',
      list: ['back', 'sideLeft', 'sideRight'],
      menu: 'construction',
    }, //altered for Wanda
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
        nr: 4,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        at: points.title,
        scale: 0.1,
      })
      //pleat lines
      if (options.waistbandClosurePosition == 'back') {
        points.pleatFrom0 = points.topLeft.shiftFractionTowards(points.topLeftNotch, 0.5)
        points.pleatFrom1 = points.topRightNotch.shiftFractionTowards(points.topRight, 0.5)
      } else {
        if (options.waistbandClosurePosition == 'sideRight') {
          points.pleatFrom0 = points.topRightNotch.shiftFractionTowards(points.topMidNotch, 0.5)
          points.pleatFrom1 = points.topRightNotch.shiftFractionTowards(points.topRight, 0.5)
        } else {
          points.pleatFrom0 = points.topLeft.shiftFractionTowards(points.topLeftNotch, 0.5)
          points.pleatFrom1 = points.topLeftNotch.shiftFractionTowards(points.topMidNotch, 0.5)
        }
      }

      for (let i = 0; i < 2; i++) {
        points['pleatTo' + i] = new Point(points['pleatFrom' + i].x, points.bottomLeft.y)
        paths['pleatStart' + i] = new Path()
          .move(points['pleatFrom' + i])
          .line(points['pleatTo' + i])
          .attr('class', 'mark')
          .attr('data-text', 'Pleats Start')
          .attr('data-text-class', 'center')
      }
    }

    return part
  },
}
