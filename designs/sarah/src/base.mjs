import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const base = {
  name: 'sarah.base',
  plugins: [pluginBundle, pluginLogoRG],
  options: {
    //Constants
    waistbandStyle: 'straight',
    sideSeamSaWidth: 0.01,
    circleRatio: 0.0125,
    //Fit
    waistEase: { pct: 3.2, min: 0, max: 20, menu: 'fit' },
    hipsEase: { pct: 3, min: 0, max: 20, menu: 'fit' },
    seatEase: { pct: 2.6, min: 0, max: 20, menu: 'fit' },
    fitGuides: { bool: true, menu: 'fit' },
    //Style
    waistHeight: { pct: 100, min: 0, max: 100, menu: 'style' },
    kneeLengthBonus: { pct: 0, min: -20, max: 50, menu: 'style' },
    //Darts
    //Construction
    hemWidth: { pct: 2, min: 0, max: 3, menu: 'construction' },
    //Advanced
    calculateWaistbandDiff: { bool: true, menu: 'advanced' },
    waistbandWidth: {
      pct: 0,
      min: 0,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'advanced',
    },
    useBackMeasures: { bool: true, menu: 'advanced' },
    waistSeatRatio: { pct: 25, min: 10, max: 50, menu: 'advanced' },
  },
  measurements: [
    'hips',
    'hipsBack',
    'seat',
    'seatBack',
    'waist',
    'waistBack',
    'waistToHips',
    'waistToSeat',
    'waistToKnee',
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
    const waistbandWidth = options.waistbandStyle == 'none' ? 0 : absoluteOptions.waistbandWidth

    const rise = measurements.waistToHips * (1 - options.waistHeight) + waistbandWidth

    const toSeat = measurements.waistToSeat - rise
    const toKnee =
      (measurements.waistToKnee - measurements.waistToSeat) * (1 + options.kneeLengthBonus)

    let hipsFront
    let seatFront
    let hipsBack
    let seatBack
    if (options.useBackMeasures) {
      void store.setIfUnset(
        'waistFront',
        (measurements.waist - measurements.waistBack) * (1 + options.waistEase)
      )
      hipsFront = (measurements.hips - measurements.hipsBack) * (1 + options.hipsEase)
      seatFront = (measurements.seat - measurements.seatBack) * (1 + options.seatEase)

      void store.setIfUnset('waistBack', measurements.waistBack * (1 + options.waistEase))
      hipsBack = measurements.hipsBack * (1 + options.hipsEase)
      seatBack = measurements.seatBack * (1 + options.seatEase)
    } else {
      void store.setIfUnset('waistBack', measurements.waist * (1 + options.waistEase) * 0.5)
      hipsBack = measurements.hips * (1 + options.hipsEase) * 0.5
      seatBack = measurements.seat * (1 + options.seatEase) * 0.5

      void store.setIfUnset('waistFront', measurements.waist * (1 + options.waistEase) * 0.5)
      hipsFront = measurements.hips * (1 + options.hipsEase) * 0.5
      seatFront = measurements.seat * (1 + options.seatEase) * 0.5
    }
    const waistBack = store.get('waistBack')
    const waistFront = store.get('waistFront')

    let waistbandDiff
    if (options.calculateWaistbandDiff || options.waistbandStyle == 'curved') {
      waistbandDiff =
        (waistbandWidth *
          (measurements.hips * (1 + options.hipsEase) -
            measurements.waist * (1 + options.waistEase))) /
        measurements.waistToHips /
        2
    } else {
      waistbandDiff = 0
    }

    void store.setIfUnset(
      'styleWaistBack',
      waistBack * options.waistHeight + hipsBack * (1 - options.waistHeight) + waistbandDiff
    )
    void store.setIfUnset(
      'styleWaistFront',
      waistFront * options.waistHeight + hipsFront * (1 - options.waistHeight) + waistbandDiff
    )
    const styleWaistBack = store.get('styleWaistBack')
    const styleWaistFront = store.get('styleWaistFront')

    let styleSeatFront
    let styleSeatBack
    if (measurements.seat < styleWaistFront + styleWaistBack) {
      styleSeatFront = styleWaistFront * (1 + options.waistSeatRatio)
      styleSeatBack = styleWaistBack * (1 + options.waistSeatRatio)
      log.warning('waist > seat using back up draft')
    } else {
      styleSeatFront = seatFront
      styleSeatBack = seatBack
    }

    const sideDartWidth = (styleSeatFront + styleSeatBack - (styleWaistFront + styleWaistBack)) / 6
    // const frontDartWidth = (styleSeatFront - styleWaistFront) / 3
    // const backDartWidth = (styleSeatBack - styleWaistBack) / 3

    const waistFrontCircumference =
      styleWaistFront * 0.5 /*  + frontDartWidth */ * (10 / options.circleRatio)
    const waistFrontRadius = waistFrontCircumference / Math.PI / 20

    const waistBackCircumference =
      styleWaistBack * 0.5 /*  + backDartWidth */ * (10 / options.circleRatio)
    const waistBackRadius = waistBackCircumference / Math.PI / 20

    //let's begin
    points.origin = new Point(0, 0)
    points.sideSeat = points.origin.shift(-90, toSeat)
    points.cfSeat = points.sideSeat.shift(180, styleSeatFront / 2)
    points.cbSeat = points.sideSeat.shift(0, styleSeatBack / 2)
    points.cfWaist = new Point(points.cfSeat.x, points.origin.y)
    points.cbWaist = new Point(points.cbSeat.x, points.origin.y)
    points.sideCurveEnd = points.origin.shift(180, sideDartWidth / 2)
    points.sideCurveStart = points.origin.shift(0, sideDartWidth / 2)
    points.sideKnee = points.sideSeat.shift(-90, toKnee)

    //side dart shaping
    points.sideCurveEndMidAnchor = points.sideSeat.shiftFractionTowards(points.sideCurveEnd, 0.5)

    points.sideCurveEndOrigin = utils.beamIntersectsY(
      points.sideCurveEndMidAnchor,
      points.sideCurveEnd.rotate(90, points.sideCurveEndMidAnchor),
      points.sideSeat.y
    )

    const sideDartCpDist =
      (4 / 3) *
      points.sideCurveEndOrigin.dist(points.sideSeat) *
      Math.tan(utils.deg2rad(points.sideCurveEndOrigin.angle(points.sideCurveEnd) / 4))

    points.sideSeatCp1 = points.sideSeat.shift(90, sideDartCpDist)
    points.sideSeatCp2 = points.sideSeatCp1
    points.sideCurveEndCp1 = points.sideCurveEnd
      .shiftTowards(points.sideCurveEndOrigin, sideDartCpDist)
      .rotate(90, points.sideCurveEnd)
    points.sideCurveStartCp2 = points.sideCurveEndCp1.flipX(points.sideSeat)

    paths.sideDart = new Path()
      .move(points.sideCurveStart)
      .curve(points.sideCurveStartCp2, points.sideSeatCp1, points.sideSeat)
      .curve(points.sideSeatCp2, points.sideCurveEndCp1, points.sideCurveEnd)

    //waist front swing

    const waistAngle = 360 * options.circleRatio
    const waistFrontCpDist = (4 / 3) * waistFrontRadius * Math.tan(utils.deg2rad(waistAngle / 4))

    points.waistFrontOrigin = points.cfWaist.shift(90, waistFrontRadius)
    points.sideWaistFront = points.cfWaist.rotate(waistAngle, points.waistFrontOrigin)
    points.sideDartFrontCpTarget = utils.beamIntersectsX(
      points.waistFrontOrigin,
      points.sideWaistFront,
      points.sideSeat.x
    )

    points.sideWaistFrontCp2I = points.sideWaistFront
      .shiftTowards(points.waistFrontOrigin, waistFrontCpDist)
      .rotate(90, points.sideWaistFront)
    points.cfWaistCp1I = points.cfWaist.shift(0, waistFrontCpDist)
    //waist back swing

    const waistBackCpDist = (4 / 3) * waistFrontRadius * Math.tan(utils.deg2rad(waistAngle / 4))

    points.waistBackOrigin = points.cbWaist.shift(90, waistBackRadius)
    points.sideWaistBack = points.cbWaist.rotate(-waistAngle, points.waistBackOrigin)
    points.sideDartBackCpTarget = utils.beamIntersectsX(
      points.waistBackOrigin,
      points.sideWaistBack,
      points.sideSeat.x
    )

    points.cbWaistCp2I = points.cbWaist.shift(180, waistBackCpDist)
    points.sideWaistBackCp1I = points.sideWaistBack
      .shiftTowards(points.waistBackOrigin, waistBackCpDist)
      .rotate(-90, points.sideWaistBack)
    //guides

    paths.box = new Path()
      .move(points.cfWaist)
      .line(points.cfSeat)
      .line(points.cbSeat)
      .line(points.cbWaist)
      .line(points.cfWaist)
      .move(points.sideSeat)
      .line(points.origin)

    paths.sideDart = new Path()
      .move(points.sideCurveStart)
      .curve(points.sideCurveStartCp2, points.sideSeatCp1, points.sideSeat)
      .curve(points.sideSeatCp2, points.sideCurveEndCp1, points.sideCurveEnd)

    paths.waistSwing = new Path()
      .move(points.cbWaist)
      .curve(points.cbWaistCp2I, points.sideWaistBackCp1I, points.sideWaistBack)
      .move(points.sideWaistFront)
      .curve(points.sideWaistFrontCp2I, points.cfWaistCp1I, points.cfWaist)

    return part
  },
}
