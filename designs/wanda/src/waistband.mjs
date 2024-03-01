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
  },
  after: [skirtBase, placket],
  plugins: [...waistbandStraight.plugins, ...waistbandCurved.plugins],
  draft: (sh) => {
    const { macro, points, Point, paths, Path, utils, options, measurements, complete, part } = sh

    if (options.waistbandStyle == 'none') {
      part.hide()
      return part
    } else {
      if (options.waistbandStyle == 'straight' || !measurements.waistToHips || !measurements.hips)
        waistbandStraight.draft(sh)
      else waistbandCurved.draft(sh)
    }

    if (complete) {
      if (options.waistbandStyle == 'straight' || !measurements.waistToHips || !measurements.hips) {
        //pleat lines
        if (options.closurePosition == 'back') {
          points.pleatFrom0 = points.waistbandTopLeft.shiftFractionTowards(
            points.waistbandTopLeftNotch,
            0.5
          )
          points.pleatFrom1 = points.waistbandTopRightNotch.shiftFractionTowards(
            points.waistbandTopRight,
            0.5
          )
        } else {
          if (options.closurePosition == 'sideRight') {
            points.pleatFrom0 = points.waistbandTopRightNotch.shiftFractionTowards(
              points.waistbandTopMidNotch,
              0.5
            )
            points.pleatFrom1 = points.waistbandTopRightNotch.shiftFractionTowards(
              points.waistbandTopRight,
              0.5
            )
          } else {
            points.pleatFrom0 = points.waistbandTopLeft.shiftFractionTowards(
              points.waistbandTopLeftNotch,
              0.5
            )
            points.pleatFrom1 = points.waistbandTopLeftNotch.shiftFractionTowards(
              points.waistbandTopMidNotch,
              0.5
            )
          }
        }

        for (let i = 0; i < 2; i++) {
          points['pleatTo' + i] = new Point(points['pleatFrom' + i].x, points.waistbandBottomLeft.y)
        }
      } else {
        if (options.closurePosition == 'back') {
          points.pleatTo0 = paths.waistbandBottomCurve.shiftFractionAlong(1 / 8)
          points.pleatTo1 = paths.waistbandBottomCurve.shiftFractionAlong(7 / 8)
        } else {
          if (options.closurePosition == 'sideRight') {
            points.pleatTo0 = paths.waistbandBottomCurve.shiftFractionAlong(5 / 8)
            points.pleatTo1 = paths.waistbandBottomCurve.shiftFractionAlong(7 / 8)
          } else {
            points.pleatTo0 = paths.waistbandBottomCurve.shiftFractionAlong(1 / 8)
            points.pleatTo1 = paths.waistbandBottomCurve.shiftFractionAlong(3 / 8)
          }
        }

        for (let i = 0; i < 2; i++) {
          if (points.waistbandOrigin < points.waistbandBottomMid) {
            points['pleatFrom' + i] = points.waistbandOrigin.shiftOutwards(
              points['pleatTo' + i],
              points.waistbandTopMid.dist(points.waistbandBottomMid)
            )
          } else {
            points['pleatFrom' + i] = points['pleatTo' + i].shiftTowards(
              points.waistbandOrigin,
              points.waistbandTopMid.dist(points.waistbandBottomMid)
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
        nr: 7,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        at: points.title,
        scale: 0.1,
      })
    }
    return part
  },
}
