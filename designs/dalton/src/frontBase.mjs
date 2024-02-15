import { backBase } from './backBase.mjs'

export const frontBase = {
  name: 'dalton.frontBase',
  after: backBase,
  options: {
    //Constants
    fitWaistFront: false,
    crotchSeamSaWidth: 0.01,
    //Advanced
    crotchSeamCurveAngle: { pct: 100, min: 0, max: 100, menu: 'advanced' },
    crotchSeamCurveStart: { pct: 0, min: 0, max: 50, menu: 'advanced' },
    crotchSeamCurveX: { pct: (1 / 3) * 100, min: 0, max: 50, menu: 'advanced' },
    crotchSeamCurve: { pct: (2 / 3) * 100, min: 33.3, max: 100, menu: 'advanced' },
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
    //set options
    if (options.fitWaist) {
      options.fitWaistFront = true
    }
    //measures
    const crossSeamBack = store.get('crossSeamBack')
    let hipsFront
    let seatFront
    if (options.useBackMeasures) {
      void store.setIfUnset(
        'waistFront',
        (measurements.waist - measurements.waistBack) * (1 + options.waistEase)
      )
      hipsFront = (measurements.hips - measurements.hipsBack) * (1 + options.hipsEase)
      seatFront = (measurements.seat - measurements.seatBack) * (1 + options.seatEase)
    } else {
      void store.setIfUnset('waistFront', measurements.waist * (1 + options.waistEase) * 0.5)
      hipsFront = measurements.hips * (1 + options.hipsEase) * 0.5
      seatFront = measurements.seat * (1 + options.seatEase) * 0.5
    }
    const waistFront = store.get('waistFront')
    const toUpperLeg = store.get('toUpperLeg')
    const knee = store.get('knee')
    const legBandWidth = store.get('legBandWidth')
    const toHips = store.get('toHips')
    const toFloor = store.get('toFloor')
    const waistbandWidth = store.get('waistbandWidth')

    const legRatio = measurements.crossSeamFront / measurements.crossSeam

    let floor = store.get('floor')
    let legBandDiff
    if (options.calculateLegBandDiff) {
      legBandDiff =
        ((legBandWidth * (knee - floor)) / (toFloor - measurements.waistToKnee)) * legRatio
    } else {
      legBandDiff = 0
    }
    floor = floor + legBandDiff

    const waistbandDiff = store.get('waistbandDiff')

    if (options.fitWaistFront || waistFront > seatFront) {
      void store.setIfUnset(
        'styleWaistFront',
        waistFront * options.waistHeight + hipsFront * (1 - options.waistHeight) + waistbandDiff
      )
    } else {
      void store.setIfUnset('styleWaistFront', seatFront)
    }
    const styleWaistFront = store.get('styleWaistFront')

    //let's begin
    points.origin = new Point(0, 0)
    points.upperLegInAnchor = points.origin.shift(0, seatFront / 4)
    points.upperLegOutAnchor = points.upperLegInAnchor.flipX()
    let crotchSeamCurveAngleMultiplier
    if (measurements.crossSeamFront < crossSeamBack) {
      crotchSeamCurveAngleMultiplier = 1
      points.upperLegIn = points.upperLegInAnchor.shift(0, seatFront / 8)
    } else {
      crotchSeamCurveAngleMultiplier = 0.5
      points.upperLegIn = points.upperLegInAnchor.shift(0, seatFront / 4)
    }

    points.crotchSeamCurveStartMax = points.upperLegInAnchor.shift(
      90,
      toUpperLeg - measurements.waistToSeat
    )

    points.crotchSeamCurveCpTarget = utils.beamsIntersect(
      points.upperLegIn,
      points.upperLegIn.shift(
        180 -
          (180 -
            points.upperLegIn.angle(
              new Point(points.upperLegInAnchor.x, measurements.waistToKnee - toUpperLeg).rotate(
                -90,
                points.upperLegIn
              )
            )) *
            options.crotchSeamCurveAngle *
            crotchSeamCurveAngleMultiplier,
        1
      ),
      points.crotchSeamCurveStartMax,
      points.upperLegInAnchor.shiftFractionTowards(points.upperLegIn, options.crotchSeamCurveX)
    )
    points.crotchSeamCurveStart = points.crotchSeamCurveCpTarget.shiftFractionTowards(
      points.crotchSeamCurveStartMax,
      1 + options.crotchSeamCurveStart
    )
    points.upperLegInCp2 = points.upperLegIn.shiftFractionTowards(
      points.crotchSeamCurveCpTarget,
      options.crotchSeamCurve
    )
    points.crotchSeamCurveStartCp1 = points.crotchSeamCurveStart.shiftFractionTowards(
      points.crotchSeamCurveCpTarget,
      options.crotchSeamCurve
    )

    points.waistInMax = points.crotchSeamCurveCpTarget.shiftOutwards(
      points.crotchSeamCurveStart,
      measurements.crossSeamFront -
        new Path()
          .move(points.upperLegIn)
          .curve(points.upperLegInCp2, points.crotchSeamCurveStartCp1, points.crotchSeamCurveStart)
          .length()
    )
    points.waistIn = points.waistInMax.shiftTowards(
      points.crotchSeamCurveStart,
      toHips + waistbandWidth
    )
    points.seatIn = points.waistInMax.shiftTowards(
      points.crotchSeamCurveStart,
      measurements.waistToSeat
    )

    //seat protection
    if (points.crotchSeamCurveStart.y < points.seatIn.y) {
      points.crotchSeamCurveStart = points.seatIn
      points.crotchSeamCurveStartCp1 = points.crotchSeamCurveStart.shiftFractionTowards(
        points.crotchSeamCurveCpTarget,
        options.crotchSeamCurve
      )

      points.waistInMax = points.crotchSeamCurveCpTarget.shiftOutwards(
        points.crotchSeamCurveStart,
        measurements.crossSeamFront -
          new Path()
            .move(points.upperLegIn)
            .curve(
              points.upperLegInCp2,
              points.crotchSeamCurveStartCp1,
              points.crotchSeamCurveStart
            )
            .length()
      )
      points.waistIn = points.waistInMax.shiftTowards(
        points.crotchSeamCurveStart,
        toHips + waistbandWidth
      )
      points.seatIn = points.waistIn.shiftTowards(
        points.crotchSeamCurveStart,
        measurements.waistToSeat - toHips - waistbandWidth
      )
    }

    // points.waistOutAnchorMax = points.upperLegOutAnchor.shift(90, toUpperLeg)
    points.waistOutAnchor = points.upperLegOutAnchor.shift(90, toUpperLeg - toHips - waistbandWidth) //points.waistOutAnchorMax.shift(-90, toHips + waistbandWidth)
    // if (options.fitWaistFront || waistFront > seatFront) {
    // points.waistOutMax = points.waistInMax.shift(points.waistInMax.angle(points.waistOutAnchorMax), waistFront / 2)
    // }
    // else {
    // points.waistOutMax = points.waistInMax.shift(points.waistInMax.angle(points.waistOutAnchorMax), seatFront / 2)
    // }
    points.waistOut = points.waistIn.shift(
      points.waistIn.angle(points.waistOutAnchor),
      styleWaistFront / 2
    )
    points.seatOut = points.seatIn.shift(points.waistIn.angle(points.waistOutAnchor), seatFront / 2)

    //leg
    if (measurements.crossSeamFront < crossSeamBack) {
      points.upperLeg = points.upperLegInAnchor.shiftFractionTowards(points.upperLegOutAnchor, 0.5)
    } else {
      points.upperLeg = points.upperLegIn
        .shiftFractionTowards(points.upperLegInAnchor, 0.5)
        .shiftFractionTowards(points.upperLegOutAnchor, 0.5)
    }
    points.knee = points.upperLeg.shift(-90, measurements.waistToKnee - toUpperLeg)
    points.kneeOut = points.knee.shift(180, knee * legRatio * 0.5)
    points.kneeIn = points.kneeOut.flipX(points.knee)
    points.seatOutCp1 = points.seatOut.shift(
      90 /* - (90 -points.seatOut.angle(points.waistOut)) * (1 - options.waistHeight) * 0.5 */,
      (points.waistOut.y - points.seatOut.y) / -2
    )
    points.seatOutCp2 = points.seatOutCp1.shiftOutwards(
      points.seatOut,
      points.seatOut.dy(points.knee) / 3
    )
    points.upperLegInCp1 = points.upperLegIn.shift(
      points.upperLegIn.angle(points.upperLegInCp2) + 90,
      points.knee.y / 3
    )
    points.floor = points.upperLeg.shift(-90, toFloor - toUpperLeg)
    if (options.fitFloor) {
      points.floorIn = points.floor.shift(0, floor * legRatio * 0.5)
    } else {
      points.floorIn = new Point(points.kneeIn.x, points.floor.y)
    }
    points.floorOut = points.floorIn.flipX(points.floor)
    if (options.fitKnee) {
      points.floorInCp2 = points.floorIn.shift(90, (points.floor.y - points.knee.y) / 2)
    } else {
      points.floorInCp2 = new Point(points.floorIn.x, points.knee.y)
    }
    points.floorOutCp1 = points.floorInCp2.flipX(points.floor)
    points.kneeInCp2 = points.floorInCp2.shiftOutwards(points.kneeIn, points.knee.y / 3)
    points.kneeOutCp1 = points.floorOutCp1.shiftOutwards(points.kneeOut, points.knee.y / 3)

    //paths
    if (options.fitKnee) {
      points.seatOutAnchor = utils.lineIntersectsCurve(
        points.seatIn,
        points.seatIn.shiftFractionTowards(points.seatOut, 2),
        points.waistOut,
        points.seatOut,
        points.kneeOutCp1,
        points.kneeOut
      )
    } else {
      points.seatOutAnchor = utils.lineIntersectsCurve(
        points.seatIn,
        points.seatIn.shiftFractionTowards(points.seatOut, 2),
        points.waistOut,
        points.seatOut,
        points.floorOutCp1,
        points.floorOut
      )
    }

    const drawInseam = () =>
      options.fitKnee
        ? new Path()
            .move(points.floorIn)
            .curve_(points.floorInCp2, points.kneeIn)
            .curve(points.kneeInCp2, points.upperLegInCp1, points.upperLegIn)
        : new Path()
            .move(points.floorIn)
            .curve(points.floorInCp2, points.upperLegInCp1, points.upperLegIn)

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

    paths.hemBase = new Path().move(points.floorOut).line(points.floorIn).hide()

    paths.crotchSeam = new Path()
      .move(points.upperLegIn)
      .curve(points.upperLegInCp2, points.crotchSeamCurveStartCp1, points.crotchSeamCurveStart)
      .line(points.waistIn)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(drawInseam())
      .join(paths.crotchSeam)
      .line(points.waistOut)
      .join(drawOutseam())
      .close()

    //stores
    store.set(
      'waistbandLength',
      store.get('waistbandBack') + points.waistOut.dist(points.waistIn) * 2
    )
    store.set('waistbandLengthTop', store.get('waistbandLength') - waistbandDiff * 2)
    if (complete) {
      //grainline
      points.grainlineTo = points.floorIn.shiftFractionTowards(points.floor, 1 / 3)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.crotchSeamCurveStart.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.notch = new Snippet('notch', points.crotchSeamCurveStart)
      //title
      points.title = new Point(points.knee.x, points.knee.y * 0.5)
      macro('title', {
        nr: 2,
        title: 'Front',
        at: points.title,
        scale: 0.5,
      })
      //fitGuides
      if (options.fitGuides) {
        if (measurements.waistToHips * options.waistHeight - waistbandWidth > 0) {
          points.hipsGuideIn = points.waistIn
            .shiftTowards(
              points.crotchSeamCurveStart,
              measurements.waistToHips * options.waistHeight - waistbandWidth
            )
            .shift(points.waistIn.angle(points.waistOut), waistFront * 0.05)
          points.hipsGuideOut = points.hipsGuideIn.shift(
            points.waistIn.angle(points.waistOut),
            waistFront * 0.15
          )
          paths.hipsGuide = new Path()
            .move(points.hipsGuideOut)
            .line(points.hipsGuideIn)
            .attr('class', 'various')
            .attr('data-text', 'Hips Guide')
            .attr('data-text-class', 'left')

          macro('sprinkle', {
            snippet: 'notch',
            on: ['hipsGuideIn', 'hipsGuideOut'],
          })
        }
        points.seatGuideIn = points.seatIn.shift(
          points.waistIn.angle(points.waistOut),
          waistFront * 0.05
        )
        points.seatGuideOut = points.seatGuideIn.shift(
          points.waistIn.angle(points.waistOut),
          waistFront * 0.15
        )
        paths.seatGuide = new Path()
          .move(points.seatGuideOut)
          .line(points.seatGuideIn)
          .attr('class', 'various')
          .attr('data-text', 'Seat Guide')
          .attr('data-text-class', 'left')

        if (options.fitKnee) {
          points.kneeGuideOut = points.kneeOut
        } else {
          if (points.seatOutAnchor.x < points.seatOut.x) {
            points.kneeGuideOut = utils.lineIntersectsCurve(
              points.kneeIn,
              points.kneeIn.shiftFractionTowards(points.kneeOut, 2),
              points.waistOut,
              points.seatOut,
              points.floorOutCp1,
              points.floorOut
            )
          } else {
            points.kneeGuideOut = utils.lineIntersectsCurve(
              points.kneeIn,
              points.kneeIn.shiftFractionTowards(points.kneeOut, 2),
              points.seatOut,
              points.seatOutCp2,
              points.floorOutCp1,
              points.floorOut
            )
          }
        }
        points.kneeGuideIn = points.kneeGuideOut.shiftFractionTowards(points.kneeIn, 0.25)
        paths.kneeGuide = new Path()
          .move(points.kneeGuideOut)
          .line(points.kneeGuideIn)
          .attr('class', 'various')
          .attr('data-text', 'Knee Guide')
          .attr('data-text-class', 'right')

        macro('sprinkle', {
          snippet: 'notch',
          on: ['seatGuideIn', 'seatGuideOut', 'kneeGuideIn', 'kneeGuideOut'],
        })
      }

      if (sa) {
        const hemSa = sa * options.hemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const crotchSeamSa = sa * options.crotchSeamSaWidth * 100
        const inseamSa = sa * options.inseamSaWidth * 100

        points.saFloorIn = points.floorIn.translate(inseamSa, hemSa)

        points.saUpperLegIn = points.upperLegIn
          .shift(points.upperLegInCp1.angle(points.upperLegIn), crotchSeamSa)
          .shift(points.upperLegInCp2.angle(points.upperLegIn), inseamSa)

        points.saWaistIn = utils.beamsIntersect(
          points.crotchSeamCurveStart
            .shiftTowards(points.waistIn, crotchSeamSa)
            .rotate(-90, points.crotchSeamCurveStart),
          points.waistIn
            .shiftTowards(points.crotchSeamCurveStart, crotchSeamSa)
            .rotate(90, points.waistIn),
          points.waistIn.shiftTowards(points.waistOut, sa).rotate(-90, points.waistIn),
          points.waistOut.shiftTowards(points.waistIn, sa).rotate(90, points.waistOut)
        )

        points.saWaistOut = utils.beamsIntersect(
          points.saWaistIn,
          points.saWaistIn.shift(points.waistIn.angle(points.waistOut), 1),
          drawOutseam().offset(sideSeamSa).start(),
          drawOutseam().offset(sideSeamSa).shiftFractionAlong(0.01)
        )

        points.saFloorOut = points.floorOut.translate(-sideSeamSa, hemSa)

        paths.sa = paths.hemBase
          .offset(hemSa)
          .line(points.saFloorIn)
          .join(drawInseam().offset(inseamSa))
          .line(points.saUpperLegIn)
          .join(paths.crotchSeam.offset(crotchSeamSa))
          .line(points.saWaistIn)
          .line(points.saWaistOut)
          .join(drawOutseam().offset(sideSeamSa))
          .line(points.saFloorOut)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
