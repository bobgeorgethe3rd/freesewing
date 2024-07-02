import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'

export const leg2 = {
  name: 'heleanor.leg2',
  options: {
    //Fit
    seatEase: { pct: 5.1, min: 0, max: 20, menu: 'fit' },
    //Style
    crotchDrop: { pct: 2, min: 0, max: 15, menu: 'style' },
    waistHeight: { pct: 0, min: 0, max: 100, menu: 'style' },
    waistbandWidth: {
      pct: 4.7,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    },
    waistbandStyle: { dflt: 'straight', list: ['straight', 'curved'] },
    legLength: { pct: 0, min: 0, max: 100, menu: 'style' },
    legLengthBonus: { pct: 0, min: -20, max: 20, menu: 'style' },
    legBandStyle: { dflt: 'band', list: ['band', 'tube', 'none'], menu: 'style' },
    legBandWidth: {
      pct: 4.7,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    },
    //Advanced
    crossSeamCurveAngle: { pct: 100, min: 0, max: 100, menu: 'advanced' },
    crossSeamCurveStart: { pct: 0, min: 0, max: 50, menu: 'advanced' },
    crossSeamCurveX: { pct: (1 / 3) * 100, min: 0, max: 50, menu: 'advanced' },
    crossSeamCurve: { pct: (2 / 3) * 100, min: 33.3, max: 100, menu: 'advanced' },
    crotchSeamCurveAngle: { pct: 100, min: 0, max: 100, menu: 'advanced' },
    crotchSeamCurveEnd: { pct: 0, min: 0, max: 50, menu: 'advanced' },
    crotchSeamCurveX: { pct: (1 / 3) * 100, min: 0, max: 50, menu: 'advanced' },
    crotchSeamCurve: { pct: (2 / 3) * 100, min: 33.3, max: 100, menu: 'advanced' },
    legFullness: { pct: 100, min: 80, max: 120, menu: 'advanced' },
  },
  measurements: [
    'crossSeam',
    'seat',
    'waistToHips',
    'waistToKnee',
    'waistToSeat',
    'waistToUpperLeg',
    'waistToFloor',
  ],
  plugins: [pluginBundle],
  draft: (sh) => {
    //draft
    const {
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
    } = sh
    //measurements
    const seat = measurements.seat * (1 + options.seatEase)

    const toUpperLeg = measurements.waistToUpperLeg * (1 + options.crotchDrop)
    const toHips = measurements.waistToHips * (1 - options.waistHeight)
    let waistbandWidth = absoluteOptions.waistbandWidth
    if (options.waistbandStyle == 'none') {
      waistbandWidth = 0
    }
    let legWidth = measurements.waist * options.legFullness
    if (
      measurements.hips / 2 > legWidth &&
      measurements.hips > (measurements.waist && measurements.seat)
    ) {
      legWidth = measurements.hips * options.legFullness
    }
    if (
      measurements.seat / 2 > legWidth &&
      measurements.seat > (measurements.waist && measurements.hips)
    ) {
      legWidth = measurements.seat * options.legFullness
    }

    let legLength =
      measurements.waistToKnee +
      (measurements.waistToCalf - measurements.waistToKnee) * 2 * options.legLength
    if (options.legLength > 0.5) {
      legLength =
        measurements.waistToCalf +
        (measurements.waistToFloor - measurements.waistToCalf) * (-1 + 2 * options.legLength)
    }
    legLength = legLength * (1 + options.legLengthBonus) - toUpperLeg

    const legTubeWidth =
      measurements.waistToFloor * (1 + options.legLengthBonus) - toUpperLeg - legLength

    let legBandWidth = absoluteOptions.legBandWidth
    if (options.legBandStyle != 'band') {
      if (legTubeWidth < absoluteOptions.legBandWidth && options.legBandStyle == 'tube') {
        legBandWidth = absoluteOptions.legBandWidth - legTubeWidth
      } else {
        legBandWidth = 0
      }
    }
    legLength = legLength - legBandWidth
    //let's begin
    //cross
    points.upperLeg = new Point(0, 0)
    points.upperLegCrossAnchor = points.upperLeg.shift(0, (seat * 3) / 32)
    points.crossSeamCurveStartMax = points.upperLegCrossAnchor.shift(
      90,
      toUpperLeg - measurements.waistToSeat
    )
    points.crossSeamCurveCpTarget = utils.beamsIntersect(
      points.upperLeg,
      points.upperLeg.shift(
        points.upperLeg.angle(
          new Point(points.upperLegCrossAnchor.x, measurements.waistToKnee - toUpperLeg).rotate(
            90,
            points.upperLeg
          )
        ) *
          options.crossSeamCurveAngle *
          0.75,
        1
      ),
      points.crossSeamCurveStartMax,
      points.upperLegCrossAnchor.shiftFractionTowards(points.upperLeg, options.crossSeamCurveX)
    )
    const crossSeamCurveAngle = points.upperLeg.angle(points.crossSeamCurveCpTarget)
    store.set('crossSeamCurveAngle', crossSeamCurveAngle)
    points.upperLegCrossAnchor = points.upperLegCrossAnchor.rotate(
      -crossSeamCurveAngle,
      points.upperLeg
    )
    points.crossSeamCurveStartMax = points.crossSeamCurveStartMax.rotate(
      -crossSeamCurveAngle,
      points.upperLeg
    )
    points.crossSeamCurveCpTarget = points.crossSeamCurveCpTarget.rotate(
      -crossSeamCurveAngle,
      points.upperLeg
    )

    points.crossSeamCurveStart = points.crossSeamCurveCpTarget.shiftFractionTowards(
      points.crossSeamCurveStartMax,
      1 + options.crossSeamCurveStart
    )
    points.upperLegCrossCp1 = points.upperLeg.shiftFractionTowards(
      points.crossSeamCurveCpTarget,
      options.crossSeamCurve
    )
    points.crossSeamCurveStartCp2 = points.crossSeamCurveStart.shiftFractionTowards(
      points.crossSeamCurveCpTarget,
      options.crossSeamCurve
    )
    points.waistCrossMax = points.crossSeamCurveCpTarget.shiftOutwards(
      points.crossSeamCurveStart,
      measurements.crossSeam * 0.5 -
        new Path()
          .move(points.crossSeamCurveStart)
          .curve(points.crossSeamCurveStartCp2, points.upperLegCrossCp1, points.upperLeg)
          .length()
    )
    points.waistCross = points.waistCrossMax.shiftTowards(
      points.crossSeamCurveStart,
      toHips + waistbandWidth
    )
    points.seatCross = points.waistCrossMax.shiftTowards(
      points.crossSeamCurveStart,
      measurements.waistToSeat
    )
    //seat protection
    if (points.crossSeamCurveStart.y < points.seatCross.y) {
      points.crossSeamCurveStart = points.seatCross
      points.crossSeamCurveStartCp2 = points.crossSeamCurveStart.shiftFractionTowards(
        points.crossSeamCurveCpTarget,
        options.crossSeamCurve
      )

      points.waistCrossMax = points.crossSeamCurveCpTarget.shiftOutwards(
        points.crossSeamCurveStart,
        measurements.crossSeam * 0.5 -
          new Path()
            .move(points.crossSeamCurveStart)
            .curve(points.crossSeamCurveStartCp2, points.upperLegCrossCp1, points.upperLeg)
            .length()
      )
      points.waistCross = points.waistCrossMax.shiftTowards(
        points.crossSeamCurveStart,
        toHips + waistbandWidth
      )
      points.seatCross = points.waistCross.shiftTowards(
        points.crossSeamCurveStart,
        measurements.waistToSeat - toHips - waistbandWidth
      )
    }
    //crotch
    points.upperLegCrotchAnchor = points.upperLeg.shift(180, (seat * 3) / 32)
    points.crotchSeamCurveEndMax = points.upperLegCrotchAnchor.shift(
      90,
      toUpperLeg - measurements.waistToSeat
    )

    points.crotchSeamCurveCpTarget = utils.beamsIntersect(
      points.upperLeg,
      points.upperLeg.shift(
        180 -
          (180 -
            points.upperLeg.angle(
              new Point(
                points.upperLegCrotchAnchor.x,
                measurements.waistToKnee - toUpperLeg
              ).rotate(-90, points.upperLeg)
            )) *
            options.crotchSeamCurveAngle *
            0.75,
        1
      ),
      points.crotchSeamCurveEndMax,
      points.upperLegCrotchAnchor.shiftFractionTowards(points.upperLeg, options.crotchSeamCurveX)
    )

    const crotchSeamCurveAngle = 180 - points.upperLeg.angle(points.crotchSeamCurveCpTarget)
    store.set('crotchSeamCurveAngle', crotchSeamCurveAngle)
    points.upperLegCrotchAnchor = points.upperLegCrotchAnchor.rotate(
      crotchSeamCurveAngle,
      points.upperLeg
    )
    points.crotchSeamCurveEndMax = points.crotchSeamCurveEndMax.rotate(
      crotchSeamCurveAngle,
      points.upperLeg
    )
    points.crotchSeamCurveCpTarget = points.crotchSeamCurveCpTarget.rotate(
      crotchSeamCurveAngle,
      points.upperLeg
    )

    points.crotchSeamCurveEnd = points.crotchSeamCurveCpTarget.shiftFractionTowards(
      points.crotchSeamCurveEndMax,
      1 + options.crotchSeamCurveEnd
    )
    points.upperLegCrotchCp2 = points.upperLeg.shiftFractionTowards(
      points.crotchSeamCurveCpTarget,
      options.crotchSeamCurve
    )
    points.crotchSeamCurveEndCp1 = points.crotchSeamCurveEnd.shiftFractionTowards(
      points.crotchSeamCurveCpTarget,
      options.crotchSeamCurve
    )

    points.waistCrotchMax = points.crotchSeamCurveCpTarget.shiftOutwards(
      points.crotchSeamCurveEnd,
      measurements.crossSeam * 0.5 -
        new Path()
          .move(points.upperLeg)
          .curve(points.upperLegCrotchCp2, points.crotchSeamCurveEndCp1, points.crotchSeamCurveEnd)
          .length()
    )
    points.waistCrotch = points.waistCrotchMax.shiftTowards(
      points.crotchSeamCurveEnd,
      toHips + waistbandWidth
    )
    points.seatCrotch = points.waistCrotchMax.shiftTowards(
      points.crotchSeamCurveEnd,
      measurements.waistToSeat
    )

    //seat protection
    if (points.crotchSeamCurveEnd.y < points.seatCrotch.y) {
      points.crotchSeamCurveEnd = points.seatCrotch
      points.crotchSeamCurveEndCp1 = points.crotchSeamCurveEnd.shiftFractionTowards(
        points.crotchSeamCurveCpTarget,
        options.crotchSeamCurve
      )

      points.waistCrotchMax = points.crotchSeamCurveCpTarget.shiftOutwards(
        points.crotchSeamCurveEnd,
        measurements.crossSeam * 0.5 -
          new Path()
            .move(points.upperLeg)
            .curve(
              points.upperLegCrotchCp2,
              points.crotchSeamCurveEndCp1,
              points.crotchSeamCurveEnd
            )
            .length()
      )
      points.waistCrotch = points.waistCrotchMax.shiftTowards(
        points.crotchSeamCurveEnd,
        toHips + waistbandWidth
      )
      points.seatCrotch = points.waistCrotch.shiftTowards(
        points.crotchSeamCurveEnd,
        measurements.waistToSeat - toHips - waistbandWidth
      )
    }
    //leg
    /* let tweak = 1
    let delta
    do {
      // points.bottomLeft = points.upperLeg.shift(points.upperLeg.angle(points.upperLegCrossAnchor) - 90, legLength * tweak)
      points.bottomLeft = points.upperLeg.shift(
        points.waistCross.angle(points.	crossSeamCurveStart),
        legLength * tweak
      )
      // points.bottomLeftCp1 = points.bottomLeft.shift(points.bottomLeft.angle(points.bottomRight) + 90, legLength * tweak * 0.5)
      points.bottomLeftCp1 = points.bottomLeft.shiftFractionTowards(points.upperLeg, 0.5)

      points.topLeftCp2 = points.topLeft.shift(
        points.crotchSeamCurveEnd.angle(points.crotchSeamCurveEndCp1),
        points.crotchSeamCurveEnd.dist(points.crotchSeamCurveCpTarget)
      )

      paths.saLeft = new Path()
        .move(points.topLeft)
        .curve(points.topLeftCp2, points.bottomLeftCp1, points.bottomLeft)
        .hide()

      // delta =
        // paths.saLeft.length() - (legLength - points.crotchSeamCurveEnd.dist(points.waistCrotch))
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 1) */

    const rot = 90 - points.crossSeamCurveStart.angle(points.waistCross)
    for (let i in points) points[i] = points[i].rotate(rot, points.upperLeg)

    points.bottomLeftAnchor = points.upperLeg.shift(
      (points.waistCross.angle(points.crossSeamCurveStart) +
        points.waistCrotch.angle(points.crotchSeamCurveEnd)) /
        2,
      legLength
    )

    points.bottomLeftCrossAnchor = utils.beamsIntersect(
      points.waistCross,
      points.crossSeamCurveStart,
      points.bottomLeftAnchor,
      points.upperLeg.rotate(-90, points.bottomLeftAnchor)
    )

    points.bottomLeftCrotchAnchor = utils.beamsIntersect(
      points.waistCrotch,
      points.crotchSeamCurveEnd,
      points.bottomLeftAnchor,
      points.upperLeg.rotate(-90, points.bottomLeftAnchor)
    )

    paths.test = new Path()
      .move(points.crotchSeamCurveEnd)
      .line(points.bottomLeftAnchor)
      .line(points.upperLeg)
      .line(points.bottomLeftAnchor)
      .line(points.crossSeamCurveStart)
      .line(points.bottomLeftAnchor)

    paths.test1 = new Path().move(points.bottomLeftCrossAnchor).line(points.bottomLeftCrotchAnchor)

    let tweak = 1
    let delta
    do {
      points.bottomLeftMin = points.bottomLeftAnchor.shift(
        points.crossSeamCurveStart.angle(points.waistCross) + 90,
        (points.crotchSeamCurveEnd.dist(points.crotchSeamCurveCpTarget) * tweak) / 3
      )
      points.bottomLeftCp1 = points.bottomLeftMin.shift(
        points.crossSeamCurveStart.angle(points.waistCross),
        points.bottomLeftMin.dy(points.upperLeg) / -2
      )
      points.topLeft = points.crotchSeamCurveEnd.shift(
        points.crotchSeamCurveEnd.angle(points.waistCrotch) + 90,
        (points.crotchSeamCurveEnd.dist(points.crotchSeamCurveCpTarget) * tweak) / 3
      )
      points.topLeftCp2 = points.topLeft.shift(
        points.crotchSeamCurveEnd.angle(points.crotchSeamCurveEndCp1),
        points.crotchSeamCurveEnd.dist(points.crotchSeamCurveCpTarget)
      )

      paths.saLeft = new Path()
        .move(points.topLeft)
        .curve(points.topLeftCp2, points.bottomLeftCp1, points.bottomLeftMin)
        .attr('data-text', points.bottomLeftMin.dy(points.crossSeamCurveStart))

      // delta =
      // paths.saLeft.length() + points.bottomLeftMin.dy(points.crossSeamCurveStart)
      if (delta > 0) tweak = tweak * 1.01
      else tweak = tweak * 0.99
    } while (Math.abs(delta) > 1)

    //paths
    paths.crossSeam = new Path()
      .move(points.waistCross)
      .line(points.crossSeamCurveStart)
      .curve(points.crossSeamCurveStartCp2, points.upperLegCrossCp1, points.upperLeg)
      .curve(points.upperLegCrotchCp2, points.crotchSeamCurveEndCp1, points.crotchSeamCurveEnd)
      //.line(points.waistCrotch)
      .hide()

    paths.seam = paths.crossSeam.clone().unhide()

    return part
  },
}
