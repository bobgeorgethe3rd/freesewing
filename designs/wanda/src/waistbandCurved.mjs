import { waistband as waistbandC } from '@freesewing/waistbandcurved'
import { skirtBase } from './skirtBase.mjs'
import { placket } from './placket.mjs'

export const waistbandCurved = {
  name: 'wanda.waistbandCurved',
  after: [placket, skirtBase],
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
        nr: 4,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        at: points.title,
        scale: 0.1,
      })
      //pleat lines
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

      if (points.origin < points.bottomMid) {
        points.pleatFrom0 = points.origin.shiftOutwards(
          points.pleatTo0,
          points.topMid.dist(points.bottomMid)
        )
        points.pleatFrom1 = points.origin.shiftOutwards(
          points.pleatTo1,
          points.topMid.dist(points.bottomMid)
        )
      } else {
        points.pleatFrom0 = points.pleatTo0.shiftTowards(
          points.origin,
          points.topMid.dist(points.bottomMid)
        )
        points.pleatFrom1 = points.pleatTo1.shiftTowards(
          points.origin,
          points.topMid.dist(points.bottomMid)
        )
      }
      for (let i = 0; i < 2; i++) {
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
