import { flyFunction } from '@freesewing/flyfront'
import { flyBase } from '@freesewing/flyfront'
import { front as frontDalton } from '@freesewing/dalton'
import { back } from './back.mjs'

export const frontBase = {
  name: 'theobald.frontBase',
  from: frontDalton,
  after: back,
  hide: {
    from: true,
  },
  options: {
    //Imported
    ...flyBase.options,
    //Style
    frontPleats: { bool: false, menu: 'style' },
    frontPleatWidth: { pct: 3.8, min: 3, max: 5, menu: 'style' },
    //Pockets
    frontPocketsBool: { bool: true, menu: 'pockets' },
    frontPocketOpeningWidth: { pct: 20.6, min: 20, max: 30, menu: 'pockets.frontPockets' },
    frontPocketOpeningTopDepth: { pct: 11.7, min: 10, max: 20, menu: 'pockets.frontPockets' },
    frontPocketOpeningDepth: { pct: 43.7, min: 40, max: 50, menu: 'pockets.frontPockets' },
    //Construction
    crotchSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
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
  }) => {
    //paths
    if (options.daltonGuides) {
      paths.daltonGuide = paths.seam.clone().attr('class', 'various dashed')
    }
    delete paths.seam
    delete paths.sa
    delete snippets.crotchSeamCurveEnd
    //removing macros not required from Dalton
    macro('title', false)
    //measurements
    const waistbandWidth = store.get('waistbandWidth')
    const styleWaistFront = store.get('styleWaistFront') * 0.5
    const flyFrontWidth = measurements.waist * options.flyFrontWidth
    const flyFrontLength =
      (measurements.crossSeamFront - measurements.waistToHips) * options.flyFrontLength
    const flyFrontShieldEx = 10 //(1 - options.flyFrontWidth) * 10.537407797681770284510010537408
    //let's begin
    //plackets
    points.flyWaist = points.waistIn.shiftTowards(points.waistOut, flyFrontWidth)
    //front pleats
    const frontPleatWidth = measurements.waist * options.frontPleatWidth
    //path guides
    const drawInseam = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          return new Path()
            .move(points.floorIn)
            .curve(points.floorInCp2, points.calfInCp1, points.calfIn)
            .curve(points.calfInCp2, points.kneeInCp1, points.kneeIn)
            .curve(points.kneeInCp2, points.upperLegInCp1, points.upperLegIn)
        } else {
          return new Path()
            .move(points.floorIn)
            .curve(points.floorInCp2, points.kneeInCp1, points.kneeIn)
            .curve(points.kneeInCp2, points.upperLegInCp1, points.upperLegIn)
        }
      } else {
        if (options.fitCalf) {
          return new Path()
            .move(points.floorIn)
            .curve(points.floorInCp2, points.calfInCp1, points.calfIn)
            .curve(points.calfInCp2, points.upperLegInCp1, points.upperLegIn)
        } else {
          return new Path()
            .move(points.floorIn)
            .curve(points.floorInCp2, points.upperLegInCp1, points.upperLegIn)
        }
      }
    }
    const drawOutseam = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
        } else {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.floorOutCp1, points.floorOut)
        }
      } else {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
        } else {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.floorOutCp1, points.floorOut)
        }
      }
    }
    if (options.frontPleats) {
      points.pivot = points.knee.shiftFractionTowards(points.floor, 0.5)
      if (points.pivot.y < points.calf.y) {
        points.pivot = points.calf.shiftFractionTowards(points.floor, 0.5)
      }

      points.pivotIn = new Path()
        .move(points.pivot)
        .line(points.pivot.shift(0, points.pivot.dist(points.upperLegIn) * 10))
        .intersects(drawInseam())[0]

      points.pivotOut = new Path()
        .move(points.pivot)
        .line(points.pivot.shift(180, points.pivot.dist(points.waistOut) * 10))
        .intersects(drawOutseam())[0]

      let wedgeAngle = 1
      let target = styleWaistFront + frontPleatWidth * (7 / 6)
      let delta
      do {
        points.waistOutEnd = points.waistOut.rotate(wedgeAngle, points.pivotOut)
        points.waistOutEndCpAnchor = points.waistIn.rotate(wedgeAngle, points.pivotOut)
        points.flyWaistR = points.flyWaist.rotate(-wedgeAngle, points.pivotIn)
        points.waistInR = points.waistIn.rotate(-wedgeAngle, points.pivotIn)

        points.waistOutEndCp = utils.beamsIntersect(
          points.waistInR,
          points.flyWaistR,
          points.waistOutEnd,
          points.waistOutEndCpAnchor
        )

        paths.waist = new Path()
          .move(points.waistInR)
          .line(points.flyWaistR)
          .curve(points.waistOutEndCp, points.waistOutEndCp, points.waistOutEnd)
          .hide()

        delta = paths.waist.length() - target
        if (delta > 0) wedgeAngle = wedgeAngle * 0.99
        else wedgeAngle = wedgeAngle * 1.01
      } while (Math.abs(delta) > 1)

      const rotIn = [
        'flyWaist',
        'waistIn',
        'crotchSeamCurveEnd',
        'crotchSeamCurveEndCp1',
        'upperLegInCp2',
        'upperLegIn',
        'upperLegInCp1',
        'kneeInCp2',
        'kneeIn',
        'kneeInCp1',
        'calfInCp2',
        'calfIn',
        'calfInCp1',
      ]
      for (const p of rotIn) {
        points[p] = points[p].rotate(-wedgeAngle, points.pivotIn)
      }

      const rotOut = [
        'seatOutCp1',
        'seatOut',
        'seatOutAnchor',
        'seatOutCp2',
        'kneeOutCp1',
        'kneeOut',
        'kneeOutCp2',
        'calfOutCp1',
        'calfOut',
        'calfOutCp2',
      ]
      for (const p of rotOut) {
        points[p] = points[p].rotate(wedgeAngle, points.pivotOut)
      }
      points.waistOut = points.waistOutEndCp.shiftOutwards(
        points.waistOutEnd,
        (frontPleatWidth * 5) / 6
      )

      paths.crotchSeam = new Path()
        .move(points.upperLegIn)
        .curve(points.upperLegInCp2, points.crotchSeamCurveEndCp1, points.crotchSeamCurveEnd)
        .line(points.waistIn)
        .hide()

      paths.waist = paths.waist.line(points.waistOut).hide()

      if (options.fitKnee || options.fitCalf) {
        if (options.fitCalf) {
          points.floorInCp2 = points.floorIn.shift(90, (points.floor.y - points.calfIn.y) / 2)
        } else {
          points.floorInCp2 = points.floorIn.shift(90, (points.floor.y - points.kneeIn.y) / 2)
        }
      } else {
        points.floorInCp2 = new Point(points.floorIn.x, points.kneeIn.y)
      }
      points.floorOutCp1 = points.floorInCp2.flipX(points.floor)

      if (options.fitKnee) {
        points.seatOutAnchor = utils.lineIntersectsCurve(
          points.seatOutAnchor,
          points.seatOutAnchor.shift(
            points.waistOutEnd.angle(points.waistOut),
            paths.waist.length()
          ),
          points.waistOut,
          points.seatOut,
          points.kneeOutCp1,
          points.kneeOut
        )
      } else {
        if (options.fitCalf) {
          points.seatOutAnchor = utils.lineIntersectsCurve(
            points.seatOutAnchor,
            points.seatOutAnchor.shift(
              points.waistOutEnd.angle(points.waistOut),
              paths.waist.length()
            ),
            points.waistOut,
            points.seatOut,
            points.calfOutCp1,
            points.calfOut
          )
        } else {
          points.seatOutAnchor = utils.lineIntersectsCurve(
            points.seatOutAnchor,
            points.seatOutAnchor.shift(
              points.waistOutEnd.angle(points.waistOut),
              paths.waist.length()
            ),
            points.waistOut,
            points.seatOut,
            points.floorOutCp1,
            points.floorOut
          )
        }
      }

      if (
        points.waistOut.x < points.seatOut.x &&
        points.seatOutAnchor.x > points.seatOut.x &&
        !options.fitKnee &&
        !options.fitCalf
      ) {
        points.floorOutCp1 = points.floorOutCp1.shiftTowards(
          points.floorOut,
          points.seatOut.dist(points.seatOutCp2)
        )
      }

      if (complete && sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const saRotIn = ['saUpperLegIn', 'saWaistIn']
        for (const p of saRotIn) {
          points[p] = points[p].rotate(-wedgeAngle, points.pivotIn)
        }
        points.saWaistOut = utils.beamsIntersect(
          points.waistOutEnd.shiftTowards(points.waistOut, sa).rotate(-90, points.waistOutEnd),
          points.waistOut.shiftTowards(points.waistOutEnd, sa).rotate(90, points.waistOut),
          drawOutseam().offset(sideSeamSa).start(),
          drawOutseam().offset(sideSeamSa).shiftFractionAlong(0.01)
        )
      }
    } else {
      paths.waist = new Path().move(points.waistIn).line(points.waistOut).hide()
    }
    //plackets
    flyFunction(part, waistbandWidth, flyFrontWidth, flyFrontLength, flyFrontShieldEx)
    //stores
    store.set('frontPleatWidth', frontPleatWidth)
    //if pockets
    if (options.frontPocketsBool) {
      //measures
      const pocketMaxDepth = measurements.waistToKnee - measurements.waistToHips - waistbandWidth

      points.frontPocketOpeningOut = drawOutseam().shiftAlong(
        pocketMaxDepth * options.frontPocketOpeningDepth
      )
      points.frontPocketOpeningOutTop = drawOutseam().shiftAlong(
        pocketMaxDepth * options.frontPocketOpeningTopDepth
      )
      points.frontPocketOpeningWaist = paths.waist
        .reverse()
        .shiftAlong(styleWaistFront * options.frontPocketOpeningWidth)

      if (complete) {
        if (sa) {
          const sideSeamSa = sa * options.sideSeamSaWidth * 100

          points.saFrontPocketOpeningWaist = utils.beamsIntersect(
            points.frontPocketOpeningWaist
              .shiftTowards(points.frontPocketOpeningOut, sa)
              .rotate(-90, points.frontPocketOpeningWaist),
            points.frontPocketOpeningOut
              .shiftTowards(points.frontPocketOpeningWaist, sa)
              .rotate(90, points.frontPocketOpeningOut),
            paths.waist.split(points.frontPocketOpeningWaist)[0].offset(sa).end(),
            paths.waist.split(points.frontPocketOpeningWaist)[0].offset(sa).shiftFractionAlong(0.99)
          )

          points.saFrontPocketOpeningOut = utils.beamsIntersect(
            points.frontPocketOpeningWaist
              .shiftTowards(points.frontPocketOpeningOut, sa)
              .rotate(-90, points.frontPocketOpeningWaist),
            points.frontPocketOpeningOut
              .shiftTowards(points.frontPocketOpeningWaist, sa)
              .rotate(90, points.frontPocketOpeningOut),
            points.frontPocketOpeningOut,
            drawOutseam().split(points.frontPocketOpeningOut)[1].offset(sideSeamSa).start()
          )
        }
      }
    }
    return part
  },
}
