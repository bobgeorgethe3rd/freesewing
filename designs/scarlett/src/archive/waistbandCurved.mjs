import { swingPanel } from './swingPanel.mjs'
import { placket } from './placket.mjs'
import { waistbandStraight } from './waistbandStraight.mjs'
import { waistband as draftWaistbandCurved } from '@freesewing/waistbandcurved'

export const waistbandCurved = {
  name: 'scarlett.waistbandCurved',
  after: [waistbandStraight, swingPanel, placket],
  from: draftWaistbandCurved,
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
    Snippet,
    absoluteOptions,
    log,
  }) => {
    //Set Render
    if (options.waistbandStyle != 'curved' || !measurements.waistToHips || !measurements.hips) {
      part.hide()
      return part
    }

    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: 9,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        scale: 1 / 3,
      })
      //pleat lines & buttons
      const buttonWidth = store.get('waistbandWidth') / 2
      const buttonLength = store.get('swingWaisbandLength') - buttonWidth
      const bottomCurveLength = paths.bottomCurve.length()

      if (options.waistbandClosurePosition == 'front') {
        points.pleatTo0 = paths.bottomCurve.shiftFractionAlong(3 / 8)
        points.pleatTo1 = paths.bottomCurve.shiftFractionAlong(5 / 8)
        if (options.swingPanelStyle != 'none') {
          points.swingButton0A = paths.bottomCurve.shiftAlong(buttonLength)
          points.swingButton1A = paths.bottomCurve.reverse().shiftAlong(buttonLength)
        }
      }
      if (options.waistbandClosurePosition == 'back') {
        points.pleatTo0 = paths.bottomCurve.shiftFractionAlong(1 / 8)
        points.pleatTo1 = paths.bottomCurve.shiftFractionAlong(7 / 8)
        if (options.swingPanelStyle == 'separate') {
          points.swingButton0A = paths.bottomCurve.shiftAlong(bottomCurveLength / 2 - buttonLength)
          points.swingButton1A = paths.bottomCurve.shiftAlong(bottomCurveLength / 2 + buttonLength)
        }
      }
      if (options.waistbandClosurePosition == 'sideRight') {
        points.pleatTo0 = paths.bottomCurve.shiftFractionAlong(5 / 8)
        points.pleatTo1 = paths.bottomCurve.shiftFractionAlong(7 / 8)
        if (options.swingPanelStyle == 'separate') {
          points.swingButton0A = paths.bottomCurve.shiftAlong(bottomCurveLength / 4 - buttonLength)
          points.swingButton1A = paths.bottomCurve.shiftAlong(bottomCurveLength / 4 + buttonLength)
        }
      }
      if (options.waistbandClosurePosition == 'sideLeft') {
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

      if (points.origin < points.bottomMid) {
        points.pleatFrom0 = points.origin.shiftOutwards(
          points.pleatTo0,
          points.topMid.dist(points.bottomMid)
        )
        points.pleatFrom1 = points.origin.shiftOutwards(
          points.pleatTo1,
          points.topMid.dist(points.bottomMid)
        )
        if (points.swingButton0A) {
          points.swingButton0 = points.origin.shiftOutwards(points.swingButton0A, buttonWidth)
          points.swingButton1 = points.origin.shiftOutwards(points.swingButton1A, buttonWidth)
        }
      } else {
        points.pleatFrom0 = points.pleatTo0.shiftTowards(
          points.origin,
          points.topMid.dist(points.bottomMid)
        )
        points.pleatFrom1 = points.pleatTo1.shiftTowards(
          points.origin,
          points.topMid.dist(points.bottomMid)
        )
        if (points.swingButton0A) {
          points.swingButton0 = points.swingButton0A.shiftTowards(points.origin, buttonWidth)
          points.swingButton1 = points.swingButton1A.shiftTowards(points.origin, buttonWidth)
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
      if (points.swingButton0A) {
        macro('sprinkle', {
          snippet: 'button',
          on: ['swingButton0', 'swingButton1'],
        })
      }
    }

    return part
  },
}
