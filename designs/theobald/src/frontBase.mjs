import { frontBase as daltonFrontBase } from '@freesewing/dalton'
import { back } from './back.mjs'

export const frontBase = {
  name: 'theobald.frontBase',
  from: daltonFrontBase,
  after: back,
  hide: {
    from: true,
  },
  options: {
    //Constants
    cpFraction: 0.55191502449,
    //Style
    frontPleats: { bool: false, menu: 'style' },
    frontPleatWidth: { pct: 3.8, min: 3, max: 5, menu: 'style' },
    //Pockets
    frontPocketsBool: { bool: true, menu: 'pockets' },
    frontPocketOpeningWidth: { pct: 20.6, min: 20, max: 30, menu: 'pockets.frontPockets' },
    frontPocketOpeningTopDepth: { pct: 11.7, min: 10, max: 20, menu: 'pockets.frontPockets' },
    frontPocketOpeningDepth: { pct: 43.7, min: 40, max: 50, menu: 'pockets.frontPockets' },
    // Plackets
    flyLength: { pct: 70.2, min: 70, max: 80, menu: 'plackets' },
    flyWidth: { pct: 5.1, min: 5, max: 6, menu: 'plackets' },
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
    delete snippets.crotchSeamCurveStart
    //removing macros not required from Dalton
    macro('title', false)
    //measurements
    const waistbandWidth = store.get('waistbandWidth')
    const styleWaistFront = store.get('styleWaistFront') * 0.5
    const flyWidth = measurements.waist * options.flyWidth
    const flyLength = (measurements.crossSeamFront - measurements.waistToHips) * options.flyLength
    const flyShieldEx = 10 //(1 - options.flyWidth) * 10.537407797681770284510010537408
    //let's begin
    //plackets
    points.flyWaist = points.waistIn.shiftTowards(points.waistOut, flyWidth)
    //front pleats
    const frontPleatWidth = measurements.waist * options.frontPleatWidth
    //path guides
    const drawOutseam = () => {
      if (options.fitKnee) {
        if (points.seatOutAnchor.x < points.seatOut.x)
          return new Path()
            .move(points.waistOut)
            .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
            ._curve(points.floorOutCp1, points.floorOut)
        else
          return new Path()
            .move(points.waistOut)
            ._curve(points.seatOutCp1, points.seatOut)
            .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
            ._curve(points.floorOutCp1, points.floorOut)
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
    if (options.frontPleats) {
      points.pivot = points.knee.shiftFractionTowards(points.floor, 0.5)

      if (options.fitKnee) {
        points.pivotIn = utils.lineIntersectsCurve(
          points.pivot,
          points.pivot.shift(0, points.pivot.dist(points.upperLegIn)),
          points.floorIn,
          points.floorInCp2,
          points.kneeIn,
          points.kneeIn
        )
        points.pivotOut = utils.lineIntersectsCurve(
          points.pivot,
          points.pivot.shift(180, points.pivot.dist(points.waistIn)),
          points.kneeOut,
          points.kneeOut,
          points.floorOutCp1,
          points.floorOut
        )
      } else {
        points.pivotIn = utils.lineIntersectsCurve(
          points.pivot,
          points.pivot.shift(0, points.pivot.dist(points.upperLegIn)),
          points.floorIn,
          points.floorInCp2,
          points.upperLegInCp1,
          points.upperLegIn
        )
        if (points.seatOutAnchor.x < points.seatOut.x) {
          points.pivotOut = utils.lineIntersectsCurve(
            points.pivot,
            points.pivot.shift(180, points.pivot.dist(points.waistIn)),
            points.waistOut,
            points.seatOut,
            points.floorOutCp1,
            points.floorOut
          )
        } else {
          points.pivotOut = utils.lineIntersectsCurve(
            points.pivot,
            points.pivot.shift(180, points.pivot.dist(points.waistIn)),
            points.seatOut,
            points.seatOutCp2,
            points.floorOutCp1,
            points.floorOut
          )
        }
      }

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
        'crotchSeamCurveStart',
        'crotchSeamCurveStartCp1',
        'upperLegInCp2',
        'upperLegIn',
        'upperLegInCp1',
        'kneeInCp2',
        'kneeIn',
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
        .curve(points.upperLegInCp2, points.crotchSeamCurveStartCp1, points.crotchSeamCurveStart)
        .line(points.waistIn)
        .hide()

      paths.waist = paths.waist.line(points.waistOut).hide()
      if (options.fitKnee) {
        points.floorOutCp1 = utils.beamIntersectsX(
          points.kneeOutCp1,
          points.kneeOut,
          points.floorOut.x
        )
        points.seatOutAnchor = utils.lineIntersectsCurve(
          points.seatOutAnchor,
          points.seatOutAnchor.shiftTowards(points.seatOut, paths.waist.length()),
          points.waistOut,
          points.seatOut,
          points.kneeOutCp1,
          points.kneeOut
        )
      } else {
        points.floorOutCp1 = new Point(points.floorOut.x, points.kneeOut.y)
        points.seatOutAnchor = utils.lineIntersectsCurve(
          points.seatOutAnchor,
          points.seatOutAnchor.shiftTowards(points.seatOut, paths.waist.length()),
          points.waistOut,
          points.seatOut,
          points.floorOutCp1,
          points.floorOut
        )
      }
      points.floorInCp2 = points.floorOutCp1.flipX(points.floor)

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
    points.flyCrotch = paths.crotchSeam
      .reverse()
      .shiftAlong(measurements.waistToHips * options.waistHeight + flyLength - waistbandWidth)
    points.flyShieldCrotch = utils.lineIntersectsCurve(
      points.flyCrotch.shift(points.waistIn.angle(points.crotchSeamCurveStart), flyShieldEx),
      points.flyCrotch
        .shift(points.waistIn.angle(points.crotchSeamCurveStart), flyShieldEx)
        .shift(
          points.waistIn.angle(points.crotchSeamCurveStart) + 90,
          points.waistOut.dist(points.waistIn)
        ),
      points.upperLegIn,
      points.upperLegInCp2,
      points.crotchSeamCurveStartCp1,
      points.crotchSeamCurveStart
    )
    points.flyShieldExWaist = utils.beamsIntersect(
      points.crotchSeamCurveStart
        .shiftTowards(points.waistIn, flyShieldEx)
        .rotate(-90, points.crotchSeamCurveStart),
      points.waistIn
        .shiftTowards(points.crotchSeamCurveStart, flyShieldEx)
        .rotate(+90, points.waistIn),
      points.flyWaist,
      points.waistIn
    )
    points.flyCurveEnd = utils.beamsIntersect(
      points.waistIn,
      points.crotchSeamCurveStart,
      points.flyCrotch,
      points.flyCrotch.shift(points.crotchSeamCurveStart.angle(points.waistIn) - 90, 1)
    )
    points.flyCpTarget = utils.beamsIntersect(
      points.flyWaist,
      points.flyWaist.shift(points.waistIn.angle(points.crotchSeamCurveStart), 1),
      points.flyCrotch,
      points.flyCurveEnd
    )
    points.flyCurveStart = points.flyCurveEnd.rotate(90, points.flyCpTarget)
    points.flyCurveStartCp2 = points.flyCurveStart.shiftFractionTowards(
      points.flyCpTarget,
      options.cpFraction
    )
    points.flyCurveEndCp1 = points.flyCurveEnd.shiftFractionTowards(
      points.flyCpTarget,
      options.cpFraction
    )
    points.flyShieldExCrotch = utils.beamsIntersect(
      paths.crotchSeam.split(points.flyShieldCrotch)[1].offset(flyShieldEx).start(),
      paths.crotchSeam
        .split(points.flyShieldCrotch)[1]
        .offset(flyShieldEx)
        .shiftFractionAlong(0.01),
      points.flyShieldCrotch,
      points.flyShieldCrotch.shift(points.waistIn.angle(points.crotchSeamCurveStart) - 90, 1)
    )
    paths.placketCurve = new Path()
      .move(points.flyWaist)
      .line(points.flyCurveStart)
      .curve(points.flyCurveStartCp2, points.flyCurveEndCp1, points.flyCurveEnd)
      .hide()
    //stores
    store.set('flyWidth', flyWidth)
    store.set('flyShieldEx', flyShieldEx)
    store.set('waistbandPlacketWidth', flyWidth + flyShieldEx)
    store.set('frontPleatWidth', frontPleatWidth)
    if (complete) {
      if (sa) {
        const crotchSeamSa = sa * options.crotchSeamSaWidth * 100

        points.saFlyWaist = utils.beamsIntersect(
          points.flyWaist.shiftTowards(points.flyCurveStart, sa).rotate(-90, points.flyWaist),
          points.flyCurveStart.shiftTowards(points.flyWaist, sa).rotate(90, points.flyCurveStart),
          points.saWaistOut,
          points.saWaistIn
        )
        points.saWaistInExCorner = utils.beamsIntersect(
          points.saWaistOut,
          points.saWaistIn,
          points.crotchSeamCurveStart
            .shiftTowards(points.waistIn, flyShieldEx + crotchSeamSa)
            .rotate(-90, points.crotchSeamCurveStart),
          points.waistIn
            .shiftTowards(points.crotchSeamCurveStart, flyShieldEx + crotchSeamSa)
            .rotate(90, points.waistIn)
        )
        points.saWaistInEx = utils.beamsIntersect(
          points.saWaistInExCorner,
          points.saWaistInExCorner.shift(points.waistIn.angle(points.crotchSeamCurveStart), 1),
          points.waistOut,
          points.waistIn
        )

        points.saFlyShieldExCrotch = utils.beamsIntersect(
          paths.crotchSeam
            .split(points.flyShieldCrotch)[1]
            .offset(flyShieldEx + crotchSeamSa)
            .start(),
          paths.crotchSeam
            .split(points.flyShieldCrotch)[1]
            .offset(flyShieldEx + crotchSeamSa)
            .shiftFractionAlong(0.001),
          points.flyShieldCrotch.shift(points.waistIn.angle(points.crotchSeamCurveStart), sa),
          points.flyShieldCrotch
            .shift(points.waistIn.angle(points.crotchSeamCurveStart), sa)
            .shift(points.waistIn.angle(points.crotchSeamCurveStart) + 90, 1)
        )
      }
    }
    //if pockets
    if (options.frontPocketsBool) {
      //measures
      const pocketMaxDepth = measurements.waistToKnee - measurements.waistToHips - waistbandWidth

      const drawOutseam = () => {
        if (options.fitKnee) {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
              ._curve(points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
              ._curve(points.floorOutCp1, points.floorOut)
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
