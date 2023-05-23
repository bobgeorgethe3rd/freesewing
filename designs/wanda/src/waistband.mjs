import { waistband as waistbandStraight } from '@freesewing/waistbandstraight'
import { waistband as waistbandCurved } from '@freesewing/waistbandcurved'
import { skirtBase } from './skirtBase.mjs'
import { placket } from './placket.mjs'

export const waistband = {
  name: 'wanda.waistband',
  options: {
    //Imported
    ...waistbandStraight.options,
    ...waistbandCurved.options,
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
  after: [skirtBase, placket],
  draft: (sh) => {
    const { macro, points, Point, paths, Path, utils, options, measurements, complete, part } = sh

    if (options.waistbandStyle == 'straight' || !measurements.waistToHips || !measurements.hips)
      waistbandStraight.draft(sh)
    else waistbandCurved.draft(sh)

    if (complete) {
      if (options.waistbandStyle == 'straight' || !measurements.waistToHips || !measurements.hips) {
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
        }
      } else {
        if (options.waistbandClosurePosition == 'back') {
          points.pleatTo0 = paths.bottomCurve.shiftFractionAlong(1 / 8)
          points.pleatTo1 = paths.bottomCurve.shiftFractionAlong(7 / 8)
        } else {
          if (options.waistbandClosurePosition == 'sideRight') {
            points.pleatTo0 = paths.bottomCurve.shiftFractionAlong(5 / 8)
            points.pleatTo1 = paths.bottomCurve.shiftFractionAlong(7 / 8)
          } else {
            points.pleatTo0 = paths.bottomCurve.shiftFractionAlong(1 / 8)
            points.pleatTo1 = paths.bottomCurve.shiftFractionAlong(3 / 8)
          }
        }

        for (let i = 0; i < 2; i++) {
          if (points.origin < points.bottomMid) {
            points['pleatFrom' + i] = points.origin.shiftOutwards(
              points['pleatTo' + i],
              points.topMid.dist(points.bottomMid)
            )
          } else {
            points['pleatFrom' + i] = points['pleatTo' + i].shiftTowards(
              points.origin,
              points.topMid.dist(points.bottomMid)
            )
          }
        }
      }
      //pleat lines

      for (let i = 0; i < 2; i++) {
        paths['pleatStart' + i] = new Path()
          .move(points['pleatFrom' + i])
          .line(points['pleatTo' + i])
          .attr('class', 'mark')
          .attr('data-text', 'Pleats Start')
          .attr('data-text-class', 'center')
      }
      //title
      macro('title', {
        nr: 4,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        at: points.title,
        scale: 0.1,
      })
    }
    return part
  },
}
