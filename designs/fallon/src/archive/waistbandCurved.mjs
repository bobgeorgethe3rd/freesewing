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
    //measures
    let width
    if (points.topLeft.x < points.bottomLeft.x) {
      width = store.get('waistbandWidth') * -1
    } else width = store.get('waistbandWidth')
    if (complete) {
      //lines
      if (options.seams == 'none' || options.seams == 'sideFront') {
        if (options.waistbandClosurePosition != 'back') {
          let leftName
          let rightName
          let midName
          if (options.waistbandClosurePosition == 'sideRight') {
            leftName = 'Side Dart'
            rightName = 'Centre Back'
            midName = 'Centre Front'

            points.bottomLeftNotch = paths.bottomCurve.shiftFractionAlong(1 / 6)
            points.bottomMidNotch = paths.bottomCurve.shiftFractionAlong(5 / 12)
            points.bottomCNotch = paths.bottomCurve.shiftFractionAlong(2 / 3)
            points.bottomRightNotch = paths.bottomCurve.shiftFractionAlong(11 / 12)

            if (paths.rightEx) {
              if (options.waistbandOverlapSide == 'right' && options.pleats) {
                delete paths.rightEx
              } else {
                paths.rightEx.attr('data-text', 'Side Back', true)
              }
            }
          } else {
            leftName = 'Centre Back'
            rightName = 'Centre Front'
            midName = 'Side Dart'

            points.bottomLeftNotch = paths.bottomCurve.shiftFractionAlong(1 / 12)
            points.bottomMidNotch = paths.bottomCurve.shiftFractionAlong(1 / 3)
            points.bottomRightNotch = paths.bottomCurve.shiftFractionAlong(7 / 12)
            points.bottomCNotch = paths.bottomCurve.shiftFractionAlong(5 / 6)

            if (paths.leftEx) {
              if (options.waistbandOverlapSide == 'left' && options.pleats) {
                delete paths.leftEx
              } else {
                paths.leftEx.attr('data-text', 'Side Back', true)
              }
            }
          }
          points.topLeftNotch = points.bottomLeftNotch.shiftTowards(points.origin, width)
          points.topRightNotch = points.bottomRightNotch.shiftTowards(points.origin, width)
          points.topMidNotch = points.bottomMidNotch.shiftTowards(points.origin, width)
          points.topCNotch = points.bottomCNotch.shiftTowards(points.origin, width)

          paths.mid = new Path()
            .move(points.topMidNotch)
            .line(points.bottomMidNotch)
            .attr('class', 'various')
            .attr('data-text', midName)
            .attr('data-text-class', 'center')

          paths.left = new Path()
            .move(points.topLeftNotch)
            .line(points.bottomLeftNotch)
            .attr('class', 'various')
            .attr('data-text', leftName)
            .attr('data-text-class', 'center')

          paths.right = new Path()
            .move(points.topRightNotch)
            .line(points.bottomRightNotch)
            .attr('class', 'various')
            .attr('data-text', rightName)
            .attr('data-text-class', 'center')

          paths.centre = new Path()
            .move(points.topCNotch)
            .line(points.bottomCNotch)
            .attr('class', 'various')
            .attr('data-text', 'Side Dart')
            .attr('data-text-class', 'center')

          macro('sprinkle', {
            snippet: 'notch',
            on: [
              'bottomLeftNotch',
              'bottomRightNotch',
              'bottomMidNotch',
              'topLeftNotch',
              'topRightNotch',
              'topMidNotch',
              'topCNotch',
              'bottomCNotch',
            ],
          })
        } else {
          paths.left.attr('data-text', 'Side Dart', true)
          paths.right.attr('data-text', 'Side Dart', true)
        }
      }
      //pleat lines
      if (options.pleats) {
        const pleatTo = store.get('pleatTo')
        if (options.waistbandClosurePosition == 'back') {
          points.pleatTo0 = paths.bottomCurve.shiftAlong(pleatTo)
          points.pleatTo1 = paths.bottomCurve.reverse().shiftAlong(pleatTo)
        } else {
          if (options.waistbandClosurePosition == 'sideRight') {
            points.pleatTo0 = paths.bottomCurve
              .split(points.bottomRightNotch)[0]
              .reverse()
              .shiftAlong(pleatTo)
            points.pleatTo1 = paths.bottomCurve
              .split(points.bottomRightNotch)[1]
              .shiftAlong(pleatTo)
          } else {
            points.pleatTo0 = paths.bottomCurve
              .split(points.bottomLeftNotch)[0]
              .reverse()
              .shiftAlong(pleatTo)
            points.pleatTo1 = paths.bottomCurve.split(points.bottomLeftNotch)[1].shiftAlong(pleatTo)
          }
        }
        for (let i = 0; i < 2; i++) {
          if (
            points['pleatTo' + i].x != points.bottomLeftEx.x &&
            points['pleatTo' + i].x != points.bottomRightEx.x
          ) {
            points['pleatFrom' + i] = points['pleatTo' + i].shiftTowards(points.origin, width)
            paths['pleatStart' + i] = new Path()
              .move(points['pleatFrom' + i])
              .line(points['pleatTo' + i])
              .attr('class', 'mark')
              .attr('data-text', 'Pleats Start')
              .attr('data-text-class', 'center')
          }
        }
      }
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
