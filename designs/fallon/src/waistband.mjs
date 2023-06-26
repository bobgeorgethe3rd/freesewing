import { waistband as waistbandStraight } from '@freesewing/waistbandstraight'
import { waistband as waistbandCurved } from '@freesewing/waistbandcurved'
import { skirtBase } from './skirtBase.mjs'
import { backPanel } from './backPanel.mjs'
import { placket } from '@freesewing/wanda'

export const waistband = {
  name: 'fallon.waistband',
  options: {
    //Imported
    ...waistbandStraight.options,
    ...waistbandCurved.options,
    //Style
    waistbandOverlapSide: {
      dflt: 'right',
      list: ['right', 'left'],
      menu: 'style',
    }, //altered for Fallon
    waistbandFolded: { bool: true, menu: 'style' }, //altered for Fallon
    //Construction
    closurePosition: {
      dflt: 'back',
      list: ['back', 'sideLeft', 'sideRight'],
      menu: 'construction',
    }, //altered for Fallon
  },
  after: [skirtBase, backPanel, placket],
  draft: (sh) => {
    const {
      macro,
      points,
      Point,
      paths,
      Path,
      utils,
      options,
      measurements,
      store,
      complete,
      part,
    } = sh
    if (options.waistbandStyle == 'none') {
      part.hide()
      return part
    } else {
      if (options.waistbandStyle == 'straight' || !measurements.waistToHips || !measurements.hips)
        waistbandStraight.draft(sh)
      else waistbandCurved.draft(sh)
    }
    //measures
    const fullWaist = store.get('fullWaist')

    if (complete) {
      if (options.waistbandStyle == 'straight' || !measurements.waistToHips || !measurements.hips) {
        if (options.seams == 'none' || options.seams == 'sideFront') {
          if (options.closurePosition != 'back') {
            if (options.closurePosition == 'sideRight') {
              points.bottomLeftNotch = points.bottomLeft.shiftTowards(
                points.bottomRight,
                fullWaist / 6
              )
              points.bottomMidNotch = points.bottomLeftNotch.shiftTowards(
                points.bottomRight,
                fullWaist / 4
              )
              points.bottomCNotch = points.bottomMidNotch.shiftTowards(
                points.bottomRight,
                fullWaist / 4
              )
              points.bottomRightNotch = points.bottomCNotch.shiftTowards(
                points.bottomRight,
                fullWaist / 4
              )
            } else {
              points.bottomLeftNotch = points.bottomLeft.shiftTowards(
                points.bottomRight,
                fullWaist / 12
              )
              points.bottomMidNotch = points.bottomLeftNotch.shiftTowards(
                points.bottomRight,
                fullWaist / 4
              )
              points.bottomRightNotch = points.bottomMidNotch.shiftTowards(
                points.bottomRight,
                fullWaist / 4
              )
              points.bottomCNotch = points.bottomRightNotch.shiftTowards(
                points.bottomRight,
                fullWaist / 4
              )
            }
            points.topLeftNotch = new Point(points.bottomLeftNotch.x, points.topMid.y)
            points.topRightNotch = new Point(points.bottomRightNotch.x, points.topMid.y)
            points.topCNotch = new Point(points.bottomCNotch.x, points.topMid.y)
            points.topMidNotch = new Point(points.bottomMidNotch.x, points.topMid.y)
          }
        }

        //pleat lines
        if (options.pleats) {
          const pleatTo = store.get('pleatTo')
          if (options.closurePosition == 'back') {
            points.pleatFrom0 = points.topLeft.shiftTowards(points.topRight, pleatTo)
            points.pleatFrom1 = points.topRight.shiftTowards(points.topLeft, pleatTo)
          } else {
            if (options.closurePosition == 'sideRight') {
              points.pleatFrom0 = points.topRightNotch.shiftTowards(points.topMidNotch, pleatTo)
              points.pleatFrom1 = points.topRightNotch.shiftTowards(points.topRight, pleatTo)
            } else {
              points.pleatFrom0 = points.topLeftNotch.shiftTowards(points.topLeft, pleatTo)
              points.pleatFrom1 = points.topLeftNotch.shiftTowards(points.topMidNotch, pleatTo)
            }
          }
          for (let i = 0; i < 2; i++) {
            if (
              points['pleatFrom' + i].x != points.topLeftEx.x &&
              points['pleatFrom' + i].x != points.topRightEx.x
            ) {
              points['pleatTo' + i] = new Point(points['pleatFrom' + i].x, points.bottomLeft.y)
              paths['pleatStart' + i] = new Path()
                .move(points['pleatFrom' + i])
                .line(points['pleatTo' + i])
                .attr('class', 'mark')
                .attr('data-text', 'Pleats Start')
                .attr('data-text-class', 'center')
            }
          }
        }
      } else {
        const waistbandWidth = store.get('waistbandWidth')
        if (options.seams == 'none' || options.seams == 'sideFront') {
          if (options.closurePosition != 'back') {
            if (options.closurePosition == 'sideRight') {
              points.bottomLeftNotch = paths.bottomCurve.shiftFractionAlong(1 / 6)
              points.bottomMidNotch = paths.bottomCurve.shiftFractionAlong(5 / 12)
              points.bottomCNotch = paths.bottomCurve.shiftFractionAlong(2 / 3)
              points.bottomRightNotch = paths.bottomCurve.shiftFractionAlong(11 / 12)
            } else {
              points.bottomLeftNotch = paths.bottomCurve.shiftFractionAlong(1 / 12)
              points.bottomMidNotch = paths.bottomCurve.shiftFractionAlong(1 / 3)
              points.bottomRightNotch = paths.bottomCurve.shiftFractionAlong(7 / 12)
              points.bottomCNotch = paths.bottomCurve.shiftFractionAlong(5 / 6)
            }
            if (points.origin.y > points.bottomMid.y) {
              points.topLeftNotch = points.bottomLeftNotch.shiftOutwards(
                points.origin,
                waistbandWidth
              )
              points.topRightNotch = points.bottomRightNotch.shiftOutwards(
                points.origin,
                waistbandWidth
              )
              points.topMidNotch = points.bottomMidNotch.shiftOutwards(
                points.origin,
                waistbandWidth
              )
              points.topCNotch = points.bottomCNotch.shiftOutwards(points.origin, waistbandWidth)
            } else {
              points.topLeftNotch = points.bottomLeftNotch.shiftTowards(
                points.origin,
                waistbandWidth
              )
              points.topRightNotch = points.bottomRightNotch.shiftTowards(
                points.origin,
                waistbandWidth
              )
              points.topMidNotch = points.bottomMidNotch.shiftTowards(points.origin, waistbandWidth)
              points.topCNotch = points.bottomCNotch.shiftTowards(points.origin, waistbandWidth)
            }
          } else {
            paths.left.attr('data-text', 'Side Dart', true)
            paths.right.attr('data-text', 'Side Dart', true)
          }
        }
        if (options.pleats) {
          const pleatTo = store.get('pleatTo')
          if (options.closurePosition == 'back') {
            points.pleatTo0 = paths.bottomCurve.shiftAlong(pleatTo)
            points.pleatTo1 = paths.bottomCurve.reverse().shiftAlong(pleatTo)
          } else {
            if (options.closurePosition == 'sideRight') {
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
              points.pleatTo1 = paths.bottomCurve
                .split(points.bottomLeftNotch)[1]
                .shiftAlong(pleatTo)
            }
          }
          for (let i = 0; i < 2; i++) {
            if (
              points['pleatTo' + i].x != points.bottomLeftEx.x &&
              points['pleatTo' + i].x != points.bottomRightEx.x
            ) {
              points['pleatFrom' + i] = points['pleatTo' + i].shiftTowards(
                points.origin,
                waistbandWidth
              )
              paths['pleatStart' + i] = new Path()
                .move(points['pleatFrom' + i])
                .line(points['pleatTo' + i])
                .attr('class', 'mark')
                .attr('data-text', 'Pleats Start')
                .attr('data-text-class', 'center')
            }
          }
        }
      }
      //lines
      if (options.seams == 'none' || options.seams == 'sideFront') {
        if (options.closurePosition != 'back') {
          let leftName
          let rightName
          let midName
          if (options.closurePosition == 'sideRight') {
            leftName = 'Side Dart'
            rightName = 'Centre Back'
            midName = 'Centre Front'
          } else {
            leftName = 'Centre Back'
            rightName = 'Centre Front'
            midName = 'Side Dart'
          }
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
      if (paths.rightEx) {
        if (
          (options.waistbandOverlapSide == 'right' || options.closurePosition == 'sideLeft') &&
          options.pleats
        ) {
          delete paths.rightEx
        } else {
          paths.rightEx.attr('data-text', 'Side Back', true)
        }
      }
      if (paths.leftEx) {
        if (
          (options.waistbandOverlapSide == 'left' || options.closurePosition == 'sideLeft') &&
          options.pleats
        ) {
          delete paths.leftEx
        } else {
          paths.leftEx.attr('data-text', 'Side Back', true)
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
