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
    //measures
    const fullWaist = store.get('fullWaist')
    //set Render
    if (
      (options.waistbandStyle != 'straight' && measurements.waistToHips && measurements.hips) ||
      options.waistbandStyle == 'none'
    ) {
      part.hide()
      return part
    }

    if (complete) {
      //lines
      if (options.seams == 'none' || options.seams == 'sideFront') {
        if (options.waistbandClosurePosition != 'back') {
          let leftName
          let rightName
          let midName
          let centreName
          if (options.waistbandClosurePosition == 'sideRight') {
            leftName = 'Side Dart'
            rightName = 'Centre Back'
            midName = 'Centre Front'

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

            if (paths.leftEx) {
              if (options.waistbandOverlapSide == 'left' && options.pleats) {
                delete paths.leftEx
              } else {
                paths.leftEx.attr('data-text', 'Side Back', true)
              }
            }
          }
          points.topLeftNotch = new Point(points.bottomLeftNotch.x, points.topMid.y)
          points.topRightNotch = new Point(points.bottomRightNotch.x, points.topMid.y)
          points.topCNotch = new Point(points.bottomCNotch.x, points.topMid.y)
          points.topMidNotch = new Point(points.bottomMidNotch.x, points.topMid.y)

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
          points.pleatFrom0 = points.topLeft.shiftTowards(points.topRight, pleatTo)
          points.pleatFrom1 = points.topRight.shiftTowards(points.topLeft, pleatTo)
        } else {
          if (options.waistbandClosurePosition == 'sideRight') {
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
