import { pctBasedOn } from '@freesewing/core'

export const draftCross = {
  name: 'neville.draftCross',
  options: {
    //Constants
    waistbandStyle: 'straight',
    //Fit
    seatEase: { pct: 2.6, min: 0, max: 20, menu: 'fit' },
    //Style
    crotchDrop: { pct: 2, min: 0, max: 15, menu: 'style' },
    waistHeight: { pct: 100, min: 0, max: 100, menu: 'style' },
    //Advanced
    waistbandWidth: {
      pct: 0,
      min: 0,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'advanced',
    },
    crossSeamCurveStart: { pct: 0, min: 0, max: 50, menu: 'advanced' },
    crossSeamCurveX: { pct: (1 / 3) * 100, min: 0, max: 50, menu: 'advanced' },
    crossSeamCurve: { pct: (2 / 3) * 100, min: 33.3, max: 100, menu: 'advanced' },
    crotchSeamCurveEnd: { pct: 0, min: 0, max: 50, menu: 'advanced' },
    crotchSeamCurveX: { pct: (1 / 3) * 100, min: 0, max: 50, menu: 'advanced' },
    crotchSeamCurve: { pct: (2 / 3) * 100, min: 33.3, max: 100, menu: 'advanced' },
    useBackMeasures: { bool: true, menu: 'advanced' },
  },
  measurements: [
    'crossSeam',
    'crossSeamFront',
    'seat',
    'seatBack',
    'waistToHips',
    'waistToSeat',
    'waistToUpperLeg',
    'waistToFloor',
  ],
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
    //measures
    const crossSeamBack = measurements.crossSeam - measurements.crossSeamFront
    let seatBack
    let seatFront
    if (options.useBackMeasures) {
      seatBack = measurements.seatBack * (1 + options.seatEase)
      seatFront = (measurements.seat - measurements.seatBack) * (1 + options.seatEase)
    } else {
      seatBack = measurements.seat * (1 + options.seatEase) * 0.5
      seatFront = measurements.seat * (1 + options.seatEase) * 0.5
    }
    const toUpperLeg = measurements.waistToUpperLeg * (1 + options.crotchDrop)
    const toHips = measurements.waistToHips * (1 - options.waistHeight)
    let waistbandWidth = absoluteOptions.waistbandWidth
    if (options.waistbandStyle == 'none') {
      waistbandWidth = 0
    }
    //let's begin
    //crotch
    points.upperLeg = new Point(0, 0)
    if (measurements.crossSeamFront > crossSeamBack) {
      points.upperLegCrossAnchor = points.upperLeg.shift(0, seatBack / 8)
    } else {
      points.upperLegCrossAnchor = points.upperLeg.shift(0, seatBack / 4)
    }
    points.crossSeamCurveStartMax = points.upperLegCrossAnchor.shift(
      90,
      toUpperLeg - measurements.waistToSeat
    )

    points.crossSeamCurveCpTarget = utils.beamIntersectsY(
      points.crossSeamCurveStartMax,
      points.upperLegCrossAnchor.shiftFractionTowards(points.upperLeg, options.crossSeamCurveX),
      points.upperLeg.y
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
      crossSeamBack -
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
        crossSeamBack -
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
    if (measurements.crossSeamFront < crossSeamBack) {
      points.upperLegCrotchAnchor = points.upperLeg.shift(180, seatFront / 8)
    } else {
      points.upperLegCrotchAnchor = points.upperLeg.shift(180, seatFront / 4)
    }

    points.crotchSeamCurveEndMax = points.upperLegCrotchAnchor.shift(
      90,
      toUpperLeg - measurements.waistToSeat
    )

    points.crotchSeamCurveCpTarget = utils.beamIntersectsY(
      points.crotchSeamCurveEndMax,
      points.upperLegCrotchAnchor.shiftFractionTowards(points.upperLeg, options.crotchSeamCurveX),
      points.upperLeg.y
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
      measurements.crossSeamFront -
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
        measurements.crossSeamFront -
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

    //guides
    paths.crossSeam = new Path()
      .move(points.waistCross)
      .line(points.crossSeamCurveStart)
      .curve(points.crossSeamCurveStartCp2, points.upperLegCrossCp1, points.upperLeg)
      .curve(points.upperLegCrotchCp2, points.crotchSeamCurveEndCp1, points.crotchSeamCurveEnd)
      .line(points.waistCrotch)
      .hide()

    //stores
    store.set('crossSeamBack', crossSeamBack)
    store.set('toHips', toHips)
    store.set('toUpperLeg', toUpperLeg)
    store.set('seatBack', seatBack)
    store.set('seatFront', seatFront)
    store.set('waistbandWidth', waistbandWidth)

    return part
  },
}
