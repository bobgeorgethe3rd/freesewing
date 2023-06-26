import { waistband as waistbandStraight } from '@freesewing/waistbandstraight'
import { waistband as waistbandCurved } from '@freesewing/waistbandcurved'
import { skirtBase } from './skirtBase.mjs'
import { swingPanel } from './swingPanel.mjs'
import { placket } from './placket.mjs'

export const waistband = {
  name: 'scarlett.waistband',
  options: {
    //Imported
    ...waistbandStraight.options,
    ...waistbandCurved.options,
    //Style
    waistbandOverlapSide: {
      dflt: 'right',
      list: ['right', 'left'],
      menu: 'style',
    }, //altered for Scarlett
  },
  after: [skirtBase, swingPanel, placket],
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
      snippets,
      Snippet,
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

    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: 9,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        scale: 1 / 3,
      })

      if (options.waistbandStyle == 'straight' || !measurements.waistToHips || !measurements.hips) {
        //pleat lines & buttons
        const buttonWidth = store.get('waistbandWidth') / 2
        const buttonLength = store.get('swingWaisbandLength') - buttonWidth
        if (options.closurePosition == 'front') {
          points.pleatFrom0 = points.topLeftNotch.shiftFractionTowards(points.topMidNotch, 0.5)
          points.pleatFrom1 = points.topMidNotch.shiftFractionTowards(points.topRightNotch, 0.5)
          if (options.swingPanelStyle != 'none') {
            points.swingButton0 = points.bottomLeft.translate(buttonLength, -buttonWidth)
            points.swingButton1 = points.bottomRight.translate(-buttonLength, -buttonWidth)
          }
        }
        if (options.closurePosition == 'back') {
          points.pleatFrom0 = points.topLeft.shiftFractionTowards(points.topLeftNotch, 0.5)
          points.pleatFrom1 = points.topRightNotch.shiftFractionTowards(points.topRight, 0.5)
          if (options.swingPanelStyle == 'separate') {
            points.swingButton0 = points.bottomMidNotch.translate(-buttonLength, -buttonWidth)
            points.swingButton1 = points.bottomMidNotch.translate(buttonLength, -buttonWidth)
          }
        }
        if (options.closurePosition == 'sideRight') {
          points.pleatFrom0 = points.topRightNotch.shiftFractionTowards(points.topMidNotch, 0.5)
          points.pleatFrom1 = points.topRightNotch.shiftFractionTowards(points.topRight, 0.5)
          if (options.swingPanelStyle == 'separate') {
            points.swingButton0 = points.bottomLeftNotch.translate(-buttonLength, -buttonWidth)
            points.swingButton1 = points.bottomLeftNotch.translate(buttonLength, -buttonWidth)
          }
        }
        if (options.closurePosition == 'sideLeft') {
          points.pleatFrom0 = points.topLeft.shiftFractionTowards(points.topLeftNotch, 0.5)
          points.pleatFrom1 = points.topLeftNotch.shiftFractionTowards(points.topMidNotch, 0.5)
          if (options.swingPanelStyle == 'separate') {
            points.swingButton0 = points.bottomRightNotch.translate(-buttonLength, -buttonWidth)
            points.swingButton1 = points.bottomRightNotch.translate(buttonLength, -buttonWidth)
          }
        }
        for (let i = 0; i < 2; i++) {
          points['pleatTo' + i] = new Point(points['pleatFrom' + i].x, points.bottomLeft.y)
          if (options.waistbandFolded) {
            points['swingButton' + i + 'F'] = points['swingButton' + i].flipY(points.flipAnchor)
            snippets['swingButton' + i + 'F'] = new Snippet(
              'button',
              points['swingButton' + i + 'F']
            )
          }
        }
      } else {
        //pleat lines & buttons
        const buttonWidth = store.get('waistbandWidth') / 2
        const buttonLength = store.get('swingWaisbandLength') - buttonWidth
        const bottomCurveLength = paths.bottomCurve.length()

        if (options.closurePosition == 'front') {
          points.pleatTo0 = paths.bottomCurve.shiftFractionAlong(3 / 8)
          points.pleatTo1 = paths.bottomCurve.shiftFractionAlong(5 / 8)
          if (options.swingPanelStyle != 'none') {
            points.swingButton0A = paths.bottomCurve.shiftAlong(buttonLength)
            points.swingButton1A = paths.bottomCurve.reverse().shiftAlong(buttonLength)
          }
        }
        if (options.closurePosition == 'back') {
          points.pleatTo0 = paths.bottomCurve.shiftFractionAlong(1 / 8)
          points.pleatTo1 = paths.bottomCurve.shiftFractionAlong(7 / 8)
          if (options.swingPanelStyle == 'separate') {
            points.swingButton0A = paths.bottomCurve.shiftAlong(
              bottomCurveLength / 2 - buttonLength
            )
            points.swingButton1A = paths.bottomCurve.shiftAlong(
              bottomCurveLength / 2 + buttonLength
            )
          }
        }
        if (options.closurePosition == 'sideRight') {
          points.pleatTo0 = paths.bottomCurve.shiftFractionAlong(5 / 8)
          points.pleatTo1 = paths.bottomCurve.shiftFractionAlong(7 / 8)
          if (options.swingPanelStyle == 'separate') {
            points.swingButton0A = paths.bottomCurve.shiftAlong(
              bottomCurveLength / 4 - buttonLength
            )
            points.swingButton1A = paths.bottomCurve.shiftAlong(
              bottomCurveLength / 4 + buttonLength
            )
          }
        }
        if (options.closurePosition == 'sideLeft') {
          points.pleatTo0 = paths.bottomCurve.shiftFractionAlong(1 / 8)
          points.pleatTo1 = paths.bottomCurve.shiftFractionAlong(3 / 8)
          if (options.swingPanelStyle == 'separate') {
            points.swingButton0A = paths.bottomCurve.shiftAlong(
              bottomCurveLength * (3 / 4) - buttonLength
            )
            points.swingButton1A = paths.bottomCurve.shiftAlong(
              bottomCurveLength * (3 / 4) + buttonLength
            )
          }
        }
        for (let i = 0; i < 2; i++) {
          if (points.origin < points.bottomMid) {
            points['pleatFrom' + i] = points.origin.shiftOutwards(
              points['pleatTo' + i],
              points.topMid.dist(points.bottomMid)
            )
            if (points['swingButton' + i + 'A']) {
              points['swingButton' + i] = points.origin.shiftOutwards(
                points['swingButton' + i + 'A'],
                buttonWidth
              )
            }
          } else {
            points['pleatFrom' + i] = points['pleatTo' + i].shiftTowards(
              points.origin,
              points.topMid.dist(points.bottomMid)
            )
            if (points['swingButton' + i + 'A']) {
              points['swingButton' + i] = points['swingButton' + i + 'A'].shiftTowards(
                points.origin,
                buttonWidth
              )
            }
          }
        }
      }

      for (let i = 0; i < 2; i++) {
        paths['pleatStart' + i] = new Path()
          .move(points['pleatFrom' + i])
          .line(points['pleatTo' + i])
          .attr('class', 'mark')
          .attr('data-text', 'Pleats Start')
          .attr('data-text-class', 'center')
      }

      if (points.swingButton0) {
        macro('sprinkle', {
          snippet: 'button',
          on: ['swingButton0', 'swingButton1'],
        })
      }
    }
    return part
  },
}
