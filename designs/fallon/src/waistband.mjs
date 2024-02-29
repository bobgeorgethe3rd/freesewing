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
  plugins: [...waistbandStraight.plugins, ...waistbandCurved.plugins],
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
      //title
      macro('title', {
        nr: 8,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        at: points.title,
        scale: 0.1,
      })
      //placement lines
      if (options.waistbandStyle == 'straight' || !measurements.waistToHips || !measurements.hips) {
        if (options.seams == 'none' || options.seams == 'sideFront') {
          if (options.closurePosition != 'back') {
            if (options.closurePosition == 'sideRight') {
              points.waistbandBottomLeftNotch = points.waistbandBottomLeft.shiftTowards(
                points.waistbandBottomRight,
                fullWaist / 6
              )
              points.waistbandBottomMidNotch = points.waistbandBottomLeftNotch.shiftTowards(
                points.waistbandBottomRight,
                fullWaist / 4
              )
              points.waistbandBottomCNotch = points.waistbandBottomMidNotch.shiftTowards(
                points.waistbandBottomRight,
                fullWaist / 4
              )
              points.waistbandBottomRightNotch = points.waistbandBottomCNotch.shiftTowards(
                points.waistbandBottomRight,
                fullWaist / 4
              )
            } else {
              points.waistbandBottomLeftNotch = points.waistbandBottomLeft.shiftTowards(
                points.waistbandBottomRight,
                fullWaist / 12
              )
              points.waistbandBottomMidNotch = points.waistbandBottomLeftNotch.shiftTowards(
                points.waistbandBottomRight,
                fullWaist / 4
              )
              points.waistbandBottomRightNotch = points.waistbandBottomMidNotch.shiftTowards(
                points.waistbandBottomRight,
                fullWaist / 4
              )
              points.waistbandBottomCNotch = points.waistbandBottomRightNotch.shiftTowards(
                points.waistbandBottomRight,
                fullWaist / 4
              )
            }
            points.waistbandTopLeftNotch = new Point(
              points.waistbandBottomLeftNotch.x,
              points.waistbandTopMid.y
            )
            points.waistbandTopRightNotch = new Point(
              points.waistbandBottomRightNotch.x,
              points.waistbandTopMid.y
            )
            points.waistbandTopCNotch = new Point(
              points.waistbandBottomCNotch.x,
              points.waistbandTopMid.y
            )
            points.waistbandTopMidNotch = new Point(
              points.waistbandBottomMidNotch.x,
              points.waistbandTopMid.y
            )
          }
        }

        //pleat lines
        if (options.pleats) {
          const pleatTo = store.get('pleatTo')
          if (options.closurePosition == 'back') {
            points.pleatFrom0 = points.waistbandTopLeft.shiftTowards(
              points.waistbandTopRight,
              pleatTo
            )
            points.pleatFrom1 = points.waistbandTopRight.shiftTowards(
              points.waistbandTopLeft,
              pleatTo
            )
          } else {
            if (options.closurePosition == 'sideRight') {
              points.pleatFrom0 = points.waistbandTopRightNotch.shiftTowards(
                points.waistbandTopMidNotch,
                pleatTo
              )
              points.pleatFrom1 = points.waistbandTopRightNotch.shiftTowards(
                points.waistbandTopRight,
                pleatTo
              )
            } else {
              points.pleatFrom0 = points.waistbandTopLeftNotch.shiftTowards(
                points.waistbandTopLeft,
                pleatTo
              )
              points.pleatFrom1 = points.waistbandTopLeftNotch.shiftTowards(
                points.waistbandTopMidNotch,
                pleatTo
              )
            }
          }
          for (let i = 0; i < 2; i++) {
            if (
              points['pleatFrom' + i].x != points.waistbandTopLeftEx.x &&
              points['pleatFrom' + i].x != points.waistbandTopRightEx.x
            ) {
              points['pleatTo' + i] = new Point(
                points['pleatFrom' + i].x,
                points.waistbandBottomLeft.y
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
      } else {
        const waistbandWidth = store.get('waistbandWidth')
        if (options.seams == 'none' || options.seams == 'sideFront') {
          if (options.closurePosition != 'back') {
            if (options.closurePosition == 'sideRight') {
              points.waistbandBottomLeftNotch = paths.waistbandBottomCurve.shiftFractionAlong(1 / 6)
              points.waistbandBottomMidNotch = paths.waistbandBottomCurve.shiftFractionAlong(5 / 12)
              points.waistbandBottomCNotch = paths.waistbandBottomCurve.shiftFractionAlong(2 / 3)
              points.waistbandBottomRightNotch = paths.waistbandBottomCurve.shiftFractionAlong(
                11 / 12
              )
            } else {
              points.waistbandBottomLeftNotch = paths.waistbandBottomCurve.shiftFractionAlong(
                1 / 12
              )
              points.waistbandBottomMidNotch = paths.waistbandBottomCurve.shiftFractionAlong(1 / 3)
              points.waistbandBottomRightNotch = paths.waistbandBottomCurve.shiftFractionAlong(
                7 / 12
              )
              points.waistbandBottomCNotch = paths.waistbandBottomCurve.shiftFractionAlong(5 / 6)
            }
            if (points.waistbandOrigin.y > points.waistbandBottomMid.y) {
              points.waistbandTopLeftNotch = points.waistbandBottomLeftNotch.shiftOutwards(
                points.waistbandOrigin,
                waistbandWidth
              )
              points.waistbandTopRightNotch = points.waistbandBottomRightNotch.shiftOutwards(
                points.waistbandOrigin,
                waistbandWidth
              )
              points.waistbandTopMidNotch = points.waistbandBottomMidNotch.shiftOutwards(
                points.waistbandOrigin,
                waistbandWidth
              )
              points.waistbandTopCNotch = points.waistbandBottomCNotch.shiftOutwards(
                points.waistbandOrigin,
                waistbandWidth
              )
            } else {
              points.waistbandTopLeftNotch = points.waistbandBottomLeftNotch.shiftTowards(
                points.waistbandOrigin,
                waistbandWidth
              )
              points.waistbandTopRightNotch = points.waistbandBottomRightNotch.shiftTowards(
                points.waistbandOrigin,
                waistbandWidth
              )
              points.waistbandTopMidNotch = points.waistbandBottomMidNotch.shiftTowards(
                points.waistbandOrigin,
                waistbandWidth
              )
              points.waistbandTopCNotch = points.waistbandBottomCNotch.shiftTowards(
                points.waistbandOrigin,
                waistbandWidth
              )
            }
          } else {
            paths.waistbandLeft.attr('data-text', 'Side Dart', true)
            paths.waistbandRight.attr('data-text', 'Side Dart', true)
          }
        }
        if (options.pleats) {
          const pleatTo = store.get('pleatTo')
          if (options.closurePosition == 'back') {
            points.pleatTo0 = paths.waistbandBottomCurve.shiftAlong(pleatTo)
            points.pleatTo1 = paths.waistbandBottomCurve.reverse().shiftAlong(pleatTo)
          } else {
            if (options.closurePosition == 'sideRight') {
              points.pleatTo0 = paths.waistbandBottomCurve
                .split(points.waistbandBottomRightNotch)[0]
                .reverse()
                .shiftAlong(pleatTo)
              points.pleatTo1 = paths.waistbandBottomCurve
                .split(points.waistbandBottomRightNotch)[1]
                .shiftAlong(pleatTo)
            } else {
              points.pleatTo0 = paths.waistbandBottomCurve
                .split(points.waistbandBottomLeftNotch)[0]
                .reverse()
                .shiftAlong(pleatTo)
              points.pleatTo1 = paths.waistbandBottomCurve
                .split(points.waistbandBottomLeftNotch)[1]
                .shiftAlong(pleatTo)
            }
          }
          for (let i = 0; i < 2; i++) {
            if (
              points['pleatTo' + i].x != points.waistbandBottomLeftEx.x &&
              points['pleatTo' + i].x != points.waistbandBottomRightEx.x
            ) {
              points['pleatFrom' + i] = points['pleatTo' + i].shiftTowards(
                points.waistbandOrigin,
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
            .move(points.waistbandTopMidNotch)
            .line(points.waistbandBottomMidNotch)
            .attr('class', 'various')
            .attr('data-text', midName)
            .attr('data-text-class', 'center')

          paths.waistbandLeft = new Path()
            .move(points.waistbandTopLeftNotch)
            .line(points.waistbandBottomLeftNotch)
            .attr('class', 'various')
            .attr('data-text', leftName)
            .attr('data-text-class', 'center')

          paths.waistbandRight = new Path()
            .move(points.waistbandTopRightNotch)
            .line(points.waistbandBottomRightNotch)
            .attr('class', 'various')
            .attr('data-text', rightName)
            .attr('data-text-class', 'center')

          paths.centre = new Path()
            .move(points.waistbandTopCNotch)
            .line(points.waistbandBottomCNotch)
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
          paths.waistbandLeft.attr('data-text', 'Side Dart', true)
          paths.waistbandRight.attr('data-text', 'Side Dart', true)
        }
      }
      if (paths.waistbandRightEx) {
        if (
          (options.waistbandOverlapSide == 'right' || options.closurePosition == 'sideLeft') &&
          options.pleats
        ) {
          delete paths.waistbandRightEx
        } else {
          paths.waistbandRightEx.attr('data-text', 'Side Back', true)
        }
      }
      if (paths.waistbandLeftEx) {
        if (
          (options.waistbandOverlapSide == 'left' || options.closurePosition == 'sideLeft') &&
          options.pleats
        ) {
          delete paths.waistbandLeftEx
        } else {
          paths.waistbandLeftEx.attr('data-text', 'Side Back', true)
        }
      }
    }
    return part
  },
}
